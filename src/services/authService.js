// src/services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
console.log("User import in authService:", User);

exports.signup = async (username, email, password) => {
  try {
    if (!User || typeof User.findOne !== "function") {
      throw new Error("User model is not properly defined");
    }
    // Check for existing username and email
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).maxTimeMS(30000);
    if (existingUser) {
      if (existingUser.email === email) throw new Error("Email already exists");
      if (existingUser.username === username)
        throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username, // Added username
      email,
      password: hashedPassword,
    });
    await user.save();
    return { _id: user._id, username, email };
  } catch (error) {
    console.error("Signup error:", error.message);
    throw new Error(`Signup failed: ${error.message}`);
  }
};
// exports.signup = async (email, password) => {
//   try {
//     if (!User || typeof User.findOne !== "function") {
//       throw new Error("User model is not properly defined");
//     }
//     const existingUser = await User.findOne({ email }).maxTimeMS(30000);
//     if (existingUser) throw new Error("Email already exists");

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       email,
//       password: hashedPassword,
//     });
//     await user.save();
//     return { _id: user._id, email };
//   } catch (error) {
//     console.error("Signup error:", error.message);
//     throw new Error(`Signup failed: ${error.message}`);
//   }
// };

exports.login = async (email, password) => {
  try {
    if (!User || typeof User.findOne !== "function") {
      throw new Error("User model is not properly defined");
    }
    console.log("Attempting to find user with email:", email);
    const user = await User.findOne({ email }).maxTimeMS(30000);
    if (!user) {
      console.log("User not found for email:", email);
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("Invalid password for email:", email);
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated token for user:", user._id);
    return { user: { _id: user._id, email }, token };
  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error(`Login failed: ${error.message}`);
  }
};

exports.logout = async () => {
  return {};
};
