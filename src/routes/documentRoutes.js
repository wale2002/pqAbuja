const express = require("express");
const { getDocuments } = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/documents - Retrieve documents for the authenticated user
router.get("/", authMiddleware, getDocuments);

module.exports = router;
