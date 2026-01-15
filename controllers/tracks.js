const express = require("express");
const Track = require("../models/track");
const { searchTrack } = require("../services/spotify");
const router = express.Router();

// POST /tracks (create)
router.post("/", async (req, res) => {
  try {
    const { title, artist } = req.body;

    const needsCover =
      req.body.coverArtUrl == null || req.body.coverArtUrl === "";
    const needsClip =
      req.body.soundClipUrl == null || req.body.soundClipUrl === "";

    if (title && artist && (needsCover || needsClip)) {
      const media = await searchTrack(title, artist);

      if (needsCover && media.coverArtUrl)
        req.body.coverArtUrl = media.coverArtUrl;
      if (needsClip && media.soundClipUrl)
        req.body.soundClipUrl = media.soundClipUrl;
    }

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

// PUT /tracks/:id
// Update a track
router.put("/:trackId", async (req, res) => {
  try {
    // 1) Search for the current track
    const existingTrack = await Track.findById(req.params.trackId);
    if (!existingTrack) return res.status(404).json({ err: "Track not found" });

    // 2) Determine final title/artist (what comes in body or existing)
    const finalTitle = req.body.title ?? existingTrack.title;
    const finalArtist = req.body.artist ?? existingTrack.artist;

    // 3) Only try Spotify if URLs that are missing in the body
    const needsCover =
      req.body.coverArtUrl == null || req.body.coverArtUrl === "";
    const needsClip =
      req.body.soundClipUrl == null || req.body.soundClipUrl === "";

    if (finalTitle && finalArtist && (needsCover || needsClip)) {
      const media = await searchTrack(finalTitle, finalArtist);

      // Just check if it is still missing and if Spotify returned something.
      if (needsCover && media.coverArtUrl)
        req.body.coverArtUrl = media.coverArtUrl;
      if (needsClip && media.soundClipUrl)
        req.body.soundClipUrl = media.soundClipUrl;
    }

    // 4) Update
    const updatedTrack = await Track.findByIdAndUpdate(
      req.params.trackId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTrack);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//DELETE /tracks/:trackId
// Delete a track
router.delete("/:trackId", async (req, res) => {
  try {
    const deletedTrack = await Track.findByIdAndDelete(req.params.trackId);
    res.status(200).json(deletedTrack);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
