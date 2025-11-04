require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Using MONGO_URI:', uri ? uri.replace(/:(.*)@/, ':***@') : 'MONGO_URI not set');

(async function(){
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
})();
