# 🚀 EC2 Deployment Checklist

**⚠️ IMPORTANT: Complete ALL of Part 1 BEFORE setting up GitHub Actions!**

## ✅ **PART 1: EC2 Setup** (Do this first - GitHub Actions will fail until this is done)

### 1. Configure Security Group
- [ ] Go to AWS Console → EC2 → Security Groups
- [ ] Add inbound rules:
  - [ ] SSH (22) from Your IP
  - [ ] HTTP (80) from 0.0.0.0/0
  - [ ] HTTPS (443) from 0.0.0.0/0
  - [ ] Custom TCP (8080) from 0.0.0.0/0

### 2. Connect to EC2
```bash
# Replace with your actual values:
chmod 400 ~/Downloads/YOUR-KEY-NAME.pem
ssh -i ~/Downloads/YOUR-KEY-NAME.pem ec2-user@YOUR-EC2-PUBLIC-IP
```

### 3. Setup EC2 Environment
```bash
# Run on EC2:
wget https://raw.githubusercontent.com/M-awais-rasool/SchemaCraft/main/BackEnd/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 4. Clone Repository
```bash
# Run on EC2:
sudo mkdir -p /opt/schemacraft
sudo chown ec2-user:ec2-user /opt/schemacraft
cd /opt/schemacraft
git clone https://github.com/M-awais-rasool/SchemaCraft.git .
```

### 5. Configure Environment
```bash
# Run on EC2:
cd BackEnd
cp .env.example .env
nano .env
```

**Edit .env with these values:**
```
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=schemacraft
JWT_SECRET=your-random-32-char-secret
GIN_MODE=release
```

### 6. First Manual Deployment
```bash
# Run on EC2:
cd /opt/schemacraft/BackEnd
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 7. Verify Everything Works
```bash
# Run on EC2:
cd /opt/schemacraft/BackEnd
chmod +x scripts/verify-setup.sh
./scripts/verify-setup.sh
```

**✅ This script will check everything and tell you what's missing!**

### 8. Test Your Application
```bash
# Run on EC2:
curl http://localhost:8080/health
```

**Expected response:** `{"status":"healthy"}`

**🚨 STOP HERE if anything doesn't work! Fix issues before proceeding to Part 2.**

---

## ✅ **PART 2: Automatic Deployment** (Only after Part 1 is 100% working)

### 9. Generate SSH Keys for GitHub Actions
```bash
# Run on EC2:
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

### 9. Get Information for GitHub Secrets
```bash
# Run on EC2:
echo "=== COPY THIS PRIVATE KEY ==="
cat ~/.ssh/github-actions
echo "=== END PRIVATE KEY ==="

echo "Your EC2 Public IP:"
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

### 10. Configure GitHub Secrets
- [ ] Go to: https://github.com/M-awais-rasool/SchemaCraft/settings/secrets/actions
- [ ] Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `EC2_SSH_KEY` | The private key from step 9 |
| `EC2_HOST` | Your EC2 public IP from step 9 |
| `EC2_USER` | `ec2-user` |
| `DEPLOY_PATH` | `/opt/schemacraft` |

### 11. Test Automatic Deployment
- [ ] Make any small change to a file in `BackEnd/` folder
- [ ] Commit and push to main branch
- [ ] Go to GitHub → Actions tab to watch deployment
- [ ] Check if your app still works: `http://YOUR-EC2-IP:8080/health`

---

## 🎯 **Final Testing**

### Your app should be accessible at:
- **API**: `http://YOUR-EC2-PUBLIC-IP:8080`
- **Health Check**: `http://YOUR-EC2-PUBLIC-IP:8080/health`
- **API Docs**: `http://YOUR-EC2-PUBLIC-IP:8080/swagger/index.html`

### Useful Commands (run on EC2):
```bash
# Check if containers are running
docker ps

# View application logs
docker logs schemacraft-backend

# Redeploy manually
cd /opt/schemacraft/BackEnd && ./scripts/deploy.sh

# Check MongoDB status
sudo systemctl status mongod
```

---

## 🆘 **Troubleshooting**

**If connection fails:**
- Check security group rules
- Verify EC2 is running
- Try `ubuntu@` instead of `ec2-user@`

**If deployment fails:**
- Check GitHub Actions logs
- Verify SSH key in secrets
- Check EC2 is accessible

**If app doesn't start:**
- Check logs: `docker logs schemacraft-backend`
- Verify .env file settings
- Check MongoDB is running

---

## 📞 **Need Help?**

1. **Check the full guide**: `BackEnd/DEPLOYMENT.md`
2. **View GitHub Actions logs**: GitHub → Actions tab
3. **Check application logs**: `docker logs schemacraft-backend`

**✅ Once everything works, any push to `main` branch will automatically deploy to your EC2!**
