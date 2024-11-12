// routes/designs.js
const express = require('express');
const router = express.Router();
const designService = require('../services/designService');
const { verifyToken } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Endpoint to get designs for a specific date based on user access level
router.get('/designs-by-date', async (req, res) => {
  try {
    const targetDate = req.query.date; // Date to fetch designs for
    if (!targetDate) {
      return res.status(400).json({ message: 'Date is required' });
    }

    let userId = null;

    // Check if the request is from an authenticated (registered) user
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    }

    const { designs, accessLevel } = await designService.getDesignsByDate(userId, targetDate);
    res.status(200).json({ designs, accessLevel });
  } catch (error) {
    console.error('Error fetching designs:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
