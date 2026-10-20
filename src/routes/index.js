const { Router } = require('express');
const authRoutes = require('./auth.routes');
const questionSetRoutes = require('./questionSet.routes');
const sessionRoutes = require('./session.routes');
const healthRoutes = require('./health.routes');
const gameInfoRoutes = require('./gameInfo.routes');
const resultsRoutes = require('./results.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/question-sets', questionSetRoutes);
router.use('/sessions', sessionRoutes);
router.use('/health', healthRoutes);
router.use('/game-info', gameInfoRoutes);
router.use('/results', resultsRoutes);

module.exports = router;