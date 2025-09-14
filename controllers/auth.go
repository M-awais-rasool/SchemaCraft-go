package controllers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"github.com/M-awais-rasool/SchemaCraft-go/models"
	"github.com/M-awais-rasool/SchemaCraft-go/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// @Summary User signup
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.SignupRequest true "Signup data"
// @Success 201 "Success"
// @Failure 400 "Bad Request"
// @Failure 409 "Conflict"
// @Failure 500 "Internal Server Error"
// @Router /auth/signup [post]
func (ac *AuthController) Signup(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	} else if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate API key
	apiKey, err := utils.GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate API key"})
		return
	}

	// Create user
	now := time.Now()
	nextMonthStart := utils.GetNextMonthStart(now)

	user := models.User{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Email:     req.Email,
		Password:  hashedPassword,
		APIKey:    apiKey,
		IsAdmin:   false,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
		APIUsage: models.APIUsageStats{
			MonthlyQuota:  1000, // Default quota
			UsedThisMonth: 0,
			QuotaResetAt:  nextMonthStart,
		},
	}

	// Insert user
	_, err = config.DB.Collection("users").InsertOne(context.TODO(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.IsAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Log signup activity
	go LogActivityWithContext(c, user.ID, models.ActivityTypeAuth, "User signed up", "New user account created", "user", user.ID.Hex(), nil)

	// Store password status before removing it (signup users always have password)
	hasPassword := true
	user.Password = "" // Remove password from response

	c.JSON(http.StatusCreated, gin.H{
		"user": gin.H{
			"id":            user.ID.Hex(),
			"name":          user.Name,
			"email":         user.Email,
			"google_id":     user.GoogleID,
			"api_key":       user.APIKey,
			"mongodb_uri":   user.MongoDBURI,
			"database_name": user.DatabaseName,
			"is_admin":      user.IsAdmin,
			"is_active":     user.IsActive,
			"created_at":    user.CreatedAt,
			"updated_at":    user.UpdatedAt,
			"last_login":    user.LastLogin,
			"api_usage":     user.APIUsage,
			"has_password":  hasPassword,
		},
		"token": token,
	})
}

// @Summary User signin
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login credentials"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/signin [post]
func (ac *AuthController) Signin(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"email": req.Email, "is_active": true}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if this is a Google user without a password set
	if user.GoogleID != "" && user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":                "This email is linked to a Google account. Please sign in with Google, or set up a password for email login.",
			"google_account":       true,
			"needs_password_setup": true,
		})
		return
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Update last login
	config.DB.Collection("users").UpdateOne(
		context.TODO(),
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{"last_login": time.Now()}},
	)

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.IsAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Log login activity
	go LogActivityWithContext(c, user.ID, models.ActivityTypeLogin, "User signed in", "User logged into account", "user", user.ID.Hex(), nil)

	// Store password status before removing it
	hasPassword := user.Password != ""
	user.Password = "" // Remove password from response

	// Send response with custom structure to include has_password
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":            user.ID.Hex(),
			"name":          user.Name,
			"email":         user.Email,
			"google_id":     user.GoogleID,
			"api_key":       user.APIKey,
			"mongodb_uri":   user.MongoDBURI,
			"database_name": user.DatabaseName,
			"is_admin":      user.IsAdmin,
			"is_active":     user.IsActive,
			"created_at":    user.CreatedAt,
			"updated_at":    user.UpdatedAt,
			"last_login":    user.LastLogin,
			"api_usage":     user.APIUsage,
			"has_password":  hasPassword,
		},
		"token": token,
	})
}

