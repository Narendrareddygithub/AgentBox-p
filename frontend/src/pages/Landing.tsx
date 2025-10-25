// AgentBox v3.0 - Landing Page
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 Marketing Requirements

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Play, 
  Shield, 
  Zap, 
  Code, 
  TestTube, 
  Eye, 
  Github, 
  Mail,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { signInWithGitHub, signInWithGoogle, signInWithEmail } from '../lib/supabase'
import toast from 'react-hot-toast'

const Landing = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGitHub()
      toast.success('Redirecting to GitHub...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with GitHub')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toast.success('Redirecting to Google...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await signInWithEmail(email, password)
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg-1">
      {/* Header */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">AgentBox</span>
          <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full border border-purple-800/50">
            v3.0
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/docs" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            Documentation
          </Link>
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="btn-outline px-4 py-2"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="text-white">The First </span>
                <span className="text-gradient">Test-Driven</span>
                <br />
                <span className="text-gradient">AI Agent</span>
                <span className="text-white"> Platform</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Where AI agents autonomously create tools, execute complex tasks, and operate 
                within sandboxed environments—with <strong className="text-blue-400">every line of code</strong> validated 
                through comprehensive automated testing and <strong className="text-purple-400">every action</strong> streamed live.
              </p>
            </div>

            {/* Key Differentiators */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="card p-6 space-y-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/30"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <TestTube className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-300">80% Test Coverage</h3>
                <p className="text-slate-400">
                  <strong className="text-red-400">Zero tolerance</strong> for untested code. 
                  Every tool, every function, every edge case—comprehensively validated before execution.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="card p-6 space-y-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800/30"
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-purple-300">Radical Transparency</h3>
                <p className="text-slate-400">
                  Watch agents think, code, and test in <strong className="text-green-400">real-time</strong>. 
                  No mock progress bars—authentic live streaming of every terminal character.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="card p-6 space-y-4 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/30"
              >
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-300">Meta-Tooling Intelligence</h3>
                <p className="text-slate-400">
                  Agents possess <strong className="text-yellow-400">one meta-tool</strong> that dynamically generates 
                  any tool needed—and evolves their capabilities autonomously.
                </p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="pt-16 space-y-8"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">
                  Experience the Future of AI Development
                </h2>
                
                {/* Authentication Options */}
                {!showEmailForm ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                    <button
                      onClick={handleGitHubSignIn}
                      disabled={isLoading}
                      className="btn-default px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600"
                    >
                      {isLoading ? (
                        <div className="spinner w-4 h-4" />
                      ) : (
                        <Github className="w-4 h-4" />
                      )}
                      Continue with GitHub
                    </button>
                    
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="btn-outline px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="spinner w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Continue with Google
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSignIn} className="max-w-sm mx-auto space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input w-full"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input w-full"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-default px-6 py-2 flex-1 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <div className="spinner w-4 h-4" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="btn-ghost px-4 py-2"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
                
                <p className="text-sm text-slate-400">
                  Free during beta • No credit card required
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-24 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Built for the Future</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              AgentBox v3.0 represents a fundamental shift in how AI agents operate—
              prioritizing transparency, reliability, and autonomous evolution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Sandbox Security',
                description: 'E2B isolated environments with resource limits and network restrictions.',
                color: 'text-blue-400'
              },
              {
                icon: TestTube,
                title: 'Test-First Development',
                description: 'Unit, integration, functional, security, and performance tests—all automated.',
                color: 'text-green-400'
              },
              {
                icon: Eye,
                title: 'Real-Time Streaming',
                description: 'Character-by-character terminal output and live code generation visibility.',
                color: 'text-purple-400'
              },
              {
                icon: Code,
                title: 'Meta-Tool Creation',
                description: 'Agents build and evolve their own tool libraries dynamically.',
                color: 'text-yellow-400'
              },
              {
                icon: Zap,
                title: 'Performance Optimized',
                description: 'Sub-100ms streaming latency and intelligent caching systems.',
                color: 'text-cyan-400'
              },
              {
                icon: Play,
                title: 'Production Ready',
                description: 'Built with Supabase, React, and E2B for enterprise-grade reliability.',
                color: 'text-red-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card p-6 space-y-4 bg-slate-800/30 border-slate-700/50"
              >
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Code className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-medium">AgentBox v3.0</span>
          </div>
          
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing