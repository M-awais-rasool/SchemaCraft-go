# SchemaCraft Backend - EC2 Deployment Guide

This guide will help you deploy your SchemaCraft Go backend on AWS EC2 with automatic GitHub deployment.

## Prerequisites

1. AWS EC2 instance (Amazon Linux 2 or Ubuntu)
2. GitHub repository access
3. Domain name (optional, for production)

## Quick Start

### 1. EC2 Instance Setup

**Launch EC2 Instance:**
- Instance Type: t3.micro (or larger for production)
- AMI: Amazon Linux 2
- Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (App)

**Connect to your EC2 instance:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

**Run the setup script:**
```bash
# Copy the setup script to your EC2 instance
wget https://raw.githubusercontent.com/M-awais-rasool/SchemaCraft/main/BackEnd/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 2. Manual Repository Setup

```bash
# Clone your repository
sudo mkdir -p /opt/schemacraft
sudo chown ec2-user:ec2-user /opt/schemacraft
cd /opt/schemacraft
git clone https://github.com/M-awais-rasool/SchemaCraft.git .
```

### 3. Environment Configuration

```bash
cd /opt/schemacraft/BackEnd
cp .env.example .env
nano .env
```

Update the `.env` file with your values:
```bash
PORT=8080
MONGODB_URI=mongodb://localhost:27017  # or your MongoDB Atlas URI
DATABASE_NAME=schemacraft
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GIN_MODE=release
```

### 4. Manual Deployment

```bash
cd /opt/schemacraft/BackEnd
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Automatic GitHub Deployment Setup

### 1. Generate SSH Key for GitHub Actions

On your EC2 instance:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_SSH_KEY` | Contents of `~/.ssh/github-actions` (private key) | SSH private key for GitHub Actions |
| `EC2_HOST` | Your EC2 public IP or domain | EC2 instance address |
| `EC2_USER` | `ec2-user` | EC2 username |
| `DEPLOY_PATH` | `/opt/schemacraft` | Application directory path |

### 3. Test the Deployment

Push any change to the `main` branch in the `BackEnd/` directory and watch the GitHub Actions workflow deploy automatically.

## Security Group Configuration

Your EC2 security group should allow:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Application port |

## Production Considerations

### 1. Use a Reverse Proxy (Nginx)

Install and configure Nginx:
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Configure Nginx (`/etc/nginx/nginx.conf`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL Certificate (Let's Encrypt)

```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. MongoDB Production Setup

**Option A: MongoDB Atlas (Recommended)**
- Create a MongoDB Atlas cluster
- Update `MONGODB_URI` in your `.env` file

**Option B: Self-hosted MongoDB**
- Configure MongoDB with authentication
- Set up regular backups
- Configure proper security settings

### 4. Environment Variables

Create a production `.env` file:
```bash
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
DATABASE_NAME=schemacraft_prod
JWT_SECRET=a-very-long-random-secret-key-for-production
GIN_MODE=release
```

### 5. Monitoring and Logging

Set up log aggregation:
```bash
# View application logs
docker logs schemacraft-backend

# Set up log rotation
sudo nano /etc/logrotate.d/docker-containers
```

## Troubleshooting

### Common Issues

1. **Port 8080 not accessible**
   - Check security group settings
   - Verify container is running: `docker ps`

2. **MongoDB connection issues**
   - Verify MongoDB is running: `sudo systemctl status mongod`
   - Check connection string in `.env`

3. **GitHub Actions deployment fails**
   - Verify SSH key is correctly added to secrets
   - Check EC2 instance is accessible from GitHub Actions

### Useful Commands

```bash
# Check application status
docker ps
docker logs schemacraft-backend

# Manual deployment
cd /opt/schemacraft/BackEnd
./scripts/deploy.sh

# Check MongoDB status
sudo systemctl status mongod

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check

Your application includes a health endpoint at `/health`. Test it:
```bash
curl http://your-ec2-public-ip:8080/health
```

Expected response:
```json
{"status":"healthy"}
```

## Cost Optimization

1. **Instance Type**: Start with `t3.micro` (eligible for free tier)
2. **Reserved Instances**: For production, consider reserved instances
3. **Auto Scaling**: Set up auto scaling groups for high availability
4. **Load Balancer**: Use Application Load Balancer for multiple instances

## Next Steps

1. Set up monitoring with CloudWatch
2. Configure automated backups
3. Implement blue-green deployments
4. Set up staging environment
5. Configure domain and SSL certificate

## Support

For issues related to:
- AWS EC2: Check AWS documentation
- Docker: Verify Dockerfile and container logs
- Go application: Check application logs and error messages
- GitHub Actions: Review workflow logs in GitHub

---

**🚀 Your SchemaCraft backend should now be deployed and accessible at:**
`http://your-ec2-public-ip:8080`

**📚 API Documentation:**
`http://your-ec2-public-ip:8080/swagger/index.html`
