const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");

// Initialize Express and middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Check requests for a token and attach the decoded id to the request
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  try {
    req.user = jwt.verify(token, process.env.JWT);
  } catch {
    req.user = null;
  }
  next();
});

app.use("/auth", require("./api/auth.js"));
app.use("/users", require("./api/users.js"));

app.listen(3306, function () {
  console.log("listening on port 3306!");
});

module.exports = app;
