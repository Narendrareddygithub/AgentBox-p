// AgentBox v3.0 - Real-time Connection Hook
// Phase 1: Foundation & Test Infrastructure  
// Based on PRD v3.0 Real-time Transparency Requirements

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js'

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

interface RealtimeConnectionState {
  isConnected: boolean
  connectionState: ConnectionState
  lastHeartbeat: Date | null
  reconnectAttempts: number
  latency: number
  error: string | null
}

interface RealtimeConnectionActions {
  connect: () => void
  disconnect: () => void
  sendHeartbeat: () => Promise<boolean>
  getConnectionStats: () => {
    uptime: number
    messagesSent: number
    messagesReceived: number
    averageLatency: number
  }
}

export function useRealtimeConnection(): RealtimeConnectionState & RealtimeConnectionActions {
  const [state, setState] = useState<RealtimeConnectionState>({
    isConnected: false,
    connectionState: 'disconnected',
    lastHeartbeat: null,
    reconnectAttempts: 0,
    latency: 0,
    error: null,
  })
  
  // Connection stats
  const statsRef = useRef({
    connectedAt: null as Date | null,
    messagesSent: 0,
    messagesReceived: 0,
    latencies: [] as number[],
  })
  
  // Heartbeat interval
  const heartbeatRef = useRef<NodeJS.Timeout>()
  const channelRef = useRef<RealtimeChannel | null>(null)
  
  // Connect to Supabase Realtime
  const connect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }
    
    setState(prev => ({
      ...prev,
      connectionState: 'connecting',
      error: null,
    }))
    
    // Create a dedicated channel for connection monitoring
    const channel = supabase.channel('connection-monitor', {
      config: {
        presence: { key: 'connection-status' },
        broadcast: { self: true, ack: true },
      },
    })
    
    channelRef.current = channel
    
    // Handle connection events
    channel
      .on('system', {}, (payload) => {
        console.log('🔌 Realtime system event:', payload)
        
        if (payload.event === 'connected') {
          setState(prev => ({
            ...prev,
            isConnected: true,
            connectionState: 'connected',
            reconnectAttempts: 0,
            error: null,
          }))
          
          statsRef.current.connectedAt = new Date()
          
          // Start heartbeat monitoring
          startHeartbeat()
        }
        
        if (payload.event === 'disconnected') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionState: 'disconnected',
          }))
          
          stopHeartbeat()
        }
      })
      .on('broadcast', { event: 'heartbeat-response' }, (payload) => {
        const now = Date.now()
        const sentAt = payload.payload.sentAt
        const latency = now - sentAt
        
        statsRef.current.messagesReceived++
        statsRef.current.latencies.push(latency)
        
        // Keep only last 10 latency measurements
        if (statsRef.current.latencies.length > 10) {
          statsRef.current.latencies.shift()
        }
        
        setState(prev => ({
          ...prev,
          lastHeartbeat: new Date(),
          latency,
        }))
      })
      .subscribe((status, err) => {
        console.log('🔌 Realtime subscription status:', status, err)
        
        if (status === 'SUBSCRIBED') {
          setState(prev => ({
            ...prev,
            isConnected: true,
            connectionState: 'connected',
            error: null,
          }))
        }
        
        if (status === 'CHANNEL_ERROR') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionState: 'error',
            error: err?.message || 'Channel error',
          }))
          
          // Auto-reconnect after delay
          setTimeout(() => {
            if (prev.reconnectAttempts < 5) {
              setState(current => ({
                ...current,
                reconnectAttempts: current.reconnectAttempts + 1,
              }))
              connect()
            }
          }, Math.min(1000 * Math.pow(2, prev.reconnectAttempts), 30000))
        }
        
        if (status === 'TIMED_OUT') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionState: 'disconnected',
            error: 'Connection timed out',
          }))
        }
        
        if (status === 'CLOSED') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionState: 'disconnected',
          }))
          
          stopHeartbeat()
        }
      })
  }, [])
  
  // Disconnect from Supabase Realtime
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
    
    stopHeartbeat()
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionState: 'disconnected',
      error: null,
    }))
    
    statsRef.current.connectedAt = null
  }, [])
  
  // Send heartbeat to measure latency
  const sendHeartbeat = useCallback(async (): Promise<boolean> => {
    if (!channelRef.current || !state.isConnected) {
      return false
    }
    
    try {
      const sentAt = Date.now()
      
      const response: RealtimeChannelSendResponse = await channelRef.current.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: { sentAt },
      })
      
      statsRef.current.messagesSent++
      
      return response === 'ok'
    } catch (error) {
      console.error('❤️ Heartbeat failed:', error)
      return false
    }
  }, [state.isConnected])
  
  // Start heartbeat monitoring
  const startHeartbeat = useCallback(() => {
    stopHeartbeat() // Clear any existing heartbeat
    
    heartbeatRef.current = setInterval(async () => {
      const success = await sendHeartbeat()
      
      if (!success) {
        setState(prev => ({
          ...prev,
          error: 'Heartbeat failed',
        }))
      }
    }, 30000) // Every 30 seconds
  }, [sendHeartbeat])
  
  // Stop heartbeat monitoring
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = undefined
    }
  }, [])
  
  // Get connection statistics
  const getConnectionStats = useCallback(() => {
    const now = Date.now()
    const connectedAt = statsRef.current.connectedAt?.getTime() || now
    const uptime = now - connectedAt
    
    const averageLatency = statsRef.current.latencies.length > 0
      ? statsRef.current.latencies.reduce((a, b) => a + b, 0) / statsRef.current.latencies.length
      : 0
    
    return {
      uptime: Math.floor(uptime / 1000), // seconds
      messagesSent: statsRef.current.messagesSent,
      messagesReceived: statsRef.current.messagesReceived,
      averageLatency: Math.round(averageLatency),
    }
  }, [])
  
  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])
  
  // Monitor connection health
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isConnected && state.lastHeartbeat) {
        const timeSinceLastHeartbeat = Date.now() - state.lastHeartbeat.getTime()
        
        // If no heartbeat for 2 minutes, consider connection stale
        if (timeSinceLastHeartbeat > 120000) {
          setState(prev => ({
            ...prev,
            error: 'Connection appears stale',
            connectionState: 'error',
          }))
          
          // Try to reconnect
          connect()
        }
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [state.isConnected, state.lastHeartbeat, connect])
  
  return {
    ...state,
    connect,
    disconnect,
    sendHeartbeat,
    getConnectionStats,
  }
}

// Hook for subscribing to specific real-time events
export function useRealtimeSubscription<T = any>({
  channel,
  event,
  callback,
  enabled = true,
}: {
  channel: string
  event: string
  callback: (payload: T) => void
  enabled?: boolean
}) {
  const [subscriptionState, setSubscriptionState] = useState<{
    isSubscribed: boolean
    error: string | null
  }>({
    isSubscribed: false,
    error: null,
  })
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  
  useEffect(() => {
    if (!enabled) {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      return
    }
    
    const realtimeChannel = supabase.channel(channel)
    channelRef.current = realtimeChannel
    
    realtimeChannel
      .on('postgres_changes', { event: event as any, schema: 'public' }, callback)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setSubscriptionState({ isSubscribed: true, error: null })
        } else if (status === 'CHANNEL_ERROR') {
          setSubscriptionState({ 
            isSubscribed: false, 
            error: err?.message || 'Subscription error' 
          })
        }
      })
    
    return () => {
      realtimeChannel.unsubscribe()
    }
  }, [channel, event, callback, enabled])
  
  return subscriptionState
}