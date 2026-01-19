const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const { mapJobFunctionAI } = require('../services/ollamaService');

let groundTruthMap = new Map();

// Helper to load Ground Truth CSV
const loadGroundTruth = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return false;
        const csv = fs.readFileSync(filePath, 'utf8');
        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });

        groundTruthMap.clear();
        results.data.forEach(row => {
            // Updated to match template headers: "current_job_title", "job_function"
            const title = row.current_job_title || row.title;
            const jobFunc = row.job_function || row.function;

            if (title && jobFunc) {
                groundTruthMap.set(title.toLowerCase().trim(), jobFunc.trim());
            }
        });
        console.log(`Loaded ${groundTruthMap.size} ground truth job mappings.`);
        return true;
    } catch (error) {
        console.error("Error loading ground truth:", error);
        return false;
    }
};

const mapJobTitle = async (title) => {
    if (!title) return { function: 'Unknown', confidence: 0, source: 'none' };

    const cleanTitle = title.toLowerCase().trim();

    // 1. Exact Match (Dict)
    if (groundTruthMap.has(cleanTitle)) {
        return {
            function: groundTruthMap.get(cleanTitle),
            confidence: 0.95,
            source: 'ground_truth'
        };
    }

    // 2. AI Fallback (Ollama)
    try {
        const aiResult = await mapJobFunctionAI(title);
        if (aiResult && aiResult.function) {
            return {
                function: aiResult.function,
                confidence: aiResult.confidence || 0.8,
                source: 'ai_ollama',
                reason: aiResult.reason
            };
        }
    } catch (e) {
        // Fallback if AI fails
    }

    return { function: 'Unmapped', confidence: 0, source: 'failed' };
};

module.exports = {
    loadGroundTruth,
    mapJobTitle
};
