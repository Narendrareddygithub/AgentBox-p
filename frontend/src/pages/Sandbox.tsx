// AgentBox v3.0 - Sandbox Page
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 Real-time Transparency Requirements

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Play, 
  Square, 
  FileText, 
  Folder, 
  Terminal as TerminalIcon, 
  Code, 
  Save, 
  Upload,
  Download,
  Trash2,
  Settings,
  Eye,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeConnection, useRealtimeSubscription } from '../hooks/useRealtimeConnection'
import { createTask, createSandbox, getUserTasks } from '../lib/supabase'
import toast from 'react-hot-toast'

const Sandbox = () => {
  const { id: sandboxId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isConnected } = useRealtimeConnection()
  const queryClient = useQueryClient()
  
  // Terminal setup
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  
  // State
  const [isRunning, setIsRunning] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  
  // Stats
  const [sandboxStats, setSandboxStats] = useState({
    uptime: 0,
    commandsExecuted: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  })
  
  // Fetch user tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => getUserTasks(user!.id),
    enabled: !!user?.id,
  })
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully!')
      setShowTaskCreator(false)
      setTaskTitle('')
      setTaskDescription('')
      
      // Navigate to the new task's sandbox
      if (data.sandbox_id) {
        navigate(`/sandbox/${data.sandbox_id}`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task')
    },
  })
  
  // Create sandbox mutation
  const createSandboxMutation = useMutation({
    mutationFn: createSandbox,
    onSuccess: (data) => {
      toast.success('Sandbox created successfully!')
      navigate(`/sandbox/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sandbox')
    },
  })
  
  // Real-time log subscription
  useRealtimeSubscription({
    channel: `sandbox-logs:${sandboxId}`,
    event: 'INSERT',
    callback: (payload: any) => {
      if (terminal.current && payload.source === 'terminal') {
        const data = payload.data || payload.message
        if (payload.level === 'error') {
          terminal.current.write(`\r\n\x1b[31m${data}\x1b[0m`)
        } else {
          terminal.current.write(data)
        }
      }
    },
    enabled: !!sandboxId && isConnected
  })
  
  // Initialize terminal
  useEffect(() => {
    if (terminalRef.current && !terminal.current) {
      // Create terminal instance
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#0f172a',
          foreground: '#10b981',
          cursor: '#10b981',
          selection: '#374151',
        },
        allowProposedApi: true,
      })
      
      // Add addons
      fitAddon.current = new FitAddon()
      terminal.current.loadAddon(fitAddon.current)
      terminal.current.loadAddon(new WebLinksAddon())
      
      // Open terminal
      terminal.current.open(terminalRef.current)
      fitAddon.current.fit()
      
      // Welcome message
      terminal.current.writeln('\x1b[32mAgentBox v3.0 - AI Agent Sandbox\x1b[0m')
      terminal.current.writeln('\x1b[36mReal-time transparent code execution environment\x1b[0m')
      terminal.current.writeln('')
      
      if (sandboxId) {
        terminal.current.writeln(`\x1b[33mConnected to sandbox: ${sandboxId}\x1b[0m`)
      } else {
        terminal.current.writeln('\x1b[33mNo active sandbox. Create a task to get started.\x1b[0m')
      }
      terminal.current.writeln('')
      terminal.current.write('$ ')
      
      // Handle input
      terminal.current.onData((data) => {
        if (data === '\r') {
          // Enter key - execute command
          if (currentCommand.trim()) {
            executeCommand(currentCommand.trim())
            setCurrentCommand('')
          }
          terminal.current?.write('\r\n$ ')
        } else if (data === '\x7f') {
          // Backspace
          if (currentCommand.length > 0) {
            setCurrentCommand(prev => prev.slice(0, -1))
            terminal.current?.write('\b \b')
          }
        } else {
          // Regular character
          setCurrentCommand(prev => prev + data)
          terminal.current?.write(data)
        }
      })
      
      // Handle resize
      const handleResize = () => {
        if (fitAddon.current) {
          fitAddon.current.fit()
        }
      }
      
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        terminal.current?.dispose()
        terminal.current = null
      }
    }
  }, [sandboxId])
  
  // Execute command in sandbox
  const executeCommand = async (command: string) => {
    if (!sandboxId) {
      terminal.current?.writeln('\r\n\x1b[31mNo active sandbox. Create a task first.\x1b[0m')
      return
    }
    
    setIsRunning(true)
    terminal.current?.writeln('')
    
    try {
      // In a real implementation, this would call the E2B API
      // For now, we'll simulate command execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock command responses
      const responses: { [key: string]: string } = {
        'ls': 'agent.py\ttest_agent.py\trequirements.txt\tREADME.md',
        'pwd': '/home/sandbox',
        'whoami': 'sandbox',
        'python --version': 'Python 3.11.0',
        'pip list': 'Package    Version\n----------  -------\npytest     7.4.3\ncoverage   7.3.2\ne2b        0.13.1',
      }
      
      const output = responses[command] || `Command executed: ${command}`
      terminal.current?.writeln(`\x1b[32m${output}\x1b[0m`)
      
      // Update stats
      setSandboxStats(prev => ({
        ...prev,
        commandsExecuted: prev.commandsExecuted + 1,
      }))
      
    } catch (error) {
      terminal.current?.writeln(`\x1b[31mError: ${error}\x1b[0m`)
    } finally {
      setIsRunning(false)
    }
  }
  
  // Handle task creation
  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      // First create the sandbox
      const sandbox = await createSandboxMutation.mutateAsync({
        user_id: user!.id,
        e2b_sandbox_id: `sandbox-${Date.now()}`,
        template: 'Python3',
        status: 'creating',
      })
      
      // Then create the task
      await createTaskMutation.mutateAsync({
        user_id: user!.id,
        sandbox_id: sandbox.id,
        title: taskTitle,
        description: taskDescription,
        requirements: [],
        status: 'pending',
      })
      
    } catch (error) {
      console.error('Task creation error:', error)
    }
  }
  
  return (
    <div className="sidebar-layout">
      {/* Left Panel - Task & File Explorer */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-3">Sandbox Environment</h2>
          
          <button
            onClick={() => setShowTaskCreator(true)}
            className="btn-default w-full py-2 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            New Task
          </button>
        </div>
        
        {/* Recent Tasks */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Tasks</h3>
          
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => task.sandbox_id && navigate(`/sandbox/${task.sandbox_id}`)}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'running' ? 'bg-blue-400' :
                    task.status === 'completed' ? 'bg-green-400' :
                    task.status === 'failed' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* File Explorer */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Files</h3>
          
          <div className="space-y-1">
            {files.length === 0 ? (
              <p className="text-xs text-slate-500">No files in sandbox</p>
            ) : (
              files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedFile(file.path)}
                >
                  {file.type === 'directory' ? (
                    <Folder className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-300">{file.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">
                {sandboxId ? `Sandbox: ${sandboxId.slice(0, 8)}...` : 'Sandbox Environment'}
              </h1>
              
              {sandboxId && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(sandboxStats.uptime / 60)}m {sandboxStats.uptime % 60}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TerminalIcon className="w-4 h-4" />
                    <span>{sandboxStats.commandsExecuted} commands</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Eye className="w-4 h-4" />
                  Real-time Connected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <Eye className="w-4 h-4" />
                  Disconnected
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Terminal */}
        <div className="flex-1 flex flex-col">
          <div 
            ref={terminalRef} 
            className="flex-1 bg-slate-900"
            style={{ minHeight: '400px' }}
          />
          
          {/* Terminal Footer */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>AgentBox Terminal v3.0</span>
              {isRunning && (
                <div className="flex items-center gap-2">
                  <div className="spinner w-3 h-3" />
                  <span>Executing command...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {sandboxId && (
                <>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>CPU: {sandboxStats.cpuUsage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    <span>Memory: {sandboxStats.memoryUsage}MB</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Creator Modal */}
      {showTaskCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what you want the AI agent to accomplish..."
                  rows={4}
                  className="input w-full resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending || createSandboxMutation.isPending}
                className="btn-default flex-1 flex items-center justify-center gap-2"
              >
                {(createTaskMutation.isPending || createSandboxMutation.isPending) ? (
                  <div className="spinner w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Create Task
              </button>
              <button
                onClick={() => setShowTaskCreator(false)}
                className="btn-ghost px-4 py-2"
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

export default Sandbox