/**
 * AgentBox v3.0 - Supabase Client Configuration
 * Phase 1: Week 1 - Core Infrastructure Setup
 * 
 * Real-time enabled Supabase client with TypeScript support
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client with real-time enabled
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10 // Increased for real-time streaming
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'agentbox-v3.0-frontend'
      }
    }
  }
)

// Real-time channel management
export class RealtimeChannelManager {
  private channels = new Map<string, ReturnType<typeof supabase.channel>>()

  /**
   * Subscribe to a sandbox channel for real-time streaming
   */
  subscribeSandboxChannel(
    sandboxId: string,
    callbacks: {
      onLog?: (payload: any) => void
      onStatus?: (payload: any) => void
      onError?: (error: any) => void
    }
  ) {
    const channelName = `sandbox_${sandboxId}`
    
    if (this.channels.has(channelName)) {
      console.warn(`Channel ${channelName} already exists, unsubscribing first`)
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'log' }, (payload) => {
        callbacks.onLog?.(payload)
      })
      .on('broadcast', { event: 'status_update' }, (payload) => {
        callbacks.onStatus?.(payload)
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'realtime_logs',
        filter: `sandbox_id=eq.${sandboxId}`
      }, (payload) => {
        callbacks.onLog?.(payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to sandbox channel: ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to channel: ${channelName}`)
          callbacks.onError?.(new Error(`Channel subscription failed: ${channelName}`))
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to a test session channel for real-time test results
   */
  subscribeTestChannel(
    testSessionId: string,
    callbacks: {
      onTestUpdate?: (payload: any) => void
      onTestComplete?: (payload: any) => void
      onError?: (error: any) => void
    }
  ) {
    const channelName = `test_${testSessionId}`
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'test_update' }, (payload) => {
        callbacks.onTestUpdate?.(payload)
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'test_results',
        filter: `test_session_id=eq.${testSessionId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
          callbacks.onTestComplete?.(payload.new)
        } else {
          callbacks.onTestUpdate?.(payload.new)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to test channel: ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to test channel: ${channelName}`)
          callbacks.onError?.(new Error(`Test channel subscription failed: ${channelName}`))
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to a task channel for progress updates
   */
  subscribeTaskChannel(
    taskId: string,
    callbacks: {
      onProgress?: (payload: any) => void
      onComplete?: (payload: any) => void
      onError?: (error: any) => void
    }
  ) {
    const channelName = `task_${taskId}`
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'progress_update' }, (payload) => {
        callbacks.onProgress?.(payload)
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        if (payload.new.status === 'completed' || payload.new.status === 'failed') {
          callbacks.onComplete?.(payload.new)
        } else {
          callbacks.onProgress?.(payload.new)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to task channel: ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to task channel: ${channelName}`)
          callbacks.onError?.(new Error(`Task channel subscription failed: ${channelName}`))
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
      console.log(`🔌 Unsubscribed from channel: ${channelName}`)
    }
  }

  /**
   * Unsubscribe from all channels (cleanup)
   */
  unsubscribeAll() {
    for (const [channelName, channel] of this.channels) {
      channel.unsubscribe()
      console.log(`🔌 Unsubscribed from channel: ${channelName}`)
    }
    this.channels.clear()
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size
  }

  /**
   * Get list of active channel names
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }
}

// Global realtime channel manager instance
export const realtimeManager = new RealtimeChannelManager()

// Cleanup channels when window is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeManager.unsubscribeAll()
  })
}

// Auth helper functions
export const auth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    // Clean up realtime channels before signing out
    realtimeManager.unsubscribeAll()
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  /**
   * Get current user
   */
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default supabase