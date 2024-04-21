const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();
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

//Creating a Post connected to the logged in User's ID
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
    const { content, author } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        author: { connect: { id: author } },
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

module.exports = router;
