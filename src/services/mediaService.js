// const MediaDocument = require("../models/MediaDocument");
// const Question = require("../models/Question");
// const { mega: initMega } = require("../config/mega");
// const pdfParse = require("pdf-parse");
// const Tesseract = require("tesseract.js");
// const { v4: uuidv4 } = require("uuid");
// const { Readable } = require("stream");

// // Timeout utility
// const timeout = (ms, promise) => {
//   return Promise.race([
//     promise,
//     new Promise((_, reject) =>
//       setTimeout(
//         () => reject(new Error(`Operation timed out after ${ms}ms`)),
//         ms
//       )
//     ),
//   ]);
// };

// // Retry utility
// const retry = async (fn, retries = 3, delay = 1000) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await fn();
//     } catch (error) {
//       if (attempt === retries) throw error;
//       console.log(
//         `Retry attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`
//       );
//       await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }
// };

// // Basic PDF validation
// const isValidPDF = (buffer) => {
//   try {
//     // Check if buffer starts with PDF header (%PDF)
//     const header = buffer.toString("ascii", 0, 4);
//     if (!header.startsWith("%PDF")) {
//       console.warn("isValidPDF: File does not have valid PDF header");
//       return false;
//     }
//     // Check minimum file size
//     if (buffer.length < 100) {
//       console.warn("isValidPDF: File size too small");
//       return false;
//     }
//     return true;
//   } catch (error) {
//     console.warn("isValidPDF: Error checking PDF validity", error);
//     return false;
//   }
// };

// exports.processMedia = async ({
//   file,
//   subject,
//   yearLevel,
//   difficulty,
//   userId,
// }) => {
//   try {
//     console.time("mediaServiceProcess");

//     // Initialize Mega client with retry
//     console.time("megaInit");
//     const megaStorage = await retry(() => timeout(20000, initMega()));
//     console.timeEnd("megaInit");

//     // Upload to Mega root folder
//     console.time("megaUpload");
//     const isImage = ["image/png", "image/jpeg"].includes(file.mimetype);
//     const fileExtension = isImage ? file.mimetype.split("/")[1] : "pdf";
//     const fileName = `${uuidv4()}_${subject}_${yearLevel}.${fileExtension}`;
//     const fileStream = Readable.from(file.buffer);
//     const megaFile = await timeout(
//       45000,
//       megaStorage.upload(
//         {
//           name: fileName,
//           allowUploadBuffering: true,
//         },
//         fileStream
//       ).complete
//     );
//     console.log("megaUpload: File uploaded to MEGA", { fileName });
//     const mediaUrl = await timeout(10000, megaFile.link());
//     console.timeEnd("megaUpload");

//     // Parse content
//     console.time("parseContent");
//     let questions = [];
//     let pdfData = null;
//     if (isImage) {
//       console.log("parseContent: Starting Tesseract OCR");
//       const {
//         data: { text },
//       } = await timeout(30000, Tesseract.recognize(file.buffer, "eng"));
//       console.log("parseContent: Tesseract OCR completed", {
//         textLength: text.length,
//       });
//       questions = extractQuestionsFromText(text, {
//         subject,
//         yearLevel: parseInt(yearLevel),
//         difficulty,
//       });
//     } else {
//       console.log("parseContent: Starting PDF parsing");
//       if (isValidPDF(file.buffer)) {
//         try {
//           pdfData = await timeout(15000, pdfParse(file.buffer));
//           console.log("parseContent: PDF parsing completed", {
//             textLength: pdfData.text.length,
//           });
//           questions = extractQuestionsFromText(pdfData.text, {
//             subject,
//             yearLevel: parseInt(yearLevel),
//             difficulty,
//           });
//         } catch (error) {
//           console.warn("parseContent: Failed to parse PDF", error);
//           console.log(
//             "parseContent: Continuing with empty question list due to invalid PDF"
//           );
//         }
//       } else {
//         console.log("parseContent: Invalid PDF detected, skipping parsing");
//       }
//     }
//     console.timeEnd("parseContent");

//     // Store questions
//     console.time("saveQuestions");
//     const questionsData = questions.map((q) => ({
//       ...q,
//       media_url: mediaUrl,
//       mega_file_id: megaFile.nodeId,
//       uploaded_by: userId,
//       created_at: new Date(),
//     }));
//     console.log("saveQuestions: Saving questions", {
//       count: questionsData.length,
//     });
//     const savedQuestions = await timeout(
//       10000,
//       Question.insertMany(questionsData)
//     );
//     console.timeEnd("saveQuestions");

