// AgentBox v3.0 - Tool Library Page
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 Meta-Tooling Requirements

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Code, 
  Play, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  Target,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeConnection } from '../hooks/useRealtimeConnection'
import { getUserTools, createTool, updateTool } from '../lib/supabase'
import toast from 'react-hot-toast'

const ToolLibrary = () => {
  const { user } = useAuth()
  const { isConnected } = useRealtimeConnection()
  const queryClient = useQueryClient()
  
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: 'utility',
    source_code: '',
  })
  
  // Fetch tools
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools', user?.id],
    queryFn: () => getUserTools(user!.id),
    enabled: !!user?.id,
  })
  
  // Create tool mutation
  const createToolMutation = useMutation({
    mutationFn: createTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      toast.success('Tool created successfully!')
      setShowCreateModal(false)
      resetNewTool()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create tool')
    },
  })
  
  // Update tool mutation
  const updateToolMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateTool(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      toast.success('Tool updated successfully!')
      setSelectedTool(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tool')
    },
  })
  
  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })
  
  // Calculate statistics
  const stats = {
    total: tools.length,
    ready: tools.filter(t => t.status === 'ready').length,
    testing: tools.filter(t => t.status === 'testing').length,
    failed: tools.filter(t => t.status === 'failed').length,
    avgCoverage: tools.length > 0 
      ? Math.round(tools.reduce((acc, t) => acc + t.test_coverage_percentage, 0) / tools.length)
      : 0,
    highCoverage: tools.filter(t => t.test_coverage_percentage >= 80).length,
  }
  
  // Get categories
  const categories = Array.from(new Set(tools.map(t => t.category)))
  
  const resetNewTool = () => {
    setNewTool({
      name: '',
      description: '',
      category: 'utility',
      source_code: '',
    })
  }
  
  const handleCreateTool = async () => {
    if (!newTool.name.trim() || !newTool.description.trim() || !newTool.source_code.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    
    await createToolMutation.mutateAsync({
      user_id: user!.id,
      name: newTool.name,
      description: newTool.description,
      category: newTool.category,
      source_code: newTool.source_code,
      status: 'creating',
    })
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'testing':
        return <TestTube className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'creating':
        return <Clock className="w-4 h-4 text-blue-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />
    }
  }
  
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-400'
    if (coverage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  const getCoverageBgColor = (coverage: number) => {
    if (coverage >= 80) return 'bg-green-900/20 border-green-800/30'
    if (coverage >= 60) return 'bg-yellow-900/20 border-yellow-800/30'
    return 'bg-red-900/20 border-red-800/30'
  }
  
  return (
    <div className="sidebar-layout">
      {/* Sidebar - Tool Categories & Stats */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Tool Library</span>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-default w-full py-2 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Tool
          </button>
        </div>
        
        {/* Statistics */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Library Stats</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-lg font-semibold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400">Total Tools</div>
            </div>
            
            <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-green-300">{stats.ready}</div>
              <div className="text-xs text-green-400">Ready</div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-blue-300">{stats.avgCoverage}%</div>
              <div className="text-xs text-blue-400">Avg Coverage</div>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-purple-300">{stats.highCoverage}</div>
              <div className="text-xs text-purple-400">High Coverage</div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Filters</h3>
          
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="ready">Ready</option>
                <option value="testing">Testing</option>
                <option value="failed">Failed</option>
                <option value="creating">Creating</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="mt-auto p-6 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse-connection' : 'bg-red-400'
            }`} />
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Real-time Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Tool Library</h1>
              <p className="text-slate-400 mt-1">Manage your AI-generated tools and monitor test coverage</p>
            </div>
            
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        </header>
        
        {/* Tool Grid */}
        <div className="content-area">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="spinner w-8 h-8" />
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-20">
              <Code className="w-16 h-16 mx-auto mb-6 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No tools match your filters' 
                  : 'No tools yet'
                }
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first tool to get started with meta-tooling'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-default px-6 py-2 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Tool
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-6 hover:border-slate-600 transition-colors cursor-pointer ${
                    getCoverageBgColor(tool.test_coverage_percentage)
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tool.status)}
                      <div>
                        <h3 className="font-semibold text-white">{tool.name}</h3>
                        <p className="text-xs text-slate-400 capitalize">{tool.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        getCoverageColor(tool.test_coverage_percentage)
                      }`}>
                        {tool.test_coverage_percentage}%
                      </div>
                      <div className="text-xs text-slate-400">Coverage</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <TestTube className="w-3 h-3" />
                        <span>{tool.passing_tests}/{tool.total_tests} tests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        <span>{tool.usage_count} uses</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      v{tool.version}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="progress">
                      <div 
                        className={`progress-bar ${
                          tool.test_coverage_percentage >= 80 ? 'bg-green-500' :
                          tool.test_coverage_percentage >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${tool.test_coverage_percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Tool Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Create New Tool</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    value={newTool.name}
                    onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., data_processor"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newTool.category}
                    onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="utility">Utility</option>
                    <option value="data_processing">Data Processing</option>
                    <option value="web_scraping">Web Scraping</option>
                    <option value="analysis">Analysis</option>
                    <option value="automation">Automation</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTool.description}
                  onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this tool does and how it should work..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Source Code
                </label>
                <textarea
                  value={newTool.source_code}
                  onChange={(e) => setNewTool(prev => ({ ...prev, source_code: e.target.value }))}
                  placeholder="def my_tool_function():\n    # Tool implementation\n    return result"
                  rows={10}
                  className="input w-full font-mono text-sm resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTool}
                disabled={createToolMutation.isPending}
                className="btn-default flex-1 flex items-center justify-center gap-2"
              >
                {createToolMutation.isPending ? (
                  <div className="spinner w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Create Tool
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetNewTool()
                }}
                className="btn-ghost px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ToolLibrary