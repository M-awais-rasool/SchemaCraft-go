package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NotificationType string

const (
	NotificationTypeInfo    NotificationType = "info"
	NotificationTypeWarning NotificationType = "warning"
	NotificationTypeError   NotificationType = "error"
	NotificationTypeSuccess NotificationType = "success"
)

type Notification struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Title     string             `json:"title" bson:"title"`
	Message   string             `json:"message" bson:"message"`
	Type      NotificationType   `json:"type" bson:"type"`
	IsRead    bool               `json:"is_read" bson:"is_read"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateNotificationRequest struct {
	UserID  primitive.ObjectID `json:"user_id" binding:"required"`
	Title   string             `json:"title" binding:"required"`
	Message string             `json:"message" binding:"required"`
	Type    NotificationType   `json:"type" binding:"required"`
}
