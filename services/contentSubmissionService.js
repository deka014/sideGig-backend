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
    selectedPreviews
  } = bodyData;


  //upload image files to cloudinary
  const imageFilesArray = [] //[{<key>:'<filePath>'},...]
  if(files) {                             //populates imageFilesArray (array of objects)
    Object.keys(files).forEach((file)=>{
      console.log('this is file',file)
      console.log('this is files',files)
      console.log('this is path of the file in files',files[file][0].path)
        imageFilesArray.push({[file]:files[file][0].path})
    })
  }
  console.log('this is imageFilesArray:',imageFilesArray)
  const cloudinary_upoloaded_file_links = await uploadImageToCloudinary(imageFilesArray)

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
    selectedPreviews: JSON.parse(selectedPreviews), 
    logo:cloudinary_upoloaded_file_links?.find((obj)=>{return obj.logo})?.logo || null, // Find first object with 'logo' and return the logo or null if not found
    photo:cloudinary_upoloaded_file_links?.find((obj)=>{return obj.photo})?.photo || null // Find first photo with 'photo' and return the photo or null if not found
  })
  const savedContent = await newContentSubmission.save();
  return savedContent 
}