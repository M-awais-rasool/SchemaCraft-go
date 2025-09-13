package controllers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type DynamicAuthController struct{}

func NewDynamicAuthController() *DynamicAuthController {
	return &DynamicAuthController{}
}

// Helper function to get authentication configuration for a collection
func (dac *DynamicAuthController) getAuthConfig(userID primitive.ObjectID, collection string) (*models.Schema, error) {
	var schema models.Schema
	filter := bson.M{"user_id": userID, "collection_name": collection, "is_active": true}
	err := config.DB.Collection("schemas").FindOne(context.TODO(), filter).Decode(&schema)
	if err != nil {
		return nil, err
	}

	if schema.AuthConfig == nil || !schema.AuthConfig.Enabled {
		return nil, errors.New("authentication not enabled for this collection")
	}

	return &schema, nil
}

// Helper function to generate JWT token for dynamic auth
func (dac *DynamicAuthController) generateDynamicJWT(userID, schemaUserID, schemaID primitive.ObjectID, collection string, jwtSecret string, expirationHours int) (string, time.Time, error) {
	expiresAt := time.Now().Add(time.Duration(expirationHours) * time.Hour)

	claims := &models.DynamicAuthClaims{
		UserID:       userID,
		SchemaUserID: schemaUserID,
		Collection:   collection,
		SchemaID:     schemaID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))

	return tokenString, expiresAt, err
}

