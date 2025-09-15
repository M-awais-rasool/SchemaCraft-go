package controllers

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

// Helper function to create aggregation pipeline for populating relations
func (dc *DynamicAPIController) createPopulationPipeline(userID primitive.ObjectID, schema *models.Schema, matchFilter bson.M) []bson.M {
	pipeline := []bson.M{
		{"$match": matchFilter},
	}

	// Add $lookup stages for relation fields
	for _, field := range schema.Fields {
		if field.Type == "relation" && field.Target != "" {
			// Check if the target collection is an authentication schema
			var targetSchema models.Schema
			targetSchemaFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
			err := config.DB.Collection("schemas").FindOne(context.TODO(), targetSchemaFilter).Decode(&targetSchema)

			var targetCollection string
			if err == nil && targetSchema.AuthConfig != nil && targetSchema.AuthConfig.Enabled {
				// This is an authentication collection, use the user collection
				targetCollection = targetSchema.AuthConfig.UserCollection
				if targetCollection == "" {
					targetCollection = field.Target + "_users"
				}
			} else {
				// Regular data collection
				targetCollection = field.Target
			}

			lookupStage := bson.M{
				"$lookup": bson.M{
					"from":         targetCollection,
					"localField":   "data." + field.Name,
					"foreignField": "_id",
					"as":           "populated_" + field.Name,
				},
			}
			pipeline = append(pipeline, lookupStage)

			// Unwind the array (assuming one-to-one relation, modify for one-to-many if needed)
			unwindStage := bson.M{
				"$unwind": bson.M{
					"path":                       "$populated_" + field.Name,
					"preserveNullAndEmptyArrays": true,
				},
			}
			pipeline = append(pipeline, unwindStage)
		}
	}

	return pipeline
}

