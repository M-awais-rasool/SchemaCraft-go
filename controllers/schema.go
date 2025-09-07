package controllers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"schemacraft-backend/config"
	"schemacraft-backend/models"

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

	// Check if schema already exists for this user
	var existingSchema models.Schema
	filter := bson.M{"user_id": userID, "collection_name": req.CollectionName}
	schemaErr := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&existingSchema)
	if schemaErr == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Schema already exists for this collection"})
		return
	} else if schemaErr != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Validate field types
	validTypes := map[string]bool{
		"string":  true,
		"number":  true,
		"boolean": true,
		"date":    true,
		"object":  true,
		"array":   true,
	}

	for _, field := range req.Fields {
		if !validTypes[field.Type] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid field type: " + field.Type})
			return
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
		if req.AuthConfig.LoginFields.EmailField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field is required when authentication is enabled"})
			return
		}
		if req.AuthConfig.PasswordField == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field is required when authentication is enabled"})
			return
		}

		// Verify that the specified fields exist in the schema
		emailFieldExists := false
		passwordFieldExists := false
		usernameFieldExists := req.AuthConfig.LoginFields.UsernameField == ""

		for _, field := range req.Fields {
			if field.Name == req.AuthConfig.LoginFields.EmailField {
				emailFieldExists = true
				if field.Type != "string" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Email field must be of type 'string'"})
					return
				}
			}
			if field.Name == req.AuthConfig.PasswordField {
				passwordFieldExists = true
				if field.Type != "string" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Password field must be of type 'string'"})
					return
				}
			}
			if req.AuthConfig.LoginFields.UsernameField != "" && field.Name == req.AuthConfig.LoginFields.UsernameField {
				usernameFieldExists = true
				if field.Type != "string" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Username field must be of type 'string'"})
					return
				}
			}
		}

		if !emailFieldExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email field '" + req.AuthConfig.LoginFields.EmailField + "' not found in schema"})
			return
		}
		if !passwordFieldExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password field '" + req.AuthConfig.PasswordField + "' not found in schema"})
			return
		}
		if !usernameFieldExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username field '" + req.AuthConfig.LoginFields.UsernameField + "' not found in schema"})
			return
		}

		// Set defaults
		if req.AuthConfig.TokenExpiration == 0 {
			req.AuthConfig.TokenExpiration = 24 // 24 hours default
		}
		if req.AuthConfig.UserCollection == "" {
			req.AuthConfig.UserCollection = req.CollectionName + "_users"
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

	// Soft delete - mark as inactive
	filter := bson.M{"_id": schemaID, "user_id": userID}
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

	c.JSON(http.StatusOK, gin.H{"message": "Schema deleted successfully"})
}
