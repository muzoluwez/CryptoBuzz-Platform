    const mongoose = require('mongoose');
    require('dotenv').config();

    console.log('Initializing persistent MongoDB connection for emailer service...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    const connectDB = async () => {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for emailer service.');
      } catch (err) {
        console.error('MongoDB connection error in emailer:', err.message);
        // Exit process with failure
        process.exit(1);
      }
    };

    module.exports = connectDB;
    
