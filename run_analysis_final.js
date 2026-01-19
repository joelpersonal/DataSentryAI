const fs = require('fs');
const path = require('path');

async function runAnalysis() {
    console.log('=== Starting DataSentry AI Final Analysis ===');
    console.log('1. Ensuring Backend is Live...');

    // Check if Ollama is ready with mistral
    try {
        const tags = await fetch('http://localhost:11434/api/tags').then(r => r.json());
        const mistral = tags.models.find(m => m.name.includes('mistral'));
        if (!mistral) {
            console.log('❌ Mistral model not yet available. Waiting or pulling...');
            // In a real script we might wait, but for now we'll proceed and let the backend handle/fail
        } else {
            console.log('✅ Ollama Mistral model detected:', mistral.name);
        }
    } catch (e) {
        console.log('⚠️ Warning: Could not check Ollama status:', e.message);
    }

    console.log('\n2. Uploading Data...');
    const formData = new FormData();
    const filePath = path.join(__dirname, 'demo_data.csv');
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'text/csv' });
    formData.append('csvFile', blob, 'demo_data.csv');

    try {
        const uploadRes = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            headers: {
                'Origin': 'http://localhost:5175' // Match allowed origin
            },
            body: formData
        });

        if (!uploadRes.ok) throw new Error(`Upload Failed: ${uploadRes.statusText}`);
        const uploadData = await uploadRes.json();
        const fileId = uploadData.fileId;
        console.log(`✅ Upload Success! File ID: ${fileId}`);

        console.log('\n3. Requesting AI Analysis (This may take time)...');
        const analyzeRes = await fetch('http://localhost:3001/api/analysis/quality', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5175'
            },
            body: JSON.stringify({ fileId, type: 'people' })
        });

        if (!analyzeRes.ok) throw new Error(`Analysis Failed: ${analyzeRes.statusText}`);
        const analysisData = await analyzeRes.json();

        console.log('\n=============================================');
        console.log('       DataSentry AI - Data Quality Report');
        console.log('=============================================');
        console.log(`\noverall data quality score: ${analysisData.analysis.score}/100`);
        console.log(`checked records: ${analysisData.analysis.totalRecords}`);
        console.log(`issues found: ${analysisData.analysis.issuesCount}`);
        console.log(`AI job mappings: ${analysisData.analysis.jobMappings}`);

        console.log('\n--- Detected Issues ---');
        analysisData.analysis.issues.slice(0, 5).forEach(issue => {
            console.log(`[Row ${issue.row}] ${issue.issue} (${issue.severity})`);
        });

        console.log('\n--- AI Corrections & Insights ---');
        analysisData.analysis.corrections.slice(0, 5).forEach(c => {
            console.log(`[${c.field}] "${c.original}" -> "${c.suggestion}" (Confidence: ${c.confidence})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

runAnalysis();
