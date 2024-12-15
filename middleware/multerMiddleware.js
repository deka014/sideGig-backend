const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname,'..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Exporting the upload object
module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB in bytes
});
