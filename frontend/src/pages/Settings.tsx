// AgentBox v3.0 - Settings Page
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 User Preferences Requirements

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, 
  Shield, 
  TestTube, 
  Zap, 
  Eye, 
  Bell, 
  Download, 
  Trash2,
  Save,
  Key,
  Database,
  Monitor,
  Settings as SettingsIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeConnection } from '../hooks/useRealtimeConnection'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, profile, signOut } = useAuth()
  const { isConnected, getConnectionStats } = useRealtimeConnection()
  const queryClient = useQueryClient()
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    test_coverage_threshold: profile?.test_coverage_threshold || 80,
    strict_test_mode: profile?.strict_test_mode ?? true,
    enable_real_time_streaming: profile?.enable_real_time_streaming ?? true,
    max_sandboxes: 3,
    sandbox_timeout_hours: 1,
  })
  
  const [activeTab, setActiveTab] = useState('profile')
  
  // Stats
  const connectionStats = getConnectionStats()
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      // This would call supabase to update profile
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return updates
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Settings saved successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })
  
  const handleSave = async () => {
    await updateProfileMutation.mutateAsync(formData)
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'testing', label: 'Testing', icon: TestTube },
    { id: 'streaming', label: 'Real-time', icon: Eye },
    { id: 'sandbox', label: 'Sandbox', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
  ]
  
  return (
    <div className="sidebar-layout">
      {/* Sidebar - Settings Navigation */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Settings</span>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
        
        {/* Connection Info */}
        <div className="mt-auto p-4 border-t border-slate-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse-connection' : 'bg-red-400'
              }`} />
              <span className="text-sm text-slate-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {isConnected && (
              <div className="text-xs text-slate-400 space-y-1">
                <div>Uptime: {Math.floor(connectionStats.uptime / 60)}m {connectionStats.uptime % 60}s</div>
                <div>Latency: {connectionStats.averageLatency}ms</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab} Settings</h1>
              <p className="text-slate-400 mt-1">
                Configure your AgentBox preferences and behavior
              </p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="btn-default px-6 py-2 flex items-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <div className="spinner w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </header>
        
        {/* Settings Content */}
        <div className="content-area">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input w-full bg-slate-700 text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      className="input w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <div>
                      <div className="text-sm font-medium text-slate-300">Account Type</div>
                      <div className="text-xs text-slate-500">Developer (Beta)</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-300">Member Since</div>
                      <div className="text-xs text-slate-500">
                        {profile?.account_created_at 
                          ? new Date(profile.account_created_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{profile?.total_tasks_run || 0}</div>
                    <div className="text-sm text-slate-400">Tasks Run</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{profile?.total_tools_created || 0}</div>
                    <div className="text-sm text-slate-400">Tools Created</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'testing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Coverage Requirements</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Minimum Coverage Threshold
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={formData.test_coverage_threshold}
                        onChange={(e) => handleInputChange('test_coverage_threshold', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <span className="text-lg font-semibold text-white">{formData.test_coverage_threshold}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tools below this threshold will be rejected. PRD requirement: 80% minimum.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-300">Strict Test Mode</div>
                      <div className="text-xs text-slate-500">
                        Enforce test-first development (no code without tests)
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.strict_test_mode}
                        onChange={(e) => handleInputChange('strict_test_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Categories</h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'Unit Tests', description: '60% of test suite - Individual function testing', enabled: true },
                    { name: 'Integration Tests', description: '30% of test suite - Multi-component interactions', enabled: true },
                    { name: 'End-to-End Tests', description: '10% of test suite - Complete user workflows', enabled: true },
                    { name: 'Security Tests', description: 'Input validation and vulnerability scanning', enabled: true },
                    { name: 'Performance Tests', description: 'Load testing and resource usage validation', enabled: true },
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-slate-300">{category.name}</div>
                        <div className="text-xs text-slate-500">{category.description}</div>
                      </div>
                      <TestTube className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'streaming' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Real-time Transparency</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-300">Enable Real-time Streaming</div>
                      <div className="text-xs text-slate-500">
                        Stream all agent actions and terminal output live
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enable_real_time_streaming}
                        onChange={(e) => handleInputChange('enable_real_time_streaming', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Streaming Performance</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-400">{connectionStats.averageLatency}ms</div>
                    <div className="text-sm text-slate-400">Average Latency</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-blue-400">{connectionStats.messagesReceived}</div>
                    <div className="text-sm text-slate-400">Messages Received</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'sandbox' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sandbox Limits</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Maximum Concurrent Sandboxes
                    </label>
                    <select
                      value={formData.max_sandboxes}
                      onChange={(e) => handleInputChange('max_sandboxes', parseInt(e.target.value))}
                      className="input w-full"
                    >
                      <option value={1}>1 Sandbox</option>
                      <option value={3}>3 Sandboxes</option>
                      <option value={5}>5 Sandboxes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sandbox Timeout (Hours)
                    </label>
                    <select
                      value={formData.sandbox_timeout_hours}
                      onChange={(e) => handleInputChange('sandbox_timeout_hours', parseInt(e.target.value))}
                      className="input w-full"
                    >
                      <option value={1}>1 Hour</option>
                      <option value={2}>2 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={8}>8 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-300">Two-Factor Authentication</div>
                      <div className="text-xs text-slate-500">Add an extra layer of security to your account</div>
                    </div>
                    <button className="btn-outline px-4 py-2 text-sm">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-300">API Keys</div>
                      <div className="text-xs text-slate-500">Manage your API access keys</div>
                    </div>
                    <button className="btn-outline px-4 py-2 text-sm">
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card p-6 border-red-900/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-300">Delete Account</div>
                      <div className="text-xs text-slate-500">Permanently delete your account and all data</div>
                    </div>
                    <button className="btn-destructive px-4 py-2 text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings