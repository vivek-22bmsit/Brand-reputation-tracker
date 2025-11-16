import express from 'express';
import { getMentions, getMentionStats, getTrendData } from '../controllers/mentionController.js';

const router = express.Router();

// GET /api/mentions - List mentions with filters
router.get('/', getMentions);

// GET /api/mentions/stats/:brandId - Get statistics
router.get('/stats/:brandId', getMentionStats);

// GET /api/mentions/trends/:brandId - Get trend data
router.get('/trends/:brandId', getTrendData);

export default router;
