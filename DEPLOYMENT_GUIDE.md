# 🚀 Deployment Guide - Brand Reputation Tracker

Complete guide to deploy your Brand Reputation Tracker to production (100% FREE).

## Overview

- **Frontend**: Netlify (FREE forever)
- **Backend**: Render (FREE tier with 750 hrs/month)
- **Database**: MongoDB Atlas (FREE M0 cluster)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1.1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Select "FREE" plan (M0 Sandbox)

### Step 1.2: Create Database Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select provider: **AWS** (recommended)
4. Choose closest region (e.g., `us-east-1`)
5. Cluster name: `brand-tracker`
6. Click **"Create"**

### Step 1.3: Create Database User

1. Create username: `tracker-admin`
2. Click **"Autogenerate Secure Password"** → **COPY IT**
3. Click **"Create User"**

### Step 1.4: Network Access

1. Go to **"Network Access"** → **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### Step 1.5: Get Connection String

1. Click **"Database"** → **"Connect"**
2. Choose **"Drivers"** → **"Node.js"**
3. Copy connection string, looks like:
   ```
   mongodb+srv://tracker-admin:<password>@brand-tracker.xxxxx.mongodb.net/
   ```
4. Replace `<password>` with your actual password
5. Add database name at end: `/brand-tracker`
6. **Final string**:
   ```
   mongodb+srv://tracker-admin:YourPassword123@brand-tracker.xxxxx.mongodb.net/brand-tracker?retryWrites=true&w=majority
   ```

**✅ Save this connection string** - you'll need it for backend deployment!

---

## Part 2: Backend Deployment (Render)

### Step 2.1: Prepare Backend for Deployment

1. Ensure your [backend/package.json](backend/package.json) has:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

2. Make sure [backend/server.js](backend/server.js) uses environment variable for PORT:
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```

### Step 2.2: Deploy to Render

1. Go to https://render.com and sign up (use GitHub)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `brand-tracker-api`
   - **Environment**: `Node`
   - **Region**: Choose closest
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **FREE**

### Step 2.3: Add Environment Variables

In Render dashboard, go to **"Environment"** and add:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://tracker-admin:YourPassword123@brand-tracker.xxxxx.mongodb.net/brand-tracker

# API Keys (get from respective platforms)
NEWS_API_KEY=your_newsapi_key
YOUTUBE_API_KEY=your_youtube_key
REDDIT_CLIENT_ID=your_reddit_id
REDDIT_CLIENT_SECRET=your_reddit_secret

# Settings
SCRAPE_INTERVAL_MINUTES=15
SPIKE_THRESHOLD_PERCENT=40
PORT=5000

# CORS - your frontend URL (will update after frontend deployment)
FRONTEND_URL=https://your-app.netlify.app
```

**Note**: Get API keys from:
- NewsAPI: https://newsapi.org/register (FREE: 100 req/day)
- YouTube: https://console.cloud.google.com (FREE: 10K units/day)
- Reddit: https://www.reddit.com/prefs/apps (FREE: unlimited)

### Step 2.4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once complete, you'll get a URL like: `https://brand-tracker-api.onrender.com`
4. **✅ Save this URL** - you'll need it for frontend!

### Step 2.5: Test Backend

```bash
curl https://brand-tracker-api.onrender.com/api/brands
```

Should return: `[]` (empty array) if successful

---

## Part 3: Frontend Deployment (Netlify)

### Step 3.1: Update Frontend Configuration

1. Create/update [frontend/.env.production](frontend/.env.production):
   ```bash
   VITE_API_URL=https://brand-tracker-api.onrender.com
   ```

2. Verify [netlify.toml](netlify.toml) exists with:
   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

### Step 3.2: Deploy to Netlify

**Option A: Via GitHub (Recommended)**

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect to GitHub → Select your repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**

**Option B: Manual Deploy**

1. Build frontend locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Go to https://app.netlify.com
3. Drag & drop the `frontend/dist` folder

### Step 3.3: Configure Environment Variables

In Netlify dashboard:

1. Go to **"Site configuration"** → **"Environment variables"**
2. Add:
   ```
   VITE_API_URL = https://brand-tracker-api.onrender.com
   ```

3. Click **"Trigger deploy"** → **"Deploy site"**

### Step 3.4: Get Your Frontend URL

Once deployed, you'll get a URL like:
```
https://sparkling-unicorn-123abc.netlify.app
```

**Custom Domain (Optional)**:
1. Go to **"Domain management"** → **"Add custom domain"**
2. Follow instructions to connect your domain

---

## Part 4: Final Configuration

### Step 4.1: Update Backend CORS

1. Go back to your **Render dashboard**
2. Update environment variable:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
3. Save and redeploy

### Step 4.2: Verify Deployment

Visit your Netlify URL and check:
- ✅ Dashboard loads
- ✅ Can create a brand
- ✅ Can see mentions
- ✅ Real-time updates work

---

## 🎉 You're Live!

**Your app URLs:**
- **Frontend**: https://your-app.netlify.app
- **Backend API**: https://brand-tracker-api.onrender.com
- **Database**: MongoDB Atlas (managed)

---

## 📊 Costs & Limits

| Service | Plan | Limits |
|---------|------|--------|
| MongoDB Atlas | M0 Free | 512 MB storage |
| Render | Free | 750 hours/month, sleeps after 15 min inactivity |
| Netlify | Free | 100 GB bandwidth, 300 build minutes |

**Note**: Render free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

## 🔧 Post-Deployment

### Monitor Your App

**Render:**
- View logs: Dashboard → "Logs"
- Check health: `https://your-api.onrender.com/health`

**Netlify:**
- View deploys: Dashboard → "Deploys"
- View logs: Click on deploy → "Deploy log"

**MongoDB Atlas:**
- Monitor usage: Dashboard → "Metrics"

### Troubleshooting

**Backend not responding:**
1. Check Render logs for errors
2. Verify MongoDB connection string
3. Ensure API keys are valid

**Frontend can't connect to backend:**
1. Check `VITE_API_URL` in Netlify env vars
2. Verify CORS settings in backend
3. Check browser console for errors

**API rate limits:**
- NewsAPI: 100 requests/day (free tier)
- YouTube: 10,000 units/day
- Consider reducing `SCRAPE_INTERVAL_MINUTES` if needed

---

## 🚀 Continuous Deployment

Both Render and Netlify support auto-deploy from GitHub:

1. Push code to `main` branch
2. Render + Netlify auto-deploy
3. No manual steps needed!

---

## 📈 Upgrade Options (When Ready)

**If you outgrow free tiers:**

- **MongoDB Atlas**: $9/month for 2GB (Shared M2)
- **Render**: $7/month for always-on service
- **Netlify**: $19/month for 400GB bandwidth

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access allows all IPs (0.0.0.0/0)
- [ ] Backend deployed to Render
- [ ] All environment variables added to Render
- [ ] API keys obtained (NewsAPI, YouTube, Reddit)
- [ ] Frontend deployed to Netlify
- [ ] `VITE_API_URL` set in Netlify
- [ ] Backend `FRONTEND_URL` updated with Netlify URL
- [ ] Tested creating a brand
- [ ] Verified data collection works

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

Happy Deploying! 🎉
