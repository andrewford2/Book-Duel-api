const { Router } = require('express');
const ctrl = require('../controllers/gameInfo.controller');

const router = Router();

router.get('/', ctrl.getGameInfo);

module.exports = router;