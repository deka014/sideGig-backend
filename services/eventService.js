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

function validateUpdateEventFields(body) {
  const {title,description,designs} = body;
  if(!title || !description) {
    throw {message:'Title and description cannot be empty'}
  }
  if(typeof title !== 'string' || typeof description !== 'string') {
    throw {message:'Title and Description should be of type string', statusCode:401}
  }
  

  //check if design exists or not
  if(designs) {

    if(!Array.isArray(designs)) {
      throw {message:'Design field should be an array', statusCode:401}
    }

    if(designs.length === 0) {
      throw {message: 'Desings array is empty', statusCode:401}
    }

    //validating each element
    for(let i=0; i<designs.length; i++) {
      const design = designs[i];
      if(!mongoose.Types.ObjectId.isValid(design)) {
        throw {message:`Invalid id type at index designs[${i}]`,statusCode: 401}
      }
    }
  }
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
    const filter = {eventDate: {$gte: new Date(startDate || Date.now())}};

    if(hasDesigns === "true") {
      filter.designs = {$exists: true, $ne:[]}  // Filter events with non-empty designs
    }

    const events = await Event.find(filter).populate("designs")
    return {events}
  } catch (error) {
    throw error;
  }
}

exports.updateEvent = async (eventId,body) => {
  try {
    const id = eventId.replace(':',''); //formatting eventId

    //formatting designs array into valid ObjectId before passing to validateUpdateEventFields()
    const {designs} = body;
    if(designs) {
      const parsed_designs =  JSON.parse(designs)
      const final_parsed_designs = parsed_designs.map(id => new mongoose.Types.ObjectId(id))
      body.designs = final_parsed_designs;
    }

    validateUpdateEventFields(body);
    console.log('validation success')
    const fieldsToUpdate = body;
    
    const updatedEvent = await Event.findByIdAndUpdate(id,{$set: fieldsToUpdate}, {new: true});
    if(!updatedEvent) {
      throw {message:'Event not found',statusCode:404}
    }
    return {updatedEvent}
  } catch (error) {
    console.log('errorr caught at updateEvent!')
    throw error;
  }
}