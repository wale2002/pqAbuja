// const multer = require("multer");
// const mediaService = require("../services/mediaService");

// // Configure Multer with memory storage
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
//     if (allowedTypes.includes(file.mimetype)) cb(null, true);
//     else cb(new Error("Only PDFs, PNGs, or JPEGs allowed"), false);
//   },
// });

// // Multer error handling middleware
// const handleMulterError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     console.error("Multer error:", err);
//     return res.status(400).json({ error: `Multer error: ${err.message}` });
//   } else if (err) {
//     console.error("File filter error:", err);
//     return res.status(400).json({ error: err.message });
//   }
//   next();
// };

// // Timeout utility
// const timeout = (ms, promise) => {
//   return Promise.race([
//     promise,
//     new Promise((_, reject) =>
//       setTimeout(() => reject(new Error("Operation timed out")), ms)
//     ),
//   ]);
// };

// exports.uploadMedia = [
//   upload.single("file"),
//   handleMulterError,
//   async (req, res) => {
//     console.time("uploadMediaTotal");
//     const { subject, yearLevel, difficulty } = req.body;
//     const file = req.file;
//     const userId = req.user?._id;

//     console.log("uploadMedia: Request received", {
//       subject,
//       yearLevel,
//       difficulty,
//       file: file?.originalname,
//       user: req.user,
//     });

//     // Validate inputs
//     if (!file) {
//       console.log("uploadMedia: No file uploaded");
//       return res
//         .status(400)
//         .json({ error: "PDF, PNG, or JPEG file is required" });
//     }

//     if (!subject || !yearLevel || !difficulty) {
//       console.log("uploadMedia: Missing required fields");
//       return res.status(400).json({
//         error: "Missing required fields: subject, yearLevel, difficulty",
//       });
//     }

