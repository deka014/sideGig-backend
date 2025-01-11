const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { createContentSubmission, updatePreviousContentSubmission } = require("../services/contentSubmissionService");
const fs = require('fs');
const path = require('path');
const upload = require("../middleware/multerMiddleware");
const ContentSubmission = require("../models/ContentSubmission");

const router = express.Router();

// Ensure the 'uploads' folder exists
const uploadFolder = path.join(__dirname,'..', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  console.log('Uploads folder created');
}


router.post('/content-submission', verifyToken, upload.fields([{ name: 'logo' }, { name: 'photo' }]), 
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

router.get('/content-submission',verifyToken,async (req,res)=>{
  const {userId} = req.user;
  try {
    console.log('This is user',userId)
    console.log(typeof userId)
    const response = await ContentSubmission.findOne({userId})
    console.log(response);
    if(!response) {
      res.status(404).json({success:false,message:'content submisison not found'})
    }
    res.status(200).json({contentSubmission:response})
  } catch (error) {
    console.log('Error occured at GET /content-submission route!')
    res.status(500).json({message:'Error getting content submussion',error});
  }
})

router.patch('/content-submission:id',verifyToken,upload.fields([{name:'logo'},{name:'photo'}]),
  async(req,res)=>{
    const {body , files, user} = req;
    const {id} = req.params;
    const contentSubmissionId = id.replace(':','');
    
    try {
      const response = await updatePreviousContentSubmission(contentSubmissionId,body,files,user)

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
      console.log('An error occured at patch /content-submission',error);
      res.status(500).json({ error: error.message });
    }
  }
)
module.exports = router;