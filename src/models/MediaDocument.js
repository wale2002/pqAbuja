// const mongoose = require("mongoose");

// const mediaDocumentSchema = new mongoose.Schema({
//   mega_file_id: String,
//   original_filename: String,
//   file_type: String,
//   subject: String,
//   year_level: Number,
//   difficulty: String,
//   file_size: Number,
//   page_count: Number,
//   uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   url: String,

//   processed: Boolean,
//   created_at: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("MediaDocument", mediaDocumentSchema);

// const mongoose = require("mongoose");

// const mediaDocumentSchema = new mongoose.Schema({
//   file_name: { type: String, required: true },
//   file_type: { type: String, required: true },
//   file_size: { type: Number, required: true },
//   file_url: { type: String },
//   mega_file_id: { type: String }, // Removed unique: true
//   uploaded_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   subject: { type: String, required: true },
//   year_level: { type: Number, required: true },
//   difficulty: { type: String, required: true },
//   created_at: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("MediaDocument", mediaDocumentSchema);

const mongoose = require("mongoose");

const mediaDocumentSchema = new mongoose.Schema({
  file_name: { type: String, required: true },
  file_type: { type: String, required: true },
  file_size: { type: Number, required: true },
  file_url: { type: String },
  mega_file_id: { type: String },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  year_level: { type: Number, required: true },
  course_name: { type: String, required: true }, // Changed from difficulty
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MediaDocument", mediaDocumentSchema);
