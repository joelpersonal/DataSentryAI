import React, { useState, useEffect } from 'react'
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Brain,
  Zap,
  Loader,
  Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getAllAnalysisSummaries } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRows: 0,
    avgQualityScore: 0,
    issuesFound: 0
  })
  const [qualityTrend, setQualityTrend] = useState([])
  const [issueTypes, setIssueTypes] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await getAllAnalysisSummaries()
      if (response.success) {
        processSummaryData(response.summaries)
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load real-time dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const processSummaryData = (summaries) => {
    if (!summaries || summaries.length === 0) {
      setStats({ totalFiles: 0, totalRows: 0, avgQualityScore: 0, issuesFound: 0 })
      setQualityTrend([])
      setIssueTypes([])
      return
    }

    // 1. Calculate Aggregated Stats
    const totalFiles = summaries.length
    const totalRows = summaries.reduce((acc, s) => acc + (s.totalRecords || 0), 0)
    const avgQualityScore = Math.round(summaries.reduce((acc, s) => acc + (s.qualityScore || 0), 0) / totalFiles)
    const issuesFound = summaries.reduce((acc, s) => acc + (s.issuesCount || 0), 0)

    setStats({ totalFiles, totalRows, avgQualityScore, issuesFound })

    // 2. Process Quality Trend (Last 5 uploads)
    const trend = summaries
      .slice(-5)
      .map(s => ({
        name: s.fileName.length > 10 ? s.fileName.substring(0, 8) + '...' : s.fileName,
        score: s.qualityScore
      }))
    setQualityTrend(trend)

    // 3. Process Issue Distribution
    const totalMissing = summaries.reduce((acc, s) => acc + (s.missingFields || 0), 0)
    const totalInvalid = summaries.reduce((acc, s) => acc + (s.invalidFields || 0), 0)

    setIssueTypes([
      { name: 'Missing Fields', value: totalMissing || 1, color: '#EF4444' },
      { name: 'Invalid Data', value: totalInvalid || 1, color: '#F59E0B' },
      { name: 'Structural Paralels', value: Math.round(issuesFound * 0.1) || 1, color: '#3B82F6' },
      { name: 'Other', value: Math.round(issuesFound * 0.05) || 1, color: '#10B981' }
    ])
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-6 rounded-full shadow-2xl relative z-10 border border-slate-50">
          <Loader className="h-10 w-10 text-black animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Files Processed', value: stats.totalFiles, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Records', value: stats.totalRows.toLocaleString(), icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Quality Score', value: `${stats.avgQualityScore}%`, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Issues Detected', value: stats.issuesFound, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className="h-16 w-16" />
            </div>
            <div className={`inline-flex p-3 ${stat.bg} ${stat.color} rounded-2xl mb-6`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-1">Audit Score Progression</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quality score trend over last 5 files</p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="score" fill="#000000" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-1">Structural Integrity Loss</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribution of detected vulnerabilities</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {issueTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {issueTypes.map((type, index) => (
              <div key={index} className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div
                  className="w-2 h-2 rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: type.color }}
                />
                <span>{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-black p-12 rounded-[3.5rem] shadow-2xl shadow-black/20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Zap className="h-64 w-64 rotate-12" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tight mb-8 uppercase">Operational Command</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Upload Module', id: 'upload', icon: Upload, desc: 'Start Analysis' },
                { label: 'Report Vault', id: 'reports', icon: FileText, desc: 'View History' }
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(action.id)}
                  className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group text-left w-full"
                >
                  <action.icon className="h-10 w-10 text-white mb-6 group-hover:scale-110 transition-transform" />
                  <p className="font-black text-lg uppercase tracking-widest text-white">{action.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Diagnostic Feed */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-black uppercase tracking-widest">Diagnostic Feed</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
            {qualityTrend.length > 0 ? [...qualityTrend].reverse().map((item, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
                  <div className="w-0.5 h-full bg-slate-100 mt-2"></div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-black uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                    Processed: {item.fullTitle || item.name}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Score: {item.score}%
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <Clock className="h-8 w-8 mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Recent Streams</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard