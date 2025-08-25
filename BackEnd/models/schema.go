package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Schema struct {
	ID                 primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	UserID             primitive.ObjectID  `json:"user_id" bson:"user_id"`
	CollectionName     string              `json:"collection_name" bson:"collection_name"`
	Fields             []SchemaField       `json:"fields" bson:"fields"`
	AuthConfig         *AuthConfig         `json:"auth_config,omitempty" bson:"auth_config,omitempty"`
	EndpointProtection *EndpointProtection `json:"endpoint_protection,omitempty" bson:"endpoint_protection,omitempty"`
	CreatedAt          time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at" bson:"updated_at"`
	IsActive           bool                `json:"is_active" bson:"is_active"`
}

type EndpointProtection struct {
	Get    bool `json:"get" bson:"get"`
	Post   bool `json:"post" bson:"post"`
	Put    bool `json:"put" bson:"put"`
	Delete bool `json:"delete" bson:"delete"`
}

type AuthConfig struct {
	Enabled                  bool            `json:"enabled" bson:"enabled"`
	UserCollection           string          `json:"user_collection" bson:"user_collection"`
	LoginFields              AuthFieldConfig `json:"login_fields" bson:"login_fields"`
	ResponseFields           []string        `json:"response_fields" bson:"response_fields"`
	PasswordField            string          `json:"password_field" bson:"password_field"`
	TokenExpiration          int             `json:"token_expiration" bson:"token_expiration"` // in hours
	RequireEmailVerification bool            `json:"require_email_verification" bson:"require_email_verification"`
	AllowSignup              bool            `json:"allow_signup" bson:"allow_signup"`
	JWTSecret                string          `json:"-" bson:"jwt_secret"` // Hidden from JSON response
}

type AuthFieldConfig struct {
	EmailField    string `json:"email_field" bson:"email_field"`
	UsernameField string `json:"username_field,omitempty" bson:"username_field,omitempty"`
	AllowBoth     bool   `json:"allow_both" bson:"allow_both"` // Allow login with either email or username
}

type SchemaField struct {
	Name        string      `json:"name" bson:"name" binding:"required"`
	Type        string      `json:"type" bson:"type" binding:"required"` // string, number, boolean, date, object, array
	Visibility  string      `json:"visibility" bson:"visibility"`        // public, private
	Required    bool        `json:"required" bson:"required"`
	Default     interface{} `json:"default,omitempty" bson:"default,omitempty"`
	Description string      `json:"description,omitempty" bson:"description,omitempty"`
}

type CreateSchemaRequest struct {
	CollectionName     string              `json:"collection_name" binding:"required"`
	Fields             []SchemaField       `json:"fields" binding:"required,min=1"`
	AuthConfig         *AuthConfig         `json:"auth_config,omitempty"`
	EndpointProtection *EndpointProtection `json:"endpoint_protection,omitempty"`
}

type DynamicData struct {
	ID        primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	Data      map[string]interface{} `json:"data" bson:"data"`
	CreatedAt time.Time              `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time              `json:"updated_at" bson:"updated_at"`
	UserID    primitive.ObjectID     `json:"user_id" bson:"user_id"`
}

// Dynamic API Authentication Models
type DynamicAuthLoginRequest struct {
	Identifier string `json:"identifier" binding:"required"` // Can be email or username
	Password   string `json:"password" binding:"required"`
}

type DynamicAuthSignupRequest struct {
	Data map[string]interface{} `json:"data" binding:"required"`
}

type DynamicAuthResponse struct {
	Token     string                 `json:"token"`
	User      map[string]interface{} `json:"user"`
	ExpiresAt time.Time              `json:"expires_at"`
}

type DynamicAuthClaims struct {
	UserID       primitive.ObjectID `json:"user_id"`
	SchemaUserID primitive.ObjectID `json:"schema_user_id"`
	Collection   string             `json:"collection"`
	SchemaID     primitive.ObjectID `json:"schema_id"`
	jwt.RegisteredClaims
}
