// MongoDB initialization script for production
// This script runs when MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('schemacraft');

// Create application user (if needed)
// db.createUser({
//   user: 'schemacraft_user',
//   pwd: 'your_secure_password',
//   roles: [
//     {
//       role: 'readWrite',
//       db: 'schemacraft'
//     }
//   ]
// });

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "apiKey": 1 }, { unique: true });
db.schemas.createIndex({ "userId": 1 });
db.schemas.createIndex({ "name": 1, "userId": 1 }, { unique: true });
db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "createdAt": -1 });

print('Database initialization completed successfully!');
