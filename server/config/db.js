const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('⚠️  MongoDB connection skipped: MONGODB_URI is not set in .env');
    console.log('   (TTS features will continue to work normally)');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('   (TTS features will continue to work normally)');
    return false;
  }
};

module.exports = connectDB;
