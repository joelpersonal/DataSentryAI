import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Loader,
  FileText,
  Eye,
  X,
  Copy,
  Check,
  Sparkles,
  Search,
  BarChart3,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  analyzeDataQuality,
  detectDuplicates,
  getFileInfo,
  exportCleanedData,
  getCleanedDataPreview,
  generateReport as fetchReport
} from '../services/api'
import IssuesTable from '../components/IssuesTable'
import DuplicatesView from '../components/DuplicatesView'
import AIInsightsPanel from '../components/AIInsightsPanel'

const Analysis = ({ fileId: propFileId, onBack }) => {
  const { fileId: paramsFileId } = useParams()
  const fileId = propFileId || paramsFileId
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [fileInfo, setFileInfo] = useState(null)
  const [qualityAnalysis, setQualityAnalysis] = useState(null)
  const [duplicateAnalysis, setDuplicateAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [exporting, setExporting] = useState(false)

  // Preview Modal States
  const [showPreview, setShowPreview] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)
  const [previewFormat, setPreviewFormat] = useState('json')
  const [copied, setCopied] = useState(false)

  // Report States
  const [reportLoading, setReportLoading] = useState(false)
  const [generatedReport, setGeneratedReport] = useState(null)

  useEffect(() => {
    if (fileId) {
      loadAnalysis()
    }
  }, [fileId])

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const [fileResponse, qualityResponse, duplicateResponse] = await Promise.all([
        getFileInfo(fileId),
        analyzeDataQuality(fileId),
        detectDuplicates(fileId)
      ])

      setFileInfo(fileResponse.info)
      setQualityAnalysis(qualityResponse.analysis)
      setDuplicateAnalysis(duplicateResponse.duplicates)

      toast.success('Analysis completed successfully')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to load analysis')
      navigate('/upload')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPreview = async (format = 'json') => {
    setPreviewFormat(format)
    setShowPreview(true)
    setPreviewLoading(true)
    try {
      const response = await getCleanedDataPreview(fileId, format)
      if (response.success) {
        setPreviewContent(response.data)
      } else {
        throw new Error('Failed to fetch preview')
      }
    } catch (error) {
      console.error('Preview error:', error)
      toast.error('Failed to load data preview')
      setShowPreview(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleExport = async (format = 'csv', removeDuplicates = false) => {
    setExporting(true)
    try {
      await exportCleanedData(fileId, format, removeDuplicates)
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleCopy = () => {
    const text = typeof previewContent === 'string'
      ? previewContent
      : JSON.stringify(previewContent, null, 2)

    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadReport = async () => {
    setReportLoading(true)
    try {
      const response = await fetchReport(fileId)
      if (response.success) {
        setGeneratedReport(response.report)
        // Link to download
        const blob = new Blob([response.report], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.filename || `QA_Report_${Date.now()}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded successfully')
      }
    } catch (error) {
      console.error('Report error:', error)
      toast.error('Failed to generate report')
    } finally {
      setReportLoading(false)
    }
  }

  const getQualityColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'issues', name: 'Issues', icon: AlertTriangle },
    { id: 'corrections', name: 'Corrections', icon: Sparkles },
    { id: 'duplicates', name: 'Duplicates', icon: Search },
    { id: 'ai-insights', name: 'AI Insights', icon: Brain },
    { id: 'reports', name: 'Reports', icon: FileText }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-100 rounded-full animate-ping opacity-25"></div>
          <div className="bg-white p-8 rounded-full shadow-2xl relative z-10 border border-slate-50">
            <Brain className="h-16 w-16 text-black" />
          </div>
        </div>
        <div className="mt-12 text-center max-w-sm">
          <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Diagnostics in Progress</h2>
          <div className="flex items-center justify-center space-x-2 text-slate-400 mb-8">
            <Loader className="h-4 w-4 animate-spin" />
            <span className="text-sm font-bold uppercase tracking-widest">Scanning structural patterns...</span>
          </div>
          <div className="h-1.5 w-64 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-black animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!fileInfo || !qualityAnalysis) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Analysis Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">The requested diagnostic report could not be located in our system.</p>
        <button onClick={onBack} className="btn-primary">
          Return to Workspace
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[3.5rem] p-10 mb-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
          <Brain className="h-64 w-64" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Neural Engine v2</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fileInfo.fileType === 'people' ? 'Persona Audit' : 'Firmographic Audit'}</span>
              </div>
              <h1 className="text-4xl font-black text-black tracking-tighter sm:text-5xl uppercase leading-none">
                {fileInfo.originalName.split('.')[0]}
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
                {fileInfo.rowCount.toLocaleString()} Total Records • {fileInfo.headers.length} Dimensions
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => loadAnalysis()}
                className="p-5 bg-slate-50 text-slate-400 hover:text-black hover:bg-slate-100 rounded-3xl transition-all border border-slate-200"
                title="Rerun Diagnostics"
              >
                <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleOpenPreview('csv')}
                className="px-8 py-5 bg-white text-black border-2 border-slate-100 hover:border-black rounded-3xl font-black text-sm uppercase tracking-widest transition-all flex items-center space-x-3"
              >
                <Eye className="h-5 w-5" />
                <span>Review Dataset</span>
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-10 py-5 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3"
              >
                {exporting ? <Loader className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                <span>Export Perfected</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-16">
        <button
          onClick={() => handleOpenPreview('csv')}
          className="btn-primary px-10 py-5 rounded-3xl shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all text-lg font-black"
        >
          <Eye className="h-6 w-6 mr-3" />
          Review Cleaned Dataset
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="px-8 pt-8 border-b border-slate-50">
              <nav className="flex space-x-12 justify-center">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-6 text-xs font-black uppercase tracking-[0.2em] flex items-center space-x-3 border-b-4 transition-all ${activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-slate-300 hover:text-slate-500'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-10">
              {activeTab === 'overview' && (
                <div className="space-y-12">
                  {/* Data Health Index */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BarChart3 className="h-32 w-32" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-end mb-10">
                        <div>
                          <h3 className="text-2xl font-black text-black tracking-tight mb-2">Data Quality Integrity</h3>
                          <p className="text-slate-500 font-medium">B2B Dataset Structural Assessment</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-7xl font-black tracking-tighter ${getQualityColor(qualityAnalysis.score)}`}>
                            {qualityAnalysis.score}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-12 shadow-inner">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${qualityAnalysis.score >= 80 ? 'bg-emerald-500' :
                            qualityAnalysis.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          style={{ width: `${qualityAnalysis.score}%` }}
                        />
                      </div>

                      {/* SPEC MANDATORY METRICS */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          { label: 'Processed', value: fileInfo.rowCount, icon: FileText, color: 'bg-slate-50 text-slate-600' },
                          { label: 'Missing Fields', value: qualityAnalysis.missingFields || 0, icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
                          { label: 'Invalid Fields', value: qualityAnalysis.invalidFields || 0, icon: XCircle, color: 'bg-rose-50 text-rose-600' },
                          { label: 'Mapped Roles', value: qualityAnalysis.jobMappings || 0, icon: Brain, color: 'bg-indigo-50 text-indigo-600' },
                          { label: 'Duplicates', value: qualityAnalysis.duplicates || 0, icon: Search, color: 'bg-amber-50 text-amber-600' }
                        ].map((stat, i) => (
                          <div key={i} className={`${stat.color} p-6 rounded-[2rem] border border-current/5 transition-transform hover:scale-105`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <stat.icon className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                            </div>
                            <div className="text-xl font-black">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Issue Breakdown by Type (SPEC REQ) */}
                  <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/30">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 text-rose-500" />
                      Vulnerability Breakdown by Type
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Object.entries(qualityAnalysis.issuesByType || {}).map(([type, count], i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className={`w-2 h-2 rounded-full ${type === 'Missing Data' ? 'bg-rose-500' : type === 'Invalid Format' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{type}</p>
                            <p className="text-lg font-black text-black">{count}</p>
                          </div>
                        </div>
                      ))}
                      {(!qualityAnalysis.issuesByType || Object.keys(qualityAnalysis.issuesByType).length === 0) && (
                        <p className="col-span-full text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4 italic">No structural issues detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Explainable Status */}
                  <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200/50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                      <Shield className="h-3 w-3 mr-2" />
                      Protocol Interpretation
                    </h4>
                    <div className="grid grid-cols-1 md:md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <div className={`text-sm font-black uppercase tracking-tight ${qualityAnalysis.score >= 80 ? 'text-emerald-600' : 'text-slate-400'}`}>Green Protection (80+)</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Dataset is commercially viable with minimal structural variance detected.</p>
                      </div>
                      <div className="space-y-2">
                        <div className={`text-sm font-black uppercase tracking-tight ${qualityAnalysis.score >= 60 && qualityAnalysis.score < 80 ? 'text-amber-600' : 'text-slate-400'}`}>Yellow Review (60-80)</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Optimization required. Significant invalid or missing data points identified.</p>
                      </div>
                      <div className="space-y-2">
                        <div className={`text-sm font-black uppercase tracking-tight ${qualityAnalysis.score < 60 ? 'text-rose-600' : 'text-slate-400'}`}>Red Critical (&lt;60)</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Dataset integrity is compromised. Mandatory manual correction recommended.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'issues' && <IssuesTable issues={qualityAnalysis.issues} fieldStats={qualityAnalysis.fieldStats} />}
              {activeTab === 'corrections' && <CorrectionsTable corrections={qualityAnalysis.corrections} />}
              {activeTab === 'duplicates' && <DuplicatesView duplicates={duplicateAnalysis} />}
              {activeTab === 'ai-insights' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-100/30 overflow-hidden">
                    <div className="p-10 border-b border-slate-50 bg-indigo-50/30 flex items-center space-x-4">
                      <div className="p-4 bg-white rounded-3xl shadow-sm border border-indigo-100">
                        <Brain className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-black tracking-tight mb-1">Advanced Neural Diagnostics</h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Deep-learning structural assessment & strategy</p>
                      </div>
                    </div>
                    <div className="p-10">
                      <AIInsightsPanel fileId={fileId} analysisResults={qualityAnalysis} />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'reports' && (
                <div className="space-y-12">
                  <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <FileText className="h-24 w-24 text-slate-100" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-black tracking-tight mb-4">Official Diagnostic QA Report</h3>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-xl mb-8">
                        The AI engine has compiled a comprehensive structural and integrity report based on the real-time analysis of <span className="text-black font-black">{fileInfo.originalName}</span>.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                        {/* Overall Quality */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Integrity Benchmark</h4>
                          <div className="flex items-end space-x-3">
                            <span className={`text-6xl font-black tracking-tighter ${getQualityColor(qualityAnalysis.score)}`}>{qualityAnalysis.score}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-3">/ 100 Quality</span>
                          </div>
                        </div>

                        {/* Issue Breakdown */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vulnerability Matrix</h4>
                          <div className="space-y-3">
                            {Object.entries(qualityAnalysis.issuesByType || {}).map(([type, count], i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{type}</span>
                                <span className="text-sm font-black text-rose-600">{count}</span>
                              </div>
                            ))}
                            {(!qualityAnalysis.issuesByType || Object.keys(qualityAnalysis.issuesByType).length === 0) && (
                              <p className="text-xs text-slate-400 italic">No structural issues detected.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadReport}
                        disabled={reportLoading}
                        className="bg-black text-white px-10 py-5 rounded-[2rem] flex items-center space-x-4 font-black shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all group"
                      >
                        {reportLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 group-hover:translate-y-1 transition-transform" />}
                        <span>Download Professional QA Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Cleaned Data Output Section (Requested by user) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cleaned Dataset Output (AI Perfected)</h4>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleOpenPreview('json')}
                          className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          View Cleaned JSON
                        </button>
                        <button
                          onClick={() => handleOpenPreview('csv')}
                          className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          View Cleaned CSV
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        onClick={() => handleOpenPreview('csv')}
                        className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-emerald-200 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-emerald-50"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                            <FileText className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-black uppercase tracking-widest">CSV Cleaned Output</div>
                            <div className="text-[10px] font-bold text-slate-400">Standardized B2B Format</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Cleaned dataset containing corrected company names, normalized industries, and validated domains.
                        </p>
                      </div>

                      <div
                        onClick={() => handleOpenPreview('json')}
                        className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-indigo-50"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                            <Brain className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-black uppercase tracking-widest">JSON Neural Output</div>
                            <div className="text-[10px] font-bold text-slate-400">Structured Intelligence Object</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Developer-ready JSON object featuring all neural corrections, confidence scores, and issue descriptions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border border-slate-100 rounded-[2.5rem]">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Report Preview (Real-Time Diagnostics)</h4>
                    <pre className="p-8 bg-slate-50 rounded-3xl text-[11px] font-mono text-slate-600 border border-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {`DATASENTRY AI DIAGNOSTIC - CORE DATA METRICS\n--------------------------------------------\nSource: ${fileInfo.originalName}\nStatus: ALIGNED & VERIFIED\nIntegrity: ${qualityAnalysis.score}%\nCritical Issues: ${qualityAnalysis.issuesCount}\n\nStrategic Action Required:\n1. Apply neural casing for record standardization.\n2. De-duplicate structural parallels.\n3. Verify industry normalization mapping.`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-12">
          {/* Radial Score */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Integrity Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-48 w-48 transform -rotate-90">
                <circle className="text-slate-50" strokeWidth="12" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                <circle
                  className={getQualityColor(qualityAnalysis.score)}
                  strokeWidth="12"
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * qualityAnalysis.score) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="88"
                  cx="96"
                  cy="96"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-black tracking-tighter">{qualityAnalysis.score}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">/ 100</span>
              </div>
            </div>
          </div>

          {/* AI Panel - Hidden if AI Insights tab is already active */}
          {activeTab !== 'ai-insights' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden animate-in fade-in duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center justify-center space-x-3">
                <Brain className="h-6 w-6 text-indigo-600" />
                <h3 className="font-black text-black uppercase tracking-widest text-sm">AI Copilot</h3>
              </div>
              <div className="p-6">
                <AIInsightsPanel fileId={fileId} analysisResults={qualityAnalysis} embedded={true} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)} />

          <div className="relative bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-2xl font-black text-black tracking-tight">AI-Perfected Dataset Explorer</h3>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                      AI Verified
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural engines have optimized structural integrity and formatting</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="bg-slate-50 p-1.5 rounded-2xl flex">
                  <button
                    onClick={() => handleOpenPreview('json')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewFormat === 'json' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >JSON View</button>
                  <button
                    onClick={() => handleOpenPreview('csv')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewFormat === 'csv' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >CSV Raw</button>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-4 hover:bg-slate-100 rounded-2xl transition-all group"
                ><X className="h-6 w-6 text-slate-400 group-hover:text-black" /></button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-12 bg-slate-50/50">
              {previewLoading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-25"></div>
                    <div className="bg-white p-6 rounded-full shadow-2xl relative z-10 border border-slate-50">
                      <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-black mb-2 tracking-tight">Perfecting Dataset Output</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synapsing neural corrections & casing rules...</p>
                </div>
              ) : (
                <div className="relative group max-w-6xl mx-auto">
                  <div className="absolute -top-4 -left-4 px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl z-20">
                    Neural Standardized Output
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-4 bg-white/90 backdrop-blur shadow-xl rounded-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all z-10 border border-slate-100"
                  >
                    {copied ? <Check className="h-6 w-6 text-emerald-500" /> : <Copy className="h-6 w-6 text-slate-400" />}
                  </button>
                  {!previewContent || (Array.isArray(previewContent) && previewContent.length === 0) ? (
                    <div className="p-12 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No processed records available for preview</p>
                    </div>
                  ) : (
                    <pre className="p-12 bg-white border border-slate-200 rounded-[3rem] text-sm font-mono text-slate-600 leading-loose overflow-x-auto shadow-2xl shadow-slate-200/50">
                      {typeof previewContent === 'string'
                        ? previewContent
                        : JSON.stringify(previewContent, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Integrity Optimized</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Format: {previewFormat.toUpperCase()}</span>
              </div>
              <div className="flex space-x-6 items-center">
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                >Maybe Later</button>
                <button
                  onClick={() => handleExport(previewFormat)}
                  disabled={exporting}
                  className="bg-black text-white px-12 py-5 rounded-[2rem] flex items-center space-x-4 font-black shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all text-sm group"
                >
                  <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                  <span>Export Perfected {previewFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CorrectionsTable = ({ corrections }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = corrections.filter(c => {
    const matchesSearch = !searchTerm ||
      c.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.original.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.suggestion.toString().toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || c.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-black tracking-tight">Neural Healing Stream</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">AI-powered field corrections & standardizations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search fixes..."
                className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold w-48 focus:ring-2 ring-indigo-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-50 border-none rounded-2xl py-3 px-6 text-xs font-black uppercase tracking-widest focus:ring-2 ring-indigo-500/20"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Fixes</option>
              <option value="formatting">Formatting</option>
              <option value="normalization">Normalization</option>
              <option value="mapping">Role Mapping</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Row</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Field</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">In (Raw)</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Out (Perfected)</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 pl-4 font-mono text-[11px] text-slate-400">#{c.row}</td>
                  <td className="py-6 font-black text-xs text-black uppercase tracking-tight">{c.field}</td>
                  <td className="py-6 text-xs text-slate-400 line-through decoration-rose-300 opacity-60">{c.original}</td>
                  <td className="py-6 font-bold text-xs text-emerald-600">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-3 w-3" />
                      <span>{c.suggestion}</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.confidence * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-900">{(c.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-help" title={c.explanation}>
                      {c.type}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No corrections identified in this stream.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analysis