//     if (!userId) {
//       console.log("uploadMedia: User not authenticated");
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     try {
//       console.time("processMedia");
//       const result = await timeout(
//         45000,
//         mediaService.processMedia({
//           file,
//           subject,
//           yearLevel,
//           difficulty,
//           userId,
//         })
//       );
//       console.timeEnd("processMedia");

//       console.log("uploadMedia: File processed", {
//         fileUrl: result.media.url,
//         megaNodeId: result.media.mega_file_id,
//         questions: result.questions.length,
//       });

//       console.timeEnd("uploadMediaTotal");
//       return res
//         .status(201)
//         .json({ message: "File uploaded successfully", data: result });
//     } catch (error) {
//       console.error("uploadMedia: Error", error);
//       console.timeEnd("uploadMediaTotal");
//       return res.status(500).json({ error: error.message });
//     }
//   },
// ];

// const { processMedia } = require("../services/mediaService");
// const AppError = require("../utils/AppError");
// const multer = require("multer");

// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(
//         new AppError("Invalid file type. Only PDF, PNG, or JPEG allowed.", 400)
//       );
//     }
//     cb(null, true);
//   },
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// exports.uploadMedia = [
//   upload.single("file"),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         throw new AppError("No file uploaded", 400);
//       }

//       const { subject, yearLevel, difficulty } = req.body;

//       if (!subject || !yearLevel || !difficulty) {
//         throw new AppError(
//           "Missing required fields: subject, yearLevel, difficulty",
//           400
//         );
//       }

//       const result = await processMedia({
//         file: req.file,
//         subject,
//         yearLevel,
//         difficulty,
//         userId: req.user._id,
//       });

//       res.status(200).json({
//         message: "File uploaded successfully",
//         data: {
//           media: result.media,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// ];

// const { processMedia } = require("../services/mediaService");
// const { Storage } = require("megajs");
// const MediaDocument = require("../models/MediaDocument");
// const AppError = require("../utils/AppError");
// const multer = require("multer");

// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(
//         new AppError("Invalid file type. Only PDF, PNG, or JPEG allowed.", 400)
//       );
//     }
//     cb(null, true);
//   },
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// exports.uploadMedia = [
//   upload.single("file"),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         throw new AppError("No file uploaded", 400);
//       }

//       const { subject, yearLevel, course_name } = req.body;

//       if (!subject || !yearLevel || !course_name) {
//         throw new AppError(
//           "Missing required fields: subject, yearLevel, difficulty",
//           400
//         );
//       }

//       if (!req.user?._id) {
//         throw new AppError("User not authenticated", 401);
//       }

//       const result = await processMedia({
//         file: req.file,
//         subject,
//         yearLevel,
//         course_name, // Changed from difficulty
//         userId: req.user._id,
//       });

//       res.status(201).json({
//         message: "File uploaded successfully",
//         data: {
//           media: result.media,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// ];

// exports.downloadMedia = async (req, res, next) => {
//   try {
//     const { mega_file_id } = req.params;
//     console.log(
//       `Attempting to download file with mega_file_id: ${mega_file_id}`
//     );

//     // Find document in database
//     const media = await MediaDocument.findOne({ mega_file_id });
//     if (!media) {
//       console.log(`No MediaDocument found for mega_file_id: ${mega_file_id}`);
//       throw new AppError("File not found", 404);
//     }

//     // Initialize Mega.nz storage and force reload
//     const storage = await new Storage({
//       email: process.env.MEGA_EMAIL,
//       password: process.env.MEGA_PASSWORD,
//     }).ready;
//     await storage.reload(true); // Force reload file list
//     console.log("Available Mega.nz files:", Object.keys(storage.files));

//     const file = storage.files[mega_file_id];
//     if (!file) {
//       console.log(
//         `File not found on Mega.nz for mega_file_id: ${mega_file_id}`
//       );
//       throw new AppError("File not found on MEGA", 404);
//     }

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `inline; filename="${media.file_name}"`
//     );
//     file.download().pipe(res);
//   } catch (error) {
//     console.error("Error in downloadMedia:", error);
//     next(error);
//   }
// };

const { processMedia } = require("../services/mediaService");
const { Storage } = require("megajs");
const MediaDocument = require("../models/MediaDocument");
const AppError = require("../utils/AppError");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new AppError("Invalid file type. Only PDF, PNG, or JPEG allowed.", 400)
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadMedia = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const { subject, yearLevel, course_name } = req.body;
      console.log("req.body:", { subject, yearLevel, course_name }); // Debug logging

      if (!subject || !yearLevel || !course_name) {
        throw new AppError(
          "Missing required fields: subject, yearLevel, course_name", // Fixed error message
          400
        );
      }

      if (!req.user?._id) {
        console.error("No user ID found in request:", req.user);
        throw new AppError("User not authenticated", 401);
      }

      console.log(`Uploading file for user: ${req.user._id}`);

      const result = await processMedia({
        file: req.file,
        subject,
        yearLevel,
        course_name,
        userId: req.user._id,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        data: {
          media: {
            ...result.media,
            original_filename: result.media.original_filename,
          },
        },
      });
    } catch (error) {
      console.error("Error in uploadMedia:", error);
      next(error);
    }
  },
];

exports.downloadMedia = async (req, res, next) => {
  try {
    const { mega_file_id } = req.params;
    console.log(
      `Attempting to download file with mega_file_id: ${mega_file_id}`
    );

    const media = await MediaDocument.findOne({ mega_file_id });
    if (!media) {
      console.log(`No MediaDocument found for mega_file_id: ${mega_file_id}`);
      throw new AppError("File not found", 404);
    }

    const storage = await new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
    }).ready;
    await storage.reload(true);
    console.log("Available Mega.nz files:", Object.keys(storage.files));

    const file = storage.files[mega_file_id];
    if (!file) {
      console.log(
        `File not found on Mega.nz for mega_file_id: ${mega_file_id}`
      );
      throw new AppError("File not found on MEGA", 404);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${media.original_file_name || media.file_name}"` // Use original_file_name
    );
    file.download().pipe(res);
  } catch (error) {
    console.error("Error in downloadMedia:", error);
    next(error);
  }
};
