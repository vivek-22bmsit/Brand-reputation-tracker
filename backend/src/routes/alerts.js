import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

// GET /api/alerts - Get alerts with filters
router.get('/', async (req, res) => {
  try {
    const { brandId, isRead } = req.query;

    const filter = {};
    if (brandId) filter.brandId = brandId;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('brandId', 'name');

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/alerts/:id/read - Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
