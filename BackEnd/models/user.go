package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name         string             `json:"name" bson:"name" binding:"required"`
	Email        string             `json:"email" bson:"email" binding:"required,email"`
	Password     string             `json:"-" bson:"password"`
	GoogleID     string             `json:"google_id,omitempty" bson:"google_id,omitempty"`
	APIKey       string             `json:"api_key" bson:"api_key"`
	MongoDBURI   string             `json:"mongodb_uri,omitempty" bson:"mongodb_uri,omitempty"`
	DatabaseName string             `json:"database_name,omitempty" bson:"database_name,omitempty"`
	IsAdmin      bool               `json:"is_admin" bson:"is_admin"`
	IsActive     bool               `json:"is_active" bson:"is_active"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updated_at"`
	LastLogin    time.Time          `json:"last_login,omitempty" bson:"last_login,omitempty"`
	APIUsage     APIUsageStats      `json:"api_usage" bson:"api_usage"`
}

type APIUsageStats struct {
	TotalRequests int64     `json:"total_requests" bson:"total_requests"`
	LastRequest   time.Time `json:"last_request,omitempty" bson:"last_request,omitempty"`
	MonthlyQuota  int64     `json:"monthly_quota" bson:"monthly_quota"`
	UsedThisMonth int64     `json:"used_this_month" bson:"used_this_month"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type SignupRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type UpdateMongoURIRequest struct {
	MongoDBURI   string `json:"mongodb_uri" binding:"required"`
	DatabaseName string `json:"database_name" binding:"required"`
}

type GoogleAuthRequest struct {
	IDToken string `json:"id_token" binding:"required"`
}
