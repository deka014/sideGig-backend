// routes/designs.js
const express = require('express');
const router = express.Router();
const designService = require('../services/designService');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const Design = require('../models/Design');
const { restart } = require('nodemon');

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

// @route   POST /api/auth/designs
// @desc    To (POST)add a new design in the DB
// @access  Private
router.post('/designs', verifyToken, async (req,res) =>{
  const data = req.body;
  const user = req.user
  try {
    const response = await designService.addDesign(data,user)
    res.status(201).json({success:true,message:'Resource created successfully',design:response})
  } catch (error) {
    console.log('error at Design.create()',error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({error})
  }
})

router.patch('/designs/:designId',verifyToken,verifyAdmin, async (req,res,next) => {
  try {
    const {body, user} = req;
    const {designId} = req.params;

    const response = await designService.updateDesign(designId,body,user);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
})
module.exports = router;
