const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// Apply to a job
router.post("/", async (req, res) => {
  const { userId, username, email, jobId } = req.body;
  if (!userId || !jobId) {
    return res.status(400).json({ message: "Missing userId or jobId" });
  }
  try {

    const exists = await Application.findOne({ userId, jobId });
    if (exists) return res.status(400).json({ message: "Already applied" });

    const application = new Application({ userId, username, email, jobId });
    await application.save();

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications by student
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!userId || userId === "null" || userId === "undefined") {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const apps = await Application.find({ userId: req.params.userId });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications for a job
router.get("/job/:jobId", async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
