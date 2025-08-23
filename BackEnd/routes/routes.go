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
		adminGroup.GET("/stats", adminController.GetPlatformStats)
	}

	// Dynamic API routes (require API Key)
	apiGroup := r.Group("/api")
	apiGroup.Use(middleware.APIKeyMiddleware())
	{
		// CRUD operations for dynamic collections
		apiGroup.POST("/:collection", dynamicAPIController.CreateDocument)
		apiGroup.GET("/:collection", dynamicAPIController.GetDocuments)
		apiGroup.GET("/:collection/:id", dynamicAPIController.GetDocumentByID)
		apiGroup.PUT("/:collection/:id", dynamicAPIController.UpdateDocument)
		apiGroup.DELETE("/:collection/:id", dynamicAPIController.DeleteDocument)
	}

	return r
}
