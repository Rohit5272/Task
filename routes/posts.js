const express = require("express");
const router = express.Router();
const passport = require("passport");
const Post = require("../models/Post");


router.get("/dashboard", async (req, res) => {
  try {
    const activeCount = await Post.countDocuments({ active: true });
    const inactiveCount = await Post.countDocuments({ active: false });

    res.json({ activeCount, inactiveCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Create a post
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { title, body, latitude, longitude } = req.body;
    const createdBy = req.user._id; 

    const newPost = new Post({
      title,
      body,
      createdBy,
      geoLocation: { latitude, longitude },
    });

    newPost
      .save()
      .then((post) => res.status(201).json(post))
      .catch((err) => res.status(400).json(err));
  }
);

// Get all posts for a user
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.find({ createdBy: req.user._id })
      .then((posts) => res.json(posts))
      .catch((err) => res.status(500).json(err));
  }
);

// Get a single post by ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const postId = req.params.id;

    Post.findOne({ _id: postId, createdBy: req.user._id })
      .then((post) => {
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json(post);
      })
      .catch((err) => res.status(500).json(err));
  }
);

// Update a post by ID
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const postId = req.params.id;
    const { title, body, latitude, longitude } = req.body;

    Post.findOneAndUpdate(
      { _id: postId, createdBy: req.user._id },
      { $set: { title, body, geoLocation: { latitude, longitude } } },
      { new: true }
    )
      .then((post) => {
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json(post);
      })
      .catch((err) => res.status(500).json(err));
  }
);

// Delete a post by ID
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const postId = req.params.id;

    Post.findOneAndDelete({ _id: postId, createdBy: req.user._id })
      .then((post) => {
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json({ message: "Post deleted successfully" });
      })
      .catch((err) => res.status(500).json(err));
  }
);

// Route to retrieve posts based on latitude and longitude
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    // Convert string query parameters to numbers
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Ensure all required query parameters are provided
    if (!lat || !long || !rad) {
      return res.status(400).json({ error: 'Latitude, longitude, and radius are required' });
    }

    // Query the database for posts within the specified radius
    const posts = await Post.find({
      geoLocation: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [long, lat] // Note: Mongoose requires longitude first, then latitude
          },
          $maxDistance: rad * 1000 // Convert radius from kilometers to meters
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
