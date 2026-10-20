const { QuestionSet, Question, Choice } = require('../models');

async function createQuestionSet(data) {
  return QuestionSet.create(data);
}

async function findQuestionSetsByHost(hostId) {
  return QuestionSet.findAll({
    where: { host_id: hostId },
    order: [['created_at', 'DESC']],
  });
}

async function findQuestionSetById(questionSetId, includeQuestions = false) {
  const include = [];
  if (includeQuestions) {
    include.push({
      association: 'questions',
      include: [{ association: 'choices' }],
    });
  }
  return QuestionSet.findByPk(questionSetId, { include });
}

async function updateQuestionSet(questionSetId, hostId, data) {
  const questionSet = await QuestionSet.findOne({
    where: { question_set_id: questionSetId, host_id: hostId },
  });
  if (!questionSet) return null;
  return questionSet.update(data);
}

async function deleteQuestionSet(questionSetId, hostId) {
  const questionSet = await QuestionSet.findOne({
    where: { question_set_id: questionSetId, host_id: hostId },
  });
  if (!questionSet) return null;
  await questionSet.destroy();
  return true;
}

module.exports = { createQuestionSet, findQuestionSetsByHost, findQuestionSetById, updateQuestionSet, deleteQuestionSet };