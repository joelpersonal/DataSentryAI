# DataSentry AI - Professional Data Quality Platform

A full-featured web application for CSV data quality analysis, cleaning, and AI-powered insights.

## 🚀 Features

- **Smart CSV Upload & Parsing** - Drag & drop CSV files with instant preview
- **AI-Powered Data Cleaning** - Intelligent suggestions with confidence scores
- **Duplicate Detection** - Advanced fuzzy matching algorithms
- **Job Title Mapping** - AI-driven job function categorization
- **Quality Scoring** - Comprehensive data quality metrics
- **Interactive Reports** - Visual charts and detailed analytics
- **AI Copilot Chat** - Business insights and recommendations
- **Export Options** - Download cleaned CSV or JSON

## 🛠 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Vite
- **Backend**: Node.js + Express + Multer
- **AI**: OpenAI GPT-4 API
- **Charts**: Recharts
- **CSV Processing**: PapaParse
- **Duplicate Detection**: Fuse.js
- **Deployment**: Vercel

## 🎨 Design Theme

Professional B2B enterprise design with:
- Primary: #1F2937 (Dark Slate Gray)
- Secondary: #3B82F6 (Blue Accent)
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Error: #EF4444 (Red)
- Background: #F9FAFB (Light Gray)

## 📁 Project Structure

```
datasentry-ai/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API calls and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Core services
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper functions
│   ├── uploads/            # Temporary file storage
│   └── package.json
├── sample-data/            # Test CSV files
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key

### 1. Clone and Setup
```bash
# Create project directory
mkdir datasentry-ai && cd datasentry-ai

# Setup backend
cd backend
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Setup frontend
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Run Development Servers
```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

### 3. Open Application
Visit `http://localhost:5173` in your browser

## 🌐 Deployment (Vercel)

### Backend Deployment
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `OPENAI_API_KEY=your_key_here`
4. Deploy backend first

### Frontend Deployment
1. Update `VITE_API_URL` in frontend/.env
2. Deploy frontend
3. Both will be live on Vercel free tier

## 📊 Sample Data

Use the provided sample CSV files in `sample-data/` to test all features:
- `employees.csv` - Employee data with duplicates
- `customers.csv` - Customer data with quality issues
- `sales.csv` - Sales data for mapping testing

## 🏆 Hackathon Features

- **AI Copilot**: Interactive chat for business insights
- **Confidence Scoring**: ML-powered quality metrics
- **Real-time Processing**: Instant feedback and suggestions
- **Professional UI**: Enterprise-ready design
- **Export Options**: Multiple output formats

## 📝 License

MIT License - Perfect for hackathon use and beyond!