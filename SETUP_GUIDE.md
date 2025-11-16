# 🚀 Setup Guide - Brand Reputation Tracker

## Step 1: MongoDB Atlas (FREE Database)

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster:**
   - Click "Build a Database"
   - Select "M0" (FREE FOREVER)
   - Choose AWS or Google Cloud
   - Select closest region
   - Cluster name: `brand-tracker`
   - Click "Create"

3. **Create database user:**
   - Username: `tracker-admin`
   - Password: (click "Autogenerate Secure Password" and COPY IT)
   - Click "Create User"

4. **Set Network Access:**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://tracker-admin:<password>@cluster0.xxxxx.mongodb.net/`

6. **Update .env file:**
   - Open `backend/.env`
   - Replace `<password>` with your actual password
   - Add database name at end: `/brand-tracker`
   - Final: `mongodb+srv://tracker-admin:YourPassword123@cluster0.xxxxx.mongodb.net/brand-tracker`

## Step 2: Get FREE API Keys

### NewsAPI (2 min)
1. Go to: https://newsapi.org/register
2. Enter email, click "Submit"
3. Copy API key from dashboard
4. Paste in `.env` → `NEWS_API_KEY=your_key_here`

### Reddit API (3 min)
1. Go to: https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill form:
   - **Name:** Brand Tracker
   - **Type:** Select "script"
   - **Description:** Brand monitoring tool
   - **About URL:** http://localhost
   - **Redirect URI:** http://localhost:5000
4. Click "Create app"
5. Copy:
   - **Client ID:** (under app name, looks like: dkj3l4k2j3l4)
   - **Secret:** (next to "secret")
6. Paste in `.env`:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_secret
   ```

### YouTube API (5 min)
1. Go to: https://console.cloud.google.com
2. Create project: "Brand Tracker"
3. Enable "YouTube Data API v3"
4. Create Credentials → API Key
5. Copy API key
6. Paste in `.env` → `YOUTUBE_API_KEY=your_key_here`

## Step 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║  Brand Reputation Tracker API         ║
╚════════════════════════════════════════╝
🚀 Server running on port 5000
✅ MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: brand-tracker
🔄 Starting data collector worker...
```

## Step 4: Create Your First Brand

Open new terminal:

```bash
curl -X POST http://localhost:5000/api/brands \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tesla",
    "keywords": ["Tesla", "Model 3", "Cybertruck"],
    "sources": {
      "newsapi": true,
      "reddit": true,
      "rss": true,
      "youtube": true
    }
  }'
```

## Step 5: Check Data Collection

Wait 1-2 minutes, then check mentions:

```bash
curl http://localhost:5000/api/mentions
```

You should see mentions being collected!

## Troubleshooting

### "MongoDB connection error"
- Check your connection string in `.env`
- Make sure password doesn't have special characters
- Verify Network Access allows your IP

### "NewsAPI rate limit"
- Free tier: 100 requests/day
- Wait 24 hours or use other sources

### "No mentions found"
- Wait 15 minutes for first collection cycle
- Check if brand keywords are popular
- Try different keywords

## Next Steps

Once backend is working:
1. Install frontend dependencies
2. Create React dashboard
3. View real-time data!
