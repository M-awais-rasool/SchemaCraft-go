package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"schemacraft-backend/config"
	"schemacraft-backend/models"
	"schemacraft-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("is_admin", claims.IsAdmin)

		c.Next()
	}
}

func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API key required"})
			c.Abort()
			return
		}

		// Find user by API key
		var user models.User
		err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"api_key": apiKey, "is_active": true}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		// Check and reset monthly quota if necessary
		quotaReset, err := utils.CheckAndResetMonthlyQuota(user.ID, &user.APIUsage)
		if err != nil {
			// Log error but continue - don't fail the request due to quota reset issues
			fmt.Printf("Error checking/resetting quota for user %s: %v\n", user.ID.Hex(), err)
		}

		// If quota was reset, fetch updated user data
		if quotaReset {
			err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": user.ID}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user data"})
				c.Abort()
				return
			}
		}

		// Check if user has exceeded their quota
		if user.APIUsage.UsedThisMonth >= user.APIUsage.MonthlyQuota {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "API quota exceeded",
				"message": "You have reached your monthly API quota limit. Please upgrade your plan or wait until next month for quota reset.",
				"quota_info": gin.H{
					"used":  user.APIUsage.UsedThisMonth,
					"limit": user.APIUsage.MonthlyQuota,
				},
			})
			c.Abort()
			return
		} // Update API usage stats and check for notifications
		go func() {
			filter := bson.M{"_id": user.ID}
			update := bson.M{
				"$inc": bson.M{"api_usage.total_requests": 1, "api_usage.used_this_month": 1},
				"$set": bson.M{"api_usage.last_request": time.Now()},
			}
			result, err := config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
			if err != nil {
				return
			}

			// If update was successful, check for notifications
			if result.ModifiedCount > 0 {
				// Get updated user data to check new usage
				var updatedUser models.User
				err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": user.ID}).Decode(&updatedUser)
				if err != nil {
					return
				}

				// Check and create API usage notifications
				notificationService := utils.NewNotificationService()
				err = notificationService.CheckAndCreateAPIUsageNotifications(
					updatedUser.ID,
					updatedUser.Name,
					updatedUser.APIUsage.UsedThisMonth,
					updatedUser.APIUsage.MonthlyQuota,
				)
				if err != nil {
					// Log error but don't fail the request
					return
				}
			}
		}()

		// Store user info in context
		c.Set("api_user_id", user.ID)
		c.Set("api_user", user)

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin, exists := c.Get("is_admin")
		if !exists || !isAdmin.(bool) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func DynamicAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := c.Param("collection")
		if collection == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Collection parameter required"})
			c.Abort()
			return
		}

		// Skip auth endpoints
		path := c.Request.URL.Path
		if strings.Contains(path, "/auth/") {
			c.Next()
			return
		}

		// Get API user first
		apiUserID, exists := c.Get("api_user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		userID := apiUserID.(primitive.ObjectID)

		// Check if auth is enabled for this collection
		var schema models.Schema
		filter := bson.M{"user_id": userID, "collection_name": collection, "is_active": true}
		err := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schema)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
			c.Abort()
			return
		}

		// Check if the current endpoint requires protection
		method := strings.ToLower(c.Request.Method)
		requiresAuth := false

		if schema.EndpointProtection != nil {
			switch method {
			case "get":
				requiresAuth = schema.EndpointProtection.Get
			case "post":
				requiresAuth = schema.EndpointProtection.Post
			case "put":
				requiresAuth = schema.EndpointProtection.Put
			case "delete":
				requiresAuth = schema.EndpointProtection.Delete
			}
		}

		// If no protection required for this endpoint, proceed
		if !requiresAuth {
			c.Next()
			return
		}

		// Auth is required, validate token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		// If auth is required but no auth config exists, check for a valid auth system
		if schema.AuthConfig == nil || !schema.AuthConfig.Enabled {
			// Look for any available auth system for this user
			var authSchema models.Schema
			authFilter := bson.M{
				"user_id":             userID,
				"auth_config.enabled": true,
				"is_active":           true,
			}
			err := config.DB.Collection("schemas").FindOne(context.TODO(), authFilter).Decode(&authSchema)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required but no auth system configured"})
				c.Abort()
				return
			}

			// Use the auth system from the found schema
			schema.AuthConfig = authSchema.AuthConfig
		}

		// Validate token
		jwtSecret := schema.AuthConfig.JWTSecret
		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not configured"})
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &models.DynamicAuthClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*models.DynamicAuthClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Verify token belongs to this user (collection doesn't need to match for cross-table auth)
		if claims.UserID != userID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not valid for this user"})
			c.Abort()
			return
		}

		// Store dynamic auth info in context
		c.Set("dynamic_auth_user_id", claims.SchemaUserID)
		c.Set("dynamic_auth_schema_id", claims.SchemaID)

		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-API-Key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
