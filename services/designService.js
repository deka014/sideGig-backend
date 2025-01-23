// services/designService.js
const User = require('../models/Users');
const Design = require('../models/Design');
const { startOfMonth, endOfMonth, addMonths, parseISO, startOfDay, endOfDay, isWithinInterval, addDays } = require('date-fns');
const { default: mongoose } = require('mongoose');
const AppError = require('../customExceptions/AppError');

exports.getDesignsByDate = async (userId = null, targetDate) => {
  const today = new Date();
  const requestedDate = parseISO(targetDate); // Convert the target date to a Date object

  let accessStartDate;
  let accessEndDate;
  let accessLevel;

  if (!userId) {
    // Non-registered users: access to designs only for the next 7 days
    accessStartDate = today;
    accessEndDate = addDays(today,7) ; // Allow viewing only 7 preview for non-registered
    accessLevel = 'limited';
  } else {
    // Registered user information
    const user = await User.findById(userId);

    if (user.subscriptionEnd && user.subscriptionEnd >= today) {
      // Subscribed users: access from subscription start to one month later
      accessStartDate = user.subscriptionStart;
      accessEndDate = addMonths(user.subscriptionStart, 1);
      accessLevel = 'all';
    } else {
      // Registered but not subscribed users or expired subscription: access for the current month
      accessStartDate = startOfMonth(today)
      accessEndDate = endOfMonth(today);
      accessLevel = 'monthly';
  }
}

  // Check if the requested date is within the access period
  if (!isWithinInterval(requestedDate, { start: accessStartDate, end: accessEndDate })) {
    throw new Error('Requested date is outside of access period');
  }

  // Define the range for the entire day of the requested date
  const dayStart = startOfDay(requestedDate);
  const dayEnd = endOfDay(requestedDate);

  // Fetch designs available on the requested date, based on access level
  let designs;
  if (accessLevel === 'limited') {
    designs = await Design.find({
      releaseDate: { $gte: dayStart, $lte: dayEnd },
      accessLevel: 'limited', // Only show limited-access designs
    });
  } else {
    designs = await Design.find({
      releaseDate: { $gte: dayStart, $lte: dayEnd },
      $or: [{ accessLevel: 'all' }, { accessLevel: 'monthly' }],
    });
  }

  return { designs, accessLevel };
};


function validateDesignData(data) {
  const { title, imageUrl, owner, maxSelections, selectedCount, status } = data;

  // Validate required fields
  if (!title || !imageUrl || !owner) {
    throw { message: 'title, imageUrl, and owner are required', statusCode: 400 };
  }

  // Validate field types
  if (
    typeof title !== 'string' ||
    typeof imageUrl !== 'string' ||
    (data.description && typeof data.description !== 'string') ||
    !mongoose.Types.ObjectId.isValid(owner) ||
    (maxSelections && typeof maxSelections !== 'number') ||
    (selectedCount && typeof selectedCount !== 'number') ||
    (status && !['available', 'unavailable'].includes(status))
  ) {
    throw { message: 'Invalid field type or value!', statusCode: 400 };
  }
}


exports.addDesign = async (data,user) => {
  validateDesignData({...data, owner:user.userId}) //validate the data
  try{
    console.log('addDesign Current user',user)
    return await Design.create({...data,owner:user.userId})
  } catch(error) {
    //NOTE: function validateDesignData(data) already does the type and falsy validation but I'm adding the below check for other validation checks by the DB.
    if(error.name === "ValidationError") {
      const customErrorObject = {message:"Internal server error!",mongoDbResponse:error} 
      throw customErrorObject;
    }
    throw error;
  }
}

exports.updateDesign = async (designId, updateData, user) => {
  
  try {
    
/*Basic check for checking whether the current user is the same user who created the design.
  Any one except the user who created the design should not be allowed to perform PUT(update) request    
*/

    // if(String(design.owner) !== String(user.userId)) {
    //   throw {message:'User is not authorized for this operation!',statusCode:401}
    // }

    // Update the design document
    // set the available fields to update
    
    const updatedDesign = await Design.findByIdAndUpdate(designId, updateData, {new: true});

    if (!updatedDesign) {
      throw new AppError('Design not found', 404);
    }
    const response = {
      _id : updatedDesign._id,
      maxSelections : updatedDesign.maxSelections,
      selectedCount : updatedDesign.selectedCount,
      status : updatedDesign.status
    }

    return response;
  } catch (error) {
    throw error;
  }
};
