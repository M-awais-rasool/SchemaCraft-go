package controllers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type SchemaController struct{}

func NewSchemaController() *SchemaController {
	return &SchemaController{}
}

// @Summary Create schema
// @Description Create a new schema/collection definition
// @Tags schema
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CreateSchemaRequest true "Schema data"
// @Success 201 "Created"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 409 "Conflict"
// @Failure 500 "Internal Server Error"
// @Router /schemas [post]
func (sc *SchemaController) CreateSchema(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get user info to check if MongoDB URI is configured
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info"})
		return
	}

	// Check if user has configured MongoDB URI
	if user.MongoDBURI == "" || user.DatabaseName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please first add a MongoDB connection"})
		return
	}

	var req models.CreateSchemaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate field types
	validTypes := map[string]bool{
		"string":   true,
		"number":   true,
		"boolean":  true,
		"date":     true,
		"object":   true,
		"array":    true,
		"relation": true,
	}

	for _, field := range req.Fields {
		if !validTypes[field.Type] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid field type: " + field.Type})
			return
		}

		// Validate relation fields
		if field.Type == "relation" {
			if field.Target == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Target collection is required for relation field: " + field.Name})
				return
			}

			// Check if target collection exists and belongs to the same user
			var targetSchema models.Schema
			targetFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
			targetErr := config.DB.Collection("schemas").FindOne(context.TODO(), targetFilter).Decode(&targetSchema)
			if targetErr != nil {
				if targetErr == mongo.ErrNoDocuments {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Target collection '" + field.Target + "' not found for relation field: " + field.Name})
					return
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while validating target collection"})
					return
				}
			}
		}

		if field.Visibility == "" {
			field.Visibility = "public" // Default to public
		}
		if field.Visibility != "public" && field.Visibility != "private" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Field visibility must be 'public' or 'private'"})
			return
		}
	}

	// Validate auth configuration if provided
	var authConfig *models.AuthConfig
	if req.AuthConfig != nil && req.AuthConfig.Enabled {
		// Validate auth configuration
		if req.AuthConfig.UserCollection == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User collection is required for authentication"})
			return
		}

		if req.AuthConfig.LoginFields.EmailField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field is required for authentication"})
			return
		}

		if req.AuthConfig.PasswordField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field is required for authentication"})
			return
		}

		// Verify that the specified fields exist in the schema
		fieldNames := make(map[string]bool)
		for _, field := range req.Fields {
			fieldNames[field.Name] = true
		}

		if !fieldNames[req.AuthConfig.LoginFields.EmailField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field '" + req.AuthConfig.LoginFields.EmailField + "' not found in schema"})
			return
		}

		if !fieldNames[req.AuthConfig.PasswordField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field '" + req.AuthConfig.PasswordField + "' not found in schema"})
			return
		}

		if req.AuthConfig.LoginFields.UsernameField != "" && !fieldNames[req.AuthConfig.LoginFields.UsernameField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username field '" + req.AuthConfig.LoginFields.UsernameField + "' not found in schema"})
			return
		}

		// Set defaults
		if req.AuthConfig.TokenExpiration == 0 {
			req.AuthConfig.TokenExpiration = 24 // 24 hours default
		}

		// Generate JWT secret if not provided
		if req.AuthConfig.JWTSecret == "" {
			secretBytes := make([]byte, 32)
			_, err := rand.Read(secretBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT secret"})
				return
			}
			req.AuthConfig.JWTSecret = hex.EncodeToString(secretBytes)
		}

		authConfig = req.AuthConfig
	}

	// Check if active schema already exists for this user
	var existingSchema models.Schema
	activeFilter := bson.M{"user_id": userID, "collection_name": req.CollectionName, "is_active": true}
	schemaErr := config.DB.Collection("schemas").FindOne(context.TODO(), activeFilter).Decode(&existingSchema)
	if schemaErr == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Schema already exists for this collection"})
		return
	} else if schemaErr != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if there's an inactive schema with the same name that we can reactivate
	var inactiveSchema models.Schema
	inactiveFilter := bson.M{"user_id": userID, "collection_name": req.CollectionName, "is_active": false}
	inactiveErr := config.DB.Collection("schemas").FindOne(context.TODO(), inactiveFilter).Decode(&inactiveSchema)

	if inactiveErr == nil {
		// Reactivate and update the existing inactive schema
		updateFilter := bson.M{"_id": inactiveSchema.ID}
		updateDoc := bson.M{
			"$set": bson.M{
				"fields":              req.Fields,
				"auth_config":         authConfig,
				"endpoint_protection": req.EndpointProtection,
				"updated_at":          time.Now(),
				"is_active":           true,
			},
		}

		_, err := config.DB.Collection("schemas").UpdateOne(context.TODO(), updateFilter, updateDoc)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reactivate schema"})
			return
		}

		// Return the reactivated schema
		updatedSchema := inactiveSchema
		updatedSchema.Fields = req.Fields
		updatedSchema.AuthConfig = authConfig
		updatedSchema.EndpointProtection = req.EndpointProtection
		updatedSchema.UpdatedAt = time.Now()
		updatedSchema.IsActive = true

		// Log schema reactivation activity
		go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeUpdate, "Reactivated table \""+req.CollectionName+"\"", "Database table schema reactivated", "schema", updatedSchema.ID.Hex(), map[string]any{
			"collection_name": req.CollectionName,
			"field_count":     len(req.Fields),
			"has_auth":        req.AuthConfig != nil && req.AuthConfig.Enabled,
			"action":          "reactivated",
		})

		c.JSON(http.StatusCreated, updatedSchema)
		return
	} else if inactiveErr != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while checking inactive schemas"})
		return
	}

	// Create schema
	schema := models.Schema{
		ID:                 primitive.NewObjectID(),
		UserID:             userID.(primitive.ObjectID),
		CollectionName:     req.CollectionName,
		Fields:             req.Fields,
		AuthConfig:         authConfig,
		EndpointProtection: req.EndpointProtection,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		IsActive:           true,
	}

	// Insert schema
	_, err = config.DB.Collection("schemas").InsertOne(context.TODO(), schema)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schema"})
		return
	}

	// Log schema creation activity
	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeCreate, "Created table \""+req.CollectionName+"\"", "New database table schema created", "schema", schema.ID.Hex(), map[string]any{
		"collection_name": req.CollectionName,
		"field_count":     len(req.Fields),
		"has_auth":        req.AuthConfig != nil && req.AuthConfig.Enabled,
	})

	c.JSON(http.StatusCreated, schema)
}

