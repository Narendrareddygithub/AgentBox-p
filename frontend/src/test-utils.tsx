// AgentBox v3.0 - React Testing Utilities
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 Testing Requirements (80% Coverage Mandatory)

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    }),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        })
      })
    })
  }),
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
    unsubscribe: vi.fn(),
    send: vi.fn().mockResolvedValue('ok')
  }),
  realtime: {
    setAuth: vi.fn()
  }
}

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
  getUserProfile: vi.fn().mockResolvedValue({}),
  createUserProfile: vi.fn().mockResolvedValue({}),
  getUserTasks: vi.fn().mockResolvedValue([]),
  getUserTools: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockResolvedValue({}),
  createTool: vi.fn().mockResolvedValue({}),
  signInWithEmail: vi.fn().mockResolvedValue({}),
  signInWithGitHub: vi.fn().mockResolvedValue({}),
  signInWithGoogle: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue({}),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Test authentication context
interface MockAuthContextType {
  user: any
  profile: any
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const mockAuthContext: MockAuthContextType = {
  user: null,
  profile: null,
  loading: false,
  signOut: vi.fn().mockResolvedValue(undefined),
  refreshSession: vi.fn().mockResolvedValue(undefined),
}

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  useRequireAuth: () => mockAuthContext,
  usePermissions: () => ({
    canCreateTools: true,
    canRunTasks: true,
    isAdmin: false,
    strictTestMode: true,
    testCoverageThreshold: 80,
  })
}))

// Mock real-time connection hook
vi.mock('../hooks/useRealtimeConnection', () => ({
  useRealtimeConnection: () => ({
    isConnected: true,
    connectionState: 'connected' as const,
    lastHeartbeat: new Date(),
    reconnectAttempts: 0,
    latency: 50,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendHeartbeat: vi.fn().mockResolvedValue(true),
    getConnectionStats: () => ({
      uptime: 300,
      messagesSent: 10,
      messagesReceived: 8,
      averageLatency: 45,
    })
  }),
  useRealtimeSubscription: () => ({
    isSubscribed: true,
    error: null
  })
}))

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  user?: any
  profile?: any
  initialEntries?: string[]
}

function customRender(
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    user = null,
    profile = null,
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Update mock auth context
  mockAuthContext.user = user
  mockAuthContext.profile = profile
  mockAuthContext.loading = false

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Helper function to render with authenticated user
function renderWithAuth(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@agentbox.dev',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  }

  const mockProfile = {
    id: 'test-user-id',
    email: 'test@agentbox.dev',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    test_coverage_threshold: 80,
    strict_test_mode: true,
    enable_real_time_streaming: true,
    total_tasks_run: 5,
    total_tools_created: 3,
  }

  return customRender(ui, {
    user: mockUser,
    profile: mockProfile,
    ...options,
  })
}

// Test data factories
export const createMockTask = (overrides = {}) => ({
  id: 'task-123',
  user_id: 'test-user-id',
  title: 'Test Task',
  description: 'A test task for unit testing',
  status: 'pending',
  progress_percentage: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sandbox: {
    id: 'sandbox-123',
    e2b_sandbox_id: 'e2b-123',
    status: 'running',
    template: 'Python3'
  },
  ...overrides,
})

export const createMockTool = (overrides = {}) => ({
  id: 'tool-123',
  user_id: 'test-user-id',
  name: 'test_tool',
  description: 'A test tool for unit testing',
  version: '1.0.0',
  source_code: 'def test_function():\\n    return "Hello, World!"',
  category: 'utility',
  status: 'ready',
  test_coverage_percentage: 85,
  total_tests: 10,
  passing_tests: 10,
  usage_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tool_tests: [],
  ...overrides,
})

export const createMockLog = (overrides = {}) => ({
  id: 'log-123',
  task_id: 'task-123',
  level: 'info',
  message: 'Test log message',
  data: {},
  source: 'terminal',
  timestamp: new Date().toISOString(),
  ...overrides,
})

// Custom matchers for better test assertions
export function expectElementToHaveTestId(element: Element, testId: string) {
  expect(element).toHaveAttribute('data-testid', testId)
}

export function expectElementToBeVisible(element: Element) {
  expect(element).toBeVisible()
}

export function expectElementToBeHidden(element: Element) {
  expect(element).not.toBeVisible()
}

// Test coverage helpers
export function mockApiCall<T>(data: T, delay = 0) {
  return vi.fn().mockImplementation(() => 
    new Promise((resolve) => 
      setTimeout(() => resolve({ data, error: null }), delay)
    )
  )
}

export function mockApiError(error: string, delay = 0) {
  return vi.fn().mockImplementation(() =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: error } }), delay)
    )
  )
}

// Real-time streaming test helpers
export function mockRealtimeSubscription(events: any[] = []) {
  const callbacks: { [key: string]: Function[] } = {}
  
  return {
    on: vi.fn((event: string, callback: Function) => {
      if (!callbacks[event]) {
        callbacks[event] = []
      }
      callbacks[event].push(callback)
      return {
        subscribe: vi.fn(() => {
          // Simulate events after subscription
          setTimeout(() => {
            events.forEach(event => {
              const eventCallbacks = callbacks[event.type] || []
              eventCallbacks.forEach(cb => cb(event))
            })
          }, 10)
          return Promise.resolve({ status: 'SUBSCRIBED' })
        })
      }
    }),
    unsubscribe: vi.fn(),
  }
}

// Performance testing helpers
export function measureRenderTime<T>(renderFn: () => T): { result: T; time: number } {
  const start = performance.now()
  const result = renderFn()
  const end = performance.now()
  
  return {
    result,
    time: end - start
  }
}

// Test environment setup
export function setupTestEnvironment() {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock WebSocket
  global.WebSocket = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
  }))

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Export everything
export * from '@testing-library/react'
export { customRender as render, renderWithAuth, setupTestEnvironment }
export { vi } from 'vitest'