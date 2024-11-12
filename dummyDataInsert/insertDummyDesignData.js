// insertDummyDesignData.js

const mongoose = require('mongoose');
const { addDays, format } = require('date-fns');
const Design = require('../models/Design');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dgindb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Generate Dummy Data
const generateDummyData = () => {
  const designs = [];
  const today = new Date();

  for (let i = 1; i <= 50; i++) {
    const randomDays = Math.floor(Math.random() * 60); // Randomly spread out designs over 60 days
    const releaseDate = addDays(today, randomDays);
    const accessLevels = ['limited', 'monthly', 'all'];
    const randomAccessLevel = accessLevels[Math.floor(Math.random() * accessLevels.length)];

    designs.push({
      title: `Design ${i}`,
      imageUrl: `https://dummyimage.com/600x400/000/fff&text=Design+${i}`,
      releaseDate: releaseDate,
      accessLevel: randomAccessLevel,
      description: `This is a dummy description for Design ${i}`,
    });
  }

  return designs;
};

// Insert Dummy Data
const insertDummyData = async () => {
  try {
    const dummyData = generateDummyData();
    await Design.insertMany(dummyData);
    console.log('Dummy data inserted successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    mongoose.connection.close(); // Close the connection when done
  }
};

// Run the script
insertDummyData();
