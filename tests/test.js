const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const routes = require("../index"); 
const { expect } = require("chai");

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());
app.use("/auth", routes);
app.use("/users", routes);
app.use("/posts", routes);

// Utility function to create a test user
const createUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("testpassword", salt);
  return await prisma.users.create({
    data: {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });
};

// Utility function to delete all test users after tests
const cleanupUsers = async () => {
  await prisma.users.deleteMany({ where: { email: "test@example.com" } });
};

// Tests for the register route
describe("POST /auth/register", () => {
  beforeEach(async () => {
    await cleanupUsers();
  });

  afterAll(async () => {
    await cleanupUsers();
  });

  test("it should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
  });

  test("it should return an error if email is invalid", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "John",
      lastname: "Doe",
      email: "invalidemail",
      password: "password123",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual("Invalid email address.");
  });

});

// Tests for the login route
describe("POST /auth/login", () => {
  let testUser;

  beforeAll(async () => {
    testUser = await createUser();
  });

  afterAll(async () => {
    await cleanupUsers();
  });

  test("it should login an existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: "testpassword" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
  });

  test("it should return an error if email is missing", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual("Invalid login credentials");
  });

  // Add more test cases for other scenarios
});

// Tests for the me route
describe("GET /auth/me", () => {
  let authToken;

  beforeAll(async () => {
    const testUser = await createUser();
    authToken = jwt.sign({ id: testUser.id }, process.env.JWT, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await cleanupUsers();
  });

  test("it should return the currently logged in user", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toEqual("test@example.com");
  });

  test("it should return an error if no token is provided", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.statusCode).toEqual(401);
  });

  // Tests for the user routes
  describe("User Routes", () => {
    beforeEach(async () => {
      await cleanupUsers();
    });

    afterAll(async () => {
      await cleanupUsers();
    });

    describe("GET /users", () => {
      test("it should get all users", async () => {
        // Create some test users
        await prisma.users.createMany({
          data: [
            {
              firstname: "John",
              lastname: "Doe",
              email: "john@example.com",
              password: "password123",
            },
            {
              firstname: "Jane",
              lastname: "Smith",
              email: "jane@example.com",
              password: "password456",
            },
          ],
        });

        const res = await request(app).get("/users");
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
      });

      
    });

    describe("GET /users/:id", () => {
      test("it should get a user by id", async () => {
        const user = await createUser();

        const res = await request(app).get(`/users/${user.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("firstname", "Test");
        expect(res.body).toHaveProperty("lastname", "User");
      });

    });

    
  });

  // Tests for posts
  describe("POST /posts", () => {
    it("should create a post for a logged-in user", (done) => {
      const agent = request.agent(app); // Using agent to retain session
      agent
        .post("/login") // Assuming there's a route to log in user and set req.user
        .send({ username: "testuser", password: "password" })
        .expect(200)
        .end((loginErr) => {
          if (loginErr) return done(loginErr);
          agent
            .post("/posts")
            .send({ content: "Test post content" })
            .expect(201)
            .end((postErr, res) => {
              if (postErr) return done(postErr);
              // Assuming the response body contains the created post
              expect(res.body.content).to.equal("Test post content");
              expect(res.body.author.id).to.be.a("number");
              done();
            });
        });
    });

    it("should create a post for a non-logged-in user", (done) => {
      request(app)
        .post("/posts")
        .send({ content: "Test post content", author: 1 }) // Assuming author id
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          // Assuming the response body contains the created post
          expect(res.body.content).to.equal("Test post content");
          expect(res.body.author.id).to.equal(1);
          done();
        });
    });
  });

  describe("DELETE /posts/:postId", () => {
    it("should delete a post", (done) => {
      // First, create a post for testing deletion
      request(app)
        .post("/posts")
        .send({ content: "Test post content", author: 1 }) // Assuming author id
        .end((postErr, postRes) => {
          if (postErr) return done(postErr);

          const postId = postRes.body.id;
          request(app)
            .delete(`/posts/${postId}`)
            .expect(204)
            .end((deleteErr) => {
              if (deleteErr) return done(deleteErr);
              done();
            });
        });
    });

    it("should return 404 for non-existent post", (done) => {
      request(app)
        .delete("/posts/9999") // Assuming this ID does not exist
        .expect(404, done);
    });
  });
});


