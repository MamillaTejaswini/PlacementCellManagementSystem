const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  semester: { type: String, required: true },
  branch: { type: String, required: true },
  sslc: { type: String, required: true },
  diploma: { type: String, required: true },
  backlogs: { type: String, required: true },
  profilePic: { type: String },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
