const express = require('express');
const Student = require('../studentModel');
const router = express.Router();

// Create a new student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student details submitted successfully!", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit student details" });
  }
});

// Get student details by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch student details" });
  }
});

// Update student details by ID
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({ message: "Student details updated successfully!", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update student details" });
  }
});

module.exports = router;
