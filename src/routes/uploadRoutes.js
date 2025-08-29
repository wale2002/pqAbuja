// const express = require("express");
// const router = express.Router();
// const uploadController = require("../controllers/uploadController");
// const authMiddleware = require("../middleware/authMiddleware");

// router.post("/", authMiddleware, uploadController.uploadMedia);

// module.exports = router;

const express = require("express");
const documentController = require("../controllers/documentController");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware"); // Your auth middleware

const router = express.Router();

router.post("/", authMiddleware, uploadController.uploadMedia);
router.get("/documents", authMiddleware, documentController.getDocuments);
router.get(
  "/download/:mega_file_id",
  authMiddleware,
  uploadController.downloadMedia
);

module.exports = router;
