const questionService = require("../services/questionService");

exports.getQuestions = async (req, res, next) => {
  try {
    const { yearLevel, subject, course_name, search } = req.query;
    const questions = await questionService.getQuestions({
      yearLevel,
      subject,
      course_name,
      search,
    });
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const questionData = req.body;
    const question = await questionService.createQuestion(questionData);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};
