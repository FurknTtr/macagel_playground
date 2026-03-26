require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./app_macagel/models/Match');
const connectDB = require('./app_macagel/configs/db');

async function test() {
  await connectDB();
  const userId = "69c514c924576a1bda2b9e46"; // example user id from earlier
  console.log("Checking for userId:", userId);
  
  const allMatches = await Match.find({});
  console.log("ALL MATCHES:", allMatches);

  const upcomingMatches = await Match.find({ 
    'players.user': userId,
    date: { $gte: new Date() },
    isActive: true 
  });
  console.log("UPCOMING MATCHES:", upcomingMatches);

  mongoose.connection.close();
}

test();
