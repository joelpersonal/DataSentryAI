const fs = require('fs');
const path = require('path');

console.log('🔍 DataSentry AI Upload Diagnostic Tool\n');

// Check if servers are running
async function checkServers() {
  console.log('1️⃣ Checking Server Status...');
  
  try {
    // Check if backend is running (simple approach)
    const { spawn } = require('child_process');
    
    // Check backend port
    const netstat = spawn('netstat', ['-an']);
    let output = '';
    
    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.on('close', (code) => {
      if (output.includes(':3001')) {
        console.log('   ✅ Backend server running on port 3001');
      } else {
        console.log('   ❌ Backend server NOT running on port 3001');
        console.log('   💡 Run: cd backend && npm run dev');
      }
      
      if (output.includes(':5173')) {
        console.log('   ✅ Frontend server running on port 5173');
      } else {
        console.log('   ❌ Frontend server NOT running on port 5173');
        console.log('   💡 Run: cd frontend && npm run dev');
      }
      
      checkFiles();
    });
    
  } catch (error) {
    console.log('   ⚠️  Could not check server status automatically');
    console.log('   💡 Manually verify: http://localhost:3001/health');
    checkFiles();
  }
}

// Check test files
function checkFiles() {
  console.log('\n2️⃣ Checking Test Files...');
  
  const testFiles = [
    'quick_test.csv',
    'sample_cv_data.csv',
    'Company_Issues.csv',
    'People_Issues.csv'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      
      console.log(`   ✅ ${file} (${stats.size} bytes, ${lines.length} lines)`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
    }
  });
  
  checkDirectories();
}

// Check directories
function checkDirectories() {
  console.log('\n3️⃣ Checking Directory Structure...');
  
  const dirs = [
    'backend/src',
    'backend/uploads',
    'frontend/src',
    'frontend/node_modules',
    'backend/node_modules'
  ];
  
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`   ✅ ${dir}`);
    } else {
      console.log(`   ❌ ${dir} - Missing`);
      if (dir.includes('node_modules')) {
        console.log(`   💡 Run: cd ${dir.split('/')[0]} && npm install`);
      }
    }
  });
  
  checkEnvironment();
}

// Check environment
function checkEnvironment() {
  console.log('\n4️⃣ Checking Environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`   📦 Node.js: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 16) {
    console.log('   ⚠️  Node.js version is old. Recommended: v16+');
  }
  
  // Check environment files
  const envFiles = [
    'backend/.env',
    'frontend/.env'
  ];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
      console.log(`   💡 Copy from ${file}.example`);
    }
  });
  
  showRecommendations();
}

// Show recommendations
function showRecommendations() {
  console.log('\n🎯 Recommendations for Faster Performance:\n');
  
  console.log('📈 Speed Optimizations:');
  console.log('   • Use files under 5MB for fastest processing');
  console.log('   • Ensure CSV has proper headers in first row');
  console.log('   • Use UTF-8 encoding without BOM');
  console.log('   • Close other browser tabs during upload');
  
  console.log('\n🔧 If Upload Still Fails:');
  console.log('   1. Try quick_test.csv first (guaranteed to work)');
  console.log('   2. Check browser console (F12) for errors');
  console.log('   3. Restart both servers');
  console.log('   4. Clear browser cache (Ctrl+Shift+R)');
  
  console.log('\n⚡ Quick Commands:');
  console.log('   • Run optimize-performance.bat for best speed');
  console.log('   • Visit http://localhost:5173 to test');
  console.log('   • Check http://localhost:3001/health for backend');
  
  console.log('\n✅ Diagnostic Complete!');
}

// Run diagnostics
checkServers();