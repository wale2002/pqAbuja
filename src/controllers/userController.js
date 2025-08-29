const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.getTotalUsers = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      console.error("No user ID found in request:", req.user);
      throw new AppError("User not authenticated", 401);
    }

    const totalUsers = await User.countDocuments();
    console.log("Total users fetched:", totalUsers);

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error in getTotalUsers:", error);
    next(error);
  }
};