// @Summary Get current user
// @Description Get current authenticated user information
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 "Success"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/me [get]
func (ac *AuthController) GetCurrentUser(c *gin.Context) {
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

	// Store password status before removing it
	hasPassword := user.Password != ""
	user.Password = "" // Remove password from response

	// Add additional info about user's authentication setup
	response := gin.H{
		"id":            user.ID.Hex(),
		"name":          user.Name,
		"email":         user.Email,
		"google_id":     user.GoogleID,
		"api_key":       user.APIKey,
		"mongodb_uri":   user.MongoDBURI,
		"database_name": user.DatabaseName,
		"is_admin":      user.IsAdmin,
		"is_active":     user.IsActive,
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
		"last_login":    user.LastLogin,
		"api_usage":     user.APIUsage,
		"has_password":  hasPassword, // Indicate if user has password set
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Update MongoDB URI
// @Description Update user's custom MongoDB connection URI
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.UpdateMongoURIRequest true "MongoDB URI data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/mongodb-uri [put]
func (ac *AuthController) UpdateMongoURI(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.UpdateMongoURIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user information for notification
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Initialize notification service
	notificationService := utils.NewNotificationService()

	// Test connection to the provided MongoDB URI
	err = config.TestMongoConnection(req.MongoDBURI, req.DatabaseName)
	if err != nil {
		// Create notification for failed connection
		notificationErr := notificationService.CreateMongoConnectionErrorNotification(
			userID.(primitive.ObjectID),
			user.Name,
			err.Error(),
		)
		if notificationErr != nil {
			// Log the notification error but don't fail the request
			fmt.Printf("Failed to create notification: %v\n", notificationErr)
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to connect to MongoDB: " + err.Error()})
		return
	}

	// Update user's MongoDB URI
	update := bson.M{
		"$set": bson.M{
			"mongodb_uri":   req.MongoDBURI,
			"database_name": req.DatabaseName,
			"updated_at":    time.Now(),
		},
	}

	_, err = config.DB.Collection("users").UpdateOne(context.TODO(), bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update MongoDB URI"})
		return
	}

	// Create notification for successful connection
	notificationErr := notificationService.CreateMongoConnectionSuccessNotification(
		userID.(primitive.ObjectID),
		user.Name,
		req.DatabaseName,
	)
	if notificationErr != nil {
		// Log the notification error but don't fail the request
		fmt.Printf("Failed to create success notification: %v\n", notificationErr)
	}

	// Log MongoDB connection activity
	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeConnect, "MongoDB database connected", "Custom MongoDB database connection configured", "database", req.DatabaseName, map[string]any{
		"database_name": req.DatabaseName,
	})

	c.JSON(http.StatusOK, gin.H{"message": "MongoDB URI updated successfully"})
}

// @Summary Test MongoDB connection
// @Description Test MongoDB connection without saving the URI
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.UpdateMongoURIRequest true "MongoDB URI data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/test-mongodb [post]
func (ac *AuthController) TestMongoConnection(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.UpdateMongoURIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user information for notification
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Initialize notification service
	notificationService := utils.NewNotificationService()

	// Test connection to the provided MongoDB URI
	err = config.TestMongoConnection(req.MongoDBURI, req.DatabaseName)
	if err != nil {
		// Create notification for failed connection
		notificationErr := notificationService.CreateMongoConnectionErrorNotification(
			userID.(primitive.ObjectID),
			user.Name,
			err.Error(),
		)
		if notificationErr != nil {
			// Log the notification error but don't fail the request
			fmt.Printf("Failed to create notification: %v\n", notificationErr)
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error":     "Failed to connect to MongoDB: " + err.Error(),
			"connected": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "MongoDB connection successful",
		"connected": true,
	})
}

// @Summary Set password for Google users
// @Description Allow Google users to set a password for email login (only if they don't have one)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.SetPasswordRequest true "Password data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/set-password [post]
func (ac *AuthController) SetPassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.SetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user information
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Only allow Google users without passwords to set a password
	if user.GoogleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This feature is only available for Google account users"})
		return
	}

	if user.Password != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is already set. Use the change password feature instead"})
		return
	}

	// Hash the new password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update user's password
	update := bson.M{
		"$set": bson.M{
			"password":   hashedPassword,
			"updated_at": time.Now(),
		},
	}

	_, err = config.DB.Collection("users").UpdateOne(context.TODO(), bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// Log password set activity
	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeSecurity, "Password set", "Password set for Google account", "security", "password_set", nil)

	c.JSON(http.StatusOK, gin.H{"message": "Password set successfully! You can now log in with email and password."})
}

