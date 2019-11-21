const express = require('express');
const router = express.Router();

const LookupTypeController = require('../controllers/lookup-type.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', checkAuth, LookupTypeController.get);
router.get('/:id', checkAuth, LookupTypeController.get_single)
router.post('/', checkAuth, LookupTypeController.create);
router.post('/:id', checkAuth, LookupTypeController.add_value);

module.exports = router;