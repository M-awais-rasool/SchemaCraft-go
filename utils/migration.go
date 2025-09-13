package utils

import (
	"context"
	"fmt"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/config"

	"go.mongodb.org/mongo-driver/bson"
)

// MigrateExistingUsersQuotaReset adds the quota_reset_at field to existing users who don't have it
func MigrateExistingUsersQuotaReset() error {
	fmt.Println("Starting migration: Adding quota_reset_at field to existing users...")

	// Find users without quota_reset_at field or with zero value
	filter := bson.M{
		"$or": []bson.M{
			{"api_usage.quota_reset_at": bson.M{"$exists": false}},
			{"api_usage.quota_reset_at": time.Time{}},
		},
	}

	// Calculate next month start
	nextMonthStart := GetNextMonthStart(time.Now())

	// Update all matching users
	update := bson.M{
		"$set": bson.M{
			"api_usage.quota_reset_at": nextMonthStart,
		},
		// Also ensure used_this_month exists and is initialized
		"$setOnInsert": bson.M{
			"api_usage.used_this_month": 0,
		},
	}

	result, err := config.DB.Collection("users").UpdateMany(context.TODO(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to migrate users: %v", err)
	}

	fmt.Printf("Migration completed: Updated %d users with quota_reset_at field\n", result.ModifiedCount)
	return nil
}

// ResetAllUsersQuota manually resets all users' monthly quota (useful for admin operations)
func ResetAllUsersQuota() error {
	fmt.Println("Resetting all users' monthly quota...")

	nextMonthStart := GetNextMonthStart(time.Now())

	update := bson.M{
		"$set": bson.M{
			"api_usage.used_this_month": 0,
			"api_usage.quota_reset_at":  nextMonthStart,
		},
	}

	result, err := config.DB.Collection("users").UpdateMany(context.TODO(), bson.M{}, update)
	if err != nil {
		return fmt.Errorf("failed to reset users quota: %v", err)
	}

	fmt.Printf("Quota reset completed: Updated %d users\n", result.ModifiedCount)
	return nil
}
