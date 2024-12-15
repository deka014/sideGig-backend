const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { createEvent, updateEvent, getEvents, getOneEvent, updateEventDesign } = require('../services/eventService');
const { getUpcomingEventsWithRandomDesign } = require('../services/eventService');

router.post('/events',async (req,res) => {
  try {
    console.log('events data',req.body)
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

router.get('/event/:id', async (req,res) => {
  console.log('we are here /event')
  try {
    console.log(req.params)
    const {id} = req.params;
    const eventId = id.replace(':','');
    console.log('eventId',eventId)
    const event = await getOneEvent(eventId);
    res.status(200).json({success:true,event})
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({success:false,message:"Error getting event",error})
  }
}
)

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

router.patch('/event/:id/addDesign', async(req,res) => {
  try {
    console.log('in /event/:id/addDesign')
    const {id} = req.params;
    console.log('req.params',req.params)
    const eventId = id.replace(':','');
    console.log("id",id)
    console.log("eventId",id)

    console.log(req.body);
    const response = await updateEventDesign(eventId,req.body)
    res.status(200).json({success:true,response})
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({success:false,message:"Error in adding design to event",error})
  }
})
// get all events from current date to next 30 events
router.get('/upcoming-events', async (req, res) => {
  try {
    const events = await getUpcomingEventsWithRandomDesign();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router
