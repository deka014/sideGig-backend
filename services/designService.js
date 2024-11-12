// services/designService.js
const User = require('../models/Users');
const Design = require('../models/Design');
const { startOfMonth, endOfMonth, addMonths, parseISO, startOfDay, endOfDay, isWithinInterval, addDays } = require('date-fns');

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
      // Registered but not subscribed users or expired subscription: access for the registration month
      accessStartDate = startOfMonth(today)
      accessEndDate = endOfMonth(user.registrationDate);
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
