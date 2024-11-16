const mongoose  = require("mongoose");
const ContentSubmission = require("../models/ContentSubmission");

function validateContentSubmissionData(bodyData) {
  const {title,name} = bodyData
  if (!name || !title) {
    throw new Error('Name and title are required');
  }
  if(typeof name!=="string" || typeof title!=="string") {
    throw new Error('Invalid form field type!');
  }
}

exports.createContentSubmission = async(bodyData,files,user) => {
  validateContentSubmissionData(bodyData);

  const {
    name,
    title,
    facebook,
    instagram,
    thread,
    xlink,
    website,
    selectedPreviews,
  } = bodyData;

  console.log('this is files',files);
  const logoFile = files['logo'] ? `/uploads/${files['logo'][0].filename}` : null;
  const photoFile = files['photo'] ? `/uploads/${files['logo'][0].filename}` : null;


  // Create a new content submission
  const newContentSubmission  = new ContentSubmission({
    userId:user.userId,
    name,
    title,
    facebook,
    instagram,
    thread,
    xlink,
    website,
    selectedPreviews:selectedPreviews ? JSON.parse(selectedPreviews) : [],
    logo:logoFile,
    photo:photoFile,
  })
  const savedContent = await newContentSubmission.save();
  return savedContent 
}