//     // Store media metadata
//     console.time("saveMediaDocument");
//     const mediaDoc = new MediaDocument({
//       mega_file_id: megaFile.nodeId,
//       original_filename: file.originalname,
//       file_type: isImage ? "image" : "pdf",
//       subject,
//       year_level: parseInt(yearLevel),
//       difficulty,
//       file_size: file.size,
//       page_count: isImage || !pdfData ? null : pdfData.numpages,
//       uploaded_by: userId,
//       url: mediaUrl,
//       processed: true,
//     });
//     console.log("saveMediaDocument: Saving media document");
//     await timeout(10000, mediaDoc.save());
//     console.timeEnd("saveMediaDocument");

//     console.timeEnd("mediaServiceProcess");

//     return {
//       questions: savedQuestions,
//       media: {
//         mega_file_id: megaFile.nodeId,
//         url: mediaUrl,
//         filename: fileName,
//       },
//     };
//   } catch (error) {
//     console.error("mediaService: Error processing media", error);
//     throw new Error(`Failed to process media: ${error.message}`);
//   }
// };

// function extractQuestionsFromText(text, metadata) {
//   const questions = [];
//   const lines = text.split("\n");
//   let currentQuestion = null;
//   let currentOptions = [];

//   for (const line of lines) {
//     const trimmedLine = line.trim();
//     if (
//       trimmedLine.match(/^\d+\.\s+/) ||
//       trimmedLine.match(/^Question\s+\d+/i)
//     ) {
//       if (currentQuestion) {
//         questions.push({
//           question: currentQuestion,
//           options: currentOptions.length > 0 ? currentOptions : null,
//           correct_answer: detectCorrectAnswer(currentOptions, lines.join("\n")),
//           ...metadata,
//         });
//       }
//       currentQuestion = trimmedLine;
//       currentOptions = [];
//     } else if (trimmedLine.match(/^[A-D]\.\s+/i)) {
//       currentOptions.push(trimmedLine.replace(/^[A-D]\.\s+/i, "").trim());
//     }
//   }

//   if (currentQuestion) {
//     questions.push({
//       question: currentQuestion,
//       options: currentOptions.length > 0 ? currentOptions : null,
//       correct_answer: detectCorrectAnswer(currentOptions, lines.join("\n")),
//       ...metadata,
//     });
//   }

//   console.log("extractQuestionsFromText: Extracted questions", {
//     count: questions.length,
//   });
//   return questions;
// }

// function detectCorrectAnswer(options, context) {
//   const answerPatterns = [
//     /answer[:\s]*([A-D])/i,
//     /correct[:\s]*([A-D])/i,
//     /solution[:\s]*([A-D])/i,
//   ];
//   for (const pattern of answerPatterns) {
//     const match = context.match(pattern);
//     if (match) return match[1];
//   }
//   return options[0] || null;
// }

// const { Storage } = require("megajs");
// const PDFDocument = require("pdfkit");
// const { v4: uuidv4 } = require("uuid");
// const MediaDocument = require("../models/MediaDocument");
// const AppError = require("../utils/AppError");

// const convertImageToPDF = async (buffer, fileName) => {
//   try {
//     const doc = new PDFDocument();
//     const pdfBuffer = [];
//     doc.on("data", (chunk) => pdfBuffer.push(chunk));
//     doc.on("end", () => {});
//     doc.image(buffer, 0, 0, { fit: [595, 842] }); // A4 size
//     doc.end();
//     return Buffer.concat(
//       await new Promise((resolve) => {
//         doc.on("end", () => resolve(pdfBuffer));
//       })
//     );
//   } catch (error) {
//     console.error(
//       "convertImageToPDF: Error converting image to PDF:",
//       error.message
//     );
//     throw new AppError("Failed to convert image to PDF", 400);
//   }
// };

// exports.processMedia = async ({
//   file,
//   subject,
//   yearLevel,
//   difficulty,
//   userId,
// }) => {
//   const processId = `processMedia-${Date.now()}`;
//   console.time(processId);

//   try {
//     // Initialize MEGA storage
//     console.time(`megaInit-${processId}`);
//     const storage = await new Storage({
//       email: process.env.MEGA_EMAIL,
//       password: process.env.MEGA_PASSWORD,
//     }).ready;
//     console.timeEnd(`megaInit-${processId}`);

//     // Convert images to PDF if necessary
//     let uploadBuffer = file.buffer;
//     let uploadFileName = `${uuidv4()}_${subject}_${yearLevel}.pdf`;
//     let uploadMimeType = "application/pdf";

//     if (["image/png", "image/jpeg"].includes(file.mimetype)) {
//       console.time(`convertImageToPDF-${processId}`);
//       uploadBuffer = await convertImageToPDF(file.buffer, uploadFileName);
//       console.timeEnd(`convertImageToPDF-${processId}`);
//     }

//     // Upload to MEGA
//     console.time(`megaUpload-${processId}`);
//     const uploadStream = storage.upload(uploadFileName, uploadBuffer);
//     const upload = await uploadStream.complete;
//     const fileUrl = upload.downloadUrl || upload.url || null; // Fallback to downloadUrl
//     const fileId = upload.id || uuidv4();
//     console.log("megaUpload: File uploaded to MEGA", {
//       fileName: uploadFileName,
//       url: fileUrl,
//       id: fileId,
//     });
//     console.timeEnd(`megaUpload-${processId}`);

//     // Save media document
//     console.time(`saveMediaDocument-${processId}`);
//     const mediaDocument = new MediaDocument({
//       file_name: uploadFileName,
//       file_type: uploadMimeType,
//       file_size: uploadBuffer.length,
//       file_url: fileUrl,
//       mega_file_id: fileId,
//       uploaded_by: userId,
//       subject,
//       year_level: parseInt(yearLevel),
//       difficulty,
//       created_at: new Date(),
//     });
//     await mediaDocument.save();
//     console.log("saveMediaDocument: Saved", {
//       fileName: uploadFileName,
//       fileUrl,
//     });
//     console.timeEnd(`saveMediaDocument-${processId}`);

//     console.timeEnd(processId);
//     return {
//       media: {
//         mega_file_id: fileId,
//         url: fileUrl,
//         filename: uploadFileName,
//       },
//     };
//   } catch (error) {
//     console.error("processMedia: Error", error);
//     throw new AppError(
//       `Failed to process media: ${error.message}`,
//       error.statusCode || 500
//     );
//   }
// };

// const { Storage } = require("megajs");
// const PDFDocument = require("pdfkit");
// const { v4: uuidv4 } = require("uuid");
// const MediaDocument = require("../models/MediaDocument");
// const AppError = require("../utils/AppError");

// const convertImageToPDF = async (buffer, fileName) => {
//   try {
//     const doc = new PDFDocument();
//     const pdfBuffer = [];
//     doc.on("data", (chunk) => pdfBuffer.push(chunk));
//     doc.on("end", () => {});
//     doc.image(buffer, 0, 0, { fit: [595, 842] });
//     doc.end();
//     return Buffer.concat(
//       await new Promise((resolve) => {
//         doc.on("end", () => resolve(pdfBuffer));
//       })
//     );
//   } catch (error) {
//     console.error(
//       "convertImageToPDF: Error converting image to PDF:",
//       error.message
//     );
//     throw new AppError("Failed to convert image to PDF", 400);
//   }
// };

// exports.processMedia = async ({
//   file,
//   subject,
//   yearLevel,
//   difficulty,
//   userId,
// }) => {
//   const processId = `processMedia-${Date.now()}`;
//   console.time(processId);

//   try {
//     console.time(`megaInit-${processId}`);
//     const storage = await new Storage({
//       email: process.env.MEGA_EMAIL,
//       password: process.env.MEGA_PASSWORD,
//     }).ready;
//     console.timeEnd(`megaInit-${processId}`);

//     let uploadBuffer = file.buffer;
//     let uploadFileName = `${uuidv4()}_${subject}_${yearLevel}.pdf`;
//     let uploadMimeType = "application/pdf";

//     if (["image/png", "image/jpeg"].includes(file.mimetype)) {
//       console.time(`convertImageToPDF-${processId}`);
//       uploadBuffer = await convertImageToPDF(file.buffer, uploadFileName);
//       console.timeEnd(`convertImageToPDF-${processId}`);
//     }

//     console.time(`megaUpload-${processId}`);
//     const uploadStream = storage.upload(
//       {
//         name: uploadFileName,
//         size: uploadBuffer.length,
//       },
//       uploadBuffer
//     );
//     const upload = await uploadStream.complete;
//     const fileUrl =
//       upload.downloadUrl || upload.url || `https://mega.nz/file/${upload.id}`;
//     const fileId = upload.id || uuidv4();
//     console.log("megaUpload: File uploaded to MEGA", {
//       fileName: uploadFileName,
//       url: fileUrl,
//       id: fileId,
//     });
//     console.timeEnd(`megaUpload-${processId}`);

