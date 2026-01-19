# 📊 Custom Datasets Guide for DataSentry AI

## 🎯 How to Analyze Your Own Data

DataSentry AI is designed to work with **any CSV dataset** you have. Here's how to get the best results:

## 📁 Supported Dataset Types

### ✅ **Business Data**
- Employee records
- Customer databases
- Sales transactions
- Financial records
- Inventory data

### ✅ **Research Data**
- Survey responses
- Experimental results
- Market research
- Academic datasets
- Scientific measurements

### ✅ **Personal Data**
- Contact lists
- Personal finances
- Health records
- Project tracking
- Any structured data

## 🔧 Data Preparation Tips

### **CSV Format Requirements**
```csv
header1,header2,header3
value1,value2,value3
value4,value5,value6
```

### **Best Practices**
- ✅ First row should contain column headers
- ✅ Use descriptive header names (e.g., "email_address" not "col1")
- ✅ UTF-8 encoding recommended
- ✅ Maximum file size: 10MB
- ✅ Avoid special characters in headers

### **Header Naming for Smart Detection**
DataSentry AI automatically detects field types based on header names:

| **Field Type** | **Recommended Headers** | **Examples** |
|----------------|------------------------|--------------|
| Email | email, mail, email_address | john@company.com |
| Phone | phone, telephone, mobile | +1-555-0123 |
| Date | date, created_at, hire_date | 2023-01-15 |
| Name | name, first_name, last_name | John Smith |
| ID | id, user_id, customer_id | 12345 |
| Money | price, salary, amount, cost | 50000 |
| Address | address, street, city, zip | 123 Main St |

## 🚀 Step-by-Step Process

### **1. Prepare Your Data**
```bash
# Place your CSV files in the my-datasets folder
my-datasets/
├── your-data.csv
├── another-dataset.csv
└── README.md
```

### **2. Start DataSentry AI**
```bash
# Run the startup script
.\analyze-my-data.bat

# Or manually start servers
.\start-clean.bat
```

### **3. Upload and Analyze**
1. Open http://localhost:5173
2. Click "Upload Data"
3. Drag & drop your CSV file
4. Click "Start Analysis"

## 📈 What You'll Get

### **Data Quality Analysis**
- **Quality Score**: Overall data health (0-100%)
- **Missing Values**: Empty or null fields
- **Invalid Formats**: Incorrect email, phone, date formats
- **Data Completeness**: Percentage of filled fields
- **Field Statistics**: Unique values, data types

### **Duplicate Detection**
- **Exact Matches**: Identical records
- **Fuzzy Matches**: Similar records (configurable threshold)
- **Similarity Scoring**: How similar records are (%)
- **Visual Grouping**: Easy-to-review duplicate clusters

### **Smart Validation**
- **Email Validation**: RFC-compliant email checking
- **Phone Validation**: International phone format support
- **Date Validation**: Multiple date format recognition
- **Name Validation**: Proper name format checking
- **Numeric Validation**: Range and format validation

### **AI-Powered Insights** (with OpenAI API key)
- **Job Title Mapping**: Standardize job functions
- **Industry Categorization**: Group similar industries
- **Data Cleaning Suggestions**: AI recommendations
- **Business Impact Analysis**: Cost of poor data quality

## 🎯 Example Use Cases

### **HR Department**
```csv
employee_id,first_name,last_name,email,phone,department,hire_date,salary
1,John,Smith,john@company.com,555-0101,Engineering,2023-01-15,75000
```
**Results**: Duplicate employees, invalid emails, salary outliers

### **Sales Team**
```csv
customer_id,company_name,contact_email,phone,industry,deal_amount,close_date
1,Tech Corp,contact@techcorp.com,555-0201,Technology,50000,2023-12-01
```
**Results**: Duplicate customers, invalid contacts, deal validation

### **Marketing Data**
```csv
lead_id,name,email,source,campaign,conversion_date,value
1,Jane Doe,jane@example.com,Google Ads,Q4 Campaign,2023-11-15,1200
```
**Results**: Email deliverability, campaign effectiveness, lead quality

## 🔧 Advanced Features

### **Custom Validation Rules**
The system automatically detects and validates:
- Email addresses (RFC compliant)
- Phone numbers (international formats)
- Dates (multiple formats: YYYY-MM-DD, MM/DD/YYYY, etc.)
- URLs (proper format validation)
- Names (proper capitalization, length)
- Numeric values (range validation)

### **Configurable Duplicate Detection**
```javascript
// Adjust similarity threshold
threshold: 0.8  // 80% similarity required
```

### **Export Options**
- **Original CSV**: Your data as-is
- **Cleaned CSV**: Issues fixed, duplicates removed
- **JSON Format**: For API integration
- **Analysis Report**: Detailed quality metrics

## 🎊 Pro Tips for Best Results

### **1. Clean Headers**
```csv
# Good
first_name,last_name,email_address,phone_number

# Avoid
col1,col2,col3,col4
```

### **2. Consistent Formats**
```csv
# Good - consistent date format
hire_date
2023-01-15
2023-02-20

# Avoid - mixed formats
hire_date
01/15/2023
Feb 20, 2023
```

### **3. Meaningful Data**
```csv
# Good - real email addresses
email
john.smith@company.com
jane.doe@company.com

# Avoid - placeholder data
email
test@test.com
example@example.com
```

## 🚨 Troubleshooting

### **Common Issues**
- **File too large**: Split into smaller files (<10MB)
- **Encoding issues**: Save as UTF-8
- **Parse errors**: Check for unescaped commas in data
- **No analysis**: Ensure headers are in first row

### **Getting Help**
1. Check the browser console for errors
2. Verify CSV format is correct
3. Try with sample data first
4. Ensure servers are running

## 🎯 Success Metrics

After analysis, you'll see:
- **Quality Score**: Target 80%+ for good data
- **Issues Found**: Specific problems to fix
- **Duplicates**: Exact count and similarity
- **Recommendations**: AI-powered next steps

Your data analysis results will help you:
- ✅ Improve data collection processes
- ✅ Identify data quality issues early
- ✅ Reduce manual data cleaning time
- ✅ Make data-driven decisions confidently

## 🎉 Ready to Analyze Your Data?

1. **Place your CSV files** in `my-datasets/` folder
2. **Run**: `.\analyze-my-data.bat`
3. **Upload** your files at http://localhost:5173
4. **Get insights** in seconds!

DataSentry AI will automatically adapt to your data structure and provide relevant insights for your specific use case.