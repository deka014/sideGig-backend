// routes/designs.js
const express = require('express');
const router = express.Router();
const designService = require('../services/designService');
const { verifyToken } = require('../middleware/authMiddleware');
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

// @route   POST /api/auth/verify-otp
// @desc    To (POST)add a new design in the DB
// @access  Private
router.post('/designs',verifyToken, async (req,res) =>{
  const user = req.user;
  console.log(user);
  console.log('/design req body',req.body)
  const {title,imageUrl,releaseDate,accessLevel,description} = req.body;

  //validate fileds
  if(!title || !imageUrl || !releaseDate) {
    res.status(400).json({message:'title, imageUrl, releaseDate are required'});
  }
  if(typeof title !== 'string' || typeof imageUrl!== 'string' || !releaseDate instanceof Date || typeof accessLevel!== 'string' || typeof description!== 'string') {
    res.status(400).json({message:"Invalid field type"})
  }

  try {
    const response = await Design.create({
      title,
      imageUrl,
      releaseDate,
      accessLevel,
      description
    })
    res.status(201).json({success:true,message:'Resource created successfully',design:response})
  } catch (error) {
    console.log('error at Design.create()',error);
    res.status(500).json({message:"Internal server error!"})
  }
})


module.exports = router;