// @Summary Change password
// @Description Change user password (requires current password for security)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ChangePasswordRequest true "Password change data"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/change-password [post]
func (ac *AuthController) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user information
	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Check if user has a password to change
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No password is currently set. Use the set password feature first"})
		return
	}

	// Verify current password
	if !utils.CheckPassword(req.CurrentPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash the new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update user's password
	update := bson.M{
		"$set": bson.M{
			"password":   hashedPassword,
			"updated_at": time.Now(),
		},
	}

	_, err = config.DB.Collection("users").UpdateOne(context.TODO(), bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to change password"})
		return
	}

	// Log password change activity
	go LogActivityWithContext(c, userID.(primitive.ObjectID), models.ActivityTypeSecurity, "Password changed", "User changed their password", "security", "password_change", nil)

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// GoogleUser represents the user data from Google
type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// @Summary Google authentication
// @Description Authenticate user with Google ID token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.GoogleAuthRequest true "Google ID token"
// @Success 200 "Success"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Router /auth/google [post]
func (ac *AuthController) GoogleAuth(c *gin.Context) {
	var req models.GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify Google ID token
	googleUser, err := ac.verifyGoogleToken(req.IDToken)
	if err != nil {
		fmt.Println("Error verifying Google token:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}

	if !googleUser.VerifiedEmail {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google account email not verified"})
		return
	}

	// Check if user already exists
	var existingUser models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"email": googleUser.Email}).Decode(&existingUser)

	if err == nil {
		// User exists - link Google account to existing user and sign them in
		update := bson.M{
			"$set": bson.M{
				"google_id":  googleUser.ID,
				"last_login": time.Now(),
				"updated_at": time.Now(),
			},
		}

		_, err = config.DB.Collection("users").UpdateOne(context.TODO(), bson.M{"_id": existingUser.ID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link Google account"})
			return
		}

		// Get updated user
		err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": existingUser.ID}).Decode(&existingUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
			return
		}

		// Generate JWT token
		token, err := utils.GenerateJWT(existingUser.ID, existingUser.Email, existingUser.IsAdmin)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		// Store password status before removing it
		hasPassword := existingUser.Password != ""
		existingUser.Password = "" // Remove password from response

		c.JSON(http.StatusOK, gin.H{
			"user": gin.H{
				"id":            existingUser.ID.Hex(),
				"name":          existingUser.Name,
				"email":         existingUser.Email,
				"google_id":     existingUser.GoogleID,
				"api_key":       existingUser.APIKey,
				"mongodb_uri":   existingUser.MongoDBURI,
				"database_name": existingUser.DatabaseName,
				"is_admin":      existingUser.IsAdmin,
				"is_active":     existingUser.IsActive,
				"created_at":    existingUser.CreatedAt,
				"updated_at":    existingUser.UpdatedAt,
				"last_login":    existingUser.LastLogin,
				"api_usage":     existingUser.APIUsage,
				"has_password":  hasPassword,
			},
			"token": token,
		})
		return
	} else if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// User doesn't exist - create new user
	apiKey, err := utils.GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate API key"})
		return
	}

	now := time.Now()
	nextMonthStart := utils.GetNextMonthStart(now)

	newUser := models.User{
		ID:    primitive.NewObjectID(),
		Name:  googleUser.Name,
		Email: googleUser.Email,
		// No password for Google-only users - they can set one later if needed
		GoogleID:  googleUser.ID,
		APIKey:    apiKey,
		IsAdmin:   false,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
		APIUsage: models.APIUsageStats{
			MonthlyQuota:  1000, // Default quota
			UsedThisMonth: 0,
			QuotaResetAt:  nextMonthStart,
		},
	}

	// Insert user
	_, err = config.DB.Collection("users").InsertOne(context.TODO(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(newUser.ID, newUser.Email, newUser.IsAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user": gin.H{
			"id":            newUser.ID.Hex(),
			"name":          newUser.Name,
			"email":         newUser.Email,
			"google_id":     newUser.GoogleID,
			"api_key":       newUser.APIKey,
			"mongodb_uri":   newUser.MongoDBURI,
			"database_name": newUser.DatabaseName,
			"is_admin":      newUser.IsAdmin,
			"is_active":     newUser.IsActive,
			"created_at":    newUser.CreatedAt,
			"updated_at":    newUser.UpdatedAt,
			"last_login":    newUser.LastLogin,
			"api_usage":     newUser.APIUsage,
			"has_password":  false, // New Google users don't have password
		},
		"token": token,
	})
}

// verifyGoogleToken verifies the Google ID token and returns user info
func (ac *AuthController) verifyGoogleToken(idToken string) (*GoogleUser, error) {
	fmt.Println("Verifying Google token:", idToken[:50]+"...") // Log only first 50 chars for security

	// For Firebase ID tokens, we need to decode the JWT payload without verification
	// In production, you should verify the signature using Google's public keys
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid JWT format")
	}

	// Decode the payload (second part)
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		fmt.Printf("Error decoding JWT payload: %v\n", err)
		return nil, err
	}

	var claims map[string]interface{}
	err = json.Unmarshal(payload, &claims)
	if err != nil {
		fmt.Printf("Error unmarshaling JWT payload: %v\n", err)
		return nil, err
	}

	fmt.Printf("JWT claims: %+v\n", claims)

	// Extract user information from claims
	googleUser := &GoogleUser{
		ID:            getString(claims, "sub"),
		Email:         getString(claims, "email"),
		VerifiedEmail: getBool(claims, "email_verified"),
		Name:          getString(claims, "name"),
		GivenName:     getString(claims, "given_name"),
		FamilyName:    getString(claims, "family_name"),
		Picture:       getString(claims, "picture"),
		Locale:        getString(claims, "locale"),
	}

	// Validate required fields
	if googleUser.Email == "" {
		return nil, fmt.Errorf("email not found in token")
	}

	// Check if token is from Firebase (has Firebase-specific claims)
	if iss := getString(claims, "iss"); iss != "" && strings.Contains(iss, "firebase") {
		// This is a Firebase token, trust the email verification
		googleUser.VerifiedEmail = true
	}

	return googleUser, nil
}

// Helper functions to safely extract values from map
func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getBool(m map[string]interface{}, key string) bool {
	if val, ok := m[key]; ok {
		if b, ok := val.(bool); ok {
			return b
		}
		if str, ok := val.(string); ok {
			return str == "true"
		}
	}
	return false
}
