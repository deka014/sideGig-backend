// services/imageService.js
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  url: process.env.CLOUDINARY_URL,
});

//to check if credentials are available
console.log(cloudinary.config());

/*
 * Uploads an image to Cloudinary and returns the image URL.
 * @param {string} imagePath - The path of the image file to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload fails.
 */
exports.uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'content_submissions', // Optional: Folder to organize images in Cloudinary
      resource_type: 'image',         // Specify resource type as image
    });

    // Return the secure URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

//module.exports = cloudinary;