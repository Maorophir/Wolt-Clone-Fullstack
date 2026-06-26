
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/search/:query
// The :query parameter will be extracted by the controller
router.get('/:query', searchController.searchEverything);

module.exports = router;