// @Summary Get schemas
// @Description Get all schemas for the authenticated user
// @Tags schema
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /schemas [get]
func (sc *SchemaController) GetSchemas(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	cursor, err := config.DB.Collection("schemas").Find(context.TODO(), bson.M{"user_id": userID, "is_active": true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schemas"})
		return
	}
	defer cursor.Close(context.TODO())

	var schemas []models.Schema
	if err = cursor.All(context.TODO(), &schemas); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode schemas"})
		return
	}

	if schemas == nil {
		schemas = []models.Schema{} // Return empty array instead of null
	}

	c.JSON(http.StatusOK, schemas)
}

// @Summary Get schema by ID
// @Description Get a specific schema by ID
// @Tags schema
// @Produce json
// @Security BearerAuth
// @Param id path string true "Schema ID"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /schemas/{id} [get]
func (sc *SchemaController) GetSchemaByID(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	schemaIDStr := c.Param("id")
	schemaID, err := primitive.ObjectIDFromHex(schemaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schema ID"})
		return
	}

	var schema models.Schema
	filter := bson.M{"_id": schemaID, "user_id": userID, "is_active": true}
	err = config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schema)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, schema)
}

// @Summary Update schema
// @Description Update an existing schema
// @Tags schema
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Schema ID"
// @Param request body models.CreateSchemaRequest true "Updated schema data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /schemas/{id} [put]
func (sc *SchemaController) UpdateSchema(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	schemaIDStr := c.Param("id")
	schemaID, err := primitive.ObjectIDFromHex(schemaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schema ID"})
		return
	}

	// Get user info to check if MongoDB URI is configured
	var user models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info"})
		return
	}

	// Check if user has configured MongoDB URI
	if user.MongoDBURI == "" || user.DatabaseName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please first add a MongoDB connection"})
		return
	}

	var req models.CreateSchemaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate field types
	validTypes := map[string]bool{
		"string":   true,
		"number":   true,
		"boolean":  true,
		"date":     true,
		"object":   true,
		"array":    true,
		"relation": true,
	}

	for _, field := range req.Fields {
		if !validTypes[field.Type] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid field type: " + field.Type})
			return
		}

		// Validate relation fields
		if field.Type == "relation" {
			if field.Target == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Target collection is required for relation field: " + field.Name})
				return
			}

			// Check if target collection exists and belongs to the same user
			var targetSchema models.Schema
			targetFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
			targetErr := config.DB.Collection("schemas").FindOne(context.TODO(), targetFilter).Decode(&targetSchema)
			if targetErr != nil {
				if targetErr == mongo.ErrNoDocuments {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Target collection '" + field.Target + "' not found for relation field: " + field.Name})
					return
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while validating target collection"})
					return
				}
			}
		}

		if field.Visibility == "" {
			field.Visibility = "public" // Default to public
		}
		if field.Visibility != "public" && field.Visibility != "private" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Field visibility must be 'public' or 'private'"})
			return
		}
	}

	// Validate auth configuration if provided
	var authConfig *models.AuthConfig
	if req.AuthConfig != nil && req.AuthConfig.Enabled {
		// Validate auth configuration
		if req.AuthConfig.UserCollection == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User collection is required for authentication"})
			return
		}

		if req.AuthConfig.LoginFields.EmailField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field is required for authentication"})
			return
		}

		if req.AuthConfig.PasswordField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field is required for authentication"})
			return
		}

		// Verify that the specified fields exist in the schema
		fieldNames := make(map[string]bool)
		for _, field := range req.Fields {
			fieldNames[field.Name] = true
		}

		if !fieldNames[req.AuthConfig.LoginFields.EmailField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field '" + req.AuthConfig.LoginFields.EmailField + "' not found in schema"})
			return
		}

		if !fieldNames[req.AuthConfig.PasswordField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field '" + req.AuthConfig.PasswordField + "' not found in schema"})
			return
		}

		if req.AuthConfig.LoginFields.UsernameField != "" && !fieldNames[req.AuthConfig.LoginFields.UsernameField] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username field '" + req.AuthConfig.LoginFields.UsernameField + "' not found in schema"})
			return
		}

		// Set defaults
		if req.AuthConfig.TokenExpiration == 0 {
			req.AuthConfig.TokenExpiration = 24 // 24 hours default
		}

		// Generate JWT secret if not provided
		if req.AuthConfig.JWTSecret == "" {
			secretBytes := make([]byte, 32)
			_, err := rand.Read(secretBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT secret"})
				return
			}
			req.AuthConfig.JWTSecret = hex.EncodeToString(secretBytes)
		}

		authConfig = req.AuthConfig
	}

	// Check if schema exists and belongs to user
	var existingSchema models.Schema
	filter := bson.M{"_id": schemaID, "user_id": userID, "is_active": true}
	err = config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&existingSchema)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Check if collection name is being changed and if another active schema exists with the new name
	if req.CollectionName != existingSchema.CollectionName {
		var conflictSchema models.Schema
		conflictFilter := bson.M{"user_id": userID, "collection_name": req.CollectionName, "is_active": true}
		conflictErr := config.DB.Collection("schemas").FindOne(context.TODO(), conflictFilter).Decode(&conflictSchema)
		if conflictErr == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Schema already exists for this collection name"})
			return
		} else if conflictErr != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// Update schema
	updateDoc := bson.M{
		"$set": bson.M{
			"collection_name":     req.CollectionName,
			"fields":              req.Fields,
			"auth_config":         authConfig,
			"endpoint_protection": req.EndpointProtection,
			"updated_at":          time.Now(),
		},
	}

	result, err := config.DB.Collection("schemas").UpdateOne(context.TODO(), filter, updateDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update schema"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
		return
	}

	// Fetch and return updated schema
	var updatedSchema models.Schema
	err = config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&updatedSchema)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated schema"})
		return
	}

	// Log schema update activity
	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeUpdate, "Updated table \""+req.CollectionName+"\"", "Database table schema updated", "schema", updatedSchema.ID.Hex(), map[string]any{
		"collection_name": req.CollectionName,
		"field_count":     len(req.Fields),
		"has_auth":        req.AuthConfig != nil && req.AuthConfig.Enabled,
		"action":          "updated",
	})

	c.JSON(http.StatusOK, updatedSchema)
}

