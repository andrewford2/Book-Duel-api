const { Router } = require('express');
const ctrl = require('../controllers/results.controller');
const { requireHubKey } = require('../middlewares/hubKey');

const router = Router();

router.use(requireHubKey);

router.get('/', ctrl.getResults);

module.exports = router;