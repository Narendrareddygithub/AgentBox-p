import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import { useAuth } from './hooks/useAuth'
import { useRealtimeConnection } from './hooks/useRealtimeConnection'

// Lazy load components for better performance
const Landing = React.lazy(() => import('./pages/Landing'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Sandbox = React.lazy(() => import('./pages/Sandbox'))
const ToolLibrary = React.lazy(() => import('./pages/ToolLibrary'))
const Settings = React.lazy(() => import('./pages/Settings'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="text-slate-300 text-sm">Loading AgentBox...</p>
    </div>
  </div>
)

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-slate-900 to-red-900">
    <div className="text-center space-y-6 max-w-md p-8">
      <div className="text-6xl">❌</div>
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-200 text-sm font-mono">{error.message}</p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

// Connection status indicator
const ConnectionStatus = () => {
  const { isConnected, connectionState } = useRealtimeConnection()
  
  if (connectionState === 'connecting') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
        Connecting...
      </div>
    )
  }
  
  if (!isConnected && connectionState === 'disconnected') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        Disconnected
      </div>
    )
  }
  
  if (isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Real-time Connected
      </div>
    )
  }
  
  return null
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return (
    <>
      {children}
      <ConnectionStatus />
    </>
  )
}

// Main App component
function App() {
  const { user, loading: authLoading } = useAuth()
  
  // Show loading screen while checking authentication
  if (authLoading) {
    return <PageLoader />
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={reset}
            resetKeys={[user?.id]} // Reset error boundary when user changes
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    user ? <Navigate to="/dashboard" replace /> : <Landing />
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sandbox/:id?" 
                  element={
                    <ProtectedRoute>
                      <Sandbox />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tools" 
                  element={
                    <ProtectedRoute>
                      <ToolLibrary />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-slate-400">404</h1>
                        <p className="text-slate-300">Page not found</p>
                        <Navigate to={user ? "/dashboard" : "/"} replace />
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}

export default App