// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const subscriptionRoutes = require('./routes/subscription');
const design = require('./routes/design');
const contentSubmissionRoute = require('./routes/contentSubmission'); //contentSubmissionRoute
const orderRoute = require('./routes/order');  //orderRoute
const eventRoute = require('./routes/event')
const designerOrder = require('./routes/designerOrder')
const errorHandler = require('./middleware/errorHandlerMiddleware');
var cors = require('cors')


 
dotenv.config();

const app = express();
app.use(cors())

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/', homeRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', design);
app.use('/api', contentSubmissionRoute) //contentSubmission
app.use('/api', orderRoute);   //order
app.use('/api',eventRoute); //event
app.use('/api/delivery',designerOrder); //event


// Centralized error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
