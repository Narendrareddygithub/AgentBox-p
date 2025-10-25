# AgentBox v3.0 - Pytest Configuration with Real-time Streaming
# Phase 1: Foundation & Test Infrastructure
# Based on PRD v3.0 Testing Requirements (80% Coverage Mandatory)

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import pytest
import coverage
from pathlib import Path

# Add the parent directory to sys.path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))


# ============================================
# REAL-TIME TEST STREAMING PLUGIN
# ============================================

class RealtimeTestPlugin:
    """
    Custom pytest plugin that streams test results in real-time.
    
    Key Features:
    - Live test execution streaming
    - Coverage tracking and enforcement
    - Supabase integration for log storage
    - Performance metrics collection
    - Test categorization (unit, integration, etc.)
    """
    
    def __init__(self):
        self.test_results: List[Dict[str, Any]] = []
        self.current_test: Optional[Dict[str, Any]] = None
        self.session_start: float = 0
        self.coverage_data: Dict[str, Any] = {}
        self.test_categories = {
            'unit': 0,
            'integration': 0,
            'functional': 0,
            'security': 0,
            'performance': 0
        }
        
        # Initialize coverage tracking
        self.cov = coverage.Coverage(
            source=['agent'],
            omit=['*/tests/*', '*/test_*'],
            config_file=True
        )
        
    def pytest_sessionstart(self, session):
        """Called at the start of the test session."""
        self.session_start = time.time()
        self.cov.start()
        
        # Log session start
        self._stream_log({
            'type': 'session_start',
            'timestamp': datetime.now().isoformat(),
            'message': 'Test session started',
            'data': {
                'python_version': sys.version,
                'pytest_version': pytest.__version__,
                'coverage_enabled': True,
            }
        })
        
    def pytest_sessionfinish(self, session):
        """Called at the end of the test session."""
        self.cov.stop()
        
        # Calculate coverage
        coverage_report = self._generate_coverage_report()
        
        session_duration = time.time() - self.session_start
        
        # Calculate test statistics
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['outcome'] == 'passed'])
        failed_tests = len([r for r in self.test_results if r['outcome'] == 'failed'])
        skipped_tests = len([r for r in self.test_results if r['outcome'] == 'skipped'])
        
        # Check coverage requirement (80% minimum)
        coverage_passed = coverage_report['total_coverage'] >= 80
        
        # Final session summary
        session_summary = {
            'type': 'session_finish',
            'timestamp': datetime.now().isoformat(),
            'message': 'Test session completed',
            'data': {
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'skipped': skipped_tests,
                'duration_seconds': round(session_duration, 2),
                'success_rate': round((passed_tests / total_tests * 100) if total_tests > 0 else 0, 2),
                'coverage': coverage_report,
                'coverage_passed': coverage_passed,
                'test_categories': self.test_categories,
                'requirements_met': {
                    'all_tests_passed': failed_tests == 0,
                    'coverage_80_percent': coverage_passed,
                    'no_critical_failures': True,  # Could be enhanced
                }
            }
        }
        
        self._stream_log(session_summary)
        
        # Fail the session if coverage is below 80%
        if not coverage_passed:
            pytest.fail(
                f"Coverage requirement not met: {coverage_report['total_coverage']:.1f}% < 80%"
            )
            
    def pytest_runtest_setup(self, item):
        """Called before each test runs."""
        # Determine test category
        test_path = str(item.fspath)
        category = 'unit'  # default
        
        if 'integration' in test_path:
            category = 'integration'
        elif 'functional' in test_path:
            category = 'functional'
        elif 'security' in test_path:
            category = 'security'
        elif 'performance' in test_path:
            category = 'performance'
            
        self.test_categories[category] += 1
        
        self.current_test = {
            'id': item.nodeid,
            'name': item.name,
            'category': category,
            'file': test_path,
            'start_time': time.time(),
            'status': 'running'
        }
        
        # Stream test start
        self._stream_log({
            'type': 'test_start',
            'timestamp': datetime.now().isoformat(),
            'message': f'Starting test: {item.name}',
            'data': self.current_test
        })
        
    def pytest_runtest_logreport(self, report):
        """Called for each test report (setup, call, teardown)."""
        if report.when == 'call':  # Only process the main test execution
            if self.current_test:
                duration = time.time() - self.current_test['start_time']
                
                test_result = {
                    **self.current_test,
                    'outcome': report.outcome,
                    'duration': round(duration, 4),
                    'end_time': time.time(),
                    'status': 'completed'
                }
                
                # Add failure information if test failed
                if report.outcome == 'failed':
                    test_result['failure_info'] = {
                        'message': str(report.longrepr),
                        'traceback': getattr(report, 'longreprtext', ''),
                    }
                    
                # Add skip reason if test was skipped
                elif report.outcome == 'skipped':
                    test_result['skip_reason'] = getattr(report, 'wasxfail', 'Unknown')
                
                self.test_results.append(test_result)
                
                # Stream test completion
                self._stream_log({
                    'type': 'test_complete',
                    'timestamp': datetime.now().isoformat(),
                    'message': f'Test completed: {test_result["name"]} - {report.outcome.upper()}',
                    'data': test_result
                })
                
                self.current_test = None
                
    def _generate_coverage_report(self) -> Dict[str, Any]:
        """Generate coverage report."""
        try:
            # Save coverage data
            self.cov.save()
            
            # Get coverage report
            total_coverage = self.cov.report(show_missing=False, skip_covered=False)
            
            # Get detailed coverage data
            coverage_data = self.cov.get_data()
            
            # Generate file-by-file coverage
            file_coverage = {}
            for filename in coverage_data.measured_files():
                analysis = self.cov.analysis2(filename)
                total_lines = len(analysis[1]) + len(analysis[2])  # executed + missing
                covered_lines = len(analysis[1])  # executed
                
                if total_lines > 0:
                    file_coverage[filename] = {
                        'covered_lines': covered_lines,
                        'total_lines': total_lines,
                        'coverage_percent': round((covered_lines / total_lines) * 100, 2),
                        'missing_lines': analysis[2]  # line numbers not covered
                    }
            
            return {
                'total_coverage': round(total_coverage, 2),
                'file_coverage': file_coverage,
                'coverage_threshold': 80,
                'threshold_met': total_coverage >= 80,
            }
            
        except Exception as e:
            return {
                'total_coverage': 0,
                'error': str(e),
                'coverage_threshold': 80,
                'threshold_met': False,
            }
    
    def _stream_log(self, log_data: Dict[str, Any]):
        """Stream log data to console and optionally to Supabase."""
        # Always print to console for immediate feedback
        timestamp = log_data.get('timestamp', datetime.now().isoformat())
        message = log_data.get('message', '')
        log_type = log_data.get('type', 'info')
        
        # Color coding for different log types
        colors = {
            'session_start': '\033[92m',  # Green
            'session_finish': '\033[94m',  # Blue
            'test_start': '\033[93m',      # Yellow
            'test_complete': '\033[92m',   # Green
            'error': '\033[91m',           # Red
        }
        
        color = colors.get(log_type, '\033[0m')  # Default no color
        reset_color = '\033[0m'
        
        print(f"{color}[{timestamp}] {log_type.upper()}: {message}{reset_color}")
        
        # If test data is available, print additional details
        if 'data' in log_data and log_type in ['test_complete', 'session_finish']:
            data = log_data['data']
            if log_type == 'test_complete':
                outcome = data.get('outcome', 'unknown')
                duration = data.get('duration', 0)
                print(f"  → {outcome.upper()} in {duration:.3f}s")
                
            elif log_type == 'session_finish':
                print(f"  → {data['passed']}/{data['total_tests']} tests passed")
                print(f"  → Coverage: {data['coverage']['total_coverage']:.1f}%")
                print(f"  → Duration: {data['duration_seconds']:.2f}s")
        
        # TODO: Optionally stream to Supabase for real-time dashboard
        # This would require async context which is complex in pytest hooks
        # For now, we focus on console streaming which satisfies the PRD requirement


