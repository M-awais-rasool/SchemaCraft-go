package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/controllers"
	"github.com/M-awais-rasool/SchemaCraft-go/models"
	"github.com/M-awais-rasool/SchemaCraft-go/utils"

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

		var user models.User
		err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"api_key": apiKey, "is_active": true}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		quotaReset, err := utils.CheckAndResetMonthlyQuota(user.ID, &user.APIUsage)
		if err != nil {
			fmt.Printf("Error checking/resetting quota for user %s: %v\n", user.ID.Hex(), err)
		}

		if quotaReset {
			err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": user.ID}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user data"})
				c.Abort()
				return
			}
		}

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
		}
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

			// Log API activity
			controllers.LogActivity(user.ID, models.ActivityTypeAPI, fmt.Sprintf("API call to %s", c.Request.URL.Path), "API endpoint accessed", "api", c.Request.URL.Path, map[string]any{
				"method":     c.Request.Method,
				"endpoint":   c.Request.URL.Path,
				"user_agent": c.GetHeader("User-Agent"),
			})

			if result.ModifiedCount > 0 {
				var updatedUser models.User
				err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": user.ID}).Decode(&updatedUser)
				if err != nil {
					return
				}

				notificationService := utils.NewNotificationService()
				err = notificationService.CheckAndCreateAPIUsageNotifications(
					updatedUser.ID,
					updatedUser.Name,
					updatedUser.APIUsage.UsedThisMonth,
					updatedUser.APIUsage.MonthlyQuota,
				)
				if err != nil {
					return
				}
			}
		}()

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

		path := c.Request.URL.Path
		if strings.Contains(path, "/auth/") {
			c.Next()
			return
		}

		apiUserID, exists := c.Get("api_user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		userID := apiUserID.(primitive.ObjectID)

		var schema models.Schema
		filter := bson.M{"user_id": userID, "collection_name": collection, "is_active": true}
		err := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schema)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schema not found"})
			c.Abort()
			return
		}

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

		if !requiresAuth {
			c.Next()
			return
		}

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

		if schema.AuthConfig == nil || !schema.AuthConfig.Enabled {
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

			schema.AuthConfig = authSchema.AuthConfig
		}

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

		if claims.UserID != userID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not valid for this user"})
			c.Abort()
			return
		}

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
