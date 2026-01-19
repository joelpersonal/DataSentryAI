# 🔧 DataSentry AI - Troubleshooting Guide

## 🚨 Common Issues & Quick Fixes

### Issue: "Please select a CSV file to upload" even when file is selected

#### ✅ **Quick Fixes:**

1. **Check File Format:**
   - Ensure file has `.csv` extension
   - File should be comma-separated values
   - First row should contain headers

2. **Browser Cache:**
   ```bash
   # Clear browser cache or try incognito mode
   Ctrl + Shift + R (hard refresh)
   ```

3. **File Size:**
   - Maximum file size: 10MB
   - If larger, split the file or compress it

4. **File Content:**
   - File must not be empty
   - Must have at least 1 header row + 1 data row
   - No special characters in headers

#### 🔍 **Debug Steps:**

1. **Test with Sample File:**
   - Use `quick_test.csv` (created automatically)
   - Only 3 rows, guaranteed to work

2. **Check Browser Console:**
   ```javascript
   // Open Developer Tools (F12)
   // Look for errors in Console tab
   // Check Network tab for failed requests
   ```

3. **Verify Servers:**
   ```bash
   # Backend: http://localhost:3001/health
   # Frontend: http://localhost:5173
   ```

### Issue: Slow Upload/Analysis Performance

#### ⚡ **Performance Optimizations:**

1. **File Size Optimization:**
   - Keep files under 5MB for best performance
   - Remove unnecessary columns before upload
   - Use UTF-8 encoding without BOM

2. **Browser Optimization:**
   - Close other tabs
   - Use Chrome or Edge for best performance
   - Disable browser extensions temporarily

3. **System Optimization:**
   - Ensure Node.js processes have enough memory
   - Close other applications
   - Use SSD storage if available

## 🚀 Speed Optimization Tips

### 1. **Faster File Processing:**
```csv
# Optimal CSV format:
name,email,job_title,company
John Smith,john@test.com,Developer,TechCorp
Jane Doe,jane@example.com,Manager,BusinessCorp
```

### 2. **Batch Processing:**
- Upload files with 100-1000 rows for optimal speed
- Larger files are processed in chunks automatically

### 3. **Network Optimization:**
- Use local development (localhost)
- Ensure stable internet connection
- Disable VPN if causing issues

## 🔧 Manual Testing Steps

### Step 1: Verify Servers
```bash
# Check backend health
curl http://localhost:3001/health

# Should return: {"status":"healthy",...}
```

### Step 2: Test File Upload
1. Open http://localhost:5173
2. Drag and drop `quick_test.csv`
3. Should see immediate upload progress
4. Analysis should start automatically

### Step 3: Verify Features
- ✅ Quality score displayed
- ✅ Issues detected and listed
- ✅ Corrections suggested
- ✅ Export options available

## 🐛 Common Error Messages

### "Request failed with status code 400"
**Cause:** Invalid file format or empty file
**Fix:** 
- Check file has proper CSV format
- Ensure file is not empty
- Verify headers are present

### "Network Error" or "CORS Error"
**Cause:** Backend not running or CORS issues
**Fix:**
- Restart backend server
- Check http://localhost:3001/health
- Clear browser cache

### "File too large"
**Cause:** File exceeds 10MB limit
**Fix:**
- Split file into smaller chunks
- Remove unnecessary columns
- Compress file content

### "No data found"
**Cause:** CSV has headers but no data rows
**Fix:**
- Add at least one data row below headers
- Check for hidden characters or encoding issues

## 🎯 Performance Benchmarks

### Expected Performance:
- **Small files (< 100 rows):** < 2 seconds
- **Medium files (100-1000 rows):** < 5 seconds  
- **Large files (1000-5000 rows):** < 15 seconds

### If slower than expected:
1. Check system resources (CPU, Memory)
2. Restart both servers
3. Try with smaller test file first
4. Check browser developer tools for errors

## 🔄 Quick Reset Commands

### Restart Everything:
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Restart backend
cd backend && npm run dev

# Restart frontend (new terminal)
cd frontend && npm run dev
```

### Clear All Data:
```bash
# Clear uploaded files
rm -rf backend/uploads/*

# Clear browser cache
# Ctrl + Shift + Delete in browser
```

## 📞 Still Having Issues?

### Check These Files:
1. `backend/error.log` - Backend errors
2. `backend/server_error.log` - Server errors
3. Browser Console (F12) - Frontend errors

### Test Files Available:
- `quick_test.csv` - Minimal test (3 rows)
- `sample_cv_data.csv` - Full test (15 rows)
- `Company_Issues.csv` - Company data test
- `People_Issues.csv` - People data test

### Expected Results:
- Quality Score: 80-95%
- Issues Found: 2-10 (depending on test data)
- Corrections: 5-15 AI suggestions
- Processing Time: < 5 seconds for test files