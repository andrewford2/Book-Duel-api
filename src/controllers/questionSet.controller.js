const service = require('../services/questionSet.service');

async function createQuestionSet(req, res) {
  const { title, description, subject, grade_level } = req.body;
  const result = await service.createQuestionSet(req.authHost.hostId, { title, description, subject, grade_level });
  res.status(201).json(result);
}

async function listQuestionSets(req, res) {
  const result = await service.listQuestionSets(req.authHost.hostId);
  res.json(result);
}

async function getQuestionSet(req, res) {
  const { id } = req.params;
  const result = await service.getQuestionSet(Number(id), req.authHost.hostId);
  if (!result) {
    return res.status(404).json({ error: { code: 'QUESTION_SET_NOT_FOUND', message: 'Question set not found' } });
  }
  // Don't expose correct answers to host
  const safeQuestions = (result.questions || []).map(q => ({
    question_id: q.question_id,
    text: q.text,
    type: q.type,
    time_limit_sec: q.time_limit_sec,
    position: q.position,
    choices: q.choices.map(c => ({ choice_id: c.choice_id, text: c.text, position: c.position })),
  }));
  res.json({ ...result.toJSON(), questions: safeQuestions });
}

async function updateQuestionSet(req, res) {
  const { id } = req.params;
  const { title, description, subject, grade_level } = req.body;
  const result = await service.updateQuestionSet(Number(id), req.authHost.hostId, { title, description, subject, grade_level });
  if (!result) {
    return res.status(404).json({ error: { code: 'QUESTION_SET_NOT_FOUND', message: 'Question set not found' } });
  }
  res.json(result);
}

async function deleteQuestionSet(req, res) {
  const { id } = req.params;
  const result = await service.deleteQuestionSet(Number(id), req.authHost.hostId);
  if (!result) {
    return res.status(404).json({ error: { code: 'QUESTION_SET_NOT_FOUND', message: 'Question set not found' } });
  }
  res.status(200).json({ message: 'Question set deleted' });
}

module.exports = { createQuestionSet, listQuestionSets, getQuestionSet, updateQuestionSet, deleteQuestionSet };