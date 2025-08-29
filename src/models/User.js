// // src/models/User.js
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   created_at: { type: Date, default: Date.now },
// });

// const User = mongoose.model("User", userSchema);
// console.log("User model defined:", User); // Debug log
// module.exports = User;

// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Added username field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
console.log("User model defined:", User); // Debug log
module.exports = User;
