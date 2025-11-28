# 🌐 Global Deployment Guide - NeuroVerse

## 🎯 Best Recommendation for You

**FREE OPTION (Recommended for Showcase):**
- **Frontend:** Vercel (Free Forever)
- **Backend:** Render (Free Tier)
- **Database:** MongoDB Atlas (Free 512MB)

**Total Cost:** $0/month ✅

---

## 📊 Deployment Options Comparison

### Free Options

| Platform | Type | Pros | Cons | Best For |
|----------|------|------|------|----------|
| **Vercel** | Frontend | Fast, auto-deploy from GitHub, custom domain | Frontend only | React apps ⭐ |
| **Netlify** | Frontend | Similar to Vercel, drag-and-drop | Frontend only | React apps |
| **Render** | Backend | Free tier, PostgreSQL support, easy setup | Spins down after inactivity | FastAPI ⭐ |
| **Railway** | Backend | 500 hrs/month free, MongoDB support | Limited free tier | Full-stack |
| **Fly.io** | Backend | Global CDN, Docker support | Complex setup | Advanced users |
| **MongoDB Atlas** | Database | 512MB free, cloud-hosted, reliable | Size limit | MongoDB ⭐ |

### Paid Options

| Platform | Cost | Pros | Best For |
|----------|------|------|----------|
| **DigitalOcean** | $6-12/month | Simple, reliable, full control | Startups ⭐ |
| **Heroku** | $7/month | Easy setup, add-ons | Quick deploy |
| **AWS (EC2)** | $10-50/month | Scalable, professional | Enterprise |
| **Google Cloud** | $10-40/month | AI/ML tools, scalable | AI projects |
| **Azure** | $10-30/month | Microsoft ecosystem | Corporate |

---

## 🚀 STEP-BY-STEP: Free Deployment (Recommended)

### Part 1: Deploy Database (MongoDB Atlas)

**Step 1: Create MongoDB Atlas Account**
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email
3. Choose "Free Tier" (M0 Sandbox)
4. Select cloud provider: AWS
5. Select region: Mumbai (ap-south-1) for India
6. Cluster Name: "neuroverse-cluster"
7. Click "Create Cluster" (takes 3-5 mins)
```

**Step 2: Setup Database Access**
```
1. Click "Database Access" in left menu
2. Click "Add New Database User"
   - Username: neuroverse_admin
   - Password: [Generate secure password - SAVE THIS!]
   - Role: Atlas admin
3. Click "Add User"
```

**Step 3: Setup Network Access**
```
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - (For production, restrict to specific IPs)
4. Click "Confirm"
```

**Step 4: Get Connection String**
```
1. Click "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   mongodb+srv://neuroverse_admin:<password>@neuroverse-cluster.xxxxx.mongodb.net/neuroverse?retryWrites=true&w=majority
5. Replace <password> with your actual password
6. SAVE THIS - you'll need it for backend
```

---

### Part 2: Deploy Backend (Render)

**Step 1: Prepare Backend Code**

Create `render.yaml` in your project root:
```yaml
services:
  - type: web
    name: neuroverse-backend
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: PYTHON_VERSION
        value: 3.9.0
```

**Step 2: Push to GitHub**
```bash
# If you haven't already:
git init
git add .
git commit -m "Prepare for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/neuroverse.git
git branch -M main
git push -u origin main
```

**Step 3: Deploy on Render**
```
1. Go to: https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: neuroverse-backend
   - Environment: Python 3
   - Build Command: cd backend && pip install -r requirements.txt
   - Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free