//     console.time(`saveMediaDocument-${processId}`);
//     const mediaDocument = new MediaDocument({
//       file_name: uploadFileName,
//       file_type: uploadMimeType,
//       file_size: uploadBuffer.length,
//       file_url: fileUrl,
//       mega_file_id: fileId,
//       uploaded_by: userId,
//       subject,
//       year_level: parseInt(yearLevel),
//       difficulty,
//       created_at: new Date(),
//     });
//     await mediaDocument.save();
//     console.log("saveMediaDocument: Saved", {
//       fileName: uploadFileName,
//       fileUrl,
//     });
//     console.timeEnd(`saveMediaDocument-${processId}`);

//     console.timeEnd(processId);
//     return {
//       media: {
//         mega_file_id: fileId,
//         url: fileUrl,
//         filename: uploadFileName,
//       },
//     };
//   } catch (error) {
//     console.error("processMedia: Error", error);
//     throw new AppError(
//       `Failed to process media: ${error.message}`,
//       error.statusCode || 500
//     );
//   }
// };

// const { Storage } = require("megajs");
// const PDFDocument = require("pdfkit");
// const { v4: uuidv4 } = require("uuid");
// const MediaDocument = require("../models/MediaDocument");
// const AppError = require("../utils/AppError");

// const convertImageToPDF = async (buffer, fileName) => {
//   try {
//     const doc = new PDFDocument();
//     const pdfBuffer = [];
//     doc.on("data", (chunk) => pdfBuffer.push(chunk));
//     doc.on("end", () => {});
//     doc.image(buffer, 0, 0, { fit: [595, 842] });
//     doc.end();
//     return Buffer.concat(
//       await new Promise((resolve) => {
//         doc.on("end", () => resolve(pdfBuffer));
//       })
//     );
//   } catch (error) {
//     console.error(
//       "convertImageToPDF: Error converting image to PDF:",
//       error.message
//     );
//     throw new AppError("Failed to convert image to PDF", 400);
//   }
// };

// exports.processMedia = async ({
//   file,
//   subject,
//   yearLevel,
//   course_name,
//   userId,
// }) => {
//   const processId = `processMedia-${Date.now()}`;
//   console.time(processId);

//   try {
//     console.time(`megaInit-${processId}`);
//     const storage = await new Storage({
//       email: process.env.MEGA_EMAIL,
//       password: process.env.MEGA_PASSWORD,
//     }).ready;
//     console.timeEnd(`megaInit-${processId}`);

//     let uploadBuffer = file.buffer;
//     let uploadFileName = `${uuidv4()}_${subject}_${yearLevel}.pdf`;
//     let uploadMimeType = "application/pdf";

//     if (["image/png", "image/jpeg"].includes(file.mimetype)) {
//       console.time(`convertImageToPDF-${processId}`);
//       uploadBuffer = await convertImageToPDF(file.buffer, uploadFileName);
//       console.timeEnd(`convertImageToPDF-${processId}`);
//     }

//     console.time(`megaUpload-${processId}`);
//     const uploadStream = storage.upload(
//       {
//         name: uploadFileName,
//         size: uploadBuffer.length,
//       },
//       uploadBuffer
//     );
//     const upload = await uploadStream.complete;
//     console.log("megaUpload: Upload result:", upload); // Log full upload object
//     const fileId = upload.nodeId; // Use nodeId instead of id
//     if (!fileId) {
//       throw new AppError("No file ID returned from Mega.nz upload", 500);
//     }
//     const fileUrl = `https://mega.nz/file/${fileId}`; // Construct URL using nodeId
//     console.log("megaUpload: File uploaded to MEGA", {
//       fileName: uploadFileName,
//       url: fileUrl,
//       id: fileId,
//     });
//     console.timeEnd(`megaUpload-${processId}`);

//     console.time(`saveMediaDocument-${processId}`);
//     const mediaDocument = new MediaDocument({
//       file_name: uploadFileName,
//       file_type: uploadMimeType,
//       file_size: uploadBuffer.length,
//       file_url: fileUrl,
//       mega_file_id: fileId,
//       uploaded_by: userId,
//       subject,
//       year_level: parseInt(yearLevel),
//       course_name, // Changed from difficulty
//       created_at: new Date(),
//     });
//     await mediaDocument.save();
//     console.log("saveMediaDocument: Saved", {
//       fileName: uploadFileName,
//       fileUrl,
//       fileId,
//     });
//     console.timeEnd(`saveMediaDocument-${processId}`);

