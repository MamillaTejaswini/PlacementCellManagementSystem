// routes/slot.js
const express = require('express');
const router = express.Router();
const Slot = require('../models/slotSchema');

// GET all slots (for user interface)
router.get('/', async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new slot (for admin panel)
router.post('/', async (req, res) => {
  const { date, time, type, interviewer,interviewerEmail } = req.body;
  const newSlot = new Slot({
    date,
    time,
    type,
    interviewer,
    interviewerEmail,
  });

  try {
    const savedSlot = await newSlot.save();
    res.status(201).json(savedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT to update slot status (e.g., booking a slot)
router.put('/:id', async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.status = req.body.status || slot.status;
    const updated = await slot.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a slot
router.delete('/:id', async (req, res) => {
  try {
    const result = await Slot.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
