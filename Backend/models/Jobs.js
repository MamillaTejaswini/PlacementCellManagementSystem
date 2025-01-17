const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  eligibility: { type: String, required: true },
  applyLink: { type: String, required: true },
});

module.exports = mongoose.model("Job", JobSchema);

