package controllers

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"schemacraft-backend/config"
	"schemacraft-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DynamicAPIController struct{}

func NewDynamicAPIController() *DynamicAPIController {
	return &DynamicAPIController{}
}

// Helper function to get user's database
func (dc *DynamicAPIController) getUserDatabase(c *gin.Context) (*mongo.Database, error) {
	apiUser, exists := c.Get("api_user")
	if !exists {
		return nil, errors.New("user not found in context")
	}

	user := apiUser.(models.User)
	if user.MongoDBURI == "" || user.DatabaseName == "" {
		return nil, errors.New("MongoDB connection not configured")
	}

	return config.GetUserDatabase(user.MongoDBURI, user.DatabaseName)
}

// Helper function to get schema by collection name
func (dc *DynamicAPIController) getSchemaByCollection(userID primitive.ObjectID, collectionName string) (*models.Schema, error) {
	var schema models.Schema
	filter := bson.M{"user_id": userID, "collection_name": collectionName, "is_active": true}
	err := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schema)
	return &schema, err
}

// Helper function to filter fields based on visibility
func (dc *DynamicAPIController) filterPublicFields(data map[string]interface{}, schema *models.Schema) map[string]interface{} {
	result := make(map[string]interface{})

	// Always include ID and timestamps
	if id, ok := data["_id"]; ok {
		result["id"] = id
	}
	if createdAt, ok := data["created_at"]; ok {
		result["created_at"] = createdAt
	}
	if updatedAt, ok := data["updated_at"]; ok {
		result["updated_at"] = updatedAt
	}

	// Include public fields only
	for _, field := range schema.Fields {
		if field.Visibility == "public" {
			if value, ok := data[field.Name]; ok {
				result[field.Name] = value
			}
		}
	}

	return result
}

// @Summary Create document in collection
// @Description Create a new document in the specified collection
// @Tags dynamic-api
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param data body object true "Document data"
// @Success 201 "Created"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection} [post]
func (dc *DynamicAPIController) CreateDocument(c *gin.Context) {
	collectionName := c.Param("collection")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)

	// Get schema
	schema, err := dc.getSchemaByCollection(userID, collectionName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found for collection: " + collectionName})
		return
	}

	// Get user's database
	db, err := dc.getUserDatabase(c)
	if err != nil {
		if err.Error() == "MongoDB connection not configured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please configure your MongoDB connection first"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error: " + err.Error()})
		}
		return
	}

	// Parse request body
	var requestData map[string]interface{}
	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate and prepare document data
	docData := make(map[string]interface{})
	for _, field := range schema.Fields {
		if value, ok := requestData[field.Name]; ok {
			docData[field.Name] = value
		} else if field.Required {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Required field missing: " + field.Name})
			return
		} else if field.Default != nil {
			docData[field.Name] = field.Default
		}
	}

	// Add metadata
	document := models.DynamicData{
		ID:        primitive.NewObjectID(),
		Data:      docData,
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Insert document
	_, err = db.Collection(collectionName).InsertOne(context.TODO(), document)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create document"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Document created successfully",
		"id":         document.ID.Hex(),
		"created_at": document.CreatedAt,
	})
}

