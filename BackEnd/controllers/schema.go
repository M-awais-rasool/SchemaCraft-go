package controllers

import (
	"context"
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
// @Success 201 {object} models.Schema
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 409 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schemas [post]
func (sc *SchemaController) CreateSchema(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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
	err := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&existingSchema)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Schema already exists for this collection"})
		return
	} else if err != mongo.ErrNoDocuments {
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

	// Create schema
	schema := models.Schema{
		ID:             primitive.NewObjectID(),
		UserID:         userID.(primitive.ObjectID),
		CollectionName: req.CollectionName,
		Fields:         req.Fields,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		IsActive:       true,
	}

	// Insert schema
	_, err = config.DB.Collection("schemas").InsertOne(context.TODO(), schema)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schema"})
		return
	}

	c.JSON(http.StatusCreated, schema)
}

// @Summary Get schemas
// @Description Get all schemas for the authenticated user
// @Tags schema
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Schema
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
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
// @Success 200 {object} models.Schema
// @Failure 401 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
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
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
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
