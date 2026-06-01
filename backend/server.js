// IMPORTANT: Load environment variables FIRST
import './loadEnv.js';

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './src/config/database.js';
import mentionRoutes from './src/routes/mentions.js';
import brandRoutes from './src/routes/brands.js';
import alertRoutes from './src/routes/alerts.js';
import { startCollector } from './src/workers/collector.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Brand Reputation Tracker API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/mentions', mentionRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/alerts', alertRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('subscribe', (brandId) => {
    socket.join(`brand-${brandId}`);
    console.log(`📡 Socket ${socket.id} subscribed to brand ${brandId}`);
  });

  socket.on('unsubscribe', (brandId) => {
    socket.leave(`brand-${brandId}`);
    console.log(`📡 Socket ${socket.id} unsubscribed from brand ${brandId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible to routes and workers
app.set('io', io);
global.io = io;

// Error handler (must be last)
app.use(errorHandler);

// Start data collector worker
startCollector(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Brand Reputation Tracker API         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: Ready`);
  console.log('════════════════════════════════════════');
});

export { io };