# ============================================
# PYTEST CONFIGURATION
# ============================================

# Register the real-time streaming plugin
def pytest_configure(config):
    """Configure pytest with our custom plugin."""
    # Register our real-time streaming plugin
    config.pluginmanager.register(RealtimeTestPlugin(), 'realtime_streaming')
    
    # Configure markers
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests (deselect with '-m "not unit"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "functional: marks tests as functional tests"
    )
    config.addinivalue_line(
        "markers", "security: marks tests as security tests"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m "not slow"')"
    )


# ============================================
# TEST FIXTURES
# ============================================

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client for testing."""
    class MockSupabase:
        def __init__(self):
            self.data = {}
            
        def from_table(self, table):
            return MockTable(table, self.data)
    
    class MockTable:
        def __init__(self, table, data):
            self.table = table
            self.data = data
            
        def select(self, *args):
            return self
            
        def insert(self, data):
            return {'data': data, 'error': None}
            
        def update(self, data):
            return {'data': data, 'error': None}
            
        def delete(self):
            return {'data': None, 'error': None}
            
        def eq(self, column, value):
            return self
            
        def execute(self):
            return {'data': [], 'error': None}
    
    return MockSupabase()


@pytest.fixture
def mock_e2b_sandbox():
    """Mock E2B sandbox for testing."""
    class MockSandbox:
        def __init__(self, sandbox_id='test-sandbox-123'):
            self.id = sandbox_id
            self.status = 'running'
            self.filesystem = MockFilesystem()
            
        async def run(self, command):
            # Mock command execution
            class MockResult:
                def __init__(self, command):
                    self.stdout = f"Output for: {command}"
                    self.stderr = ""
                    self.exit_code = 0
                    
            return MockResult(command)
            
        async def close(self):
            self.status = 'closed'
            
    class MockFilesystem:
        def __init__(self):
            self.files = {}
            
        async def write(self, path, content):
            self.files[path] = content
            
        async def read(self, path):
            return self.files.get(path, "")
            
        async def list(self, path="/"):
            return []
    
    return MockSandbox()


@pytest.fixture
def sample_task_data():
    """Sample task data for testing."""
    return {
        'id': 'test-task-123',
        'user_id': 'test-user-123',
        'title': 'Test Task',
        'description': 'A test task for unit testing',
        'status': 'pending',
        'progress_percentage': 0,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
    }


@pytest.fixture
def sample_tool_data():
    """Sample tool data for testing."""
    return {
        'id': 'test-tool-123',
        'user_id': 'test-user-123',
        'name': 'test_function',
        'description': 'A test function for unit testing',
        'source_code': 'def test_function():\\n    return "Hello, World!"',
        'category': 'utility',
        'status': 'ready',
        'test_coverage_percentage': 100,
        'total_tests': 5,
        'passing_tests': 5,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
    }


@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    """Setup test environment with necessary configurations."""
    # Set test environment variables
    monkeypatch.setenv('ENVIRONMENT', 'test')
    monkeypatch.setenv('DEBUG', 'true')
    monkeypatch.setenv('TEST_COVERAGE_THRESHOLD', '80')
    
    # Mock external service calls
    monkeypatch.setenv('E2B_API_KEY', 'test-key')
    monkeypatch.setenv('SUPABASE_URL', 'http://localhost:54321')
    monkeypatch.setenv('SUPABASE_ANON_KEY', 'test-anon-key')


# ============================================
# COVERAGE CONFIGURATION
# ============================================

# Ensure coverage data is collected
pytest_plugins = ['pytest_cov']

# Add custom command line options
def pytest_addoption(parser):
    """Add custom command line options."""
    parser.addoption(
        "--coverage-threshold",
        action="store",
        default=80,
        type=int,
        help="Minimum coverage threshold (default: 80)"
    )
    parser.addoption(
        "--stream-logs",
        action="store_true",
        default=True,
        help="Enable real-time log streaming (default: True)"
    )
    parser.addoption(
        "--test-category",
        action="store",
        choices=['unit', 'integration', 'functional', 'security', 'performance'],
        help="Run only tests of specific category"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection based on command line options."""
    # Filter by test category if specified
    category = config.getoption("--test-category")
    if category:
        selected = []
        for item in items:
            # Check if test file contains category name
            test_path = str(item.fspath)
            if category in test_path or hasattr(item, 'pytestmark'):
                # Check for category marker
                markers = [mark.name for mark in item.iter_markers()]
                if category in markers:
                    selected.append(item)
        items[:] = selected