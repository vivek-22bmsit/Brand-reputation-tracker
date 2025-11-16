# 📊 Brand Reputation Tracker

A real-time brand monitoring and sentiment analysis platform that tracks brand mentions across multiple sources including YouTube, NewsAPI, and RSS feeds.

## ✨ Features

- **Real-time Monitoring**: Automated collection every 15 minutes from multiple sources
- **Sentiment Analysis**: AI-powered sentiment analysis using Natural NLP
- **Trend Visualization**: Interactive charts and trend indicators
- **Multi-Source**: YouTube, NewsAPI, RSS feeds (Indian & Global business news)
- **Topic Clustering**: Automatic grouping of related mentions
- **Free APIs**: All data sources use free tier APIs

## 🚀 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- Socket.io for real-time updates
- Natural (NLP for sentiment analysis)
- Node-cron for scheduling

**Frontend:**
- React 18 + Vite
- TailwindCSS
- Recharts for data visualization
- React Query for data management

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API Keys (all free):
  - NewsAPI: https://newsapi.org/register
  - YouTube API: https://console.cloud.google.com
  - (Optional) Reddit API

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd brand-reputation-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the Application**

Backend (port 5000):
```bash
cd backend
npm run dev
```

Frontend (port 5173):
```bash
cd frontend
npm run dev
```

## 🔧 Configuration

Edit `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/brand-tracker

# API Keys (FREE)
NEWS_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret

# Settings
SCRAPE_INTERVAL_MINUTES=15
SPIKE_THRESHOLD_PERCENT=40
```

## 📊 Data Sources

- **YouTube** (10K units/day free): Video titles, descriptions, channels
- **NewsAPI** (100 requests/day free): News articles from 80K+ sources
- **RSS Feeds** (unlimited): BBC, TechCrunch, Economic Times, Moneycontrol
- **Reddit** (unlimited): Subreddit posts and comments

## 🎯 Usage

### Create a Brand

```bash
curl -X POST http://localhost:5000/api/brands \
  -H "Content-Type: application/json" \
  -d '{
    "name": "YourBrand",
    "keywords": ["keyword1", "keyword2"]
  }'
```

### View Dashboard

Open http://localhost:5173 in your browser to:
- Monitor real-time mentions
- View sentiment trends
- Analyze topic clusters
- Track source distribution

## 📈 Features in Detail

### Sentiment Analysis
- Positive, Negative, Neutral classification
- Trend indicators (↗️ up, ↘️ down, → neutral)
- Percentage change vs. previous day

### Trends Page
- 7-day sentiment trend lines
- Volume charts
- Source breakdown
- Interactive tooltips

### Data Collection
- Automatic every 15 minutes
- Duplicate detection via content hashing
- Spike detection and alerts
- Topic clustering using TF-IDF

## 🛠️ API Endpoints

```
GET    /api/brands              - List all brands
POST   /api/brands              - Create new brand
PUT    /api/brands/:id          - Update brand
GET    /api/mentions            - Get mentions (filter by brand)
GET    /api/mentions/stats/:id  - Get mention statistics
GET    /api/mentions/trends/:id - Get trend data
GET    /api/alerts              - Get alerts
```

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**API Keys not working:**
- Ensure no quotes around values in .env
- Restart backend after changing .env
- Check API key limits haven't been exceeded

**MongoDB connection issues:**
- Ensure MongoDB is running
- Check MONGODB_URI is correct
- For Atlas, whitelist your IP address

## 🎉 Acknowledgments

Built with ❤️ using free tier APIs and open source libraries.
