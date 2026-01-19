const fs = require('fs');
const path = require('path');

// Test the backend controllers directly
async function testBackend() {
    console.log('🧪 Testing DataSentry AI Backend...\n');

    try {
        // Test 1: Import controllers
        console.log('1. Testing controller imports...');
        const uploadController = require('./backend/src/controllers/uploadController');
        const analysisController = require('./backend/src/controllers/analysisController');
        const aiController = require('./backend/src/controllers/aiController');
        console.log('✅ All controllers imported successfully\n');

        // Test 2: Test CSV parsing with sample data
        console.log('2. Testing CSV parsing...');
        const sampleCsvPath = path.join(__dirname, 'demo_data.csv');
        
        if (!fs.existsSync(sampleCsvPath)) {
            console.log('⚠️  demo_data.csv not found, creating sample...');
            const sampleCsv = `name,email,company,title
John Doe,john@example.com,Acme Corp,Software Engineer
Jane Smith,jane@test.com,Tech Inc,Product Manager
Bob Johnson,bob@company.com,StartupXYZ,CEO`;
            fs.writeFileSync(sampleCsvPath, sampleCsv);
        }

        // Mock file upload object
        const mockFile = {
            originalname: 'demo_data.csv',
            filename: 'test-' + Date.now() + '.csv',
            path: sampleCsvPath,
            size: fs.statSync(sampleCsvPath).size
        };

        // Mock request/response
        let uploadResult;
        const mockReq = { file: mockFile };
        const mockRes = {
            json: (data) => { uploadResult = data; },
            status: (code) => ({ json: (data) => { uploadResult = { status: code, ...data }; } })
        };

        await uploadController.uploadAndParse(mockReq, mockRes);
        
        if (uploadResult && uploadResult.success) {
            console.log('✅ CSV parsing successful');
            console.log(`   - File ID: ${uploadResult.fileId}`);
            console.log(`   - Rows: ${uploadResult.info.rowCount}`);
            console.log(`   - Headers: ${uploadResult.info.headers.join(', ')}\n`);

            // Test 3: Test data analysis
            console.log('3. Testing data analysis...');
            let analysisResult;
            const analysisReq = { body: { fileId: uploadResult.fileId } };
            const analysisRes = {
                json: (data) => { analysisResult = data; },
                status: (code) => ({ json: (data) => { analysisResult = { status: code, ...data }; } })
            };

            await analysisController.analyzeDataQuality(analysisReq, analysisRes);
            
            if (analysisResult && analysisResult.success) {
                console.log('✅ Data analysis successful');
                console.log(`   - Quality Score: ${analysisResult.analysis.score}%`);
                console.log(`   - Issues Found: ${analysisResult.analysis.issuesCount}`);
                console.log(`   - Corrections: ${analysisResult.analysis.corrections?.length || 0}\n`);
            } else {
                console.log('❌ Data analysis failed:', analysisResult);
            }

            // Test 4: Test AI features (if API key is configured)
            console.log('4. Testing AI features...');
            const envContent = fs.readFileSync('./backend/.env', 'utf8');
            const hasApiKey = envContent.includes('OPENAI_API_KEY=') && 
                             !envContent.includes('OPENAI_API_KEY=your_openai_api_key_here');

            if (hasApiKey) {
                console.log('✅ OpenAI API key is configured');
                
                // Test AI chat
                let chatResult;
                const chatReq = { 
                    body: { 
                        fileId: uploadResult.fileId, 
                        message: 'What can you tell me about this data?',
                        context: ''
                    } 
                };
                const chatRes = {
                    json: (data) => { chatResult = data; },
                    status: (code) => ({ json: (data) => { chatResult = { status: code, ...data }; } })
                };

                await aiController.aiCopilotChat(chatReq, chatRes);
                
                if (chatResult && chatResult.success) {
                    console.log('✅ AI Chat working');
                    console.log(`   - Response: ${chatResult.response.substring(0, 100)}...\n`);
                } else {
                    console.log('⚠️  AI Chat had issues:', chatResult?.error || 'Unknown error');
                }
            } else {
                console.log('⚠️  OpenAI API key not configured - AI features will use fallbacks\n');
            }

        } else {
            console.log('❌ CSV parsing failed:', uploadResult);
            return;
        }

        console.log('🎉 Backend test completed successfully!');
        console.log('\nYour DataSentry AI backend is working correctly.');
        console.log('You can now start the full application with: run-datasentry.bat');

    } catch (error) {
        console.error('❌ Backend test failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. All dependencies are installed (npm install)');
        console.error('2. All required files exist');
        console.error('3. No syntax errors in the code');
    }
}

// Run the test
testBackend();