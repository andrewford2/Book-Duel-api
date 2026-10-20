const repo = require('../repositories/questionSet.repository');

async function createQuestionSet(hostId, { title, description, subject, grade_level }) {
  if (!title || title.trim().length < 3) {
    const err = new Error('Title must be at least 3 characters');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }
  return repo.createQuestionSet({ host_id: hostId, title: title.trim(), description: description?.trim(), subject: subject?.trim(), grade_level: grade_level?.trim() });
}

async function listQuestionSets(hostId) {
  return repo.findQuestionSetsByHost(hostId);
}

async function getQuestionSet(questionSetId, hostId) {
  return repo.findQuestionSetById(questionSetId, true);
}

async function updateQuestionSet(questionSetId, hostId, { title, description, subject, grade_level }) {
  if (title !== undefined && title.trim().length < 3) {
    const err = new Error('Title must be at least 3 characters');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }
  return repo.updateQuestionSet(questionSetId, hostId, { title: title?.trim(), description: description?.trim(), subject: subject?.trim(), grade_level: grade_level?.trim() });
}

async function deleteQuestionSet(questionSetId, hostId) {
  return repo.deleteQuestionSet(questionSetId, hostId);
}

module.exports = { createQuestionSet, listQuestionSets, getQuestionSet, updateQuestionSet, deleteQuestionSet };