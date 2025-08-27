package controllers

import (
	"context"
	"net/http"
	"strconv"

	"schemacraft-backend/config"
	"schemacraft-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AdminController struct{}

type ToggleUserStatusRequest struct {
	IsActive bool `json:"is_active"`
}

func NewAdminController() *AdminController {
	return &AdminController{}
}

// @Summary Get all users (Admin only)
// @Description Get all registered users with pagination
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 500 "Internal Server Error"
// @Router /admin/users [get]
func (ac *AdminController) GetAllUsers(c *gin.Context) {
	page := 1
	limit := 20

	if p, ok := c.GetQuery("page"); ok {
		if pageInt, err := strconv.Atoi(p); err == nil && pageInt > 0 {
			page = pageInt
		}
	}

	if l, ok := c.GetQuery("limit"); ok {
		if limitInt, err := strconv.Atoi(l); err == nil && limitInt > 0 && limitInt <= 100 {
			limit = limitInt
		}
	}

	skip := (page - 1) * limit

	// Find options
	findOptions := options.Find()
	findOptions.SetLimit(int64(limit))
	findOptions.SetSkip(int64(skip))
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	// Get users
	cursor, err := config.DB.Collection("users").Find(context.TODO(), bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(context.TODO())

	var users []models.User
	if err = cursor.All(context.TODO(), &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
		return
	}

	// Remove passwords from response
	for i := range users {
		users[i].Password = ""
	}

	// Get total count
	total, err := config.DB.Collection("users").CountDocuments(context.TODO(), bson.M{})
	if err != nil {
		total = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// @Summary Get user by ID (Admin only)
// @Description Get detailed user information by ID
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /admin/users/{id} [get]
func (ac *AdminController) GetUserByID(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get user's schemas
	cursor, err := config.DB.Collection("schemas").Find(context.TODO(), bson.M{"user_id": userID})
	if err == nil {
		var schemas []models.Schema
		cursor.All(context.TODO(), &schemas)
		cursor.Close(context.TODO())
	}

	user.Password = "" // Remove password from response
	c.JSON(http.StatusOK, user)
}

// @Summary Toggle user active status (Admin only)
// @Description Activate or deactivate a user account
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body ToggleUserStatusRequest true "Active status"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /admin/users/{id}/toggle-status [put]
func (ac *AdminController) ToggleUserStatus(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var request struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user status
	filter := bson.M{"_id": userID}
	update := bson.M{"$set": bson.M{"is_active": request.IsActive}}

	result, err := config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	status := "deactivated"
	if request.IsActive {
		status = "activated"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User " + status + " successfully",
	})
}

// @Summary Get platform statistics (Admin only)
// @Description Get overall platform statistics
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 500 "Internal Server Error"
// @Router /admin/stats [get]
func (ac *AdminController) GetPlatformStats(c *gin.Context) {
	// Total users
	totalUsers, err := config.DB.Collection("users").CountDocuments(context.TODO(), bson.M{})
	if err != nil {
		totalUsers = 0
	}

	// Active users
	activeUsers, err := config.DB.Collection("users").CountDocuments(context.TODO(), bson.M{"is_active": true})
	if err != nil {
		activeUsers = 0
	}

	// Total schemas
	totalSchemas, err := config.DB.Collection("schemas").CountDocuments(context.TODO(), bson.M{"is_active": true})
	if err != nil {
		totalSchemas = 0
	}

	// Get API usage aggregation
	var totalAPIRequests int64 = 0
	cursor, err := config.DB.Collection("users").Find(context.TODO(), bson.M{})
	if err == nil {
		var users []models.User
		if cursor.All(context.TODO(), &users) == nil {
			for _, user := range users {
				totalAPIRequests += user.APIUsage.TotalRequests
			}
		}
		cursor.Close(context.TODO())
	}

	stats := gin.H{
		"total_users":        totalUsers,
		"active_users":       activeUsers,
		"inactive_users":     totalUsers - activeUsers,
		"total_schemas":      totalSchemas,
		"total_api_requests": totalAPIRequests,
	}

	c.JSON(http.StatusOK, stats)
}

// @Summary Revoke user API key (Admin only)
// @Description Revoke a user's API key
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /admin/users/{id}/revoke-api-key [post]
func (ac *AdminController) RevokeAPIKey(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Update user to remove API key
	filter := bson.M{"_id": userID}
	update := bson.M{"$unset": bson.M{"api_key": ""}}

	result, err := config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke API key"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "API key revoked successfully",
	})
}

// @Summary Get API usage statistics (Admin only)
// @Description Get API usage statistics for all users
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param threshold query int false "Usage threshold percentage (default: 80)"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 500 "Internal Server Error"
// @Router /admin/api-usage [get]
func (ac *AdminController) GetAPIUsageStats(c *gin.Context) {
	// Parse threshold parameter
	thresholdStr := c.DefaultQuery("threshold", "80")
	threshold, err := strconv.Atoi(thresholdStr)
	if err != nil || threshold < 0 || threshold > 100 {
		threshold = 80
	}

	// Get all users with their API usage
	cursor, err := config.DB.Collection("users").Find(context.TODO(), bson.M{"is_active": true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(context.TODO())

	var users []models.User
	err = cursor.All(context.TODO(), &users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
		return
	}

	// Categorize users by usage
	var highUsageUsers []gin.H
	var quotaExceededUsers []gin.H
	var totalUsage int64
	var totalQuota int64

	for _, user := range users {
		usagePercentage := float64(user.APIUsage.UsedThisMonth) / float64(user.APIUsage.MonthlyQuota) * 100

		userInfo := gin.H{
			"id":               user.ID,
			"name":             user.Name,
			"email":            user.Email,
			"used_this_month":  user.APIUsage.UsedThisMonth,
			"monthly_quota":    user.APIUsage.MonthlyQuota,
			"usage_percentage": usagePercentage,
			"last_request":     user.APIUsage.LastRequest,
		}

		totalUsage += user.APIUsage.UsedThisMonth
		totalQuota += user.APIUsage.MonthlyQuota

		// Check if user exceeded quota
		if user.APIUsage.UsedThisMonth >= user.APIUsage.MonthlyQuota {
			quotaExceededUsers = append(quotaExceededUsers, userInfo)
		} else if usagePercentage >= float64(threshold) {
			// Check if user is approaching quota threshold
			highUsageUsers = append(highUsageUsers, userInfo)
		}
	}

	// Calculate overall statistics
	overallUsagePercentage := float64(totalUsage) / float64(totalQuota) * 100

	stats := gin.H{
		"overall_stats": gin.H{
			"total_usage":          totalUsage,
			"total_quota":          totalQuota,
			"usage_percentage":     overallUsagePercentage,
			"total_users":          len(users),
			"high_usage_users":     len(highUsageUsers),
			"quota_exceeded_users": len(quotaExceededUsers),
		},
		"high_usage_users":     highUsageUsers,
		"quota_exceeded_users": quotaExceededUsers,
		"threshold_percentage": threshold,
	}

	c.JSON(http.StatusOK, stats)
}

// @Summary Reset user API quota (Admin only)
// @Description Reset a user's monthly API quota
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /admin/users/{id}/reset-quota [post]
func (ac *AdminController) ResetUserQuota(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Reset user's monthly usage to 0
	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"api_usage.used_this_month": 0,
		},
	}

	result, err := config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset quota"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User quota reset successfully",
	})
}
