const mongoose = require('mongoose');
const Event = require('../models/Event');
const Design = require('../models/Design');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dgindb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Function to generate a random date
const getRandomDate = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Function to insert dummy data
async function insertDummyData() {
  // Clear existing data
  await Event.deleteMany({});
  await Design.deleteMany({});

  const events = [];
  const today = new Date();
  const designs = [];

  // Create 100 dummy designs
  for (let i = 0; i < 100; i++) {
    const design = new Design({
      title: `Design ${i + 1}`,
      imageUrl: `https://via.placeholder.com/300x200?text=Design+${i + 1}`,
      status: i % 5 === 0 ? 'unavailable' : 'available', // Some designs are unavailable
      description: `Description for Design ${i + 1}`,
      owner : '60f3b3b3b3b3b3b3b3b3b3b3', // Dummy user ID
    });
    designs.push(design);
  }

  // Save designs to database
  const savedDesigns = await Design.insertMany(designs);

  // Create 30 dummy events and associate random designs
  for (let i = 0; i < 30; i++) {
    const randomDesigns = savedDesigns
      .sort(() => 0.5 - Math.random()) // Shuffle designs
      .slice(0, Math.floor(Math.random() * 5) + 1) // Select 1-5 random designs
      .map((design) => design._id);

    const event = new Event({
      title: `Event ${i + 1}`,
      description: `Description for Event ${i + 1}`,
      eventDate: getRandomDate(today, new Date(today.getFullYear(), today.getMonth() + 1)),
      designs: randomDesigns,
    });
    events.push(event);
  }

  // Save events to database
  await Event.insertMany(events);
}

insertDummyData()