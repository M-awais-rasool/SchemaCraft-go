package main

import (
	"log"
	"os"

	"schemacraft-backend/config"
	"schemacraft-backend/routes"

	"github.com/joho/godotenv"
)

// @title SchemaCraft API
// @version 1.0
// @description Dynamic Schema API Builder - Create APIs on the fly with custom schemas
// @termsOfService http://swagger.io/terms/

// @contact.name SchemaCraft Support
// @contact.url http://www.schemacraft.com/support
// @contact.email support@schemacraft.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWT Bearer token. Format: Bearer {token}

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-API-Key
// @description API Key for dynamic API access

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Connect to MongoDB
	config.ConnectMongoDB()

	// Setup routes
	router := routes.SetupRoutes()

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("🚀 SchemaCraft API Server starting on port %s", port)
	log.Printf("📖 API Documentation: http://localhost:%s/swagger/index.html", port)
	log.Printf("🏠 Home: http://localhost:%s", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
