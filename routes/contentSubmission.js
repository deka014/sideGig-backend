const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { createContentSubmission , getLatestContentSubmissionSelectedPreview } = require("../services/contentSubmissionService");
const fs = require('fs');
const path = require('path');
const upload = require("../middleware/multerMiddleware");
const checkUserPaymentStatus = require("../middleware/checkUserPaymentStatus");


const router = express.Router();

// Ensure the 'uploads' folder exists
const uploadFolder = path.join(__dirname,'..', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  console.log('Uploads folder created');
}


router.post('/content-submission', verifyToken, checkUserPaymentStatus, upload.fields([{ name: 'logo' }, { name: 'photo' }]), 
  async(req,res) => {
    
    console.log('Content-Type:', req.headers['content-type']);

    const {body , files, user} = req;
    console.log(req.user)
    console.log(body)
  try {
    const response = await createContentSubmission(body,files,user);

    //unlink or remove file from diskStorage after success
    /**
     * we are using Object.keys(files) because files is an object. So we are basically iterating the keys of the object. 
     */
    Object.keys(files).forEach((file) => {
      const filePath = files[file][0].path;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing ${file}:`, err);
        } else {
          console.log(`${file} removed successfully`);
        }
      });
    });

    res.status(201).json({message:'content submitted successfully', content:response})
  } catch (error) {
    console.error('Error submitting content:', error);
    res.status(500).json({ error: error.message });
  }
})


router.get('/content-submission-selected-preview', verifyToken, async(req,res,next) => {
  try {
    const {userId} = req.user;
    const response = await getLatestContentSubmissionSelectedPreview(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
})

module.exports = router;