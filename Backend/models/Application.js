const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: String,
  username: String,
  email: String,
  jobId: String,
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);