6. Add Environment Variables:
   - MONGO_URI = [Your MongoDB Atlas connection string]
   - JWT_SECRET = [Generate random: https://randomkeygen.com/]
7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. Your backend URL: https://neuroverse-backend.onrender.com
```

**⚠️ Important for Render Free Tier:**
- Service spins down after 15 mins of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to $7/month for always-on

---

### Part 3: Deploy Frontend (Vercel)

**Step 1: Update Frontend Configuration**

Edit `frontend/.env.production`:
```env
REACT_APP_API_URL=https://neuroverse-backend.onrender.com
```

**Step 2: Deploy to Vercel**
```
1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
6. Add Environment Variables:
   - REACT_APP_API_URL = https://neuroverse-backend.onrender.com
7. Click "Deploy"
8. Wait 2-3 minutes
9. Your live URL: https://neuroverse.vercel.app
```

**Step 3: Custom Domain (Optional)**
```
1. In Vercel project settings → Domains
2. Add your domain (e.g., neuroverse.com)
3. Update DNS records as shown
4. Wait 24-48 hours for SSL certificate
```

---

### Part 4: Update Backend CORS

Edit `backend/main.py`:
```python
# Update CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://neuroverse.vercel.app",  # Add your Vercel URL
        "https://your-custom-domain.com"  # If you have one
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push changes:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Render will auto-redeploy in 2-3 minutes.

---

## 💰 STEP-BY-STEP: Paid Deployment (DigitalOcean)

### Cost: ~$12/month for everything

**Step 1: Create DigitalOcean Account**
```
1. Go to: https://www.digitalocean.com
2. Sign up (Get $200 free credit for 60 days with GitHub Student Pack)
3. Add payment method
```

**Step 2: Create Droplet (Server)**
```
1. Click "Create" → "Droplets"
2. Choose:
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic ($6/month)
   - CPU: Regular (1GB RAM)
   - Datacenter: Bangalore (India)
3. Authentication: SSH Key (recommended) or Password
4. Hostname: neuroverse-server
5. Click "Create Droplet"
```

**Step 3: SSH into Server**
```bash
# Get IP from DigitalOcean dashboard
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y
```

**Step 4: Install Dependencies**
```bash
# Install Python
apt install python3 python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org -y
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install nginx -y
```

**Step 5: Upload Project**
```bash
# On your local machine:
scp -r neuroverse root@YOUR_DROPLET_IP:/var/www/

# On the server:
cd /var/www/neuroverse
```

**Step 6: Setup Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
nano .env
# Add:
# MONGO_URI=mongodb://localhost:27017/neuroverse
# JWT_SECRET=your_secret_key

# Test
python main.py
# Press Ctrl+C to stop
```

**Step 7: Setup Frontend**
```bash
cd ../frontend
npm install
npm run build
```

**Step 8: Configure Nginx**
```bash
nano /etc/nginx/sites-available/neuroverse
```

Add this configuration:
```nginx
# Backend (API)
server {
    listen 80;
    server_name api.yourdomain.com;  # Or use IP

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Or use IP

    root /var/www/neuroverse/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/neuroverse /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Step 9: Run Backend with PM2**
```bash
npm install -g pm2
cd /var/www/neuroverse/backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name neuroverse-api
pm2 startup
pm2 save
```

**Step 10: Setup SSL (Free with Let's Encrypt)**
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

**Your site is now live!**
- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall (UFW on Ubuntu)
- [ ] Restrict MongoDB access
- [ ] Setup regular backups
- [ ] Monitor logs

---

## 🎯 Quick Comparison: Which to Choose?

| Your Goal | Recommendation |
|-----------|----------------|
| **Free showcase for portfolio** | Vercel + Render + MongoDB Atlas ⭐ |
| **Client project (low traffic)** | Vercel + Render ($7/month) |
| **Professional product** | DigitalOcean ($12/month) |
| **High traffic, scalable** | AWS/Google Cloud ($50+/month) |
| **Learn deployment** | DigitalOcean (full control) |

---

## ✅ Post-Deployment Checklist

- [ ] Test all features on live site
- [ ] Check mobile responsiveness
- [ ] Test PDF downloads
- [ ] Verify Excel uploads work
- [ ] Create admin account
- [ ] Setup Google Analytics (optional)
- [ ] Add site to Google Search Console
- [ ] Share URL with institute!

---

## 🆘 Troubleshooting

### Backend won't start on Render
```
Check Logs → Look for:
- Missing environment variables
- MongoDB connection errors
- Python version mismatch
```

### Frontend can't connect to Backend
```
- Check REACT_APP_API_URL in Vercel env vars
- Verify backend CORS allows frontend URL
- Check backend is running (visit API URL)
```

### MongoDB connection failed
```
- Check username/password in connection string
- Verify IP whitelist (0.0.0.0/0 for all)
- Test connection string locally first
```

---

**Good luck with your deployment! 🚀**

Need help? Feel free to ask!
