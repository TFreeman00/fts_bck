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

//Creating a Post connected to the logged in User's ID
router.post("/posts", async (req, res, next) => {
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
// POST || PATH// http://localhost:3306/posts
router.post("/posts", async (req, res, next) => {
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
// DELETE || PATH// http://localhost:3306/posts/:postId
router.delete("/posts/:postId", async (req, res, next) => {
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
