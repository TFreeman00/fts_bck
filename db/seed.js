const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const bcrypt = require("bcrypt");

async function createInitialCategories() {
  try {
    console.log("Starting to create categories...");
    await createCategory("F my Job");
    await createCategory("F my Relationship");
    await createCategory("F my Family");
    await createCategory("F my Finances");
    await createCategory("F my Health");
    await createCategory("F my Social Life");
    await createCategory("F my Commute");
    await createCategory("F my Roommate");
    await createCategory("F my Pet");
    await createCategory("F my Cooking");
    await createCategory("F my Looks");
    await createCategory("F my Technology");
    await createCategory("F my Sleep");
    await createCategory("F my Hobbies");
    await createCategory("F my Ex");
    await createCategory("F my Future");
    await createCategory("F my Past");
    await createCategory("F my Monday");
    await createCategory("F my Boss");
    await createCategory("F my Luck");
    console.log("Finished creating categories!");
  } catch (error) {
    console.error("Error creating categories!");
    throw error;
  }
}

async function createCategory(name) {
  try {
    await prisma.category.create({
      data: {
        name,
      },
    });
  } catch (error) {
    throw error;
  }
}


async function createInitialUsers() {
  try {
    console.log("Starting to create users...");
    const salt = await bcrypt.genSalt(10);
    await createUser({
      username: "Fzee",
      firstName: "Fiona",
      lastName: "Zheng",
      email: "fiona@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      username: "Bnice",
      firstName: "Bernice",
      lastName: "Burgos",
      email: "bernice@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      username: "Tfree",
      firstName: "Tyrice",
      lastName: "Freeman",
      email: "tyrice@admin.com",
      password: await bcrypt.hash("123", salt),
      isAdmin: true,
    });
    await createUser({
      username: "jsam",
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

async function createUser({ firstName, username, lastName, email, password, isAdmin }) {
  try {
    await prisma.user.create({
      data: {
        username,
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
    await createInitialCategories();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}
rebuildDB();