//     console.timeEnd(processId);
//     return {
//       media: {
//         mega_file_id: fileId,
//         url: fileUrl,
//         filename: uploadFileName,
//       },
//     };
//   } catch (error) {
//     console.error("processMedia: Error", error);
//     throw new AppError(
//       `Failed to process media: ${error.message}`,
//       error.statusCode || 500
//     );
//   }
// };

const { v2: cloudinary } = require("cloudinary");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");
const MediaDocument = require("../models/MediaDocument");
const AppError = require("../utils/AppError");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertImageToPDF = async (buffer, fileName) => {
  try {
    const doc = new PDFDocument();
    const pdfBuffer = [];
    doc.on("data", (chunk) => pdfBuffer.push(chunk));
    doc.image(buffer, 0, 0, { fit: [595, 842] });
    doc.end();
    return Buffer.concat(
      await new Promise((resolve) => {
        doc.on("end", () => resolve(pdfBuffer));
      })
    );
  } catch (error) {
    console.error(
      "convertImageToPDF: Error converting image to PDF:",
      error.message
    );
    throw new AppError("Failed to convert image to PDF", 400);
  }
};

exports.processMedia = async ({
  file,
  subject,
  yearLevel,
  course_name,
  userId,
}) => {
  const processId = `processMedia-${Date.now()}`;
  console.time(processId);

  try {
    let uploadBuffer = file.buffer;
    // Sanitize subject to remove special characters
    let uploadFileName = `${uuidv4()}_${subject.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${yearLevel}.pdf`;
    let uploadMimeType = "application/pdf";

    // Convert images to PDF if necessary
    if (["image/png", "image/jpeg"].includes(file.mimetype)) {
      console.time(`convertImageToPDF-${processId}`);
      uploadBuffer = await convertImageToPDF(file.buffer, uploadFileName);
      console.timeEnd(`convertImageToPDF-${processId}`);
    }

    // Generate signature for signed upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureParams = {
      public_id: uploadFileName,
      timestamp: timestamp,
    };
    const signature = cloudinary.utils.api_sign_request(
      signatureParams,
      process.env.CLOUDINARY_API_SECRET
    );

    // Log signature parameters for debugging
    console.log("Signature params:", signatureParams);
    console.log("Generated signature:", signature);

    // Upload to Cloudinary with signed parameters
    console.time(`cloudinaryUpload-${processId}`);
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: uploadFileName,
          timestamp: timestamp,
          api_key: process.env.CLOUDINARY_API_KEY,
          signature: signature,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(
              new AppError(
                `Failed to upload to Cloudinary: ${error.message}`,
                500
              )
            );
          }
          resolve(result);
        }
      );
      uploadStream.end(uploadBuffer);
    });

    const { public_id, secure_url } = uploadResult;
    if (!public_id || !secure_url) {
      throw new AppError(
        "No public_id or secure_url returned from Cloudinary",
        500
      );
    }

    console.log("cloudinaryUpload: File uploaded to Cloudinary", {
      fileName: uploadFileName,
      url: secure_url,
      public_id,
    });
    console.timeEnd(`cloudinaryUpload-${processId}`);

    // Save to MongoDB
    console.time(`saveMediaDocument-${processId}`);
    const mediaDocument = new MediaDocument({
      file_name: uploadFileName,
      file_type: uploadMimeType,
      file_size: uploadBuffer.length,
      file_url: secure_url,
      cloudinary_public_id: public_id,
      uploaded_by: userId,
      subject,
      year_level: parseInt(yearLevel),
      course_name,
      created_at: new Date(),
    });
    await mediaDocument.save();
    console.log("saveMediaDocument: Saved", {
      fileName: uploadFileName,
      fileUrl: secure_url,
      public_id,
    });
    console.timeEnd(`saveMediaDocument-${processId}`);

    console.timeEnd(processId);
    return {
      media: {
        cloudinary_public_id: public_id,
        url: secure_url,
        filename: uploadFileName,
        original_filename: file.originalname,
      },
    };
  } catch (error) {
    console.error("processMedia: Error", error);
    throw new AppError(
      `Failed to process media: ${error.message}`,
      error.statusCode || 500
    );
  }
};
