const { sendWelcomeEmail } = require("../utils/emailService");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  headline: user.headline,
  company: user.company,
});

const cookieDays = Number(process.env.JWT_COOKIE_DAYS) || 7;

const sendTokenCookie = (res, user) => {
  const token = signToken(user);
  res.cookie("sb_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

// @route  POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, headline, company } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (!["student", "recruiter"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'student' or 'recruiter'" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      headline: role === "student" ? headline : "",
      company: role === "recruiter" ? company : "",
    });

    sendTokenCookie(res, user);

    // ✅ Email hook — fire and forget, registration block nahi hogi
    sendWelcomeEmail({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
    }).catch((err) => console.error("Welcome email failed:", err.message));

    res.status(201).json({
      message: "Account created successfully",
      user: publicUser(user),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    res.status(500).json({ message: "Something went wrong while creating the account" });
  }
});

// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendTokenCookie(res, user);

    res.status(200).json({
      message: "Logged in successfully",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while logging in" });
  }
});

// @route  POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});

module.exports = router;