const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, progressController.updateProgress);
router.get('/roadmap/:roadmapId', authMiddleware, progressController.getUserProgress);

module.exports = router;