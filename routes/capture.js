const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createCapture, getCaptures, getCaptureStats } = require('../controllers/captureController');

router.post('/', auth, createCapture);
router.get('/', auth, getCaptures);
router.get('/stats', auth, getCaptureStats);
module.exports = router;
