const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We will connect to a local MongoDB instance by default
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intelligence_fusion', {
      // Compatibility options for Mongoose 6+ typically don't require useNewUrlParser/useUnifiedTopology
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
