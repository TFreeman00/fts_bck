const { PrismaClient } = require("@prisma/client");
// const { product } = require("../db");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Deny access if user is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all users  
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

//Get user by id 
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.params.id),
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// create new user
router.post("/", async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    const user = await prisma.user.create({
      data: {
        username,
        firstname,
        lastname,
        email,
        password,
      },
    });
    res.status(201).send(user);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put("/:id", async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        username,
        firstname,
        lastname,
        email,
        password: hashedPassword,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
