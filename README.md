# SchemaCraft Backend

This is the backend service for SchemaCraft, built with Go. It provides RESTful APIs for authentication, user management, schema management, notifications, and more.

## Features
- User authentication (JWT)
- Admin and user roles
- Dynamic schema and API generation
- Activity logging
- Notification system
- API usage tracking
- Docker support
- Swagger API documentation

## Project Structure
- `main.go` - Entry point
- `config/` - Configuration and database setup
- `controllers/` - API controllers
- `middleware/` - Auth and other middleware
- `models/` - Data models
- `routes/` - API route definitions
- `utils/` - Utility functions
- `docs/` - Swagger documentation

## Getting Started

### Prerequisites
- Go 1.20+
- Docker (optional, for containerization)
- PostgreSQL (or your configured DB)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd BackEnd
   ```
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Configure your environment variables in `.env` or `config/database.go`.

### Running the Server
```bash
go run main.go
```

### API Documentation
Swagger docs available at `/docs/swagger.json` and `/docs/swagger.yaml`.

## License
MIT
