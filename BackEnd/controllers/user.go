package controllers

import (
	"context"
	"net/http"

	"schemacraft-backend/config"
	"schemacraft-backend/models"
	"schemacraft-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type UserController struct{}

func NewUserController() *UserController {
	return &UserController{}
}

// @Summary Get user dashboard data
// @Description Get dashboard data for the authenticated user
// @Tags user
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /user/dashboard [get]
func (uc *UserController) GetDashboard(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get user info
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Get user's schemas count
	schemaCount, err := config.DB.Collection("schemas").CountDocuments(
		context.TODO(),
		bson.M{"user_id": userID, "is_active": true},
	)
	if err != nil {
		schemaCount = 0
	}

	// Get user's schemas
	cursor, err := config.DB.Collection("schemas").Find(
		context.TODO(),
		bson.M{"user_id": userID, "is_active": true},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schemas"})
		return
	}
	defer cursor.Close(context.TODO())

	var schemas []models.Schema
	if err = cursor.All(context.TODO(), &schemas); err != nil {
		schemas = []models.Schema{}
	}

	dashboardData := gin.H{
		"user": gin.H{
			"id":            user.ID.Hex(),
			"name":          user.Name,
			"email":         user.Email,
			"api_key":       user.APIKey,
			"mongodb_uri":   user.MongoDBURI != "",
			"database_name": user.DatabaseName,
			"created_at":    user.CreatedAt,
			"last_login":    user.LastLogin,
		},
		"stats": gin.H{
			"total_schemas": schemaCount,
			"api_usage":     user.APIUsage,
			"has_custom_db": user.MongoDBURI != "",
		},
		"schemas": schemas,
	}

	c.JSON(http.StatusOK, dashboardData)
}

// @Summary Regenerate API key
// @Description Generate a new API key for the user
// @Tags user
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /user/regenerate-api-key [post]
func (uc *UserController) RegenerateAPIKey(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Generate new API key
	newAPIKey, err := utils.GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate API key"})
		return
	}

	// Update user's API key
	filter := bson.M{"_id": userID}
	update := bson.M{"$set": bson.M{"api_key": newAPIKey}}

	_, err = config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update API key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "API key regenerated successfully",
		"api_key": newAPIKey,
	})
}

// @Summary Get API usage stats
// @Description Get detailed API usage statistics
// @Tags user
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /user/api-usage [get]
func (uc *UserController) GetAPIUsage(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	usageData := gin.H{
		"total_requests":   user.APIUsage.TotalRequests,
		"last_request":     user.APIUsage.LastRequest,
		"monthly_quota":    user.APIUsage.MonthlyQuota,
		"used_this_month":  user.APIUsage.UsedThisMonth,
		"remaining_quota":  user.APIUsage.MonthlyQuota - user.APIUsage.UsedThisMonth,
		"quota_percentage": float64(user.APIUsage.UsedThisMonth) / float64(user.APIUsage.MonthlyQuota) * 100,
	}

	c.JSON(http.StatusOK, usageData)
}
