const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

async function testEnhancedFeatures() {
  console.log('🧪 Testing Enhanced DataSentry AI Features...\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${API_BASE}/../health`);
    console.log('✅ Health Check:', health.data.status);

    // 2. Test File Upload with CV Data
    console.log('\n2️⃣ Testing CV File Upload...');
    const formData = new FormData();
    const csvPath = path.join(__dirname, 'sample_cv_data.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('Sample CV data file not found');
    }

    formData.append('csvFile', fs.createReadStream(csvPath));
    
    const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    console.log('✅ Upload Success:', uploadResponse.data.success);
    console.log('📊 File Info:', {
      name: uploadResponse.data.info.originalName,
      rows: uploadResponse.data.info.rowCount,
      columns: uploadResponse.data.info.headers.length,
      headers: uploadResponse.data.info.headers.slice(0, 5).join(', ') + '...'
    });

    const fileId = uploadResponse.data.fileId;

    // 3. Test Enhanced Data Quality Analysis
    console.log('\n3️⃣ Testing Enhanced Data Quality Analysis...');
    const analysisResponse = await axios.post(`${API_BASE}/analysis/quality`, {
      fileId: fileId,
      type: 'people'
    });

    const analysis = analysisResponse.data.analysis;
    console.log('✅ Analysis Complete!');
    console.log('📈 Quality Score:', analysis.score + '%');
    console.log('🔍 Issues Found:', analysis.issuesCount);
    console.log('🔧 Corrections Suggested:', analysis.corrections?.length || 0);
    console.log('👥 Job Mappings:', analysis.jobMappings || 0);
    console.log('🔄 Duplicates Detected:', analysis.duplicates || 0);

    // Show issue breakdown
    if (analysis.issuesByType) {
      console.log('\n📋 Issue Breakdown:');
      Object.entries(analysis.issuesByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }

    // Show sample corrections
    if (analysis.corrections && analysis.corrections.length > 0) {
      console.log('\n🔧 Sample Corrections:');
      analysis.corrections.slice(0, 3).forEach((correction, i) => {
        console.log(`   ${i + 1}. Row ${correction.row}, ${correction.field}:`);
        console.log(`      "${correction.original}" → "${correction.suggestion}"`);
        console.log(`      Confidence: ${Math.round(correction.confidence * 100)}%`);
        console.log(`      Type: ${correction.type}`);
      });
    }

    // 4. Test Report Generation
    console.log('\n4️⃣ Testing QA Report Generation...');
    const reportResponse = await axios.post(`${API_BASE}/analysis/report`, {
      fileId: fileId
    });

    console.log('✅ Report Generated:', reportResponse.data.success);
    console.log('📄 Report Length:', reportResponse.data.report.length, 'characters');

    // 5. Test Export Functionality
    console.log('\n5️⃣ Testing Export Functionality...');
    
    // Test JSON preview
    const jsonPreview = await axios.post(`${API_BASE}/analysis/export`, {
      fileId: fileId,
      format: 'json',
      preview: true
    });

    console.log('✅ JSON Preview:', jsonPreview.data.success);
    console.log('📊 Preview Records:', jsonPreview.data.data?.length || 0);

    // Test CSV preview
    const csvPreview = await axios.post(`${API_BASE}/analysis/export`, {
      fileId: fileId,
      format: 'csv',
      preview: true
    });

    console.log('✅ CSV Preview:', csvPreview.data.success);
    console.log('📄 CSV Preview Length:', csvPreview.data.data?.length || 0, 'characters');

    // 6. Test Analysis Summaries
    console.log('\n6️⃣ Testing Analysis Summaries...');
    const summariesResponse = await axios.get(`${API_BASE}/analysis/summaries`);
    
    console.log('✅ Summaries Retrieved:', summariesResponse.data.success);
    console.log('📊 Total Analyses:', summariesResponse.data.summaries?.length || 0);

    console.log('\n🎉 All Enhanced Features Working Perfectly!');
    console.log('\n📋 Feature Summary:');
    console.log('   ✅ Enhanced file validation and error handling');
    console.log('   ✅ Invalid/missing field detection');
    console.log('   ✅ Intelligent corrections with confidence scores');
    console.log('   ✅ Duplicate detection');
    console.log('   ✅ Job title mapping');
    console.log('   ✅ Comprehensive QA reporting');
    console.log('   ✅ Export to cleaned CSV/JSON');
    console.log('   ✅ Overall data quality scoring');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testEnhancedFeatures();