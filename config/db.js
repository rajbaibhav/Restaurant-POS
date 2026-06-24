const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This looks for the MONGO_URI variable in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure if the database doesn't connect
    process.exit(1);
  }
};

module.exports = connectDB;