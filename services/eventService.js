const { default: mongoose } = require("mongoose");
const Event = require("../models/Event");
const { json } = require("body-parser");
const AppError = require("../customExceptions/AppError");

function validateCreateEventFileds(data) {
  const { title, description, eventDate } = data;
  if(!title || !description || !eventDate) {
   throw {message:'Title, Description, EventDate fields are required!', statusCode:401} 
  }
  if(typeof title !== 'string' || typeof description !== 'string' || !eventDate instanceof Date) {
    throw {message:'Invalid field type', statusCode:401}
  }
}

function validateUpdateEventFields(fieldsToUpdate) {
  const allowedFields = ['title', 'description', 'eventDate', 'designs'];

  // Validate fields individually
  if (fieldsToUpdate.title && typeof fieldsToUpdate.title !== 'string') {
    throw { message: 'Title should be a string', statusCode: 401 };
  }
  if (fieldsToUpdate.description && typeof fieldsToUpdate.description !== 'string') {
    throw { message: 'Description should be a string', statusCode: 401 };
  }
  if (fieldsToUpdate.eventDate && !(new Date(fieldsToUpdate.eventDate) instanceof Date)) {
    throw { message: 'Invalid eventDate format', statusCode: 401 };
  }

  //checking if designs exists
  if (fieldsToUpdate.designs) {
    if (!Array.isArray(fieldsToUpdate.designs)) {
      throw { message: 'Design field should be an array', statusCode: 401 };
    }
    if (fieldsToUpdate.designs.length === 0) {
      throw { message: 'Designs array is empty', statusCode: 401 };
    }

    // Validate each design ID
    for (let i = 0; i < fieldsToUpdate.designs.length; i++) {
      const design = fieldsToUpdate.designs[i];
      if (!mongoose.Types.ObjectId.isValid(design)) {
        throw { message: `Invalid ID at designs[${i}]`, statusCode: 401 };
      }
    }
  }

  // Filter out fields not allowed for update
  for (const key of Object.keys(fieldsToUpdate)) {
    if (!allowedFields.includes(key)) {
      delete fieldsToUpdate[key];
    }
  }

  return fieldsToUpdate; // Return the validated and filtered object
}

exports.createEvent = async (body) => {
  try {
    validateCreateEventFileds(body)
    const event = new Event(body);
    await event.save();
    console.log(event)
    return { event }
  } catch (error) {
    throw error;
  }
}

exports.getEvents = async (query) => {
  try {
    const { startDate, hasDesigns } = query;
    // const filter = {eventDate: {$gte: new Date(startDate || Date.now())}};
    // if(hasDesigns === "true") {
    //   filter.designs = {$exists: true, $ne:[]}  // Filter events with non-empty designs
    // }
    // const events = await Event.find(filter).populate("designs")

    const events = await Event.find().sort({ eventDate: -1 }).populate("designs") //sord by eventDate in descedeing
    return {events}
  } catch (error) {
    throw error;
  }
}

exports.getOneEvent = async (id) => {
  try {
    const eventId = id.replace(':','');
    console.log('getOneEvent for id',id);

    const response = await Event.findById(id).populate('designs', 'imageUrl title selectedCount status maxSelections'); ;
    console.log(response);
    if(!response) {
      throw new AppError('Event not found', 400);
    }
    return response;
  } catch (error) {
    throw error;
  }
}

exports.updateEventDesign = async (eventId,data) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId,{$push:{designs:data.designId}},{new:true})
    console.log("updatedEvent with design",updatedEvent)
    return updatedEvent;
  } catch (error) {
    throw error;
  }
}

exports.updateEvent = async (eventId, body) => {
  try {

    const fieldsToUpdate = {...body};
    console.log('fieldsToUpdate',fieldsToUpdate)
    console.log('Update event id:', eventId);
    const updatedEvent = await Event.findByIdAndUpdate(eventId, { $set: fieldsToUpdate }, { new: true });
    console.log('Update Event Success')
    
    if (!updatedEvent) {
      throw new AppError('Event not found', 400);
    }
    return updatedEvent;
  } catch (error) {
    console.error('Error caught at updateEvent service !');
    throw error;
  }
};


exports.getUpcomingEventsWithRandomDesign = async (fromDate = new Date()) => {

  console.log('Fetching upcomming events from Current date in IST:', fromDate);
  // Fetch events for the next 30 days with non-empty designs array
  //@deprecated call test for better

  // const events = await Event.find({
  //   eventDate: { $gte: fromDate }, // Fetch events from current date onwards
  //   designs: { $exists: true, $ne: [] }, // Ensure designs array exists and is not empty
  // })
  //   .sort({ eventDate: 1 }) // Sort by event date
  //   .limit(40) // Limit to 30 events
  //   .populate({
  //     path: 'designs',
  //     match: { status: 'available' , selectedCount : {$lt : 15} }, // Only fetch designs with status 'available' and selectedCount less than 15
  //   });
  
    const events = await Event.aggregate([
      {
        $match: {
          available : true,
          eventDate: { $gte: fromDate }, // Events from current date onwards
          designs: { $exists: true, $ne: [] }, // Ensure designs array exists and is not empty
        },
      },
      {
        $lookup: {
          from: 'designs', // Collection to join (Design schema)
          localField: 'designs', 
          foreignField: '_id',
          as: 'filteredDesigns',
        },
      },
      {
        $addFields: {
          filteredDesigns: {
            $filter: {
              input: '$filteredDesigns',
              as: 'design',
              cond: {
                $and: [
                  { $eq: ['$$design.status', 'available'] }, // Design status is 'available'
                  { $lt: ['$$design.selectedCount', '$$design.maxSelections'] },   // selectedCount < 15
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          'filteredDesigns.0': { $exists: true }, // Retain only events with at least one matching design
        },
      },
      {
        $sort: { eventDate: 1 }, // Sort by event date
      },
      {
        $limit: 30, // Limit to 30 events
      },
      {
        $project: {
          // only add some fields from filteredDesigns
          _id :1,
          title: 1,
          description: 1,
          eventDate: 1,
          filteredDesigns: {
            _id: 1,
            title: 1,
            imageUrl: 1,
            description: 1,
            selectedCount: 1,
          },
          // designs: 0, // Exclude original designs array
        },
      },
    ]);
    
    console.log('Events with filtered designs:', JSON.stringify(events, null, 2));
    

  // Process each event and select a random design

  const eventsWithRandomDesigns = events
    .map((event) => {
      const availableDesigns = event.filteredDesigns;

      // Select a random design
      const randomDesign =
        availableDesigns.length > 0
          ? availableDesigns[Math.floor(Math.random() * availableDesigns.length)]
          : null;

      // Exclude events without available designs
      if (!randomDesign) return null;

      // Return only selected fields
      return {
        eventId: event._id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        randomDesign: {
          id: randomDesign._id,
          title: randomDesign.title,
          imageUrl: randomDesign.imageUrl,
          description: randomDesign.description,
        },
      };
    })
    .filter(Boolean); // Remove null entries

  return eventsWithRandomDesigns;
};