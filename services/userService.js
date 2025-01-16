const dotenv = require('dotenv');
const User = require('../models/Users');


dotenv.config();


exports.getUsersBasedOnAccess = async (page, access,limit=10) => {
    try {
        const filter = {}; // Initialize an empty filter object
        if (access && access!== 'all') {
            filter.access = access;
        }
        console.log('Filter:', filter);

        const users = await User.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        console.log('Users fetched:', users);
        return users ;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
}
