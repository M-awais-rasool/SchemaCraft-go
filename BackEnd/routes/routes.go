package routes

import (
	"schemacraft-backend/controllers"
	_ "schemacraft-backend/docs" // This is required for go-swagger
	"schemacraft-backend/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())

	// Initialize controllers
	authController := controllers.NewAuthController()
	userController := controllers.NewUserController()
	schemaController := controllers.NewSchemaController()
	adminController := controllers.NewAdminController()
	dynamicAPIController := controllers.NewDynamicAPIController()
	dynamicAuthController := controllers.NewDynamicAuthController()
	notificationController := controllers.NewNotificationController()

	// Public routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "SchemaCraft API Server",
			"version": "1.0.0",
			"status":  "running",
		})
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// User-specific Swagger UI and API docs (allows token-based access for direct browser viewing)
	r.GET("/user/swagger-ui", userController.GetSwaggerUI)
	r.GET("/user/api-docs", userController.GetAPIDocumentation)

	// Auth routes (public)
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/signup", authController.Signup)
		authGroup.POST("/signin", authController.Signin)
		authGroup.POST("/google", authController.GoogleAuth)
	}

	// Protected routes (require JWT)
	protectedGroup := r.Group("/")
	protectedGroup.Use(middleware.AuthMiddleware())
	{
		// Auth routes (protected)
		protectedGroup.GET("/auth/me", authController.GetCurrentUser)
		protectedGroup.PUT("/auth/mongodb-uri", authController.UpdateMongoURI)
		protectedGroup.POST("/auth/test-mongodb", authController.TestMongoConnection)

		// Notification routes
		protectedGroup.GET("/notifications", notificationController.GetNotifications)
		protectedGroup.PUT("/notifications/:id/read", notificationController.MarkAsRead)
		protectedGroup.PUT("/notifications/read-all", notificationController.MarkAllAsRead)
		protectedGroup.DELETE("/notifications/:id", notificationController.DeleteNotification)
		protectedGroup.GET("/notifications/unread-count", notificationController.GetUnreadCount)

		// User dashboard routes
		protectedGroup.GET("/user/dashboard", userController.GetDashboard)
		protectedGroup.POST("/user/regenerate-api-key", userController.RegenerateAPIKey)
		protectedGroup.GET("/user/api-usage", userController.GetAPIUsage)

		// API documentation for frontend (protected route)
		protectedGroup.GET("/user/api-documentation", userController.GetAPIDocumentation)

		// Schema management routes
		protectedGroup.POST("/schemas", schemaController.CreateSchema)
		protectedGroup.GET("/schemas", schemaController.GetSchemas)
		protectedGroup.GET("/schemas/:id", schemaController.GetSchemaByID)
		protectedGroup.DELETE("/schemas/:id", schemaController.DeleteSchema)
	}

	// Admin routes (require JWT + admin role)
	adminGroup := r.Group("/admin")
	adminGroup.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminGroup.GET("/users", adminController.GetAllUsers)
		adminGroup.GET("/users/:id", adminController.GetUserByID)
		adminGroup.PUT("/users/:id/toggle-status", adminController.ToggleUserStatus)
		adminGroup.POST("/users/:id/revoke-api-key", adminController.RevokeAPIKey)
		adminGroup.POST("/users/:id/reset-quota", adminController.ResetUserQuota)
		adminGroup.GET("/stats", adminController.GetPlatformStats)
		adminGroup.GET("/api-usage", adminController.GetAPIUsageStats)
	}

	// Dynamic API routes (require API Key)
	apiGroup := r.Group("/api")
	apiGroup.Use(middleware.APIKeyMiddleware())
	{
		// Authentication endpoints (public within API)
		apiGroup.POST("/:collection/auth/signup", dynamicAuthController.Signup)
		apiGroup.POST("/:collection/auth/login", dynamicAuthController.Login)
		apiGroup.GET("/:collection/auth/validate", dynamicAuthController.ValidateToken)

		// Protected dynamic API routes (apply dynamic auth middleware)
		protectedAPIGroup := apiGroup.Group("")
		protectedAPIGroup.Use(middleware.DynamicAuthMiddleware())
		{
			// CRUD operations for dynamic collections
			protectedAPIGroup.POST("/:collection", dynamicAPIController.CreateDocument)
			protectedAPIGroup.GET("/:collection", dynamicAPIController.GetDocuments)
			protectedAPIGroup.GET("/:collection/:id", dynamicAPIController.GetDocumentByID)
			protectedAPIGroup.PUT("/:collection/:id", dynamicAPIController.UpdateDocument)
			protectedAPIGroup.DELETE("/:collection/:id", dynamicAPIController.DeleteDocument)
		}
	}

	return r
}
