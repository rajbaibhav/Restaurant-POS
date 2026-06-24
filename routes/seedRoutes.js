const express = require('express');
const router = express.Router();
const { seedDemo } = require('../controllers/seedController');

// POST /seed/demo — One-time setup to populate the database
router.post('/demo', seedDemo);

module.exports = router;
