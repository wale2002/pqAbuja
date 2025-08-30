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
//       console.log("req.body:", { subject, yearLevel, course_name }); // Debug logging

//       if (!subject || !yearLevel || !course_name) {
//         throw new AppError(
//           "Missing required fields: subject, yearLevel, course_name", // Fixed error message
//           400
//         );
//       }

//       if (!req.user?._id) {
//         console.error("No user ID found in request:", req.user);
//         throw new AppError("User not authenticated", 401);
//       }

//       console.log(`Uploading file for user: ${req.user._id}`);

//       const result = await processMedia({
//         file: req.file,
//         subject,
//         yearLevel,
//         course_name,
//         userId: req.user._id,
//       });

//       res.status(201).json({
//         message: "File uploaded successfully",
//         data: {
//           media: {
//             ...result.media,
//             original_filename: result.media.original_filename,
//           },
//         },
//       });
//     } catch (error) {
//       console.error("Error in uploadMedia:", error);
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

//     const media = await MediaDocument.findOne({ mega_file_id });
//     if (!media) {
//       console.log(`No MediaDocument found for mega_file_id: ${mega_file_id}`);
//       throw new AppError("File not found", 404);
//     }

//     const storage = await new Storage({
//       email: process.env.MEGA_EMAIL,
//       password: process.env.MEGA_PASSWORD,
//     }).ready;
//     await storage.reload(true);
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
//       `inline; filename="${media.original_file_name || media.file_name}"` // Use original_file_name
//     );
//     file.download().pipe(res);
//   } catch (error) {
//     console.error("Error in downloadMedia:", error);
//     next(error);
//   }
// };

// const { processMedia } = require("../services/mediaService");
// const MediaDocument = require("../models/MediaDocument");
// const AppError = require("../utils/AppError");
// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const stream = require("stream");

// // Configure Cloudinary (optional here if already configured in mediaService)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsy2gg4ho",
//   api_key: process.env.CLOUDINARY_API_KEY || "868269553158326",
//   api_secret:
//     process.env.CLOUDINARY_API_SECRET || "8rnpBwVjBdsiSgOMFA7Vxffo77Y",
// });

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
//       console.log("req.body:", { subject, yearLevel, course_name });

//       if (!subject || !yearLevel || !course_name) {
//         throw new AppError(
//           "Missing required fields: subject, yearLevel, course_name",
//           400
//         );
//       }

//       if (!req.user?._id) {
//         console.error("No user ID found in request:", req.user);
//         throw new AppError("User not authenticated", 401);
//       }

//       console.log(`Uploading file for user: ${req.user._id}`);

//       const result = await processMedia({
//         file: req.file,
//         subject,
//         yearLevel,
//         course_name,
//         userId: req.user._id,
//       });

//       res.status(201).json({
//         message: "File uploaded successfully",
//         data: {
//           media: {
//             ...result.media,
//             original_filename: result.media.original_filename,
//           },
//         },
//       });
//     } catch (error) {
//       console.error("Error in uploadMedia:", error);
//       next(error);
//     }
//   },
// ];

// exports.downloadMedia = async (req, res, next) => {
//   try {
//     const { cloudinary_public_id } = req.params;
//     console.log(
//       `Attempting to download file with cloudinary_public_id: ${cloudinary_public_id}`
//     );

//     const media = await MediaDocument.findOne({ cloudinary_public_id });
//     if (!media) {
//       console.log(
//         `No MediaDocument found for cloudinary_public_id: ${cloudinary_public_id}`
//       );
//       throw new AppError("File not found", 404);
//     }

//     // Fetch file from Cloudinary
//     const fileUrl = cloudinary.url(cloudinary_public_id, {
//       resource_type: "raw",
//     });

//     // Stream the file to the response
//     res.setHeader("Content-Type", media.file_type || "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `inline; filename="${media.file_name}"`
//     );

//     // Fetch and stream the file
//     const response = await fetch(fileUrl);
//     if (!response.ok) {
//       throw new AppError("Failed to fetch file from Cloudinary", 500);
//     }

//     const bufferStream = new stream.PassThrough();
//     response.body.pipe(bufferStream);
//     bufferStream.pipe(res);
//   } catch (error) {
//     console.error("Error in downloadMedia:", error);
//     next(error);
//   }
// };

const { processMedia } = require("../services/mediaService");
const MediaDocument = require("../models/MediaDocument");
const AppError = require("../utils/AppError");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const axios = require("axios");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsy2gg4ho",
  api_key: process.env.CLOUDINARY_API_KEY || "868269553158326",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "8rnpBwVjBdsiSgOMFA7Vxffo77Y",
});

// Log Cloudinary configuration for debugging
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "[REDACTED]" : undefined,
});

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

exports.uploadMedia = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const { subject, yearLevel, course_name } = req.body;
      console.log("req.body:", { subject, yearLevel, course_name });

      if (!subject || !yearLevel || !course_name) {
        throw new AppError(
          "Missing required fields: subject, yearLevel, course_name",
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
    const { cloudinary_public_id } = req.params;
    console.log(
      `Attempting to download file with cloudinary_public_id: ${cloudinary_public_id}`
    );

    const media = await MediaDocument.findOne({ cloudinary_public_id });
    if (!media) {
      console.log(
        `No MediaDocument found for cloudinary_public_id: ${cloudinary_public_id}`
      );
      throw new AppError("File not found in database", 404);
    }

    // Generate signed URL (expires in 1 hour; adjust as needed)
    const signedUrl = cloudinary.utils.private_download_url(
      cloudinary_public_id,
      media.file_type.split("/")[1] || "pdf", // e.g., 'pdf'
      {
        resource_type: "raw",
        type: "upload", // Match upload type
        attachment: true, // Forces download instead of inline view
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      }
    );

    if (!signedUrl) {
      throw new AppError("Failed to generate signed URL", 500);
    }

    console.log(`Generated signed URL: ${signedUrl}`);

    // Option 1: Redirect client to signed URL (recommended for efficiency)
    res.redirect(signedUrl);

    // Option 2: Proxy via Axios (if needed, but uses your bandwidth)
    // const response = await axios({
    //   url: signedUrl,
    //   method: "GET",
    //   responseType: "stream",
    //   timeout: 30000,
    // });
    // res.setHeader("Content-Type", media.file_type || "application/pdf");
    // res.setHeader("Content-Disposition", `inline; filename="${media.file_name}"`);
    // response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data,
      stack: error.stack,
    });
    next(
      new AppError(
        `Failed to download file: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};
