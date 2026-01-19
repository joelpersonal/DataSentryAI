const Papa = require('papaparse');
const path = require('path');
const { getFileData } = require('./uploadController');
const { validateCompanyRecord, validatePersonRecord, calculateConfidenceScore } = require('../utils/validators');
const { mapJobTitle, loadGroundTruth } = require('../utils/jobMapper');
const { normalizeIndustryAI, explainIssueAI } = require('../services/ollamaService');
const { normalizeIndustry, normalizeFunction, normalizeJobTitle, suggestDomainCorrection } = require('../utils/normalization');

// Load ground truth on startup/controller load
const groundTruthPath = path.join(process.cwd(), 'your-datasets', 'templates', 'job-function-template.csv');
loadGroundTruth(groundTruthPath);

// In-memory storage for analysis results
const resultsStorage = new Map();

const analyzeDataQuality = async (req, res) => {
  try {
    const { fileId, type = 'auto' } = req.body; // type: 'companies' | 'people' | 'auto'
    const fileData = getFileData(fileId);

    if (!fileData) {
      if (res.status) return res.status(404).json({ error: 'File not found' });
      return { error: 'File not found' };
    }

    const { data, headers } = fileData;
    const issues = [];
    const corrections = [];
    let jobMappings = 0;

    // Detect file type if auto
    let fileType = type;
    if (fileType === 'auto') {
      const headerStr = headers.join(' ').toLowerCase();
      if (headerStr.includes('revenue') || headerStr.includes('industry')) fileType = 'companies';
      else if (headerStr.includes('title') || headerStr.includes('email')) fileType = 'people';
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowId = i + 1;
      let rowIssues = [];

      // Validation Rules
      if (fileType === 'companies') {
        rowIssues = validateCompanyRecord(row);
      } else if (fileType === 'people') {
        rowIssues = validatePersonRecord(row);
      }

      // Add issues to main list
      rowIssues.forEach(issue => {
        issues.push({ row: rowId, ...issue, confidence: 1.0 });
      });

      // --- PERFECT OUTPUT & AI CORRECTION LOGIC ---
      const rowHeaders = Object.keys(row);
      for (const header of rowHeaders) {
        const value = row[header];
        if (value === null || value === undefined) continue;

        const headerLower = header.toLowerCase();
        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        // 1. Basic Cleaning (Whitespace)
        if (value !== trimmedValue) {
          corrections.push({
            row: rowId,
            field: header,
            original: value,
            suggestion: trimmedValue,
            confidence: 1.0,
            type: 'cleaning',
            explanation: 'Removed unnecessary whitespace from the start/end of the field.',
            recommendation: 'Fix whitespace at source.'
          });
        }

        // 2. Intelligent Casing (Names, Companies, Cities)
        if (['first name', 'last name', 'name', 'company', 'city', 'country'].some(k => headerLower.includes(k))) {
          if (typeof trimmedValue === 'string' && trimmedValue.length > 0) {
            const perfected = trimmedValue.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            if (perfected !== trimmedValue) {
              corrections.push({
                row: rowId,
                field: header,
                original: value,
                suggestion: perfected,
                confidence: 0.95,
                type: 'formatting',
                explanation: 'Corrected text casing to standard Title Case format.',
                recommendation: 'Enable title-case validation in CRM.'
              });
            }
          }
        }

        // 3. Industry Normalization (Fuzzy + AI)
        if (headerLower.includes('industry')) {
          const norm = normalizeIndustry(trimmedValue);
          if (norm.changed) {
            corrections.push({
              row: rowId,
              field: header,
              original: value,
              suggestion: norm.value,
              confidence: norm.confidence,
              type: 'normalization',
              explanation: 'Normalized industry name to standard business category.',
              recommendation: 'Use standardized industry labels.'
            });
          }
        }

        // 4. Job Title Perfection (Fuzzy + Ground Truth + AI Mapping)
        if (['title', 'job title', 'role', 'position'].some(k => headerLower.includes(k))) {
          // Attempt spec mapping
          const mapping = await mapJobTitle(trimmedValue);
          if (mapping.function !== 'Unmapped' && mapping.function !== 'Unknown') {
            row.job_function = mapping.function; // Add to row for export
            row.confidence_score = mapping.confidence;
            jobMappings++;

            if (mapping.function.toLowerCase() !== trimmedValue.toLowerCase()) {
              corrections.push({
                row: rowId,
                field: header,
                original: value,
                suggestion: mapping.function,
                confidence: mapping.confidence,
                type: 'mapping',
                explanation: `Mapped job title to business function: ${mapping.function} (Source: ${mapping.source})`,
                recommendation: 'Use role-based job functions.'
              });
            }
          }
        }

        // 5. Email Domain Intelligence
        if (headerLower.includes('email')) {
          const norm = suggestDomainCorrection(trimmedValue);
          if (norm) {
            corrections.push({
              row: rowId,
              field: header,
              original: value,
              suggestion: norm.value,
              confidence: norm.confidence,
              type: 'repair',
              explanation: `Identified and corrected potential typo in email domain: ${norm.value}`,
              recommendation: 'Update email to corrected domain.'
            });
          }
        }
      }

      // Special Case: AI-Powered Enrichment (Limit to first 10 rows for performance in demo)
      if (i < 10) {
        const industryKey = Object.keys(row).find(k => k.toLowerCase().includes('industry'));
        if (industryKey && row[industryKey]) {
          try {
            const aiNorm = await normalizeIndustryAI(row[industryKey]);
            if (aiNorm.normalized && aiNorm.normalized !== row[industryKey]) {
              corrections.push({
                row: rowId,
                field: industryKey,
                original: row[industryKey],
                suggestion: aiNorm.normalized,
                confidence: 0.9,
                type: 'ai_perfection'
              });
            }
          } catch (e) { /* Fallback to fuzzy */ }
        }
      }
    }

    // --- DUPLICATE DETECTION LOGIC (SPEC: Detect potential duplicates) ---
    const seenMap = new Map();
    const duplicateGroups = [];

    data.forEach((row, index) => {
      // Logic: People -> Email; Companies -> Name + Domain
      let key = '';
      if (fileType === 'people') {
        const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
        key = emailKey ? row[emailKey]?.toString().toLowerCase().trim() : '';
      } else {
        const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('company'));
        const domainKey = Object.keys(row).find(k => k.toLowerCase().includes('domain'));
        const nameVal = nameKey ? row[nameKey]?.toString().toLowerCase().trim() : '';
        const domainVal = domainKey ? row[domainKey]?.toString().toLowerCase().trim() : '';
        key = `${nameVal}|${domainVal}`;
      }

      if (key && key !== '|' && key !== '') {
        if (seenMap.has(key)) {
          seenMap.get(key).push(index + 1);
        } else {
          seenMap.set(key, [index + 1]);
        }
      }
    });

    seenMap.forEach((rows, key) => {
      if (rows.length > 1) {
        duplicateGroups.push({ key, rows, count: rows.length });
      }
    });

    const totalDuplicates = duplicateGroups.reduce((acc, g) => acc + g.count - 1, 0);

    // --- METRICS & AGGREGATION ---
    const totalFields = data.length * headers.length;

    // Aggregating issues by type for the QA Report
    const issuesByType = issues.reduce((acc, issue) => {
      const type = issue.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    if (totalDuplicates > 0) {
      issuesByType['Duplicates'] = totalDuplicates;
    }

    const missingCount = issuesByType['Missing Data'] || 0;
    const invalidCount = (issuesByType['Invalid Format'] || 0) + (issuesByType['Schema Mismatch'] || 0);
    const duplicatePercent = data.length > 0 ? (totalDuplicates / data.length) * 100 : 0;

    const missingPercent = totalFields > 0 ? (missingCount / totalFields) * 100 : 0;
    const invalidPercent = totalFields > 0 ? (invalidCount / totalFields) * 100 : 0;

    const qualityScore = Math.max(0, Math.round(100 - (missingPercent + invalidPercent + duplicatePercent)));

    const analysisResults = {
      score: qualityScore,
      issuesCount: issues.length + totalDuplicates,
      issuesByType,
      missingFields: missingCount,
      invalidFields: invalidCount,
      duplicates: totalDuplicates,
      duplicateGroups,
      flaggedRecords: [...new Set([...issues.map(i => i.row), ...duplicateGroups.flatMap(g => g.rows)])].length,
      issues: issues.slice(0, 1000),
      corrections: corrections.slice(0, 10000),
      jobMappings,
      fileType,
      processedAt: new Date().toISOString()
    };

    const result = {
      success: true,
      analysis: analysisResults
    };

    // Store the result
    resultsStorage.set(fileId, {
      ...analysisResults,
      totalRecords: data.length,
      fileName: fileData.originalName,
      uploadedAt: fileData.uploadedAt
    });

    if (res.json) res.json(result);
    return result;

  } catch (error) {
    console.error('Analysis error:', error);
    if (res.status) res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
};

const getAllAnalysisSummaries = async (req, res) => {
  const summaries = Array.from(resultsStorage.entries()).map(([fileId, data]) => ({
    fileId,
    fileName: data.fileName,
    qualityScore: data.score,
    totalRecords: data.totalRecords,
    issuesCount: data.issuesCount,
    missingFields: data.missingFields || 0,
    invalidFields: data.invalidFields || 0,
    uploadedAt: data.uploadedAt
  }));
  res.json({ success: true, summaries });
};

const detectDuplicates = async (req, res) => {
  // Placeholder for simplified logic if needed, or keeping original
  res.json({ success: true, duplicates: { total: 0, groups: [] } });
};

const generateReport = async (req, res) => {
  try {
    const { fileId } = req.body;
    const fileData = getFileData(fileId);
    const analysis = resultsStorage.get(fileId);

    if (!fileData || !analysis) {
      return res.status(404).json({ error: 'Analysis data not found' });
    }

    const reportDate = new Date().toLocaleString();
    const issueBreakdown = Object.entries(analysis.issuesByType || {})
      .map(([type, count]) => `- ${type}: ${count}`)
      .join('\n');

    const reportContent = `
================================================================================
                    DATASENTRY AI - DIAGNOSTIC QA REPORT
================================================================================
Report Date: ${reportDate}
Filename:    ${fileData.originalName}
Total Rows:  ${fileData.rowCount}
Dimensions:  ${fileData.headers.length}

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
QUALITY INTEGRITY SCORE: ${analysis.score}%
TOTAL ISSUES IDENTIFIED: ${analysis.issuesCount}
RECORDS REQUIRING FIXES: ${analysis.flaggedRecords}
NEURAL CORRECTIONS APPLIED: ${analysis.corrections?.length || 0}

HEALTH STATUS: ${analysis.score >= 80 ? 'HEALTHY' : analysis.score >= 60 ? 'OPTIMIZATION REQUIRED' : 'CRITICAL ATTENTION NEEDED'}

--------------------------------------------------------------------------------
2. DATA VULNERABILITY BREAKDOWN (BY TYPE)
--------------------------------------------------------------------------------
${issueBreakdown || 'No critical structural issues identified.'}

--------------------------------------------------------------------------------
3. TOP STRUCTURAL ISSUES
--------------------------------------------------------------------------------
${analysis.issues.length > 0 ?
        analysis.issues.slice(0, 15).map(i => `- Row ${i.row}: ${i.field} -> ${i.issue} (Confidence: ${Math.round(i.confidence * 100)}%)`).join('\n') :
        'No critical structural issues identified.'
      }
${analysis.issues.length > 15 ? `... and ${analysis.issues.length - 15} more issues.` : ''}

--------------------------------------------------------------------------------
4. AI TRANSFORMATION SUMMARY
--------------------------------------------------------------------------------
- Job Functions Mapped: ${analysis.jobMappings || 0}
- Formatting Rules Applied: Title Casing, Whitespace Trimming
- Neural Normalization: Industry Standardized, Domain Repairs

--------------------------------------------------------------------------------
5. STRATEGIC RECOMMENDATIONS
--------------------------------------------------------------------------------
1. Review the Top ${Math.min(10, analysis.issuesCount)} high-confidence issues immediately.
2. Export the "AI-Perfected" dataset to apply structural fixes.
3. ${analysis.score < 80 ? 'Implement mandatory field validation for lower-confidence columns.' : 'Data integrity is within acceptable thresholds for production use.'}

================================================================================
                    END OF DIAGNOSTIC REPORT - GENERATED BY AI
================================================================================
`;

    res.json({
      success: true,
      report: reportContent,
      filename: `QA_Report_${fileData.originalName.split('.')[0]}.txt`
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Report generation failed', message: error.message });
  }
};

const exportCleanedData = async (req, res) => {
  try {
    const { fileId, format = 'csv', preview = false } = req.body;
    const fileData = getFileData(fileId);
    const analysis = resultsStorage.get(fileId);

    console.log(`[Export] Request for fileId: ${fileId}, format: ${format}, preview: ${preview}`);

    if (!fileData) {
      console.error(`[Export] fileData not found for ${fileId}`);
      return res.status(404).json({ error: 'File data not found' });
    }

    if (!analysis) {
      console.warn(`[Export] analysisResults not found for ${fileId}. Falling back to raw data.`);
    }

    // Deep Clone and Enrich for SPEC compliance
    // We want to ensure we include original data + job_function + corrections + issues_detected
    const enrichedData = (analysis && (analysis.issues?.length > 0 || analysis.corrections?.length > 0 || analysis.jobMappings > 0)) ?
      fileData.data.map((row, index) => {
        const rowId = index + 1;
        const rowIssues = analysis.issues?.filter(i => i.row === rowId) || [];
        const rowCorrections = analysis.corrections?.filter(c => c.row === rowId) || [];

        const newRow = { ...row };

        // Add Spec-Mandatory Columns
        newRow.issues_detected = rowIssues.length > 0 ?
          rowIssues.map(i => `${i.field}: ${i.issue}`).join('; ') : 'None';

        // Apply corrections to the cleaned file
        rowCorrections.forEach(c => {
          // Robust check for field existence
          if (Object.prototype.hasOwnProperty.call(newRow, c.field)) {
            newRow[c.field] = c.suggestion;
          }
        });

        // Ensure job_function is present (it might have been added to the row during analysis)
        if (!newRow.job_function) {
          newRow.job_function = row.job_function || 'Not Mapped';
        }

        // Ensure confidence score exists (average of corrections + job mapping)
        if (!newRow.confidence_score) {
          const confs = rowCorrections.map(c => c.confidence);
          if (row.confidence_score) confs.push(parseFloat(row.confidence_score));

          newRow.confidence_score = confs.length > 0 ?
            (confs.reduce((a, b) => a + b) / confs.length).toFixed(2) : "1.00";
        }

        return newRow;
      }) : fileData.data;

    console.log(`[Export] Enriched data rows: ${enrichedData?.length || 0}`);

    if (format === 'csv') {
      const csvOutput = Papa.unparse(enrichedData);

      if (preview) {
        // For CSV preview, return the first 20 lines of the UNPARSED string
        // so it looks like a real CSV file in the modal
        const rows = csvOutput.split('\n');
        const previewCsv = rows.slice(0, 21).join('\n'); // 1 header + 20 data rows
        return res.json({ success: true, data: previewCsv });
      }

      const downloadName = `cleaned_${analysis?.fileType || 'data'}_${Date.now()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);
      return res.send(csvOutput);
    }

    // For JSON
    if (preview) {
      return res.json({ success: true, data: enrichedData.slice(0, 20) });
    }

    res.json({ success: true, data: enrichedData });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

module.exports = {
  analyzeDataQuality,
  detectDuplicates,
  generateReport,
  exportCleanedData,
  getAllAnalysisSummaries
};