// models/Slot.js
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: String,
  time: String,
  type: String, // "technical", "behavioral", "system design"
  interviewer: String,
  interviewerEmail:String,
  status: { type: String, enum: ['available', 'booked'], default: 'available' }
});

module.exports = mongoose.model('Slot', slotSchema);
