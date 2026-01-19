const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, roadmapController.getAllRoadmaps);
router.get('/:id', optionalAuth, roadmapController.getRoadmapById);
router.post('/', authMiddleware, roadmapController.createRoadmap);

module.exports = router;