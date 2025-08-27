const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/shantanu/Quiz Application/Backend/.env' });

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { connectTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));