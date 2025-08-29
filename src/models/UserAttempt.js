const mongoose = require("mongoose");

const userAttemptSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selected_answer: { type: String },
  is_correct: { type: Boolean },
  attempted_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserAttempt", userAttemptSchema);
