# AgentBox v3.0 - Unit Tests for Sandbox Manager
# Phase 1: Foundation & Test Infrastructure
# Based on PRD v3.0 Testing Requirements (80% Coverage Mandatory)

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timedelta

# Import the module under test
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agent.core.sandbox_manager import SandboxManager, get_sandbox_manager


@pytest.fixture
def mock_e2b_sandbox():
    """Mock E2B sandbox for testing."""
    mock_sandbox = Mock()
    mock_sandbox.id = 'test-sandbox-123'
    mock_sandbox.close = AsyncMock()
    
    # Mock filesystem
    mock_filesystem = Mock()
    mock_filesystem.write = AsyncMock()
    mock_filesystem.read = AsyncMock(return_value='file content')
    mock_filesystem.list = AsyncMock(return_value=[])
    mock_sandbox.filesystem = mock_filesystem
    
    # Mock run method
    mock_result = Mock()
    mock_result.stdout = 'Command output'
    mock_result.stderr = ''
    mock_result.exit_code = 0
    mock_sandbox.run = AsyncMock(return_value=mock_result)
    
    return mock_sandbox


@pytest.fixture
def sandbox_manager():
    """Create a SandboxManager instance for testing."""
    return SandboxManager(api_key='test-api-key')


class TestSandboxManager:
    """Test suite for SandboxManager class.
    
    This test suite ensures 80% coverage as required by the PRD.
    """
    
    @pytest.mark.unit
    def test_sandbox_manager_initialization(self, sandbox_manager):
        """Test SandboxManager initialization."""
        assert sandbox_manager.api_key == 'test-api-key'
        assert sandbox_manager.template == 'Python3'
        assert isinstance(sandbox_manager.active_sandboxes, dict)
        assert len(sandbox_manager.active_sandboxes) == 0
        
        # Test default limits
        assert sandbox_manager.default_limits['max_execution_time'] == 300
        assert sandbox_manager.default_limits['max_memory_mb'] == 1024
        assert sandbox_manager.default_limits['max_sandboxes_per_user'] == 3
        assert sandbox_manager.default_limits['timeout_hours'] == 1
    
    @pytest.mark.unit
    @patch('agent.core.sandbox_manager.E2BPython3')
    async def test_create_sandbox_success(self, mock_e2b_class, sandbox_manager, mock_e2b_sandbox):
        """Test successful sandbox creation."""
        # Mock E2B sandbox creation
        mock_e2b_class.create.return_value = mock_e2b_sandbox
        
        user_id = 'test-user-123'
        task_id = 'test-task-456'
        
        result = await sandbox_manager.create_sandbox(user_id, task_id)
        
        # Verify sandbox creation
        assert result['id'] == 'test-sandbox-123'
        assert result['status'] == 'running'
        assert 'created_at' in result
        assert 'expires_at' in result
        
        # Verify sandbox is stored
        assert 'test-sandbox-123' in sandbox_manager.active_sandboxes
        sandbox_info = sandbox_manager.active_sandboxes['test-sandbox-123']
        assert sandbox_info['user_id'] == user_id
        assert sandbox_info['task_id'] == task_id
        assert sandbox_info['status'] == 'running'
    
    @pytest.mark.unit
    async def test_create_sandbox_user_limit_exceeded(self, sandbox_manager):
        """Test sandbox creation when user limit is exceeded."""
        user_id = 'test-user-123'
        
        # Pre-populate with maximum sandboxes
        for i in range(3):
            sandbox_manager.active_sandboxes[f'sandbox-{i}'] = {
                'user_id': user_id,
                'status': 'running'
            }
        
        # Attempt to create another sandbox
        with pytest.raises(ValueError, match='reached maximum sandbox limit'):
            await sandbox_manager.create_sandbox(user_id, 'task-123')
    
    @pytest.mark.unit
    async def test_execute_command_success(self, sandbox_manager, mock_e2b_sandbox):
        """Test successful command execution."""
        # Set up sandbox in manager
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'user_id': 'user-123',
            'task_id': 'task-456',
            'sandbox': mock_e2b_sandbox,
            'status': 'running',
            'stats': {
                'commands_executed': 0,
                'total_execution_time': 0,
            }
        }
        
        command = 'echo "Hello World"'
        result = await sandbox_manager.execute_command(sandbox_id, command)
        
        # Verify command execution
        assert result['success'] is True
        assert result['stdout'] == 'Command output'
        assert result['stderr'] == ''
        assert result['exit_code'] == 0
        assert result['execution_time'] > 0
        
        # Verify stats updated
        stats = sandbox_manager.active_sandboxes[sandbox_id]['stats']
        assert stats['commands_executed'] == 1
        assert stats['total_execution_time'] > 0
    
    @pytest.mark.unit
    async def test_execute_command_sandbox_not_found(self, sandbox_manager):
        """Test command execution with non-existent sandbox."""
        with pytest.raises(ValueError, match='Sandbox .* not found'):
            await sandbox_manager.execute_command('nonexistent', 'echo test')
    
    @pytest.mark.unit
    async def test_execute_command_sandbox_not_running(self, sandbox_manager, mock_e2b_sandbox):
        """Test command execution with stopped sandbox."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox,
            'status': 'terminated',
        }
        
        with pytest.raises(ValueError, match='Sandbox .* is not running'):
            await sandbox_manager.execute_command(sandbox_id, 'echo test')
    
    @pytest.mark.unit
    async def test_write_file_success(self, sandbox_manager, mock_e2b_sandbox):
        """Test successful file writing."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox,
            'stats': {'files_created': 0}
        }
        
        result = await sandbox_manager.write_file(sandbox_id, '/test.py', 'print("Hello")')
        
        assert result is True
        mock_e2b_sandbox.filesystem.write.assert_called_once_with('/test.py', 'print("Hello")')
        
        # Verify stats updated
        assert sandbox_manager.active_sandboxes[sandbox_id]['stats']['files_created'] == 1
    
    @pytest.mark.unit
    async def test_read_file_success(self, sandbox_manager, mock_e2b_sandbox):
        """Test successful file reading."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox
        }
        
        result = await sandbox_manager.read_file(sandbox_id, '/test.py')
        
        assert result == 'file content'
        mock_e2b_sandbox.filesystem.read.assert_called_once_with('/test.py')
    
    @pytest.mark.unit
    async def test_list_files_success(self, sandbox_manager, mock_e2b_sandbox):
        """Test successful file listing."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox
        }
        
        # Mock file list response
        mock_file = Mock()
        mock_file.name = 'test.py'
        mock_file.path = '/test.py'
        mock_file.is_dir = False
        mock_e2b_sandbox.filesystem.list.return_value = [mock_file]
        
        result = await sandbox_manager.list_files(sandbox_id)
        
        assert len(result) == 1
        assert result[0]['name'] == 'test.py'
        assert result[0]['path'] == '/test.py'
        assert result[0]['type'] == 'file'
    
    @pytest.mark.unit
    async def test_get_sandbox_stats(self, sandbox_manager):
        """Test sandbox statistics retrieval."""
        sandbox_id = 'test-sandbox-123'
        created_at = datetime.now()
        expires_at = created_at + timedelta(hours=1)
        
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'status': 'running',
            'created_at': created_at,
            'expires_at': expires_at,
            'stats': {
                'commands_executed': 5,
                'total_execution_time': 120.5
            },
            'limits': {
                'max_execution_time': 300,
                'max_memory_mb': 1024
            }
        }
        
        stats = await sandbox_manager.get_sandbox_stats(sandbox_id)
        
        assert stats['id'] == sandbox_id
        assert stats['status'] == 'running'
        assert stats['uptime_seconds'] >= 0
        assert stats['expires_in_seconds'] > 0
        assert stats['stats']['commands_executed'] == 5
        assert stats['limits']['max_execution_time'] == 300
    
    @pytest.mark.unit
    async def test_terminate_sandbox_success(self, sandbox_manager, mock_e2b_sandbox):
        """Test successful sandbox termination."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox,
            'status': 'running'
        }
        
        result = await sandbox_manager.terminate_sandbox(sandbox_id)
        
        assert result is True
        mock_e2b_sandbox.close.assert_called_once()
        
        # Verify status updated
        sandbox_info = sandbox_manager.active_sandboxes[sandbox_id]
        assert sandbox_info['status'] == 'terminated'
        assert 'terminated_at' in sandbox_info
    
    @pytest.mark.unit
    async def test_terminate_sandbox_not_found(self, sandbox_manager):
        """Test sandbox termination when sandbox doesn't exist."""
        result = await sandbox_manager.terminate_sandbox('nonexistent')
        assert result is False
    
    @pytest.mark.unit
    async def test_cleanup_expired_sandboxes(self, sandbox_manager, mock_e2b_sandbox):
        """Test cleanup of expired sandboxes."""
        # Create expired sandbox
        expired_sandbox_id = 'expired-sandbox'
        sandbox_manager.active_sandboxes[expired_sandbox_id] = {
            'sandbox': mock_e2b_sandbox,
            'status': 'running',
            'expires_at': datetime.now() - timedelta(hours=1)  # Expired 1 hour ago
        }
        
        # Create active sandbox
        active_sandbox_id = 'active-sandbox'
        sandbox_manager.active_sandboxes[active_sandbox_id] = {
            'sandbox': Mock(),
            'status': 'running',
            'expires_at': datetime.now() + timedelta(hours=1)  # Expires in 1 hour
        }
        
        cleaned_up = await sandbox_manager.cleanup_expired_sandboxes()
        
        assert cleaned_up == 1
        assert sandbox_manager.active_sandboxes[expired_sandbox_id]['status'] == 'terminated'
        assert sandbox_manager.active_sandboxes[active_sandbox_id]['status'] == 'running'
    
    @pytest.mark.unit
    def test_get_active_sandboxes_all(self, sandbox_manager):
        """Test getting all active sandboxes."""
        # Add test sandboxes
        sandbox_manager.active_sandboxes = {
            'sandbox-1': {'status': 'running', 'user_id': 'user-1'},
            'sandbox-2': {'status': 'terminated', 'user_id': 'user-2'},
            'sandbox-3': {'status': 'running', 'user_id': 'user-1'},
        }
        
        active = sandbox_manager.get_active_sandboxes()
        
        assert len(active) == 2  # Only running sandboxes
        assert 'sandbox-1' in active
        assert 'sandbox-3' in active
        assert 'sandbox-2' not in active
    
    @pytest.mark.unit
    def test_get_active_sandboxes_by_user(self, sandbox_manager):
        """Test getting active sandboxes filtered by user."""
        # Add test sandboxes
        sandbox_manager.active_sandboxes = {
            'sandbox-1': {'status': 'running', 'user_id': 'user-1'},
            'sandbox-2': {'status': 'running', 'user_id': 'user-2'},
            'sandbox-3': {'status': 'running', 'user_id': 'user-1'},
        }
        
        active = sandbox_manager.get_active_sandboxes('user-1')
        
        assert len(active) == 2
        assert 'sandbox-1' in active
        assert 'sandbox-3' in active
        assert 'sandbox-2' not in active


class TestSandboxManagerGlobal:
    """Test global sandbox manager functions."""
    
    @pytest.mark.unit
    @patch.dict('os.environ', {'E2B_API_KEY': 'test-global-key'})
    def test_get_sandbox_manager(self):
        """Test getting global sandbox manager instance."""
        # Reset global instance
        import agent.core.sandbox_manager
        agent.core.sandbox_manager._sandbox_manager = None
        
        manager = get_sandbox_manager()
        
        assert isinstance(manager, SandboxManager)
        assert manager.api_key == 'test-global-key'
        
        # Test singleton behavior
        manager2 = get_sandbox_manager()
        assert manager is manager2
    
    @pytest.mark.unit
    @patch.dict('os.environ', {}, clear=True)
    def test_get_sandbox_manager_no_api_key(self):
        """Test getting global sandbox manager without API key."""
        # Reset global instance
        import agent.core.sandbox_manager
        agent.core.sandbox_manager._sandbox_manager = None
        
        with pytest.raises(RuntimeError, match='E2B_API_KEY environment variable not set'):
            get_sandbox_manager()
    
    @pytest.mark.unit
    async def test_initialize_sandbox_manager(self):
        """Test initialization of global sandbox manager."""
        manager = await initialize_sandbox_manager('test-init-key', 'Python3')
        
        assert isinstance(manager, SandboxManager)
        assert manager.api_key == 'test-init-key'
        assert manager.template == 'Python3'


