# SchemaCraft - Dynamic Schema API Builder

A powerful full-stack application that allows users to create custom APIs instantly with intuitive schema design. Built with React (TypeScript) frontend and Go backend.

## 🚀 Features

### 🔹 Frontend (React + TypeScript)
- **Landing Page**: Professional marketing page with feature overview
- **Authentication**: Sign up/Sign in with JWT tokens
- **Dashboard**: User dashboard with API key management, schema overview, and usage statistics
- **Schema Builder**: Visual schema designer with drag & drop interface
- **Real-time Updates**: Live schema management and API testing

### 🔹 Backend (Go + Gin + MongoDB)
- **User Management**: JWT-based authentication with secure password hashing
- **API Key System**: Unique API key generation and management for each user
- **Dynamic Schema Builder**: Create, read, update, delete custom schemas
- **Auto-Generated APIs**: Automatic CRUD endpoints based on user schemas
- **Field-Level Security**: Public/private field visibility controls
- **Custom Database Support**: Connect your own MongoDB instance
- **Admin Panel**: User management and platform statistics

### 🔹 Dynamic API Features
- **CRUD Operations**: Full Create, Read, Update, Delete operations
- **Field Visibility**: Control which fields are visible in GET responses
- **Pagination**: Built-in pagination for list endpoints
- **API Documentation**: Auto-generated Swagger docs for each user's APIs
- **Usage Tracking**: Monitor API usage and implement quotas

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Go 1.21+**
- **Gin** web framework
- **MongoDB** with official Go driver
- **JWT** for authentication
- **bcrypt** for password hashing
- **UUID** for API key generation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- Go (v1.21 or later)
- MongoDB (local instance or MongoDB Atlas)

### 1. Clone and Setup Frontend

```bash
cd SchemaCraft
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### 2. Setup Backend

```bash
cd BackEnd
go mod tidy
```

### 3. Environment Configuration

Create a `.env` file in the `BackEnd` directory:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=schemacraft
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GIN_MODE=debug
```

**MongoDB Options:**

#### Option 1: Local MongoDB
Install MongoDB locally and run:
```bash
mongod --dbpath /path/to/data/directory
```

#### Option 2: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`
4. Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net`

#### Option 3: Docker MongoDB
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 4. Run Backend

```bash
cd BackEnd
go run main.go
```

The backend will be available at http://localhost:8080

## 🎯 Usage Guide

### 1. **Landing Page**
Visit http://localhost:5173 to see the landing page with feature overview.

### 2. **Sign Up**
Create a new account - you'll automatically get:
- Unique API key for your APIs
- Access to the dashboard
- 1000 API requests quota per month

### 3. **Create Schema**
In the dashboard:
- Click "Create Schema"
- Define your collection name (e.g., "users", "products")
- Add fields with different types (string, number, boolean, date, object, array)
- Set field visibility (public/private)
- Mark required fields

### 4. **Use Your API**
Once schema is created, you get automatic endpoints:

```bash
# Create document
POST http://localhost:8080/api/{collection}
Headers: X-API-Key: your-api-key

# Get all documents
GET http://localhost:8080/api/{collection}?page=1&limit=10
Headers: X-API-Key: your-api-key

# Get document by ID
GET http://localhost:8080/api/{collection}/{id}
Headers: X-API-Key: your-api-key

# Update document
PUT http://localhost:8080/api/{collection}/{id}
Headers: X-API-Key: your-api-key

# Delete document
DELETE http://localhost:8080/api/{collection}/{id}
Headers: X-API-Key: your-api-key
```

### 5. **API Documentation**
Access auto-generated Swagger docs at:
```
http://localhost:8080/docs/{your-api-key}
```

## 🔐 Security Features

- **JWT Authentication** for dashboard access
- **API Key Authentication** for dynamic APIs
- **Password Hashing** with bcrypt
- **Field-Level Visibility** (public/private fields)
- **Request Rate Limiting** and quota management
- **Admin Controls** for user management

## 📊 Admin Features

Access admin panel with an admin user:
- View all registered users
- Monitor API usage statistics
- Activate/deactivate user accounts
- Revoke API keys
- Platform-wide analytics

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── auth/                 # Authentication pages
│   ├── dashboard/           # Dashboard components
│   └── LandingPage.tsx     # Marketing landing page
├── contexts/               # React Context providers
├── hooks/                 # Custom React hooks
├── services/             # API service layer
└── App.tsx              # Main app component
```

### Backend Structure
```
BackEnd/
├── config/              # Database configuration
├── controllers/         # HTTP request handlers
├── middleware/         # Authentication & CORS middleware
├── models/            # Data models and structures
├── routes/           # API route definitions
├── utils/           # Utility functions
└── main.go         # Application entry point
```

## 🔄 API Examples

### Example Schema Creation:
```json
{
  "collection_name": "users",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "visibility": "public",
      "required": true,
      "description": "User's full name"
    },
    {
      "name": "email",
      "type": "string",
      "visibility": "public",
      "required": true,
      "description": "User's email address"
    },
    {
      "name": "password",
      "type": "string",
      "visibility": "private",
      "required": true,
      "description": "User's password (hidden from GET requests)"
    },
    {
      "name": "age",
      "type": "number",
      "visibility": "public",
      "required": false,
      "default": 0
    }
  ]
}
```

### Example API Usage:
```bash
# Create a new user
curl -X POST http://localhost:8080/api/users \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123",
    "age": 30
  }'

# Get all users (password field will be hidden)
curl -X GET http://localhost:8080/api/users \
  -H "X-API-Key: your-api-key-here"
```

## 🚀 Deployment

### Quick Deployment to AWS EC2

For detailed deployment instructions, see [BackEnd/DEPLOYMENT.md](BackEnd/DEPLOYMENT.md).

#### Prerequisites
- AWS EC2 instance (Amazon Linux 2 or Ubuntu)
- Domain name (optional)
- GitHub repository

#### One-Command EC2 Setup
```bash
# On your EC2 instance
wget https://raw.githubusercontent.com/M-awais-rasool/SchemaCraft/main/BackEnd/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

#### Automatic GitHub Deployment
1. Configure GitHub Secrets:
   - `EC2_SSH_KEY`: SSH private key for GitHub Actions
   - `EC2_HOST`: Your EC2 public IP or domain
   - `EC2_USER`: `ec2-user`
   - `DEPLOY_PATH`: `/opt/schemacraft`

2. Push to `main` branch - automatic deployment via GitHub Actions!

#### Manual Deployment
```bash
cd /opt/schemacraft/BackEnd
./scripts/deploy.sh
```

#### Local Development with Docker
```bash
cd BackEnd
./scripts/dev-start.sh
```

### Frontend (Vercel/Netlify)
```bash
cd SchemaCraft
npm run build
# Deploy the 'dist' folder
```

### Production Environment Variables
```env
PORT=8080
MONGODB_URI=your-production-mongodb-uri
DATABASE_NAME=schemacraft_prod
JWT_SECRET=your-super-secure-production-jwt-secret
GIN_MODE=release
```

### Production Features
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ SSL/TLS support (Let's Encrypt)
- ✅ Auto-scaling ready
- ✅ Health checks
- ✅ Log management
- ✅ Database optimization
- ✅ CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@schemacraft.com or create an issue in the repository.

---

**Built with ❤️ by the SchemaCraft team**