// @Summary Delete schema
// @Description Delete a schema (soft delete)
// @Tags schema
// @Produce json
// @Security BearerAuth
// @Param id path string true "Schema ID"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /schemas/{id} [delete]
func (sc *SchemaController) DeleteSchema(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	schemaIDStr := c.Param("id")
	schemaID, err := primitive.ObjectIDFromHex(schemaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schema ID"})
		return
	}

	// First, check if the schema being deleted is an auth schema
	var schemaToDelete models.Schema
	filter := bson.M{"_id": schemaID, "user_id": userID, "is_active": true}
	err = config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schemaToDelete)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find schema"})
		}
		return
	}

	// Soft delete - mark as inactive
	update := bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}}

	result, err := config.DB.Collection("schemas").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schema"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
		return
	}

	// If this was an auth schema, remove endpoint protection from all other schemas by this user
	if schemaToDelete.AuthConfig != nil && schemaToDelete.AuthConfig.Enabled {
		// Find all other active schemas by this user that have endpoint protection
		protectedSchemasFilter := bson.M{
			"user_id":   userID,
			"is_active": true,
			"_id":       bson.M{"$ne": schemaID}, // Exclude the deleted schema
			"$or": []bson.M{
				{"endpoint_protection.get": true},
				{"endpoint_protection.post": true},
				{"endpoint_protection.put": true},
				{"endpoint_protection.delete": true},
			},
		}

		// Remove endpoint protection from those schemas
		removeProtectionUpdate := bson.M{
			"$set": bson.M{
				"endpoint_protection": nil,
				"updated_at":          time.Now(),
			},
		}

		_, err = config.DB.Collection("schemas").UpdateMany(
			context.TODO(),
			protectedSchemasFilter,
			removeProtectionUpdate,
		)
		if err != nil {
			// Log the error but don't fail the delete operation
			fmt.Printf("Warning: Failed to remove endpoint protection from related schemas: %v\n", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schema deleted successfully"})
}
