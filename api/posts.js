const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

// Deny access if user is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all posts
router.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
});

// Get posts by category
router.get("/:category", async (req, res, next) => {
  try {
    const category = req.params.category;
    const posts = await prisma.post.findMany({
      where: {
        category: category,
      },
    });
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
});

// Creating a Post connected to the logged in User's ID
router.post("/", async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.create({
      data: {
        content,
        author: {
          connect: { id: userId },
        },
      },
    });
    res.status(201).send(post);
  } catch (error) {
    next(error);
  }
});

// Create a new post (for non logged in user)
// POST || PATH// http://localhost:3307/posts
router.post("/", async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
      },
    });

    res.status(201).send(post);
  } catch (error) {
    next(error);
  }
});

// Deleting a post
// DELETE || PATH// http://localhost:3307/posts/:postId
router.delete("/:postId", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Post editing
router.put("/:postId", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).send("You are not authorized to edit this post");
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content,
      },
    });

    res.status(200).send(updatedPost);
  } catch (error) {
    next(error);
  }
});

// Upvote a post
router.post("/:postId/upvote", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        postId,
        userId,
      },
    });

    if (
      existingVote &&
      existingVote.vote === (req.path.includes("upvote") ? 1 : -1)
    ) {
      return res.status(400).send("You already voted on this post");
    }

    // Update vote count
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        votes: {
          increment: req.path.includes("upvote") ? 1 : -1,
        },
      },
    });

    res.status(200).send(updatedPost);
  } catch (error) {
    next(error);
  }
});

// Downvote a post
router.post("/:postId/downvote", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        postId,
        userId,
      },
    });

    if (
      existingVote &&
      existingVote.vote === (req.path.includes("upvote") ? 1 : -1)
    ) {
      return res.status(400).send("You already voted on this post");
    }

    // Update vote count
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        votes: {
          increment: req.path.includes("downvote") ? -1 : 1,
        },
      },
    });

    res.status(200).send(updatedPost);
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get("/:userId/profile", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Exclude sensitive information
    const profile = { ...user, password: undefined };

    res.status(200).send(profile);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put("/:userId/profile", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { bio, location, ...otherUpdates } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bio,
        location,
        ...otherUpdates,
      },
    });

    // Exclude sensitive information
    const profile = { ...updatedUser, password: undefined };

    res.status(200).send(profile);
  } catch (error) {
    next(error);
  }
});

// Search functionality
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q || "";

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            author: {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });

    res.res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
