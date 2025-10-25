// AgentBox v3.0 - Dashboard Page
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 User Interface Requirements

import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Play, 
  Code, 
  Terminal, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Settings,
  LogOut,
  Zap,
  Eye
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeConnection } from '../hooks/useRealtimeConnection'
import { getUserTasks, getUserTools } from '../lib/supabase'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const { isConnected, connectionState, getConnectionStats } = useRealtimeConnection()
  
  // Fetch user tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => getUserTasks(user!.id),
    enabled: !!user?.id,
  })
  
  // Fetch user tools
  const { data: tools = [], isLoading: toolsLoading } = useQuery({
    queryKey: ['tools', user?.id],
    queryFn: () => getUserTools(user!.id),
    enabled: !!user?.id,
  })
  
  const stats = getConnectionStats()
  
  // Calculate dashboard metrics
  const metrics = {
    totalTasks: tasks.length,
    runningTasks: tasks.filter(t => t.status === 'running').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    failedTasks: tasks.filter(t => t.status === 'failed').length,
    totalTools: tools.length,
    readyTools: tools.filter(t => t.status === 'ready').length,
    testCoverageAvg: tools.length > 0 
      ? Math.round(tools.reduce((acc, t) => acc + t.test_coverage_percentage, 0) / tools.length)
      : 0,
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />
    }
  }
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-running'
      case 'completed':
        return 'status-completed'
      case 'failed':
        return 'status-failed'
      case 'pending':
        return 'status-pending'
      default:
        return 'status-indicator bg-slate-900/20 text-slate-400 border-slate-900/30'
    }
  }
  
  return (
    <div className="sidebar-layout">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AgentBox</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 text-white">
            <Terminal className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/sandbox" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <Play className="w-4 h-4" />
            Sandbox
          </Link>
          <Link to="/tools" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <Code className="w-4 h-4" />
            Tool Library
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || user?.email} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'Anonymous'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="mb-3 p-2 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse-connection' : 'bg-red-400'
              }`} />
              <span className="text-xs text-slate-300">
                {connectionState === 'connecting' ? 'Connecting...' :
                 isConnected ? 'Real-time Connected' : 'Disconnected'}
              </span>
            </div>
            {isConnected && (
              <div className="text-xs text-slate-400 space-y-1">
                <div>Uptime: {Math.floor(stats.uptime / 60)}m {stats.uptime % 60}s</div>
                <div>Latency: {stats.averageLatency}ms</div>
              </div>
            )}
          </div>
          
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 mt-1">
                Welcome back, {profile?.full_name || 'Developer'}! Ready to build some agents?
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/sandbox" 
                className="btn-default px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Task
              </Link>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="content-area space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 bg-blue-900/20 border-blue-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-300">{metrics.totalTasks}</p>
                  <p className="text-blue-400 text-sm">Total Tasks</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 bg-purple-900/20 border-purple-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-300">{metrics.totalTools}</p>
                  <p className="text-purple-400 text-sm">Tools Created</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 bg-green-900/20 border-green-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-300">{metrics.testCoverageAvg}%</p>
                  <p className="text-green-400 text-sm">Avg Coverage</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 bg-yellow-900/20 border-yellow-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{metrics.runningTasks}</p>
                  <p className="text-yellow-400 text-sm">Active Tasks</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Recent Tasks and Tools */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="card-title">Recent Tasks</h3>
                <p className="card-description">Your latest AI agent tasks and their status</p>
              </div>
              <div className="card-content">
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner w-6 h-6" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Terminal className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No tasks yet. Create your first task to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{task.title}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(task.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={getStatusClass(task.status)}>
                          {task.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <Link to="/sandbox" className="btn-outline px-4 py-2 w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Task
                </Link>
              </div>
            </motion.div>
            
            {/* Tool Library Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="card-title">Tool Library</h3>
                <p className="card-description">Your AI-generated tools and their test coverage</p>
              </div>
              <div className="card-content">
                {toolsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner w-6 h-6" />
                  </div>
                ) : tools.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Code className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No tools yet. Run a task to start building your library!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tools.slice(0, 5).map((tool) => (
                      <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <div className={`w-2 h-2 rounded-full ${
                          tool.status === 'ready' ? 'bg-green-400' :
                          tool.status === 'testing' ? 'bg-yellow-400' :
                          tool.status === 'failed' ? 'bg-red-400' :
                          'bg-slate-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{tool.name}</p>
                          <p className="text-xs text-slate-400">{tool.category}</p>
                        </div>
                        <div className="text-xs text-slate-300">
                          {tool.test_coverage_percentage}% coverage
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <Link to="/tools" className="btn-outline px-4 py-2 w-full flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View All Tools
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard