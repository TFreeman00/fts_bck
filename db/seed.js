const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const bcrypt = require("bcrypt");

async function createInitialCategories() {
  try {
    console.log("Starting to create categories...");
    await createCategory("Epic Fail Moments");
    await createCategory("Blame It on the Dog");
    await createCategory("DIY Disasters");
    await createCategory("Cooking Catastrophes");
    await createCategory("Fashion Faux Pas");
    await createCategory("Tech Troubles");
    await createCategory("Pet Peeves");
    await createCategory("Traffic Tantrums");
    await createCategory("Social Media Snafus");
    await createCategory("Monday Madness");
    await createCategory("Relationship Woes");
    await createCategory("Parenting Pandemonium");
    await createCategory("Job Jitters");
    await createCategory("Gym Gaffes");
    await createCategory("Holiday Horrors");
    await createCategory("Weather Woes");
    await createCategory("Lost in Translation");
    await createCategory("Neighbor Nuisances");
    await createCategory("Roommate Rumblings");
    await createCategory("Public Transit Terrors");
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
