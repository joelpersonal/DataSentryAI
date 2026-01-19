# My Custom Datasets

This folder contains your personal datasets for analysis with DataSentry AI.

## How to Add Your Data

1. **Copy your CSV files** to this folder
2. **Upload through the web interface** at http://localhost:5173
3. **Or reference them directly** in the application

## Supported Formats

- ✅ CSV files with headers
- ✅ UTF-8 encoding recommended
- ✅ Maximum file size: 10MB
- ✅ Any number of columns
- ✅ Any data types (text, numbers, dates, emails, etc.)

## What DataSentry AI Will Analyze

### Data Quality Metrics
- Missing values detection
- Email format validation
- Phone number validation
- Date format validation
- Data completeness scoring

### Duplicate Detection
- Exact matches
- Fuzzy matching (similar records)
- Configurable similarity thresholds
- Visual duplicate grouping

### AI-Powered Insights
- Job title standardization
- Industry categorization
- Data cleaning suggestions
- Business impact analysis

## Example Dataset Structure

Your CSV should have headers in the first row:
```csv
id,name,email,phone,department,hire_date
1,John Smith,john@company.com,555-0101,Engineering,2023-01-15
2,Jane Doe,jane@company.com,555-0102,Marketing,2023-02-20
```

## Getting Started

1. Place your CSV files in this folder
2. Open http://localhost:5173 in your browser
3. Upload your files through the web interface
4. View detailed analysis results