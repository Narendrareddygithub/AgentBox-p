// AgentBox v3.0 - Authentication Hook
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 User Management Requirements

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile, createUserProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  profile: any | null
}

interface AuthActions {
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<Omit<AuthState, 'profile'>>({
    user: null,
    session: null,
    loading: true,
  })
  
  const queryClient = useQueryClient()
  
  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', authState.user?.id],
    queryFn: () => getUserProfile(authState.user!.id),
    enabled: !!authState.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user doesn't have a profile yet
      if (error?.code === 'PGRST116') {
        return false
      }
      return failureCount < 2
    },
  })
  
  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: createUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', authState.user?.id], data)
      toast.success('Profile created successfully!')
    },
    onError: (error: any) => {
      console.error('Failed to create profile:', error)
      toast.error('Failed to create profile. Please try again.')
    },
  })
  
  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setAuthState({
          session,
          user: session?.user || null,
          loading: false,
        })
        
        // Create profile if user exists but no profile
        if (session?.user && !profile && !profileLoading) {
          createProfileMutation.mutate({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
          })
        }
      }
    })
    
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'Not logged in')
      
      setAuthState({
        session,
        user: session?.user || null,
        loading: false,
      })
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success(`Welcome back, ${session.user.email}!`)
        
        // Refresh all queries when user signs in
        queryClient.invalidateQueries()
        
        // Create profile if it doesn't exist
        try {
          await getUserProfile(session.user.id)
        } catch (error: any) {
          if (error?.code === 'PGRST116') {
            // Profile doesn't exist, create it
            createProfileMutation.mutate({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            })
          }
        }
      }
      
      if (event === 'SIGNED_OUT') {
        toast('See you later!', { icon: '👋' })
        
        // Clear all cached data
        queryClient.clear()
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully')
      }
    })
    
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [profile, profileLoading, createProfileMutation, queryClient])
  
  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setAuthState({
        user: null,
        session: null,
        loading: false,
      })
      
      // Clear all cached queries
      queryClient.clear()
      
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }
  
  // Refresh session function
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setAuthState({
        session: data.session,
        user: data.user,
        loading: false,
      })
      
      return data
    } catch (error: any) {
      console.error('Refresh session error:', error)
      throw error
    }
  }
  
  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading || profileLoading,
    profile,
    signOut,
    refreshSession,
  }
}

// Hook for requiring authentication
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login or show login modal
      toast.error('Please sign in to access this feature.')
    }
  }, [auth.loading, auth.user])
  
  return auth
}

// Hook for checking if user has specific permissions
export function usePermissions() {
  const { profile } = useAuth()
  
  return {
    canCreateTools: profile?.total_tools_created < 50, // Max tools per user
    canRunTasks: true, // All users can run tasks
    isAdmin: profile?.email?.includes('@agentbox.dev'), // Simple admin check
    strictTestMode: profile?.strict_test_mode ?? true,
    testCoverageThreshold: profile?.test_coverage_threshold ?? 80,
  }
}