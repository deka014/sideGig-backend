const { uploadImageToCloudinary } = require('../services/imageService.js');
const path = require('path');

(async () => {
  try {
    const imagePath = path.join(__dirname, 'sample1.png');  //sample image path: it will get uploaded to Cloudinary server
    const imageUrl = await uploadImageToCloudinary(imagePath);
    console.log('Image uploaded successfully:', imageUrl);
  } catch (error) {
    console.error('Error in uploading image:', error.message);
  }
})();

