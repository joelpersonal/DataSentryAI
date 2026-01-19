const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

// AI-powered suggestions
router.post('/suggestions', aiController.generateSuggestions);

// Job title to function mapping
router.post('/job-mapping', aiController.mapJobTitles);

// Industry standardization
router.post('/standardize-industry', aiController.standardizeIndustry);

// AI copilot chat
router.post('/chat', aiController.aiCopilotChat);

// Business impact insights
router.post('/insights', aiController.generateBusinessInsights);

module.exports = router;