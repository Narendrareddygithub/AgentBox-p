-- AgentBox v3.0 - Real-time Channels Configuration
-- Phase 1: Foundation & Test Infrastructure  
-- Date: 2025-10-26

-- Enable real-time for all tables that need streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sandboxes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tools;

-- Create custom real-time channel configurations
-- These channels will be used for WebSocket streaming

-- Function to broadcast sandbox events
CREATE OR REPLACE FUNCTION public.broadcast_sandbox_event(
    p_sandbox_id TEXT,
    p_event_type TEXT,
    p_payload JSONB
)
RETURNS void AS $$
BEGIN
    -- This function will be called from Edge Functions to broadcast events
    PERFORM pg_notify(
        'sandbox_' || p_sandbox_id,
        json_build_object(
            'type', p_event_type,
            'payload', p_payload,
            'timestamp', extract(epoch from now())
        )::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast test events
CREATE OR REPLACE FUNCTION public.broadcast_test_event(
    p_tool_id UUID,
    p_test_session_id UUID,
    p_event_type TEXT,
    p_payload JSONB
)
RETURNS void AS $$
BEGIN
    PERFORM pg_notify(
        'test_' || p_test_session_id::text,
        json_build_object(
            'type', p_event_type,
            'tool_id', p_tool_id,
            'payload', p_payload,
            'timestamp', extract(epoch from now())
        )::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast task progress events
CREATE OR REPLACE FUNCTION public.broadcast_task_event(
    p_task_id UUID,
    p_event_type TEXT,
    p_payload JSONB
)
RETURNS void AS $$
BEGIN
    PERFORM pg_notify(
        'task_' || p_task_id::text,
        json_build_object(
            'type', p_event_type,
            'payload', p_payload,
            'timestamp', extract(epoch from now())
        )::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle real-time log insertion with immediate broadcast
CREATE OR REPLACE FUNCTION public.handle_realtime_log_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast the log entry immediately when inserted
    PERFORM public.broadcast_sandbox_event(
        NEW.sandbox_id,
        'log',
        json_build_object(
            'id', NEW.id,
            'log_type', NEW.log_type,
            'content', NEW.content,
            'metadata', NEW.metadata,
            'timestamp', extract(epoch from NEW.timestamp),
            'sequence_number', NEW.sequence_number,
            'source', NEW.source
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for real-time log broadcasting
CREATE TRIGGER trigger_broadcast_realtime_logs
    AFTER INSERT ON public.realtime_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_realtime_log_insert();

-- Function to handle test result updates with broadcasting
CREATE OR REPLACE FUNCTION public.handle_test_result_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast test result updates
    PERFORM public.broadcast_test_event(
        NEW.tool_id,
        NEW.test_session_id,
        'test_update',
        json_build_object(
            'id', NEW.id,
            'status', NEW.status,
            'total_tests', NEW.total_tests,
            'passed_tests', NEW.passed_tests,
            'failed_tests', NEW.failed_tests,
            'skipped_tests', NEW.skipped_tests,
            'coverage_percent', NEW.coverage_percent,
            'execution_time_ms', NEW.execution_time_ms,
            'completed_at', NEW.completed_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for test result broadcasting
CREATE TRIGGER trigger_broadcast_test_results
    AFTER INSERT OR UPDATE ON public.test_results
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_test_result_update();

-- Function to handle task progress updates with broadcasting
CREATE OR REPLACE FUNCTION public.handle_task_progress_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast task progress updates
    PERFORM public.broadcast_task_event(
        NEW.id,
        'progress_update',
        json_build_object(
            'id', NEW.id,
            'status', NEW.status,
            'total_steps', NEW.total_steps,
            'completed_steps', NEW.completed_steps,
            'current_action', NEW.current_action,
            'tools_used', NEW.tools_used,
            'tools_created', NEW.tools_created,
            'updated_at', NEW.updated_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for task progress broadcasting
CREATE TRIGGER trigger_broadcast_task_progress
    AFTER UPDATE ON public.tasks
    FOR EACH ROW
    WHEN (OLD.completed_steps != NEW.completed_steps OR 
          OLD.status != NEW.status OR 
          OLD.current_action != NEW.current_action)
    EXECUTE FUNCTION public.handle_task_progress_update();

-- Function to handle sandbox status updates
CREATE OR REPLACE FUNCTION public.handle_sandbox_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast sandbox status changes
    PERFORM public.broadcast_sandbox_event(
        NEW.e2b_sandbox_id,
        'status_update',
        json_build_object(
            'id', NEW.id,
            'e2b_sandbox_id', NEW.e2b_sandbox_id,
            'status', NEW.status,
            'boot_time_ms', NEW.boot_time_ms,
            'last_activity_at', NEW.last_activity_at,
            'metadata', NEW.metadata
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for sandbox status broadcasting
CREATE TRIGGER trigger_broadcast_sandbox_status
    AFTER INSERT OR UPDATE ON public.sandboxes
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.id IS NULL)
    EXECUTE FUNCTION public.handle_sandbox_status_update();

-- Function to clean up old real-time logs (keep only last 24 hours for performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_realtime_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.realtime_logs 
    WHERE timestamp < (NOW() - INTERVAL '24 hours');
    
    -- Log cleanup stats
    INSERT INTO public.realtime_logs (sandbox_id, log_type, content, source)
    VALUES (
        'system',
        'system',
        'Cleaned up old realtime logs older than 24 hours',
        'system'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule log cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-realtime-logs', '0 */6 * * *', 'SELECT public.cleanup_old_realtime_logs();');

-- Function to get real-time channel permissions for user
CREATE OR REPLACE FUNCTION public.can_access_channel(
    p_channel_name TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS boolean AS $$
DECLARE
    channel_prefix TEXT;
    entity_id TEXT;
BEGIN
    -- Extract channel type and entity ID from channel name
    -- Expected formats: sandbox_{sandbox_id}, test_{session_id}, task_{task_id}
    
    IF p_channel_name LIKE 'sandbox_%' THEN
        entity_id := substring(p_channel_name FROM 9); -- Remove 'sandbox_' prefix
        -- Check if user has access to any tasks using this sandbox
        RETURN EXISTS (
            SELECT 1 FROM public.sandboxes s
            JOIN public.tasks t ON t.sandbox_id = s.id
            WHERE s.e2b_sandbox_id = entity_id 
            AND t.user_id = p_user_id
        );
    
    ELSIF p_channel_name LIKE 'test_%' THEN
        entity_id := substring(p_channel_name FROM 6); -- Remove 'test_' prefix
        -- Check if user has access to test results for this session
        RETURN EXISTS (
            SELECT 1 FROM public.test_results tr
            WHERE tr.test_session_id::text = entity_id 
            AND tr.created_by = p_user_id
        );
    
    ELSIF p_channel_name LIKE 'task_%' THEN
        entity_id := substring(p_channel_name FROM 6); -- Remove 'task_' prefix
        -- Check if user owns this task
        RETURN EXISTS (
            SELECT 1 FROM public.tasks
            WHERE id::text = entity_id 
            AND user_id = p_user_id
        );
    
    ELSE
        -- Unknown channel format, deny access
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for real-time functions
GRANT EXECUTE ON FUNCTION public.broadcast_sandbox_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_test_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_task_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_channel TO authenticated;

-- Create indexes for real-time query performance
CREATE INDEX IF NOT EXISTS idx_realtime_logs_channel_lookup 
    ON public.realtime_logs(sandbox_id, timestamp DESC);
    
CREATE INDEX IF NOT EXISTS idx_test_results_session_lookup 
    ON public.test_results(test_session_id, status);
    
CREATE INDEX IF NOT EXISTS idx_tasks_realtime_lookup 
    ON public.tasks(id, user_id, status);