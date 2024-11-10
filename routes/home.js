const express = require('express');
const router  = express.Router();


// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', async (req, res) => {
    res.status(200).json({ message: 'Welcome to the home page' });
});


module.exports = router;