const path = require('path');
const { uploadAndParse } = require('./backend/src/controllers/uploadController');
const { analyzeDataQuality, exportCleanedData } = require('./backend/src/controllers/analysisController');
const fs = require('fs');

// Mock Express Request/Response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    res.setHeader = (key, value) => {
        if (!res.headers) res.headers = {};
        res.headers[key] = value;
    };
    res.send = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runDemo = async () => {
    const logBuffer = [];
    const log = (msg) => {
        console.log(msg);
        logBuffer.push(typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg);
    };

    log("=== Starting DataSentry AI Hackathon Demo ===\n");

    // 1. Upload People Data
    log("1. Uploading 'People_Issues.csv'...");
    const uploadReq = {
        file: {
            path: path.resolve('demo_data.csv'), // Reusing demo_data for simulation
            originalname: 'People_Issues.csv',
            filename: 'People_Issues.csv',
            size: 1024
        }
    };
    const uploadRes = mockRes();

    try {
        await uploadAndParse(uploadReq, uploadRes);
        const fileId = uploadRes.data.fileId;
        log(`   Upload Success! File ID: ${fileId}`);

        // 2. Run AI-Powered Analysis
        log("\n2. Running Analysis (Mode: People + AI Mapping)...");
        // We override the default analyze with our hackathon logic
        // Note: In real app, we'd pass { type: 'people' }
        const analyzeReq = {
            body: { fileId, type: 'people' }
        };
        const analyzeRes = mockRes();

        await analyzeDataQuality(analyzeReq, analyzeRes);

        const analysis = analyzeRes.data.analysis;

        // Handle both old and new response structures for robust demo
        const score = analysis.score || analysis.qualityScore;
        const issues = analysis.issues || [];
        const corrections = analysis.corrections || [];

        log(`   Overall Data Quality Score: ${score}/100`);
        log(`   Total Records: ${analysis.totalRecords || analysis.totalRows}`);
        log(`   Job Functions Mapped: ${analysis.jobMappings || 0}`);

        log("\n   --- Issues Detected ---");
        if (issues.length > 0) {
            issues.slice(0, 5).forEach(i => {
                log(`   Row ${i.row} [${i.field}]: ${i.issue} (Severity: ${i.severity})`);
            });
        }

        log("\n   --- AI Corrections & Normalization ---");
        if (corrections.length > 0) {
            corrections.slice(0, 5).forEach(c => {
                log(`   Row ${c.row} [${c.field}]: "${c.original}" -> "${c.suggestion}" (Conf: ${c.confidence})`);
            });
        }

        log("\n=== Demo Complete ===");
        fs.writeFileSync('demo_log.txt', logBuffer.join('\n'));

    } catch (error) {
        log("Demo runtime error: " + error);
        fs.writeFileSync('demo_log.txt', logBuffer.join('\n'));
    }
};

runDemo();
