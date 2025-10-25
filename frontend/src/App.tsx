import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useRealtimeConnection } from './hooks/useRealtimeConnection'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Sandbox from './pages/Sandbox'
import ToolLibrary from './pages/ToolLibrary'
import Settings from './pages/Settings'

// Loading spinner component
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 ${sizeClasses[size]}`}
    />
  )
}

// Alert component for connection status
const Alert = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    {children}
  </div>
)

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
)

function App() {
  const { user, loading: authLoading } = useAuth()
  const { isConnected, connectionState, error, connect } = useRealtimeConnection()

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && user && connectionState === 'disconnected' && !error) {
      const timer = setTimeout(() => {
        connect()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, user, error, connect, connectionState])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <span className="text-slate-300 text-lg">Initializing AgentBox...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Real-time connection status alert */}
      {user && !isConnected && connectionState !== 'connecting' && (
        <Alert className="m-4 border-yellow-500 bg-yellow-900/20 text-yellow-300">
          <AlertDescription>
            {error 
              ? `Connection error: ${error}. Attempting to reconnect...`
              : 'Establishing real-time connection...'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main application routes */}
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />} 
        />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sandbox/:id?" element={<Sandbox />} />
            <Route path="/tools" element={<ToolLibrary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </div>
  )
}

export default App