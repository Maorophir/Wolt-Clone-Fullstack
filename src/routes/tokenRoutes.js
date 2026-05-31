const express = require('express');

const router = express.Router();

const tokenController = require('../controllers/tokenController');

// POST /api/tokens   -> log in / verify credentials (PRS-104)
router.post('/', tokenController.login);

module.exports = router;