# ============================================
# PERFORMANCE TESTS
# ============================================

class TestSandboxManagerPerformance:
    """Performance tests for SandboxManager.
    
    These tests ensure the sandbox manager meets PRD performance requirements.
    """
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_sandbox_creation_performance(self, sandbox_manager, mock_e2b_sandbox):
        """Test sandbox creation performance (should be < 10 seconds per PRD)."""
        with patch('agent.core.sandbox_manager.E2BPython3') as mock_e2b_class:
            mock_e2b_class.create.return_value = mock_e2b_sandbox
            
            import time
            start_time = time.time()
            
            await sandbox_manager.create_sandbox('user-123', 'task-456')
            
            execution_time = time.time() - start_time
            
            # Should complete in under 10 seconds (PRD requirement)
            assert execution_time < 10.0
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_command_execution_performance(self, sandbox_manager, mock_e2b_sandbox):
        """Test command execution performance."""
        sandbox_id = 'test-sandbox-123'
        sandbox_manager.active_sandboxes[sandbox_id] = {
            'sandbox': mock_e2b_sandbox,
            'status': 'running',
            'stats': {'commands_executed': 0, 'total_execution_time': 0}
        }
        
        import time
        start_time = time.time()
        
        await sandbox_manager.execute_command(sandbox_id, 'echo test')
        
        execution_time = time.time() - start_time
        
        # Command execution should be fast
        assert execution_time < 5.0


