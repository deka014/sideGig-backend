const { default: mongoose } = require("mongoose");
const Event = require("../models/Event");
const { json } = require("body-parser");

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

exports.updateEvent = async (eventId, body) => {
  try {
    const id = eventId.replace(':', ''); // formatting eventId

    const fieldsToUpdate = {...body};

    // If designs are present, parse them to ObjectId instances
    if (fieldsToUpdate.designs) {
      const parsedDesigns = JSON.parse(fieldsToUpdate.designs);
      fieldsToUpdate.designs = parsedDesigns.map((id) => new mongoose.Types.ObjectId(id));
    }
    const validatedFields = validateUpdateEventFields(fieldsToUpdate)
    console.log('Validation success:', fieldsToUpdate);

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(id, { $set: validatedFields }, { new: true });

    if (!updatedEvent) {
      throw { message: 'Event not found', statusCode: 404 };
    }

    return { updatedEvent };
  } catch (error) {
    console.error('Error caught at updateEvent!');
    throw error;
  }
};


exports.getUpcomingEventsWithRandomDesign = async () => {
  const currentDate = new Date();

  // Fetch events for the next 30 days with non-empty designs array
  const events = await Event.find({
    eventDate: { $gte: currentDate },
    designs: { $exists: true, $ne: [] }, // Ensure designs array exists and is not empty
  })
    .sort({ eventDate: 1 }) // Sort by event date
    .limit(30) // Limit to 30 events
    .populate({
      path: 'designs',
      match: { status: 'available' }, // Only fetch designs with status 'available'
    });

  // Process each event and select a random design

  const eventsWithRandomDesigns = events
    .map((event) => {
      const availableDesigns = event.designs;

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