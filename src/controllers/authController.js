const authService = require("../services/authService");
const Email = require("../utils/email");

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body; // Added username to destructuring
    const user = await authService.signup(username, email, password);
    // Send welcome email
    const emailInstance = new Email({ username, email });
    await emailInstance.sendWelcome();
    res.status(201).json({ user, message: "Account created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // JWT logout is client-side (discard token)
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
