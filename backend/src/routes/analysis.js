const express = require('express');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// Analyze data quality
router.post('/quality', analysisController.analyzeDataQuality);

// Detect duplicates
router.post('/duplicates', analysisController.detectDuplicates);

// Generate comprehensive report
router.post('/report', analysisController.generateReport);

// Export cleaned data
router.post('/export', analysisController.exportCleanedData);

// Get all analysis summaries
router.get('/summaries', analysisController.getAllAnalysisSummaries);

module.exports = router;