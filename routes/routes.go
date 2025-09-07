package routes

import (
	"schemacraft-backend/controllers"
	_ "schemacraft-backend/docs"
	"schemacraft-backend/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	authController := controllers.NewAuthController()
	userController := controllers.NewUserController()
	schemaController := controllers.NewSchemaController()
	adminController := controllers.NewAdminController()
	dynamicAPIController := controllers.NewDynamicAPIController()
	dynamicAuthController := controllers.NewDynamicAuthController()
	notificationController := controllers.NewNotificationController()
	activityController := controllers.NewActivityController()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "SchemaCraft API Server",
			"version": "1.0.0",
			"status":  "running",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/user/swagger-ui", userController.GetSwaggerUI)
	r.GET("/user/api-docs", userController.GetAPIDocumentation)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/signup", authController.Signup)
		authGroup.POST("/signin", authController.Signin)
		authGroup.POST("/google", authController.GoogleAuth)
	}

	protectedGroup := r.Group("/")
	protectedGroup.Use(middleware.AuthMiddleware())
	{
		protectedGroup.GET("/auth/me", authController.GetCurrentUser)
		protectedGroup.PUT("/auth/mongodb-uri", authController.UpdateMongoURI)
		protectedGroup.POST("/auth/test-mongodb", authController.TestMongoConnection)

		protectedGroup.GET("/notifications", notificationController.GetNotifications)
		protectedGroup.PUT("/notifications/:id/read", notificationController.MarkAsRead)
		protectedGroup.PUT("/notifications/read-all", notificationController.MarkAllAsRead)
		protectedGroup.DELETE("/notifications/:id", notificationController.DeleteNotification)
		protectedGroup.GET("/notifications/unread-count", notificationController.GetUnreadCount)

		protectedGroup.GET("/activities", activityController.GetActivities)
		protectedGroup.POST("/activities", activityController.CreateActivity)

		protectedGroup.GET("/user/dashboard", userController.GetDashboard)
		protectedGroup.POST("/user/regenerate-api-key", userController.RegenerateAPIKey)
		protectedGroup.GET("/user/api-usage", userController.GetAPIUsage)

		protectedGroup.GET("/user/api-documentation", userController.GetAPIDocumentation)

		protectedGroup.POST("/schemas", schemaController.CreateSchema)
		protectedGroup.GET("/schemas", schemaController.GetSchemas)
		protectedGroup.GET("/schemas/:id", schemaController.GetSchemaByID)
		protectedGroup.DELETE("/schemas/:id", schemaController.DeleteSchema)
	}

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

		adminGroup.POST("/migrate-quota-system", adminController.MigrateQuotaSystem)
		adminGroup.POST("/reset-all-quota", adminController.ResetAllUsersQuota)
	}

	apiGroup := r.Group("/api")
	apiGroup.Use(middleware.APIKeyMiddleware())
	{
		apiGroup.POST("/:collection/auth/signup", dynamicAuthController.Signup)
		apiGroup.POST("/:collection/auth/login", dynamicAuthController.Login)
		apiGroup.GET("/:collection/auth/validate", dynamicAuthController.ValidateToken)

		protectedAPIGroup := apiGroup.Group("")
		protectedAPIGroup.Use(middleware.DynamicAuthMiddleware())
		{
			protectedAPIGroup.POST("/:collection", dynamicAPIController.CreateDocument)
			protectedAPIGroup.GET("/:collection", dynamicAPIController.GetDocuments)
			protectedAPIGroup.GET("/:collection/:id", dynamicAPIController.GetDocumentByID)
			protectedAPIGroup.PUT("/:collection/:id", dynamicAPIController.UpdateDocument)
			protectedAPIGroup.DELETE("/:collection/:id", dynamicAPIController.DeleteDocument)
		}
	}

	return r
}
