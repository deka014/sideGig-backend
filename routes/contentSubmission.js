const express = require("express");
const multer = require('multer');
const { verifyToken } = require("../middleware/authMiddleware");
const { createContentSubmission } = require("../services/contentSubmissionService");
const fs = require('fs');
const path = require('path');

const router = express.Router();

console.log('We are hereeeee./...............')

// Ensure the 'uploads' folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  console.log('Uploads folder created');
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024,} // 10 MB in bytes
});


router.post('/content-submission', verifyToken, upload.fields([{ name: 'logo' }, { name: 'photo' }]), 
  async(req,res) => {

    console.log('Content-Type:', req.headers['content-type']);

    const {body , files, user} = req;

    console.log(req.body)
    console.log(req.files)
    console.log(req.user)

  try {
    const response = await createContentSubmission(body,files,user);
    res.status(201).json({message:'content submitted successfully', content:response})
  } catch (error) {
    console.error('Error submitting content:', error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;