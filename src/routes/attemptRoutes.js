const express = require("express");
const router = express.Router();
const attemptController = require("../controllers/attemptController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/user/:userId", authMiddleware, attemptController.getUserAttempts);

module.exports = router;
