const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// register a new user
router.post("/register", async (req, res, next) => {
  const { firstname, lastname, username, email, password, confirmPassword } =
    req.body;

  try {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(email)) {
      // Handle invalid email error
      return res.status(401).json({ error: "Invalid email address" });
    }

    if (username.length < 5) {
      // Handle password format error
      return res
        .status(401)
        .json({ error: "username must be at least 5 characters" });
    }

    if (password.length < 8) {
      // Handle password format error
      return res
        .status(401)
        .json({ error: "password must be at least 8 characters" });
    }

    if (password !== confirmPassword) {
      // Handle password mismatch error
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // if (!firstname || !lastname) {
    //   return res.status(401).send("Please enter your name.");
    // }

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT, {
      expiresIn: "1h",
    });

    res.send({ user, token });
  } catch (error) {
    next(error);
  }
});

//login to an existing account
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  // Handle unauthorized user error
  if (!username) return res.status(401).send("Username doesn't exist");

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (user.username !== username)
      return res.status(401).send("Invalid login credentials");

    const match = await bcrypt.compare(password, user?.password);

    if (match) {
      // Passwords match, authenticate user
      res.status(200).json({ message: "Login successful" });
    } else {
      // Passwords don't match, deny access
      res.status(401).json({ error: "Unauthorized" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT, {
      expiresIn: "1h",
    });
    res.send({ token, user });
  } catch (error) {
    next(error);
  }
});

//Get the currently logged in user
router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    res.send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
