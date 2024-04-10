const { PrismaClient } = require("@prisma/client");
// const { product } = require("../db");
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

// Get all users  ||Test Approved
//GET || PATH || http://localhost:3000/users 
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.users.findMany();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

//Get user by id ||Test Approved
// GET || PATH// http://localhost:3000/users/1
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        id: Number(req.params.id),
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// create new user ||Test Approved
// POST || PATH// http://localhost:3000/users
router.post("/", async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const user = await prisma.users.create({
      data: {
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

// Update user ||Test Approved
// PUT || PATH// http://localhost:3000/users/6 (Choose userId num to update)
router.put("/:id", async (req, res, next) => {
  try {
    const { firstname, lastname, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.users.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        firstname,
        lastname,
        password: hashedPassword,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Delete user ||Test Approved
//DELETE || PATH || http://localhost:3000/users/8 (choose userID num to delete)
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await prisma.users.delete({
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
