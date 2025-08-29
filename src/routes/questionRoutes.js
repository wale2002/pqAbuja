const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", questionController.getQuestions);
router.post("/", authMiddleware, questionController.createQuestion);

module.exports = router;
