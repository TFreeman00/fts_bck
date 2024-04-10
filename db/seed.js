const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const bcrypt = require("bcrypt");


async function createInitialUsers() {
  try {
    console.log("Starting to create users...");
    const salt = await bcrypt.genSalt(10);
    await createUser({
      firstName: "Fiona",
      lastName: "Zheng",
      email: "fiona@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      firstName: "Bernice",
      lastName: "Burgos",
      email: "bernice@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      firstName: "Tyrice",
      lastName: "Freeman",
      email: "tyrice@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      firstName: "Jose",
      lastName: "SamboniGaviria",
      email: "jose@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createUser({ firstName, lastName, email, password, isAdmin }) {
  try {
    await prisma.users.create({
      data: {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
        isadmin: isAdmin,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
    await createInitialUsers();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}
rebuildDB();
