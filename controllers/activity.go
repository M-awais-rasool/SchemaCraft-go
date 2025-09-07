package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"schemacraft-backend/config"
	"schemacraft-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActivityController struct{}

func NewActivityController() *ActivityController {
	return &ActivityController{}
}

// @Summary Get user activities
// @Description Get all activities for the authenticated user
// @Tags activities
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Limit number of activities (default: 20)"
// @Param page query int false "Page number (default: 1)"
// @Success 200 {object} models.ActivityResponse
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /activities [get]
func (ac *ActivityController) GetActivities(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse pagination parameters
	page := 1
	limit := 20

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	skip := (page - 1) * limit

	// Get activities
	filter := bson.M{"user_id": userID}

	// Get total count
	total, err := config.DB.Collection("activities").CountDocuments(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count activities"})
		return
	}

	// Get activities with pagination
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(int64(skip)).
		SetLimit(int64(limit))

	cursor, err := config.DB.Collection("activities").Find(context.TODO(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}
	defer cursor.Close(context.TODO())

	var activities []models.Activity
	if err = cursor.All(context.TODO(), &activities); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode activities"})
		return
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := models.ActivityResponse{
		Activities: activities,
	}
	response.Pagination.Page = page
	response.Pagination.Limit = limit
	response.Pagination.Total = int(total)
	response.Pagination.TotalPages = totalPages

	c.JSON(http.StatusOK, response)
}

// @Summary Create activity log
// @Description Create a new activity log entry
// @Tags activities
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param activity body models.CreateActivityRequest true "Activity data"
// @Success 201 {object} models.Activity
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /activities [post]
func (ac *ActivityController) CreateActivity(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	activity := models.Activity{
		ID:          primitive.NewObjectID(),
		UserID:      userID.(primitive.ObjectID),
		Type:        req.Type,
		Action:      req.Action,
		Description: req.Description,
		Resource:    req.Resource,
		ResourceID:  req.ResourceID,
		IPAddress:   c.ClientIP(),
		UserAgent:   c.GetHeader("User-Agent"),
		Metadata:    req.Metadata,
		CreatedAt:   time.Now(),
	}

	_, err := config.DB.Collection("activities").InsertOne(context.TODO(), activity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create activity"})
		return
	}

	c.JSON(http.StatusCreated, activity)
}

// Helper function to log activity (can be called from other controllers)
func LogActivity(userID primitive.ObjectID, activityType models.ActivityType, action, description, resource, resourceID string, metadata map[string]any) error {
	activity := models.Activity{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Type:        activityType,
		Action:      action,
		Description: description,
		Resource:    resource,
		ResourceID:  resourceID,
		Metadata:    metadata,
		CreatedAt:   time.Now(),
	}

	_, err := config.DB.Collection("activities").InsertOne(context.TODO(), activity)
	return err
}

// Helper function to log activity with context (gets IP and User-Agent from gin context)
func LogActivityWithContext(c *gin.Context, userID primitive.ObjectID, activityType models.ActivityType, action, description, resource, resourceID string, metadata map[string]any) error {
	activity := models.Activity{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Type:        activityType,
		Action:      action,
		Description: description,
		Resource:    resource,
		ResourceID:  resourceID,
		IPAddress:   c.ClientIP(),
		UserAgent:   c.GetHeader("User-Agent"),
		Metadata:    metadata,
		CreatedAt:   time.Now(),
	}

	_, err := config.DB.Collection("activities").InsertOne(context.TODO(), activity)
	return err
}
