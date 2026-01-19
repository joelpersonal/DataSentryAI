const fs = require('fs');
const path = require('path');

// Simple test to verify our sample data is properly formatted
function testSampleData() {
  console.log('🧪 Testing Sample CV Data Format...\n');

  const csvPath = path.join(__dirname, 'sample_cv_data.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Sample CV data file not found');
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log('✅ Sample Data Analysis:');
  console.log(`📊 Total Lines: ${lines.length}`);
  console.log(`📋 Headers: ${lines[0]}`);
  console.log(`👥 Data Rows: ${lines.length - 1}`);
  
  // Check for common issues
  const headers = lines[0].split(',');
  console.log(`🔍 Column Count: ${headers.length}`);
  
  // Sample a few rows
  console.log('\n📝 Sample Records:');
  for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
    const row = lines[i].split(',');
    console.log(`   Row ${i}: ${row[0]} - ${row[3]} at ${row[4]}`);
  }
  
  // Check for potential issues
  console.log('\n🔍 Data Quality Preview:');
  let emptyEmails = 0;
  let invalidPhones = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (!row[1] || row[1].trim() === '') emptyEmails++;
    if (row[2] && !row[2].match(/[\d\-\+\(\)\s\.]/)) invalidPhones++;
  }
  
  console.log(`   📧 Missing Emails: ${emptyEmails}`);
  console.log(`   📱 Potential Phone Issues: ${invalidPhones}`);
  
  console.log('\n🎉 Sample data is ready for testing!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Open http://localhost:5173 in your browser');
  console.log('   2. Upload the sample_cv_data.csv file');
  console.log('   3. Watch the enhanced analysis in action!');
}

testSampleData();