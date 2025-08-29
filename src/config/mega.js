const { Storage } = require("megajs");
const path = require("path");
const fs = require("fs");

// Ensure Uploads folder exists (optional, not used with memoryStorage)
const UPLOAD_DIR = path.join(__dirname, "Uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Validate environment variables
if (!process.env.MEGA_EMAIL || !process.env.MEGA_PASSWORD) {
  throw new Error("MEGA_EMAIL and MEGA_PASSWORD must be set in .env");
}

// Initialize Mega storage
const storage = new Storage({
  email: process.env.MEGA_EMAIL.trim(),
  password: process.env.MEGA_PASSWORD.trim(),
});

async function initMega() {
  try {
    await storage.ready;
    console.log("MEGA: Storage initialized");
    return storage;
  } catch (err) {
    console.error("MEGA: Failed to initialize storage:", err.message);
    throw new Error(
      "Mega storage not available. Check network or credentials."
    );
  }
}

module.exports = { mega: initMega };