// Helper function to filter fields based on visibility and populate relations
func (dc *DynamicAPIController) filterPublicFieldsWithRelations(data bson.M, schema *models.Schema, userID primitive.ObjectID) map[string]interface{} {
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

	// Include public fields and populate relations
	for _, field := range schema.Fields {
		if field.Visibility == "public" {
			if field.Type == "relation" && field.Target != "" {
				// Get populated relation data
				if populatedData, ok := data["populated_"+field.Name]; ok {
					if populatedDoc, ok := populatedData.(bson.M); ok {
						// Check if the target is an authentication collection
						var targetSchema models.Schema
						targetSchemaFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
						err := config.DB.Collection("schemas").FindOne(context.TODO(), targetSchemaFilter).Decode(&targetSchema)

						relatedData := make(map[string]interface{})

						if err == nil && targetSchema.AuthConfig != nil && targetSchema.AuthConfig.Enabled {
							// This is an authentication collection - data is stored directly in the document
							for key, value := range populatedDoc {
								// Skip internal fields and password fields
								if key != "_id" && key != "created_at" && key != "updated_at" &&
									!strings.Contains(strings.ToLower(key), "password") {
									relatedData[key] = value
								}
							}
						} else {
							// Regular data collection - data is in the "data" field
							if docData, ok := populatedDoc["data"]; ok {
								if docDataMap, ok := docData.(bson.M); ok {
									for key, value := range docDataMap {
										relatedData[key] = value
									}
								}
							}
						}

						// Always include ID and timestamps
						if relatedID, ok := populatedDoc["_id"]; ok {
							relatedData["id"] = relatedID
						}
						if relatedCreatedAt, ok := populatedDoc["created_at"]; ok {
							relatedData["created_at"] = relatedCreatedAt
						}
						if relatedUpdatedAt, ok := populatedDoc["updated_at"]; ok {
							relatedData["updated_at"] = relatedUpdatedAt
						}

						result[field.Name] = relatedData
					}
				} else {
					// If no relation found, include the raw ID
					if dataMap, ok := data["data"].(bson.M); ok {
						if value, ok := dataMap[field.Name]; ok {
							result[field.Name] = value
						}
					}
				}
			} else {
				// Regular field
				if dataMap, ok := data["data"].(bson.M); ok {
					if value, ok := dataMap[field.Name]; ok {
						result[field.Name] = value
					}
				}
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
			// Validate relation fields
			if field.Type == "relation" && field.Target != "" {
				// Convert value to ObjectID for validation
				var relationID primitive.ObjectID
				switch v := value.(type) {
				case string:
					var err error
					relationID, err = primitive.ObjectIDFromHex(v)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid relation ID for field: " + field.Name})
						return
					}
				case primitive.ObjectID:
					relationID = v
				default:
					c.JSON(http.StatusBadRequest, gin.H{"error": "Relation field must be a valid ObjectID: " + field.Name})
					return
				}

				// Verify the referenced document exists
				var count int64

				// Check if the target collection is an authentication schema
				var targetSchema models.Schema
				targetSchemaFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
				err = config.DB.Collection("schemas").FindOne(context.TODO(), targetSchemaFilter).Decode(&targetSchema)

				if err == nil && targetSchema.AuthConfig != nil && targetSchema.AuthConfig.Enabled {
					// This is an authentication collection, check in the user collection
					userCollection := targetSchema.AuthConfig.UserCollection
					if userCollection == "" {
						userCollection = field.Target + "_users"
					}
					count, err = db.Collection(userCollection).CountDocuments(context.TODO(), bson.M{"_id": relationID})
				} else {
					// Regular data collection, check with user_id filter
					count, err = db.Collection(field.Target).CountDocuments(context.TODO(), bson.M{"_id": relationID, "user_id": userID})
				}

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate relation for field: " + field.Name})
					return
				}
				if count == 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Referenced document not found for field: " + field.Name})
					return
				}

				docData[field.Name] = relationID
			} else {
				docData[field.Name] = value
			}
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

	// Create aggregation pipeline with population
	matchFilter := bson.M{"user_id": userID}
	pipeline := dc.createPopulationPipeline(userID, schema, matchFilter)

	// Add pagination stages
	pipeline = append(pipeline,
		bson.M{"$sort": bson.M{"created_at": -1}},
		bson.M{"$skip": int64(skip)},
		bson.M{"$limit": int64(limit)},
	)

	// Execute aggregation
	cursor, err := db.Collection(collectionName).Aggregate(context.TODO(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
		return
	}
	defer cursor.Close(context.TODO())

	var documents []bson.M
	if err = cursor.All(context.TODO(), &documents); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode documents"})
		return
	}

	// Filter public fields and populate relations
	var publicDocuments []map[string]interface{}
	for _, doc := range documents {
		publicData := dc.filterPublicFieldsWithRelations(doc, schema, userID)
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

	// Create aggregation pipeline with population for single document
	matchFilter := bson.M{"_id": documentID, "user_id": userID}
	pipeline := dc.createPopulationPipeline(userID, schema, matchFilter)

	// Execute aggregation
	cursor, err := db.Collection(collectionName).Aggregate(context.TODO(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer cursor.Close(context.TODO())

	var documents []bson.M
	if err = cursor.All(context.TODO(), &documents); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode document"})
		return
	}

	if len(documents) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Filter public fields and populate relations
	publicData := dc.filterPublicFieldsWithRelations(documents[0], schema, userID)

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
			// Validate relation fields
			if field.Type == "relation" && field.Target != "" {
				// Convert value to ObjectID for validation
				var relationID primitive.ObjectID
				switch v := value.(type) {
				case string:
					var err error
					relationID, err = primitive.ObjectIDFromHex(v)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid relation ID for field: " + field.Name})
						return
					}
				case primitive.ObjectID:
					relationID = v
				default:
					c.JSON(http.StatusBadRequest, gin.H{"error": "Relation field must be a valid ObjectID: " + field.Name})
					return
				}

				// Verify the referenced document exists
				var count int64

				// Check if the target collection is an authentication schema
				var targetSchema models.Schema
				targetSchemaFilter := bson.M{"user_id": userID, "collection_name": field.Target, "is_active": true}
				err = config.DB.Collection("schemas").FindOne(context.TODO(), targetSchemaFilter).Decode(&targetSchema)

				if err == nil && targetSchema.AuthConfig != nil && targetSchema.AuthConfig.Enabled {
					// This is an authentication collection, check in the user collection
					userCollection := targetSchema.AuthConfig.UserCollection
					if userCollection == "" {
						userCollection = field.Target + "_users"
					}
					count, err = db.Collection(userCollection).CountDocuments(context.TODO(), bson.M{"_id": relationID})
				} else {
					// Regular data collection, check with user_id filter
					count, err = db.Collection(field.Target).CountDocuments(context.TODO(), bson.M{"_id": relationID, "user_id": userID})
				}

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate relation for field: " + field.Name})
					return
				}
				if count == 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Referenced document not found for field: " + field.Name})
					return
				}

				updateData["data."+field.Name] = relationID
			} else {
				updateData["data."+field.Name] = value
			}
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
