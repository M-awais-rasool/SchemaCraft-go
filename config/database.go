package config

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	DB          *mongo.Database
)

func ConnectMongoDB() {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI environment variable is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	MongoClient = client
	DB = client.Database(os.Getenv("DATABASE_NAME"))

	log.Println("Connected to MongoDB successfully!")
}

func GetUserDatabase(mongoURI, dbName string) (*mongo.Database, error) {
	if mongoURI == "" {
		// Return error if no custom URI provided - don't fall back to default DB
		return nil, errors.New("MongoDB URI not configured")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		// Close the client if ping fails
		client.Disconnect(ctx)
		return nil, err
	}

	// Test database access by attempting to list collections
	db := client.Database(dbName)
	_, err = db.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		client.Disconnect(ctx)
		return nil, err
	}

	return db, nil
}

func TestMongoConnection(mongoURI, dbName string) error {
	if mongoURI == "" {
		return errors.New("MongoDB URI cannot be empty")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}
	defer client.Disconnect(ctx)

	// Ping to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	// Test database access
	db := client.Database(dbName)
	_, err = db.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		return err
	}

	return nil
}