# ============================================
# INTEGRATION TEST EXAMPLES
# ============================================

@pytest.mark.integration
class TestSandboxManagerIntegration:
    """Integration tests for SandboxManager with real-like scenarios.
    
    These tests verify that components work together correctly.
    """
    
    @pytest.mark.asyncio
    async def test_full_sandbox_lifecycle(self, sandbox_manager, mock_e2b_sandbox):
        """Test complete sandbox lifecycle from creation to termination."""
        with patch('agent.core.sandbox_manager.E2BPython3') as mock_e2b_class:
            mock_e2b_class.create.return_value = mock_e2b_sandbox
            
            user_id = 'integration-user'
            task_id = 'integration-task'
            
            # 1. Create sandbox
            result = await sandbox_manager.create_sandbox(user_id, task_id)
            sandbox_id = result['id']
            
            # 2. Execute multiple commands
            commands = ['ls', 'pwd', 'echo "Hello World"']
            for cmd in commands:
                cmd_result = await sandbox_manager.execute_command(sandbox_id, cmd)
                assert cmd_result['success'] is True
            
            # 3. Write and read files
            file_content = 'print("Integration test")'
            write_success = await sandbox_manager.write_file(sandbox_id, '/test.py', file_content)
            assert write_success is True
            
            read_content = await sandbox_manager.read_file(sandbox_id, '/test.py')
            assert read_content == 'file content'  # Mock returns this
            
            # 4. Get sandbox stats
            stats = await sandbox_manager.get_sandbox_stats(sandbox_id)
            assert stats['stats']['commands_executed'] == len(commands)
            assert stats['stats']['files_created'] == 1
            
            # 5. Terminate sandbox
            terminate_success = await sandbox_manager.terminate_sandbox(sandbox_id)
            assert terminate_success is True
            
            # Verify final state
            sandbox_info = sandbox_manager.active_sandboxes[sandbox_id]
            assert sandbox_info['status'] == 'terminated'


if __name__ == '__main__':
    # Run tests with coverage reporting
    import subprocess
    import sys
    
    cmd = [
        sys.executable, '-m', 'pytest', 
        __file__, 
        '-v',
        '--cov=agent.core.sandbox_manager',
        '--cov-report=term-missing',
        '--cov-report=html',
        '--cov-fail-under=80',  # Enforce 80% coverage
        '-m', 'unit'  # Run only unit tests by default
    ]
    
    print(f"Running tests with command: {' '.join(cmd)}")
    subprocess.run(cmd)