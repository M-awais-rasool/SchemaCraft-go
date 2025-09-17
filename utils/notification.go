package utils

import (
	"context"
	"fmt"
	"github.com/M-awais-rasool/SchemaCraft-go/config"
	"time"

	"github.com/M-awais-rasool/SchemaCraft-go/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

func (ns *NotificationService) CreateNotification(userID primitive.ObjectID, title, message string, notificationType models.NotificationType) error {
	notification := models.Notification{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Title:     title,
		Message:   message,
		Type:      notificationType,
		IsRead:    false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := config.DB.Collection("notifications").InsertOne(context.TODO(), notification)
	return err
}

func (ns *NotificationService) CreateMongoConnectionErrorNotification(userID primitive.ObjectID, userName, errorMessage string) error {
	title := "MongoDB Connection Failed"
	message := "Hello " + userName + ", your MongoDB connection attempt failed. " +
		"Please verify your connection string and database name. Error: " + errorMessage

	return ns.CreateNotification(userID, title, message, models.NotificationTypeError)
}

func (ns *NotificationService) CreateMongoConnectionSuccessNotification(userID primitive.ObjectID, userName, databaseName string) error {
	title := "MongoDB Connection Successful"
	message := "Hello " + userName + ", your MongoDB connection to database '" + databaseName + "' has been established successfully!"

	return ns.CreateNotification(userID, title, message, models.NotificationTypeSuccess)
}

func (ns *NotificationService) GetUserNotifications(userID primitive.ObjectID, limit int) ([]models.Notification, error) {
	var notifications []models.Notification

	cursor, err := config.DB.Collection("notifications").Find(
		context.TODO(),
		map[string]interface{}{"user_id": userID},
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	err = cursor.All(context.TODO(), &notifications)
	return notifications, err
}

func (ns *NotificationService) MarkNotificationAsRead(notificationID primitive.ObjectID) error {
	_, err := config.DB.Collection("notifications").UpdateOne(
		context.TODO(),
		map[string]interface{}{"_id": notificationID},
		map[string]interface{}{
			"$set": map[string]interface{}{
				"is_read":    true,
				"updated_at": time.Now(),
			},
		},
	)
	return err
}

func (ns *NotificationService) MarkAllNotificationsAsRead(userID primitive.ObjectID) error {
	_, err := config.DB.Collection("notifications").UpdateMany(
		context.TODO(),
		map[string]interface{}{
			"user_id": userID,
			"is_read": false,
		},
		map[string]interface{}{
			"$set": map[string]interface{}{
				"is_read":    true,
				"updated_at": time.Now(),
			},
		},
	)
	return err
}

func (ns *NotificationService) DeleteNotification(notificationID primitive.ObjectID) error {
	_, err := config.DB.Collection("notifications").DeleteOne(
		context.TODO(),
		map[string]interface{}{"_id": notificationID},
	)
	return err
}

func (ns *NotificationService) GetUnreadNotificationCount(userID primitive.ObjectID) (int64, error) {
	count, err := config.DB.Collection("notifications").CountDocuments(
		context.TODO(),
		map[string]interface{}{
			"user_id": userID,
			"is_read": false,
		},
	)
	return count, err
}

func (ns *NotificationService) CreateAPIQuotaWarningNotification(userID primitive.ObjectID, userName string, usedCalls, totalQuota int64) error {
	title := "API Usage Warning"
	percentage := float64(usedCalls) / float64(totalQuota) * 100
	message := "Hello " + userName + ", you have reached 500 API calls this month (" +
		fmt.Sprintf("%.1f", percentage) + "% of your quota). " +
		"You have " + fmt.Sprintf("%d", totalQuota-usedCalls) + " calls remaining."

	return ns.CreateNotification(userID, title, message, models.NotificationTypeWarning)
}

func (ns *NotificationService) CreateAPIQuotaLimitNotification(userID primitive.ObjectID, userName string, totalQuota int64) error {
	title := "API Quota Exceeded"
	message := "Hello " + userName + ", your free quota is full! You have used all " +
		fmt.Sprintf("%d", totalQuota) + " API calls for this month. " +
		"Consider upgrading to a premium plan for higher limits or wait until next month for quota reset."

	return ns.CreateNotification(userID, title, message, models.NotificationTypeError)
}

func (ns *NotificationService) CheckAndCreateAPIUsageNotifications(userID primitive.ObjectID, userName string, usedCalls, totalQuota int64) error {
	if usedCalls == 500 {
		err := ns.CreateAPIQuotaWarningNotification(userID, userName, usedCalls, totalQuota)
		if err != nil {
			return err
		}
	}

	if usedCalls >= totalQuota {
		err := ns.CreateAPIQuotaLimitNotification(userID, userName, totalQuota)
		if err != nil {
			return err
		}
	}

	return nil
}
