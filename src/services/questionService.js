const Question = require("../models/Question");

exports.getQuestions = async ({ yearLevel, subject, course_name, search }) => {
  const query = {};

  if (yearLevel) query.year_level = parseInt(yearLevel);
  if (subject) query.subject = subject;
  if (course_name) query.course_name = course_name;
  if (search) query.$text = { $search: search };

  return await Question.find(query).sort({ created_at: -1 });
};

exports.createQuestion = async (questionData) => {
  const question = new Question({
    ...questionData,
    created_at: new Date(),
  });
  return await question.save();
};
