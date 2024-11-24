// services/imageService.js
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // url: process.env.CLOUDINARY_URL,
});

/*
 * Uploads an image to Cloudinary and returns the image URL.
 * @param {string} imagePath - The path of the image file to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload fails.
 */
exports.uploadImageToCloudinary = async (imageFilesArray) => {
  if(!imageFilesArray) {return null}
  
  try {
    //check if array as we might need to upload multiple files
    if(Array.isArray(imageFilesArray) && imageFilesArray.length !==0 ) { 

    /**
     * We are using Promise.all() so that the uploads happen concurently and ensure that we dont move forward until all async operations(file upload) completes.
     * Inside we are using map as it returns the value that the promise will be resloved with.
     */
      const cloudninary_file_urls = await Promise.all(
        imageFilesArray.map( async(pathObj) => {
          const key = Object.keys(pathObj)[0];
          const path = pathObj[key];
          const result = await cloudinary.uploader.upload(path,{
            folder: 'dgin/user', // Optional: Folder to organize images in Cloudinary
            resource_type: 'image',
          })
          return {[key]:result.secure_url}
        })
      );
      return cloudninary_file_urls; //If there are no images it will be undefined
    }
    //else{}
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Error submitting files!');
  }
};