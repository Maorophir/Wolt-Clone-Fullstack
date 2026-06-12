const express = require('express');

const router = express.Router();

const tokenController = require('../controllers/tokenController');

// POST /api/tokens   -> log in / verify credentials
router.post('/', tokenController.login);

module.exports = router;
