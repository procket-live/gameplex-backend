const express = require('express');
const router = express.Router();

router.get('/', LookupTypeController.get);

module.exports = router;