// @Summary Get all documents from collection
// @Description Get all documents from the specified collection
// @Tags dynamic-api
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection} [get]
func (dc *DynamicAPIController) GetDocuments(c *gin.Context) {
	collectionName := c.Param("collection")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)

	// Get schema
	schema, err := dc.getSchemaByCollection(userID, collectionName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found for collection: " + collectionName})
		return
	}

	// Get user's database
	db, err := dc.getUserDatabase(c)
	if err != nil {
		if err.Error() == "MongoDB connection not configured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please configure your MongoDB connection first"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error: " + err.Error()})
		}
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit > 100 {
		limit = 100
	}
	skip := (page - 1) * limit

	// Query options
	findOptions := options.Find()
	findOptions.SetLimit(int64(limit))
	findOptions.SetSkip(int64(skip))
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	// Find documents
	cursor, err := db.Collection(collectionName).Find(context.TODO(), bson.M{"user_id": userID}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
		return
	}
	defer cursor.Close(context.TODO())

	var documents []models.DynamicData
	if err = cursor.All(context.TODO(), &documents); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode documents"})
		return
	}

	// Filter public fields only
	var publicDocuments []map[string]interface{}
	for _, doc := range documents {
		publicData := dc.filterPublicFields(doc.Data, schema)
		publicData["id"] = doc.ID.Hex()
		publicData["created_at"] = doc.CreatedAt
		publicData["updated_at"] = doc.UpdatedAt
		publicDocuments = append(publicDocuments, publicData)
	}

	// Get total count
	total, err := db.Collection(collectionName).CountDocuments(context.TODO(), bson.M{"user_id": userID})
	if err != nil {
		total = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"data": publicDocuments,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// @Summary Get document by ID
// @Description Get a specific document by ID from the collection
// @Tags dynamic-api
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param id path string true "Document ID"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/{id} [get]
func (dc *DynamicAPIController) GetDocumentByID(c *gin.Context) {
	collectionName := c.Param("collection")
	documentIDStr := c.Param("id")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)
	documentID, err := primitive.ObjectIDFromHex(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	// Get schema
	schema, err := dc.getSchemaByCollection(userID, collectionName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found for collection: " + collectionName})
		return
	}

	// Get user's database
	db, err := dc.getUserDatabase(c)
	if err != nil {
		if err.Error() == "MongoDB connection not configured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please configure your MongoDB connection first"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error: " + err.Error()})
		}
		return
	}

	// Find document
	var document models.DynamicData
	filter := bson.M{"_id": documentID, "user_id": userID}
	err = db.Collection(collectionName).FindOne(context.TODO(), filter).Decode(&document)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Filter public fields only
	publicData := dc.filterPublicFields(document.Data, schema)
	publicData["id"] = document.ID.Hex()
	publicData["created_at"] = document.CreatedAt
	publicData["updated_at"] = document.UpdatedAt

	c.JSON(http.StatusOK, publicData)
}

// @Summary Update document by ID
// @Description Update a specific document by ID in the collection
// @Tags dynamic-api
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param id path string true "Document ID"
// @Param data body object true "Update data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/{id} [put]
func (dc *DynamicAPIController) UpdateDocument(c *gin.Context) {
	collectionName := c.Param("collection")
	documentIDStr := c.Param("id")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)
	documentID, err := primitive.ObjectIDFromHex(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	// Get schema
	schema, err := dc.getSchemaByCollection(userID, collectionName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found for collection: " + collectionName})
		return
	}

	// Get user's database
	db, err := dc.getUserDatabase(c)
	if err != nil {
		if err.Error() == "MongoDB connection not configured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please configure your MongoDB connection first"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error: " + err.Error()})
		}
		return
	}

	// Parse request body
	var requestData map[string]interface{}
	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate and prepare update data
	updateData := make(map[string]interface{})
	for _, field := range schema.Fields {
		if value, ok := requestData[field.Name]; ok {
			updateData["data."+field.Name] = value
		}
	}
	updateData["updated_at"] = time.Now()

	// Update document
	filter := bson.M{"_id": documentID, "user_id": userID}
	update := bson.M{"$set": updateData}

	result, err := db.Collection(collectionName).UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update document"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Document updated successfully",
		"updated_at": updateData["updated_at"],
	})
}

// @Summary Delete document by ID
// @Description Delete a specific document by ID from the collection
// @Tags dynamic-api
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param id path string true "Document ID"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/{id} [delete]
func (dc *DynamicAPIController) DeleteDocument(c *gin.Context) {
	collectionName := c.Param("collection")
	documentIDStr := c.Param("id")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)
	documentID, err := primitive.ObjectIDFromHex(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	// Get user's database
	db, err := dc.getUserDatabase(c)
	if err != nil {
		if err.Error() == "MongoDB connection not configured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please configure your MongoDB connection first"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error: " + err.Error()})
		}
		return
	}

	// Delete document
	filter := bson.M{"_id": documentID, "user_id": userID}
	result, err := db.Collection(collectionName).DeleteOne(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
}
