const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correct_answer: String,
  subject: String,
  yearLevel: Number,
  course_name: String,
  media_url: String,
  mega_file_id: String,
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", questionSchema);
