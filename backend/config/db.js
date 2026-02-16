const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * Uses the MONGO_URI env variable which should point to your Atlas cluster.
 * Example: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/elderguard
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
