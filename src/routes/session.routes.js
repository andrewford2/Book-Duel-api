const { Router } = require('express');
const ctrl = require('../controllers/session.controller');
const { requireAuth } = require('../middlewares/auth');
const { requirePlayerAuth } = require('../middlewares/playerAuth');
const { requireHubKey } = require('../middlewares/hubKey');

const router = Router();

// Host routes - require host auth
router.post('/', requireAuth, ctrl.createSession);
router.get('/:code', requireAuth, ctrl.getSession);
router.patch('/:code', requireAuth, ctrl.endSession);

// Player routes - require player auth (simple session_player_id)
router.post('/:code/players', ctrl.joinSession);

// Host round management
router.post('/:code/rounds', requireAuth, ctrl.startRound);
router.get('/:code/rounds/current', requireAuth, ctrl.getCurrentRound);

// Player round view
router.get('/:code/rounds/current', requirePlayerAuth, ctrl.getCurrentRound);

// Player answer submission
router.post('/:code/answers', requirePlayerAuth, ctrl.submitAnswer);

// Public leaderboard
router.get('/:code/leaderboard', ctrl.getLeaderboard);

// Hub endpoint for results
router.get('/:code/results', requireHubKey, ctrl.getLeaderboard);

module.exports = router;