package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Schema struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID         primitive.ObjectID `json:"user_id" bson:"user_id"`
	CollectionName string             `json:"collection_name" bson:"collection_name"`
	Fields         []SchemaField      `json:"fields" bson:"fields"`
	CreatedAt      time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at" bson:"updated_at"`
	IsActive       bool               `json:"is_active" bson:"is_active"`
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
	CollectionName string        `json:"collection_name" binding:"required"`
	Fields         []SchemaField `json:"fields" binding:"required,min=1"`
}

type DynamicData struct {
	ID        primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	Data      map[string]interface{} `json:"data" bson:"data"`
	CreatedAt time.Time              `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time              `json:"updated_at" bson:"updated_at"`
	UserID    primitive.ObjectID     `json:"user_id" bson:"user_id"`
}
