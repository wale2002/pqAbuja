const MediaDocument = require("../models/MediaDocument");
const AppError = require("../utils/AppError");

exports.getDocuments = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.year_level) {
      query.year_level = parseInt(req.query.year_level);
    }
    const documents = await MediaDocument.find(query).sort({ created_at: -1 });
    res.status(200).json({
      message: "Documents retrieved successfully",
      documents,
    });
  } catch (error) {
    next(new AppError("Failed to retrieve documents", 500));
  }
};
