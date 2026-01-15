const express = require("express");
const Track = require("../models/track");
const router = express.Router();

// POST / tracks(create);
router.post("/", async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.status(201).json(track);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET / tracks(index);
router.get("/", async (req, res) => {
  try {
    const tracks = await Track.find({}).sort({ createdAt: "desc" });
    res.status(200).json(tracks);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /tracks/:id
router.get("/:trackId", async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId);
    res.status(200).json(track);
  } catch (error) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
