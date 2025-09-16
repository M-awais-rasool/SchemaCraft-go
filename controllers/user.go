package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/models"
	"github.com/M-awais-rasool/SchemaCraft-go/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	schemaCount, err := config.DB.Collection("schemas").CountDocuments(
		context.TODO(),
		bson.M{"user_id": userID, "is_active": true},
	)
	if err != nil {
		schemaCount = 0
	}

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

	activityCursor, err := config.DB.Collection("activities").Find(
		context.TODO(),
		bson.M{"user_id": userID},
		options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(5),
	)
	var recentActivities []models.Activity
	if err == nil {
		defer activityCursor.Close(context.TODO())
		activityCursor.All(context.TODO(), &recentActivities)
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
		"schemas":           schemas,
		"recent_activities": recentActivities,
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

	newAPIKey, err := utils.GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate API key"})
		return
	}

	filter := bson.M{"_id": userID}
	update := bson.M{"$set": bson.M{"api_key": newAPIKey}}

	_, err = config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update API key"})
		return
	}

	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeSecurity, "Generated new API key", "API key regenerated for security", "api_key", "", nil)

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

// @Summary Get user API documentation
// @Description Get personalized API documentation for the user's schemas
// @Tags user
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /user/api-docs [get]
func (uc *UserController) GetAPIDocumentation(c *gin.Context) {
	userID, exists := c.Get("user_id")

	if !exists {
		token := c.Query("token")
		if token != "" {
			claims, err := utils.ValidateJWT(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
				return
			}
			userID = claims.UserID
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	}

	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

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

	scheme := getScheme(c)
	apiDoc := gin.H{
		"swagger": "2.0",
		"info": gin.H{
			"title":       "",
			"description": "",
			"version":     "",
		},
		"host":     c.Request.Host,
		"basePath": "/api",
		"schemes":  []string{scheme},
		"produces": []string{"application/json"},
		"consumes": []string{"application/json"},
		"security": []gin.H{
			{"ApiKeyAuth": []string{}},
		},
		"securityDefinitions": gin.H{
			"ApiKeyAuth": gin.H{
				"type":        "apiKey",
				"name":        "X-API-Key",
				"in":          "header",
				"description": "Your personal API key",
			},
		},
		"api_key":     user.APIKey,
		"paths":       gin.H{},
		"definitions": gin.H{},
		"schemas":     schemas,
	}

	paths := gin.H{}
	definitions := gin.H{}

	for _, schema := range schemas {
		collectionName := schema.CollectionName

		definitions[collectionName] = buildSchemaForCollection(schema)

		if schema.AuthConfig != nil && schema.AuthConfig.Enabled {
			paths["/"+collectionName+"/auth/signup"] = gin.H{
				"post": gin.H{
					"summary":     "Sign up for " + collectionName,
					"description": "Create a new user account in the " + collectionName + " authentication system",
					"tags":        []string{collectionName + " Auth"},
					"parameters": []gin.H{
						{
							"name":        "body",
							"in":          "body",
							"required":    true,
							"description": "User signup data",
							"schema": gin.H{
								"type": "object",
								"properties": gin.H{
									"data": gin.H{
										"type":        "object",
										"description": "User data according to your schema",
										"properties":  buildAuthSchemaProperties(schema),
									},
								},
								"required": []string{"data"},
							},
						},
					},
					"responses": gin.H{
						"201": gin.H{
							"description": "User created successfully",
							"schema": gin.H{
								"$ref": "#/definitions/AuthResponse",
							},
						},
						"400": gin.H{"description": "Bad Request"},
						"409": gin.H{"description": "User already exists"},
						"500": gin.H{"description": "Internal Server Error"},
					},
				},
			}

			paths["/"+collectionName+"/auth/login"] = gin.H{
				"post": gin.H{
					"summary":     "Login to " + collectionName,
					"description": "Authenticate user and get access token",
					"tags":        []string{collectionName + " Auth"},
					"parameters": []gin.H{
						{
							"name":        "body",
							"in":          "body",
							"required":    true,
							"description": "Login credentials",
							"schema": gin.H{
								"$ref": "#/definitions/LoginRequest",
							},
						},
					},
					"responses": gin.H{
						"200": gin.H{
							"description": "Login successful",
							"schema": gin.H{
								"$ref": "#/definitions/AuthResponse",
							},
						},
						"401": gin.H{"description": "Invalid credentials"},
						"500": gin.H{"description": "Internal Server Error"},
					},
				},
			}

			paths["/"+collectionName+"/auth/validate"] = gin.H{
				"get": gin.H{
					"summary":     "Validate token for " + collectionName,
					"description": "Validate authentication token",
					"tags":        []string{collectionName + " Auth"},
					"security": []gin.H{
						{"BearerAuth": []string{}},
					},
					"responses": gin.H{
						"200": gin.H{
							"description": "Token is valid",
							"schema": gin.H{
								"type": "object",
								"properties": gin.H{
									"valid":      gin.H{"type": "boolean"},
									"user_id":    gin.H{"type": "string"},
									"collection": gin.H{"type": "string"},
									"expires_at": gin.H{"type": "string", "format": "date-time"},
								},
							},
						},
						"401": gin.H{"description": "Invalid token"},
					},
				},
			}

			paths["/"+collectionName+"/auth/users"] = gin.H{
				"get": gin.H{
					"summary":     "Get all users from " + collectionName,
					"description": "Retrieve all users from the " + collectionName + " authentication system",
					"tags":        []string{collectionName + " Auth"},
					"parameters": []gin.H{
						{
							"name":        "page",
							"in":          "query",
							"type":        "integer",
							"description": "Page number (default: 1)",
						},
						{
							"name":        "limit",
							"in":          "query",
							"type":        "integer",
							"description": "Items per page (default: 10, max: 100)",
						},
					},
					"responses": gin.H{
						"200": gin.H{
							"description": "Users retrieved successfully",
							"schema": gin.H{
								"type": "object",
								"properties": gin.H{
									"data": gin.H{
										"type": "array",
										"items": gin.H{
											"type":        "object",
											"description": "User data according to your schema response fields",
										},
									},
									"total":       gin.H{"type": "integer"},
									"page":        gin.H{"type": "integer"},
									"limit":       gin.H{"type": "integer"},
									"total_pages": gin.H{"type": "integer"},
								},
							},
						},
						"401": gin.H{"description": "Unauthorized"},
						"404": gin.H{"description": "Authentication not configured"},
						"500": gin.H{"description": "Internal Server Error"},
					},
				},
			}

			// Update security definitions to include Bearer auth
			securityDefs := apiDoc["securityDefinitions"].(gin.H)
			securityDefs["BearerAuth"] = gin.H{
				"type":        "apiKey",
				"name":        "Authorization",
				"in":          "header",
				"description": "Bearer token for authenticated requests. Format: Bearer {token}",
			}

			// Skip CRUD endpoints for auth-only schemas - only show auth endpoints
			continue
		}

		// Add CRUD endpoints only for non-auth schemas
		// GET /api/{collection}
		getEndpoint := gin.H{
			"summary":     "Get all " + collectionName,
			"description": "Retrieve all documents from the " + collectionName + " collection",
			"tags":        []string{collectionName},
			"parameters": []gin.H{
				{
					"name":        "page",
					"in":          "query",
					"type":        "integer",
					"description": "Page number (default: 1)",
				},
				{
					"name":        "limit",
					"in":          "query",
					"type":        "integer",
					"description": "Items per page (default: 10, max: 100)",
				},
			},
			"responses": gin.H{
				"200": gin.H{"description": "Success"},
				"401": gin.H{"description": "Unauthorized"},
				"500": gin.H{"description": "Internal Server Error"},
			},
		}

		postEndpoint := gin.H{
			"summary":     "Create " + collectionName,
			"description": "Create a new document in the " + collectionName + " collection",
			"tags":        []string{collectionName},
			"parameters": []gin.H{
				{
					"name":        "body",
					"in":          "body",
					"required":    true,
					"description": "Document data",
					"schema": gin.H{
						"$ref": "#/definitions/" + collectionName,
					},
				},
			},
			"responses": gin.H{
				"201": gin.H{"description": "Created"},
				"400": gin.H{"description": "Bad Request"},
				"401": gin.H{"description": "Unauthorized"},
				"500": gin.H{"description": "Internal Server Error"},
			},
		}

		// Add authentication requirement if endpoint is protected
		if schema.EndpointProtection != nil && schema.EndpointProtection.Get {
			getEndpoint["security"] = []gin.H{{"BearerAuth": []string{}}}
		}
		if schema.EndpointProtection != nil && schema.EndpointProtection.Post {
			postEndpoint["security"] = []gin.H{{"BearerAuth": []string{}}}
		}

		paths["/"+collectionName] = gin.H{
			"get":  getEndpoint,
			"post": postEndpoint,
		}

		// GET/PUT/DELETE /api/{collection}/{id}
		getByIdEndpoint := gin.H{
			"summary":     "Get " + collectionName + " by ID",
			"description": "Retrieve a specific document by ID",
			"tags":        []string{collectionName},
			"parameters": []gin.H{
				{
					"name":        "id",
					"in":          "path",
					"required":    true,
					"type":        "string",
					"description": "Document ID",
				},
			},
			"responses": gin.H{
				"200": gin.H{"description": "Success"},
				"401": gin.H{"description": "Unauthorized"},
				"404": gin.H{"description": "Not Found"},
				"500": gin.H{"description": "Internal Server Error"},
			},
		}

		putEndpoint := gin.H{
			"summary":     "Update " + collectionName,
			"description": "Update a specific document by ID",
			"tags":        []string{collectionName},
			"parameters": []gin.H{
				{
					"name":        "id",
					"in":          "path",
					"required":    true,
					"type":        "string",
					"description": "Document ID",
				},
				{
					"name":        "body",
					"in":          "body",
					"required":    true,
					"description": "Update data",
					"schema": gin.H{
						"$ref": "#/definitions/" + collectionName,
					},
				},
			},
			"responses": gin.H{
				"200": gin.H{"description": "Success"},
				"400": gin.H{"description": "Bad Request"},
				"401": gin.H{"description": "Unauthorized"},
				"404": gin.H{"description": "Not Found"},
				"500": gin.H{"description": "Internal Server Error"},
			},
		}

		deleteEndpoint := gin.H{
			"summary":     "Delete " + collectionName,
			"description": "Delete a specific document by ID",
			"tags":        []string{collectionName},
			"parameters": []gin.H{
				{
					"name":        "id",
					"in":          "path",
					"required":    true,
					"type":        "string",
					"description": "Document ID",
				},
			},
			"responses": gin.H{
				"200": gin.H{"description": "Success"},
				"401": gin.H{"description": "Unauthorized"},
				"404": gin.H{"description": "Not Found"},
				"500": gin.H{"description": "Internal Server Error"},
			},
		}

		// Add authentication requirement if endpoint is protected
		if schema.EndpointProtection != nil && schema.EndpointProtection.Get {
			getByIdEndpoint["security"] = []gin.H{{"BearerAuth": []string{}}}
		}
		if schema.EndpointProtection != nil && schema.EndpointProtection.Put {
			putEndpoint["security"] = []gin.H{{"BearerAuth": []string{}}}
		}
		if schema.EndpointProtection != nil && schema.EndpointProtection.Delete {
			deleteEndpoint["security"] = []gin.H{{"BearerAuth": []string{}}}
		}

		paths["/"+collectionName+"/{id}"] = gin.H{
			"get":    getByIdEndpoint,
			"put":    putEndpoint,
			"delete": deleteEndpoint,
		}
	}

	// Add common authentication definitions
	definitions["LoginRequest"] = gin.H{
		"type": "object",
		"properties": gin.H{
			"identifier": gin.H{
				"type":        "string",
				"description": "Email or username",
			},
			"password": gin.H{
				"type":        "string",
				"description": "Password",
			},
		},
		"required": []string{"identifier", "password"},
	}

	definitions["AuthResponse"] = gin.H{
		"type": "object",
		"properties": gin.H{
			"token": gin.H{
				"type":        "string",
				"description": "JWT access token",
			},
			"user": gin.H{
				"type":        "object",
				"description": "User data",
			},
			"expires_at": gin.H{
				"type":        "string",
				"format":      "date-time",
				"description": "Token expiration time",
			},
		},
	}

	apiDoc["paths"] = paths
	apiDoc["definitions"] = definitions

	c.JSON(http.StatusOK, apiDoc)
}

// Helper function to build schema definition from user's schema
func buildSchemaForCollection(schema models.Schema) gin.H {
	properties := gin.H{}
	required := []string{}

	for _, field := range schema.Fields {
		fieldSchema := gin.H{
			"type":        field.Type,
			"description": field.Description,
		}

		if field.Default != nil {
			fieldSchema["default"] = field.Default
		}

		properties[field.Name] = fieldSchema

		if field.Required {
			required = append(required, field.Name)
		}
	}

	schemaDefinition := gin.H{
		"type":       "object",
		"properties": properties,
	}

	if len(required) > 0 {
		schemaDefinition["required"] = required
	}

	return schemaDefinition
}

// Helper function to build auth schema properties
func buildAuthSchemaProperties(schema models.Schema) gin.H {
	properties := gin.H{}

	if schema.AuthConfig != nil {
		// Add common auth fields
		emailField := schema.AuthConfig.LoginFields.EmailField
		if emailField != "" {
			properties[emailField] = gin.H{
				"type":        "string",
				"format":      "email",
				"description": "Email address",
			}
		}

		usernameField := schema.AuthConfig.LoginFields.UsernameField
		if usernameField != "" {
			properties[usernameField] = gin.H{
				"type":        "string",
				"description": "Username",
			}
		}

		passwordField := schema.AuthConfig.PasswordField
		if passwordField != "" {
			properties[passwordField] = gin.H{
				"type":        "string",
				"format":      "password",
				"description": "Password",
			}
		}

		// Add other schema fields
		for _, field := range schema.Fields {
			if field.Name != passwordField && field.Name != emailField && field.Name != usernameField {
				fieldSchema := gin.H{
					"type":        field.Type,
					"description": field.Description,
				}
				if field.Default != nil {
					fieldSchema["default"] = field.Default
				}
				properties[field.Name] = fieldSchema
			}
		}
	}

	return properties
}

// @Summary Get user Swagger UI
// @Description Get personalized Swagger UI for the user's APIs
// @Tags user
// @Produce html
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /user/swagger-ui [get]
func (uc *UserController) GetSwaggerUI(c *gin.Context) {
	// Try to get user ID from JWT middleware first
	userID, exists := c.Get("user_id")

	// If not found in context, try to get from query parameter (for direct access)
	if !exists {
		token := c.Query("token")
		if token != "" {
			// Validate the token manually
			claims, err := utils.ValidateJWT(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
				return
			}
			userID = claims.UserID
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	}

	// Get user info
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Generate the Swagger spec URL for this user
	swaggerSpecURL := fmt.Sprintf("%s://%s/user/api-docs", getScheme(c), c.Request.Host)

	// Add token to the API docs URL if it was provided as query param
	token := c.Query("token")
	if token != "" {
		swaggerSpecURL += "?token=" + token
	}

	swaggerHTML := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>` + user.Name + ` - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        .info {
            background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
            position: relative;
            overflow: hidden;
            color: white;
            padding: 0;
            margin-bottom: 0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .info::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }
        .header-container {
            position: relative;
            z-index: 1;
            padding: 32px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        .header-left {
            flex: 1;
            min-width: 300px;
        }
        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        .header-title {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
        }
        .header-subtitle {
            margin: 0;
            font-size: 16px;
            font-weight: 400;
            color: #cbd5e1;
            line-height: 1.4;
        }
        .api-key-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 16px 20px;
            min-width: 300px;
        }
        .api-key-label {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
        }
        .api-key-value {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px 16px;
            font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            color: #e2e8f0;
            word-break: break-all;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .api-key-value:hover {
            background: rgba(15, 23, 42, 0.8);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .copy-indicator {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: #22c55e;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .status-badge {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
            .header-container {
                padding: 24px 20px;
                flex-direction: column;
                align-items: flex-start;
            }
            .header-right {
                width: 100%;
            }
            .api-key-container {
                min-width: 100%;
            }
            .header-title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="info">
        <div class="header-container">
            <div class="header-left">
                <div class="logo-section">
                    <div class="logo-icon">` + string(user.Name[0]) + `</div>
                    <div>
                        <h1 class="header-title">` + user.Name + `'s Personal API</h1>
                        <p class="header-subtitle">Interactive documentation for your dynamic API endpoints</p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <div class="status-badge">Active</div>
                <div class="api-key-container">
                    <span class="api-key-label">API Key</span>
                    <div class="api-key-value" onclick="copyToClipboard('` + user.APIKey + `')" title="Click to copy">
                        ` + user.APIKey + `
                        <span class="copy-indicator" id="copyIndicator">Copied!</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                const indicator = document.getElementById('copyIndicator');
                indicator.style.opacity = '1';
                setTimeout(() => {
                    indicator.style.opacity = '0';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
            });
        }

        SwaggerUIBundle({
            url: '` + swaggerSpecURL + `',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            requestInterceptor: function(request) {
                // Automatically add the API key to requests
                if (request.url.includes('/api/')) {
                    request.headers['X-API-Key'] = '` + user.APIKey + `';
                }
                return request;
            },
            onComplete: function() {
                // Add custom styling
                const style = document.createElement('style');
                style.textContent = '.swagger-ui .topbar { display: none; } .swagger-ui .info { margin-bottom: 0; }';
                document.head.appendChild(style);
                console.log('Swagger UI loaded successfully');
            },
            onFailure: function(error) {
                console.error('Failed to load Swagger UI:', error);
                document.getElementById('swagger-ui').innerHTML = '<div style="padding: 20px; color: red;">Failed to load API documentation: ' + error + '</div>';
            }
        });
    </script>
</body>
</html>`

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
	c.String(http.StatusOK, swaggerHTML)
}

func getScheme(c *gin.Context) string {
	if os.Getenv("FORCE_HTTPS") == "true" || os.Getenv("GIN_MODE") == "release" {
		return "https"
	}

	if c.Request.TLS != nil {
		return "https"
	}

	if forwardedProto := c.GetHeader("X-Forwarded-Proto"); forwardedProto != "" {
		return forwardedProto
	}

	if c.GetHeader("CF-Visitor") != "" {
		return "https"
	}

	if c.GetHeader("X-Forwarded-Ssl") == "on" {
		return "https"
	}

	if c.GetHeader("X-Url-Scheme") == "https" {
		return "https"
	}

	if c.Request.Header.Get("X-Real-IP") != "" || c.Request.Header.Get("X-Forwarded-For") != "" {
		return "https"
	}

	return "http"
}
