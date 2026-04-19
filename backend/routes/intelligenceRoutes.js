const express = require('express');
const router = express.Router();
const IntelligenceNode = require('../models/IntelligenceNode');

// @route   GET /api/intelligence
// @desc    Get all intelligence nodes
// @access  Public (for dashboard view)
router.get('/', async (req, res) => {
  try {
    const nodes = await IntelligenceNode.find({});
    res.json(nodes);
  } catch (error) {
    console.error(`Error fetching intelligence nodes: ${error.message}`);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
