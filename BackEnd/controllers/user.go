package controllers

import (
	"context"
	"fmt"
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

	// Build API documentation data
	apiDoc := gin.H{
		"swagger": "2.0",
		"info": gin.H{
			"title":       "Your SchemaCraft API",
			"description": "Personal API documentation for your dynamic schemas",
			"version":     "1.0",
			"contact": gin.H{
				"name":  user.Name,
				"email": user.Email,
			},
		},
		"host":     c.Request.Host,
		"basePath": "/api",
		"schemes":  []string{"http", "https"},
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

	// Generate path documentation for each schema
	paths := gin.H{}
	definitions := gin.H{}

	for _, schema := range schemas {
		collectionName := schema.CollectionName

		// Add schema definition
		definitions[collectionName] = buildSchemaForCollection(schema)

		// GET /api/{collection}
		paths["/"+collectionName] = gin.H{
			"get": gin.H{
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
			},
			"post": gin.H{
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
			},
		}

		// GET/PUT/DELETE /api/{collection}/{id}
		paths["/"+collectionName+"/{id}"] = gin.H{
			"get": gin.H{
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
			},
			"put": gin.H{
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
			},
			"delete": gin.H{
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
			},
		}
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

	// HTML template for Swagger UI
	swaggerHTML := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>` + user.Name + ` - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
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
        }
        .info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info h1 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .info p {
            margin: 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="info">
        <h1>` + user.Name + `'s Personal API</h1>
        <p>Interactive documentation for your dynamic API endpoints</p>
        <p><strong>API Key:</strong> <code>` + user.APIKey + `</code></p>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
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

// Helper function to get the scheme (http/https)
func getScheme(c *gin.Context) string {
	if c.Request.TLS != nil {
		return "https"
	}
	if c.GetHeader("X-Forwarded-Proto") == "https" {
		return "https"
	}
	return "http"
}
