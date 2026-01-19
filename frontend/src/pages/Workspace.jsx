import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Upload as UploadIcon,
    FileText,
    Brain,
    Shield,
    Activity,
    ChevronRight,
    Settings,
    HelpCircle,
    LogOut,
    Search
} from 'lucide-react'
import Dashboard from './Dashboard'
import Upload from './Upload'
import Analysis from './Analysis'
import Reports from './Reports'
import AIInsights from './AIInsights'
import AIInsightsPanel from '../components/AIInsightsPanel'

const Workspace = () => {
    const { fileId: urlFileId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [activeModule, setActiveModule] = useState('dashboard')
    const [currentFileId, setCurrentFileId] = useState(urlFileId || null)
    const [showChat, setShowChat] = useState(false)

    // Sync active module with URL if needed, but for SPA feel we rely on internal state
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (urlFileId) {
            setActiveModule('analysis')
            setCurrentFileId(urlFileId)
        } else if (window.location.pathname.includes('/reports')) {
            setActiveModule('reports')
        } else if (window.location.pathname.includes('/upload')) {
            setActiveModule('upload')
        }
    }, [urlFileId, searchParams])

    const navigation = [
        { id: 'dashboard', name: 'Neural Hub', icon: BarChart3, color: 'text-indigo-600' },
        { id: 'upload', name: 'Data Ingestion', icon: UploadIcon, color: 'text-emerald-600' },
        { id: 'reports', name: 'Audit Vault', icon: FileText, color: 'text-blue-600' },
    ]

    const handleModuleChange = (module, id = null) => {
        setActiveModule(module)
        if (id) setCurrentFileId(id)

        // Update URL to maintain breadcrumbs but it's still an SPA
        if (module === 'dashboard') navigate('/')
        else if (module === 'upload') navigate('/upload')
        else if (module === 'reports') navigate('/reports')
        else if (module === 'analysis' && id) navigate(`/analysis/${id}`)
    }

    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard':
                return <Dashboard onNavigate={handleModuleChange} />
            case 'upload':
                return <Upload onAnalysisStart={(id) => handleModuleChange('analysis', id)} />
            case 'analysis':
                return <Analysis fileId={currentFileId} onBack={() => handleModuleChange('dashboard')} />
            case 'reports':
                return <Reports onNavigate={handleModuleChange} />
            case 'ai-insights':
                return <AIInsights />
            default:
                return <Dashboard onNavigate={handleModuleChange} />
        }
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
            {/* PERSISTENT SIDEBAR - Enterprise SPA Style */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl shadow-slate-200/50 z-20">
                <div className="p-8">
                    <div className="flex items-center space-x-3 group mb-12">
                        <div className="flex items-center justify-center w-10 h-10 bg-black rounded-xl shadow-lg shadow-black/10 group-hover:rotate-12 transition-transform duration-300">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-black leading-tight uppercase">DataSentry</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Intelligence.v2</span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-4">Command Center</p>
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = activeModule === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleModuleChange(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group ${active
                                        ? 'bg-black text-white shadow-xl shadow-black/20 translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                                        <span className="text-sm font-black tracking-tight">{item.name}</span>
                                    </div>
                                    {active && <ChevronRight className="w-4 h-4 opacity-50" />}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/50">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black">Neural Engine</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active & Secure</span>
                            </div>
                        </div>

                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-black transition-colors text-xs font-bold uppercase tracking-widest">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-widest">
                            <LogOut className="w-4 h-4" />
                            <span>Terminate</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN WORKSPACE AREA */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top bar for the Workspace */}
                <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-slate-100 rounded-xl">
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                            Operational Stream / <span className="text-black">{activeModule.toUpperCase()}</span>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Audit Search..."
                                className="bg-slate-100 border-none rounded-2xl py-2.5 pl-12 pr-6 text-xs font-bold focus:ring-2 ring-indigo-500/20 w-64 transition-all"
                            />
                        </div>
                        <div className="flex items-center -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 ring-1 ring-slate-100"></div>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Frame */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {renderModule()}
                    </div>
                </div>

                {/* Global Floating Actions/Status */}
                <div className="absolute bottom-8 right-8 flex flex-col items-end space-y-4">
                    {/* Floating Chat Modal */}
                    {showChat && (
                        <div className="w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 z-50">
                            <div className="p-6 border-b border-slate-50 bg-black text-white flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Brain className="h-5 w-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Neural Copilot</span>
                                </div>
                                <button
                                    onClick={() => setShowChat(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden p-4">
                                <AIInsightsPanel fileId={currentFileId} embedded={true} />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-5 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center space-x-3 ${showChat ? 'bg-black text-white' : 'bg-white text-indigo-600 border border-slate-100'}`}
                    >
                        {showChat ? <Activity className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                        {!showChat && <span className="text-xs font-black uppercase tracking-widest text-black">Ask AI</span>}
                    </button>

                    <button className="p-5 bg-white rounded-2xl shadow-2xl border border-slate-100 hover:scale-110 transition-transform text-indigo-600">
                        <HelpCircle className="h-6 h-6" />
                    </button>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
        </div>
    )
}

export default Workspace
