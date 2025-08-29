const Attempt = require("../models/UserAttempt");
const AppError = require("../utils/AppError");

exports.getUserAttempts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== "admin") {
      throw new AppError("Unauthorized: Access to attempts restricted", 403);
    }

    const attempts = await Attempt.find({ user_id: userId });
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(
      (attempt) => attempt.is_correct
    ).length;

    console.log(
      `getUserAttempts: User ${userId}, Total: ${totalAttempts}, Correct: ${correctAttempts}`
    );
    res.json({
      totalAttempts,
      correctAttempts,
    });
  } catch (error) {
    console.error("Error in getUserAttempts:", {
      message: error.message,
      stack: error.stack,
    });
    next(new AppError(`Failed to fetch user attempts: ${error.message}`, 500));
  }
};