// Helper function to validate dynamic JWT token
func (dac *DynamicAuthController) validateDynamicJWT(tokenString, jwtSecret string) (*models.DynamicAuthClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.DynamicAuthClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*models.DynamicAuthClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// Helper function to get user's database
func (dac *DynamicAuthController) getUserDatabase(c *gin.Context) (*mongo.Database, error) {
	apiUser, exists := c.Get("api_user")
	if !exists {
		return nil, errors.New("user not found in context")
	}

	user := apiUser.(models.User)
	if user.MongoDBURI == "" || user.DatabaseName == "" {
		return nil, errors.New("MongoDB connection not configured")
	}

	return config.GetUserDatabase(user.MongoDBURI, user.DatabaseName)
}

// Helper function to filter response fields
func (dac *DynamicAuthController) filterResponseFields(userData map[string]interface{}, responseFields []string) map[string]interface{} {
	if len(responseFields) == 0 {
		// If no specific fields configured, return all except password
		result := make(map[string]interface{})
		for key, value := range userData {
			if !strings.Contains(strings.ToLower(key), "password") {
				result[key] = value
			}
		}
		return result
	}

	result := make(map[string]interface{})
	for _, field := range responseFields {
		if value, exists := userData[field]; exists {
			result[field] = value
		}
	}
	return result
}

// @Summary Dynamic API Signup
// @Description Sign up for a dynamic API with custom schema
// @Tags dynamic-auth
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param signup body models.DynamicAuthSignupRequest true "Signup data"
// @Success 201 "Created"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 409 "Conflict"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/auth/signup [post]
func (dac *DynamicAuthController) Signup(c *gin.Context) {
	collection := c.Param("collection")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)

	// Get authentication configuration
	schema, err := dac.getAuthConfig(userID, collection)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Authentication not configured for this collection"})
		return
	}

	if !schema.AuthConfig.AllowSignup {
		c.JSON(http.StatusForbidden, gin.H{"error": "Signup is not allowed for this collection"})
		return
	}

	// Get user's database
	db, err := dac.getUserDatabase(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	// Parse request body
	var req models.DynamicAuthSignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields based on schema
	authConfig := schema.AuthConfig
	emailField := authConfig.LoginFields.EmailField
	passwordField := authConfig.PasswordField

	email, emailExists := req.Data[emailField]
	password, passwordExists := req.Data[passwordField]

	if !emailExists || !passwordExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Required fields missing: %s, %s", emailField, passwordField),
		})
		return
	}

	emailStr, ok := email.(string)
	if !ok || emailStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	passwordStr, ok := password.(string)
	if !ok || passwordStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password format"})
		return
	}

	// Check if user already exists
	userCollection := authConfig.UserCollection
	if userCollection == "" {
		userCollection = collection + "_users"
	}

	existingUser := bson.M{}
	filter := bson.M{emailField: emailStr}
	err = db.Collection(userCollection).FindOne(context.TODO(), filter).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	} else if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwordStr), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Prepare user document
	userDoc := bson.M{
		"_id":        primitive.NewObjectID(),
		"created_at": time.Now(),
		"updated_at": time.Now(),
	}

	// Add all fields from request
	for key, value := range req.Data {
		if key == passwordField {
			userDoc[key] = string(hashedPassword)
		} else {
			userDoc[key] = value
		}
	}

	// Insert user
	result, err := db.Collection(userCollection).InsertOne(context.TODO(), userDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Get the inserted user ID
	schemaUserID := result.InsertedID.(primitive.ObjectID)

	// Generate JWT token
	jwtSecret := authConfig.JWTSecret
	if jwtSecret == "" {
		// Generate a random secret if not configured
		secretBytes := make([]byte, 32)
		rand.Read(secretBytes)
		jwtSecret = hex.EncodeToString(secretBytes)

		// Save the generated secret to the schema
		update := bson.M{"$set": bson.M{"auth_config.jwt_secret": jwtSecret}}
		config.DB.Collection("schemas").UpdateOne(context.TODO(), bson.M{"_id": schema.ID}, update)
	}

	tokenExpiration := authConfig.TokenExpiration
	if tokenExpiration == 0 {
		tokenExpiration = 24 // Default 24 hours
	}

	token, expiresAt, err := dac.generateDynamicJWT(userID, schemaUserID, schema.ID, collection, jwtSecret, tokenExpiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Filter response fields
	responseData := dac.filterResponseFields(req.Data, authConfig.ResponseFields)
	responseData["id"] = schemaUserID.Hex()

	c.JSON(http.StatusCreated, models.DynamicAuthResponse{
		Token:     token,
		User:      responseData,
		ExpiresAt: expiresAt,
	})
}

// @Summary Dynamic API Login
// @Description Login to a dynamic API with custom schema
// @Tags dynamic-auth
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param login body models.DynamicAuthLoginRequest true "Login credentials"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/auth/login [post]
func (dac *DynamicAuthController) Login(c *gin.Context) {
	collection := c.Param("collection")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)

	// Get authentication configuration
	schema, err := dac.getAuthConfig(userID, collection)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Authentication not configured for this collection"})
		return
	}

	// Get user's database
	db, err := dac.getUserDatabase(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	// Parse request body
	var req models.DynamicAuthLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prepare login filter based on configuration
	authConfig := schema.AuthConfig
	emailField := authConfig.LoginFields.EmailField
	usernameField := authConfig.LoginFields.UsernameField
	passwordField := authConfig.PasswordField

	var filter bson.M
	if authConfig.LoginFields.AllowBoth && usernameField != "" {
		// Allow login with either email or username
		filter = bson.M{
			"$or": []bson.M{
				{emailField: req.Identifier},
				{usernameField: req.Identifier},
			},
		}
	} else {
		// Login with email only
		filter = bson.M{emailField: req.Identifier}
	}

	// Find user
	userCollection := authConfig.UserCollection
	if userCollection == "" {
		userCollection = collection + "_users"
	}

	var userData bson.M
	err = db.Collection(userCollection).FindOne(context.TODO(), filter).Decode(&userData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Verify password
	storedPassword, exists := userData[passwordField]
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password field not found"})
		return
	}

	storedPasswordStr, ok := storedPassword.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid password format"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPasswordStr), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Get user ID
	schemaUserID := userData["_id"].(primitive.ObjectID)

	// Generate JWT token
	jwtSecret := authConfig.JWTSecret
	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not configured"})
		return
	}

	tokenExpiration := authConfig.TokenExpiration
	if tokenExpiration == 0 {
		tokenExpiration = 24 // Default 24 hours
	}

	token, expiresAt, err := dac.generateDynamicJWT(userID, schemaUserID, schema.ID, collection, jwtSecret, tokenExpiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Filter response fields
	responseData := dac.filterResponseFields(userData, authConfig.ResponseFields)
	responseData["id"] = schemaUserID.Hex()

	c.JSON(http.StatusOK, models.DynamicAuthResponse{
		Token:     token,
		User:      responseData,
		ExpiresAt: expiresAt,
	})
}

// @Summary Validate Dynamic Auth Token
// @Description Validate authentication token for dynamic API
// @Tags dynamic-auth
// @Produce json
// @Security ApiKeyAuth
// @Param collection path string true "Collection name"
// @Param Authorization header string true "Bearer token"
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /api/{collection}/auth/validate [get]
func (dac *DynamicAuthController) ValidateToken(c *gin.Context) {
	collection := c.Param("collection")

	apiUserID, exists := c.Get("api_user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := apiUserID.(primitive.ObjectID)

	// Get authentication configuration
	schema, err := dac.getAuthConfig(userID, collection)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Authentication not configured for this collection"})
		return
	}

	// Get token from header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
		return
	}

	// Validate token
	jwtSecret := schema.AuthConfig.JWTSecret
	claims, err := dac.validateDynamicJWT(tokenString, jwtSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Verify token belongs to this collection and user
	if claims.Collection != collection || claims.UserID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not valid for this collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":      true,
		"user_id":    claims.SchemaUserID.Hex(),
		"collection": claims.Collection,
		"expires_at": claims.ExpiresAt,
	})
}
