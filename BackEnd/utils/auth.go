package utils

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"schemacraft-backend/config"
	"schemacraft-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID  primitive.ObjectID `json:"user_id"`
	Email   string             `json:"email"`
	IsAdmin bool               `json:"is_admin"`
	jwt.RegisteredClaims
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateJWT(userID primitive.ObjectID, email string, isAdmin bool) (string, error) {
	claims := &Claims{
		UserID:  userID,
		Email:   email,
		IsAdmin: isAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", errors.New("JWT_SECRET environment variable is not set")
	}

	return token.SignedString([]byte(jwtSecret))
}

func ValidateJWT(tokenString string) (*Claims, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("JWT_SECRET environment variable is not set")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// CheckAndResetMonthlyQuota checks if a user's quota needs to be reset and resets it if necessary
func CheckAndResetMonthlyQuota(userID primitive.ObjectID, apiUsage *models.APIUsageStats) (bool, error) {
	now := time.Now()

	// If QuotaResetAt is zero or if we're in a new month, reset the quota
	if apiUsage.QuotaResetAt.IsZero() || IsNewMonth(apiUsage.QuotaResetAt, now) {
		// Calculate next reset time (beginning of next month)
		nextReset := GetNextMonthStart(now)

		// Reset the quota
		filter := bson.M{"_id": userID}
		update := bson.M{
			"$set": bson.M{
				"api_usage.used_this_month": 0,
				"api_usage.quota_reset_at":  nextReset,
			},
		}

		// Use the global DB connection
		_, err := config.DB.Collection("users").UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return false, err
		}

		// Update the local struct
		apiUsage.UsedThisMonth = 0
		apiUsage.QuotaResetAt = nextReset

		return true, nil
	}

	return false, nil
}

// IsNewMonth checks if the current time is in a different month than the reset time
func IsNewMonth(resetTime, currentTime time.Time) bool {
	resetYear, resetMonth, _ := resetTime.Date()
	currentYear, currentMonth, _ := currentTime.Date()

	return resetYear != currentYear || resetMonth != currentMonth
}

// GetNextMonthStart returns the start of the next month
func GetNextMonthStart(t time.Time) time.Time {
	year, month, _ := t.Date()

	// Move to next month
	if month == 12 {
		year++
		month = 1
	} else {
		month++
	}

	return time.Date(year, month, 1, 0, 0, 0, 0, t.Location())
}
