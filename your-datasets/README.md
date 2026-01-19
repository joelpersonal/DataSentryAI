# 📊 Your Personal Datasets Folder

## 🎯 How to Use This Folder

This is your dedicated space to store and organize all your datasets for DataSentry AI analysis.

## 📁 Folder Structure

```
your-datasets/
├── README.md                 # This file
├── raw-data/                # Your original Word/Excel files
├── csv-files/               # Converted CSV files ready for analysis
├── processed/               # Analyzed datasets with results
└── templates/               # CSV templates for different data types
```

## 🚀 Quick Start Process

### Step 1: Add Your Data
1. **Copy your Word files** to the `raw-data/` folder
2. **Convert to CSV** (see instructions below)
3. **Place CSV files** in the `csv-files/` folder

### Step 2: Analyze
1. **Open DataSentry AI**: http://localhost:5173
2. **Upload CSV files** from `csv-files/` folder
3. **Get instant analysis** and insights

### Step 3: Results
- **View results** in the web interface
- **Export cleaned data** to `processed/` folder
- **Save analysis reports** for future reference

## 📄 Converting Word Files to CSV

### Method 1: Copy & Paste
1. Open your Word file
2. Select the table/data (Ctrl+A)
3. Copy (Ctrl+C)
4. Open Excel or Google Sheets
5. Paste (Ctrl+V)
6. Save as CSV to `csv-files/` folder

### Method 2: Direct Save from Word
1. Open Word file
2. File → Save As
3. Choose "CSV (Comma delimited)" format
4. Save to `csv-files/` folder

### Method 3: Use Online Converters
- Upload Word file to online Word-to-CSV converter
- Download CSV file
- Place in `csv-files/` folder

## ✅ CSV Format Requirements

Your CSV files should look like this:
```csv
header1,header2,header3,header4
value1,value2,value3,value4
value5,value6,value7,value8
```

### Best Practices:
- ✅ First row contains column headers
- ✅ Use descriptive header names
- ✅ No empty rows at the top
- ✅ Consistent data formats
- ✅ UTF-8 encoding

## 🎯 What DataSentry AI Will Analyze

### Automatic Detection
Based on your column headers, the system will automatically detect:
- **Email fields**: email, mail, email_address
- **Phone fields**: phone, mobile, telephone
- **Date fields**: date, created_at, hire_date
- **Name fields**: name, first_name, last_name
- **ID fields**: id, user_id, customer_id
- **Money fields**: salary, price, amount, cost

### Analysis Results
You'll get:
- **Quality Score**: Overall data health (0-100%)
- **Missing Values**: Count and percentage
- **Invalid Formats**: Specific validation errors
- **Duplicates**: Exact and fuzzy matches
- **Field Statistics**: Unique values, completeness
- **Export Options**: Cleaned CSV, JSON formats

## 📋 Common Dataset Types

### Employee Data
```csv
employee_id,first_name,last_name,email,phone,department,hire_date,salary
1,John,Smith,john@company.com,555-0101,Engineering,2023-01-15,75000
```

### Customer Data
```csv
customer_id,company_name,contact_email,phone,industry,registration_date
1,Tech Corp,contact@techcorp.com,555-0201,Technology,2023-01-15
```

### Sales Data
```csv
sale_id,customer_id,product,amount,sale_date,sales_rep
1,101,Software License,5000,2023-12-01,John Smith
```

### Survey Data
```csv
response_id,participant_name,email,age,rating,feedback_date
1,Jane Doe,jane@email.com,25,4,2023-11-15
```

## 🔧 Troubleshooting

### Common Issues:
- **File won't upload**: Check file size (<10MB)
- **Parse errors**: Ensure proper CSV format
- **No analysis**: Verify headers are in first row
- **Encoding issues**: Save as UTF-8

### Getting Help:
1. Check sample files in `templates/` folder
2. Verify CSV format matches examples
3. Try with smaller test files first
4. Ensure DataSentry AI servers are running

## 🎊 Success Tips

1. **Start Small**: Test with a few rows first
2. **Clean Headers**: Use descriptive, consistent names
3. **Check Format**: Ensure proper CSV structure
4. **Review Results**: Use insights to improve data quality
5. **Export Clean Data**: Save improved datasets

## 📞 Quick Commands

```bash
# Start DataSentry AI
.\analyze-my-data.bat

# Open website
http://localhost:5173

# Check if servers are running
netstat -an | findstr :3001
netstat -an | findstr :5173
```

Your datasets are now ready for professional data quality analysis! 🚀