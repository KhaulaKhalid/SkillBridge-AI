const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../src/models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skillbridge.ai";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Platform Admin";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin account already exists: " + ADMIN_EMAIL);
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log("Updated existing user role to admin");
    }
  } else {
    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    await admin.save();
    console.log("Admin account created: " + ADMIN_EMAIL);
  }

  await mongoose.disconnect();
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
