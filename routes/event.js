const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { createEvent, updateEvent, getEvents } = require('../services/eventService');

router.post('/events',async (req,res) => {
  try {
    const event = await createEvent(req.body)
    res.status(201).json({success:true,message:'Event created successuflly', event: event.event})
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({message:'Error creating event',error})
  }
})

router.get('/events',async (req,res) => {
  try {
    const response = await getEvents(req.query)
    res.status(200).json({success:true,events:response.events})
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({message:"Error while getting events", error})
  }
})

router.put('/events:eventId', async (req,res) => {
  try {
    const { eventId } = req.params;
    const response = await updateEvent(eventId,req.body)
    res.status(200).json({success:true, message:'Resource updated successfully', updatedEvent: response.updatedEvent})
  } catch (error) {
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({message:'Error updating resource', error:error})
  }
})

module.exports = router