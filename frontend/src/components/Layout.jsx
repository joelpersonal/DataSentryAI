import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Upload,
  FileText,
  Brain,
  Shield,
  Menu,
  X,
  Activity
} from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Upload Data', href: '/upload', icon: Upload },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Dashboard', href: '/', icon: BarChart3 },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans antialiased text-slate-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="flex items-center justify-center w-10 h-10 bg-black rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-black/10">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-black leading-tight">DATASENTRY</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">AI INTELLIGENCE</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 flex items-center space-x-2 ${active
                      ? 'bg-black text-white shadow-xl shadow-black/20 scale-105'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-black'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Side Info */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 transition-colors hover:bg-emerald-100">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">System Active</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xl transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-5 py-4 text-base font-bold rounded-2xl transition-all ${active
                      ? 'bg-black text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - Properly Centered */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto transition-all duration-500">
          {children}
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="flex items-center space-x-3 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-black tracking-[0.3em] uppercase">DATASENTRY AI</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} className="text-xs font-bold text-slate-400 hover:text-black transition-colors uppercase tracking-widest">
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-8 border-t border-slate-50 w-full max-w-xs text-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
                &copy; {new Date().getFullYear()} Advanced Engineering<br />
                Enterprise Systems Division
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout