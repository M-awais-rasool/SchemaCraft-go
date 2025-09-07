package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ActivityType string

const (
	ActivityTypeCreate   ActivityType = "create"
	ActivityTypeUpdate   ActivityType = "update"
	ActivityTypeDelete   ActivityType = "delete"
	ActivityTypeAPI      ActivityType = "api"
	ActivityTypeAuth     ActivityType = "auth"
	ActivityTypeConnect  ActivityType = "connect"
	ActivityTypeSecurity ActivityType = "security"
	ActivityTypeLogin    ActivityType = "login"
	ActivityTypeLogout   ActivityType = "logout"
)

type Activity struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"user_id" bson:"user_id"`
	Type        ActivityType       `json:"type" bson:"type"`
	Action      string             `json:"action" bson:"action"`
	Description string             `json:"description,omitempty" bson:"description,omitempty"`
	Resource    string             `json:"resource,omitempty" bson:"resource,omitempty"`
	ResourceID  string             `json:"resource_id,omitempty" bson:"resource_id,omitempty"`
	IPAddress   string             `json:"ip_address,omitempty" bson:"ip_address,omitempty"`
	UserAgent   string             `json:"user_agent,omitempty" bson:"user_agent,omitempty"`
	Metadata    map[string]any     `json:"metadata,omitempty" bson:"metadata,omitempty"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
}

type CreateActivityRequest struct {
	Type        ActivityType   `json:"type" binding:"required"`
	Action      string         `json:"action" binding:"required"`
	Description string         `json:"description,omitempty"`
	Resource    string         `json:"resource,omitempty"`
	ResourceID  string         `json:"resource_id,omitempty"`
	Metadata    map[string]any `json:"metadata,omitempty"`
}

type ActivityResponse struct {
	Activities []Activity `json:"activities"`
	Pagination struct {
		Page       int `json:"page"`
		Limit      int `json:"limit"`
		Total      int `json:"total"`
		TotalPages int `json:"total_pages"`
	} `json:"pagination"`
}
