const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/summary', auth, getDashboardSummary);

module.exports = router;
