const ContentSubmission = require("../models/ContentSubmission");
const { uploadImageToCloudinary } = require("./imageService");

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

  console.log('this is files files files files files',files);
  const logoFile = files['logo'] ? `${files['logo'][0].path}` : null;
  const photoFile = files['photo'] ? `${files['photo'][0].path}` : null;


  //upload image files to cloudinary
  const cloudinary_upoloaded_file_links = await uploadImageToCloudinary([{logoFile},{photoFile}])
  
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
    logo:cloudinary_upoloaded_file_links[0].logoFile,
    photo:cloudinary_upoloaded_file_links[1].photoFile,
  })
  const savedContent = await newContentSubmission.save();
  return savedContent 
}