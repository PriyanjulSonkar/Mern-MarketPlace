import app from '../server/express';
import mongoose from 'mongoose';
import config from '../config/config';

// Ensure Mongoose connects to the database in a serverless environment
if (mongoose.connection.readyState === 0) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
  }).catch(err => {
    console.error("MongoDB connection failed in serverless function: ", err);
  });
}

export default app;
