# 🚀 SkillLift Deployment Guide

## The Problem with Vercel

Your backend uses **Express + Socket.IO + File Uploads**, which are **NOT compatible** with Vercel's serverless architecture:

- ❌ **Socket.IO WebSockets** - Not supported on Vercel
- ❌ **File uploads to local filesystem** - Vercel functions are stateless
- ❌ **Persistent server processes** - Vercel functions are short-lived
- ❌ **Large dependencies** - Exceeds Vercel's limits

## ✅ Recommended Deployment Options

### Option 1: Railway (Easiest & Best for your app)

1. **Sign up at [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **When creating the service, set the Root Directory to `backend`**
4. **Railway will auto-detect your `railway.json` and `nixpacks.toml` configs**
5. **Add environment variables:**
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-jwt-secret
   PAYSTACK_SECRET_KEY=your-paystack-secret
   PAYSTACK_PUBLIC_KEY=your-paystack-public
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=your-email@domain.com
   NODE_ENV=production
   PORT=5000
   ```

### Option 2: Render

1. **Sign up at [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Use these settings:**
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
   - **Health Check Path:** `/health`

### Option 3: DigitalOcean App Platform

1. **Sign up at [DigitalOcean](https://digitalocean.com)**
2. **Create new App**
3. **Connect GitHub repository**
4. **Configure:**
   - **Source Directory:** `backend`
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
   - **HTTP Port:** `5000`

### Option 4: Docker Deployment (Any VPS)

1. **Get a VPS (DigitalOcean Droplet, AWS EC2, etc.)**
2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
3. **Clone your repository:**
   ```bash
   git clone https://github.com/your-username/skilllift.git
   cd skilllift
   ```
4. **Create `.env` file with your environment variables**
5. **Deploy:**
   ```bash
   docker-compose up -d
   ```

## 🔧 Environment Variables Needed

Create a `.env` file in your backend directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skilllift

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-email@domain.com

# App Config
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

## 🌐 Frontend Deployment

For your frontend, you CAN use Vercel:

1. **Deploy frontend to Vercel**
2. **Update `VITE_API_URL` to your backend URL**
3. **Update `VITE_PAYSTACK_PUBLIC_KEY`**

## 📊 Monitoring & Health Checks

Your app includes health check endpoints:
- **Backend Health:** `https://your-backend-url.com/health`
- **API Status:** Check the response for all available endpoints

## 🚨 Important Notes

- **Socket.IO will work** on Railway, Render, DigitalOcean, and Docker deployments
- **File uploads will work** with persistent storage
- **WebSocket connections** will be maintained properly
- **Database connections** will be persistent

## 🎯 Quick Start (Railway)

1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your SkillLift repository
4. **IMPORTANT: Set Root Directory to `backend`**
5. Railway will auto-detect the configuration
6. Add your environment variables
7. Deploy! 🚀

Your app will be live at `https://your-app-name.railway.app`

## 🔧 Troubleshooting Railway Deployment

### If you get "Nixpacks build failed":

1. **Make sure Root Directory is set to `backend`**
2. **Check that `backend/package.json` exists**
3. **Verify `backend/nixpacks.toml` is present**
4. **Ensure all environment variables are set**

### If you get "No start script found":

1. **Check `backend/package.json` has `"start": "node server.js"`**
2. **Verify `backend/server.js` exists**
3. **Make sure all dependencies are in `package.json`**

### If Socket.IO doesn't work:

1. **Check WebSocket URL in frontend**
2. **Update `VITE_API_URL` to your Railway URL**
3. **Ensure CORS is configured for your frontend domain**
