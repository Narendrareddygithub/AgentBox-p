-- AgentBox v3.0 - Initial Database Schema
-- Phase 1: Foundation & Test Infrastructure
-- Date: 2025-10-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tools library table - stores all agent-created tools
CREATE TABLE public.tools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'file_operations', 'web_scraping', 'data_analysis', etc.
    implementation TEXT NOT NULL, -- Python code implementation
    test_suite TEXT NOT NULL, -- Complete pytest test suite
    created_by UUID REFERENCES public.users(id),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Tool metadata
    metadata JSONB DEFAULT '{}',
    dependencies TEXT[], -- List of required packages
    security_rating TEXT DEFAULT 'unknown', -- 'safe', 'caution', 'dangerous'
    
    -- Performance metrics
    avg_execution_time_ms INTEGER,
    success_rate DECIMAL(5,2),
    
    UNIQUE(name, version)
);

-- Test results table - stores all test execution results
CREATE TABLE public.test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    sandbox_id TEXT NOT NULL,
    test_session_id UUID DEFAULT uuid_generate_v4(),
    
    -- Test execution details
    total_tests INTEGER NOT NULL,
    passed_tests INTEGER NOT NULL,
    failed_tests INTEGER NOT NULL,
    skipped_tests INTEGER NOT NULL,
    coverage_percent DECIMAL(5,2),
    
    -- Timing information
    execution_time_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Detailed results
    test_details JSONB DEFAULT '[]', -- Array of individual test results
    error_logs TEXT,
    coverage_report JSONB,
    
    -- Status tracking
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'timeout'
    created_by UUID REFERENCES public.users(id)
);

-- Sandboxes table - tracks active E2B sandbox instances
CREATE TABLE public.sandboxes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    e2b_sandbox_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    
    -- Sandbox configuration
    template TEXT DEFAULT 'python', 
    status TEXT DEFAULT 'initializing', -- 'initializing', 'running', 'stopped', 'error'
    
    -- Resource tracking
    cpu_limit TEXT DEFAULT '1000m',
    memory_limit TEXT DEFAULT '1Gi',
    disk_limit TEXT DEFAULT '10Gi',
    
    -- Timing
    boot_time_ms INTEGER,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Tasks table - tracks user tasks and agent executions
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    sandbox_id UUID REFERENCES public.sandboxes(id),
    
    -- Task details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
    
    -- Agent execution tracking
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    current_action TEXT,
    
    -- Tools used
    tools_used UUID[] DEFAULT '{}',
    tools_created UUID[] DEFAULT '{}',
    
    -- Results
    result JSONB,
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time logs table - stores all streaming logs
CREATE TABLE public.realtime_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sandbox_id TEXT NOT NULL,
    task_id UUID REFERENCES public.tasks(id),
    
    -- Log details
    log_type TEXT NOT NULL, -- 'stdout', 'stderr', 'test_result', 'agent_reasoning', 'code_generation'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Timing (critical for real-time streaming)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sequence_number BIGSERIAL,
    
    -- Source tracking
    source TEXT, -- 'agent', 'test_runner', 'sandbox', 'user'
    created_by UUID REFERENCES public.users(id)
);

-- Tool versions table - track tool evolution
CREATE TABLE public.tool_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    
    -- Version details
    implementation TEXT NOT NULL,
    test_suite TEXT NOT NULL,
    changelog TEXT,
    
    -- Migration tracking
    migrated_from INTEGER, -- Previous version number
    migration_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    UNIQUE(tool_id, version)
);

-- Indexes for performance
CREATE INDEX idx_tools_category ON public.tools(category);
CREATE INDEX idx_tools_created_by ON public.tools(created_by);
CREATE INDEX idx_tools_is_active ON public.tools(is_active);
CREATE INDEX idx_test_results_tool_id ON public.test_results(tool_id);
CREATE INDEX idx_test_results_status ON public.test_results(status);
CREATE INDEX idx_sandboxes_user_id ON public.sandboxes(user_id);
CREATE INDEX idx_sandboxes_status ON public.sandboxes(status);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_realtime_logs_sandbox_id ON public.realtime_logs(sandbox_id);
CREATE INDEX idx_realtime_logs_task_id ON public.realtime_logs(task_id);
CREATE INDEX idx_realtime_logs_timestamp ON public.realtime_logs(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_versions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Tools can be viewed by all authenticated users, but only created/updated by owner
CREATE POLICY "Authenticated users can view all tools" ON public.tools
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create tools" ON public.tools
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tools" ON public.tools
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Test results are viewable by tool creator and test runner
CREATE POLICY "Users can view test results for their tools" ON public.test_results
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.tools 
            WHERE tools.id = test_results.tool_id 
            AND tools.created_by = auth.uid()
        ) OR created_by = auth.uid()
    );

CREATE POLICY "Users can create test results" ON public.test_results
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Sandboxes belong to users
CREATE POLICY "Users can manage own sandboxes" ON public.sandboxes
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Tasks belong to users  
CREATE POLICY "Users can manage own tasks" ON public.tasks
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Realtime logs can be viewed by task owner
CREATE POLICY "Users can view logs for own tasks" ON public.realtime_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = realtime_logs.task_id 
            AND tasks.user_id = auth.uid()
        ) OR created_by = auth.uid()
    );

CREATE POLICY "System can create realtime logs" ON public.realtime_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Tool versions follow same rules as tools
CREATE POLICY "Users can view tool versions for accessible tools" ON public.tool_versions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.tools 
            WHERE tools.id = tool_versions.tool_id
        )
    );

CREATE POLICY "Users can create tool versions for own tools" ON public.tool_versions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tools 
            WHERE tools.id = tool_versions.tool_id 
            AND tools.created_by = auth.uid()
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();