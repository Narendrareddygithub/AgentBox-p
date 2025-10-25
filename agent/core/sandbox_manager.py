"""AgentBox v3.0 - E2B Sandbox Manager
Phase 1: Week 1 - Core Infrastructure Setup

Manages E2B sandbox instances for secure code execution with real-time streaming.
"""

import asyncio
import os
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Any
import json
import logging

try:
    from e2b import Sandbox
    from e2b.sandbox_sync import SandboxSync
except ImportError:
    print("⚠️  E2B SDK not installed. Run: pip install e2b")
    raise

from supabase import create_client, Client
from .realtime_streamer import RealtimeStreamer
from .security_validator import SecurityValidator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SandboxManager:
    """Manages E2B sandbox instances with real-time streaming and security validation."""
    
    def __init__(self, supabase_client: Client, realtime_streamer: RealtimeStreamer):
        self.supabase = supabase_client
        self.streamer = realtime_streamer
        self.security_validator = SecurityValidator()
        
        # Active sandbox tracking
        self.active_sandboxes: Dict[str, SandboxSync] = {}
        self.sandbox_metadata: Dict[str, Dict[str, Any]] = {}
        
        # Configuration
        self.default_template = os.getenv('E2B_TEMPLATE', 'Python3')
        self.max_execution_time = int(os.getenv('MAX_EXECUTION_TIME_SECONDS', '300'))  # 5 minutes
        self.max_memory = os.getenv('MAX_MEMORY_MB', '1024')  # 1GB
        self.max_sandboxes_per_user = int(os.getenv('MAX_SANDBOXES_PER_USER', '3'))
        
        logger.info(f"SandboxManager initialized with template: {self.default_template}")
    
    async def create_sandbox(
        self, 
        user_id: str, 
        task_id: Optional[str] = None,
        template: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new E2B sandbox instance with real-time streaming."""
        
        try:
            # Check user sandbox limit
            user_sandboxes = await self._get_user_sandbox_count(user_id)
            if user_sandboxes >= self.max_sandboxes_per_user:
                raise Exception(f"User has reached maximum sandbox limit ({self.max_sandboxes_per_user})")
            
            # Create sandbox with boot time tracking
            start_time = time.time()
            template_to_use = template or self.default_template
            
            logger.info(f"Creating sandbox with template: {template_to_use} for user: {user_id}")
            
            # Create E2B sandbox
            sandbox = SandboxSync(template=template_to_use)
            boot_time_ms = int((time.time() - start_time) * 1000)
            
            # Generate internal sandbox ID
            internal_id = str(uuid.uuid4())
            
            # Store in database
            sandbox_data = {
                'id': internal_id,
                'e2b_sandbox_id': sandbox.id,
                'user_id': user_id,
                'template': template_to_use,
                'status': 'running',
                'boot_time_ms': boot_time_ms,
                'cpu_limit': '1000m',
                'memory_limit': f'{self.max_memory}Mi',
                'disk_limit': '10Gi',
                'last_activity_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                'metadata': {
                    'task_id': task_id,
                    'created_at': datetime.utcnow().isoformat()
                }
            }
            
            # Insert into database
            result = self.supabase.table('sandboxes').insert(sandbox_data).execute()
            
            # Store in active sandboxes
            self.active_sandboxes[sandbox.id] = sandbox
            self.sandbox_metadata[sandbox.id] = sandbox_data
            
            logger.info(f"✅ Sandbox created: {sandbox.id} (boot time: {boot_time_ms}ms)")
            
            # Stream creation event
            await self.streamer.stream_sandbox_event(
                sandbox.id,
                'sandbox_created',
                {
                    'sandbox_id': sandbox.id,
                    'internal_id': internal_id,
                    'boot_time_ms': boot_time_ms,
                    'template': template_to_use,
                    'status': 'running'
                }
            )
            
            return {
                'sandbox_id': sandbox.id,
                'internal_id': internal_id,
                'boot_time_ms': boot_time_ms,
                'template': template_to_use,
                'status': 'running',
                'expires_at': sandbox_data['expires_at']
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create sandbox: {str(e)}")
            raise Exception(f"Sandbox creation failed: {str(e)}")
    
    async def execute_code(
        self, 
        sandbox_id: str, 
        code: str,
        task_id: Optional[str] = None,
        stream_output: bool = True
    ) -> Dict[str, Any]:
        """Execute code in a sandbox with real-time streaming and security validation."""
        
        if sandbox_id not in self.active_sandboxes:
            raise Exception(f"Sandbox {sandbox_id} not found or inactive")
        
        # Security validation
        security_result = self.security_validator.validate_code(code)
        if not security_result['is_safe']:
            error_msg = f"Code security validation failed: {security_result['reason']}"
            logger.warning(f"⚠️ {error_msg}")
            
            # Stream security warning
            if stream_output:
                await self.streamer.stream_log(
                    sandbox_id, 
                    'security_warning', 
                    error_msg,
                    task_id=task_id
                )
            
            raise Exception(error_msg)
        
        sandbox = self.active_sandboxes[sandbox_id]
        
        try:
            # Update last activity
            await self._update_sandbox_activity(sandbox_id)
            
            # Stream code execution start
            if stream_output:
                await self.streamer.stream_log(
                    sandbox_id,
                    'code_execution_start',
                    f"Executing code:\n{code}",
                    task_id=task_id
                )
            
            # Execute code with timeout
            start_time = time.time()
            
            if stream_output:
                # Execute with real-time streaming
                result = await self._execute_with_streaming(
                    sandbox, sandbox_id, code, task_id
                )
            else:
                # Execute without streaming (for internal operations)
                execution = sandbox.process.start(
                    cmd=f"python3 -c \"{code.replace('\"', '\\"')}\"",
                    timeout=self.max_execution_time
                )
                
                result = {
                    'exit_code': execution.exit_code,
                    'stdout': execution.stdout,
                    'stderr': execution.stderr
                }
            
            execution_time_ms = int((time.time() - start_time) * 1000)
            result['execution_time_ms'] = execution_time_ms
            
            # Stream execution completion
            if stream_output:
                await self.streamer.stream_log(
                    sandbox_id,
                    'code_execution_complete',
                    f"Execution completed in {execution_time_ms}ms (exit code: {result['exit_code']})",
                    task_id=task_id
                )
            
            logger.info(f"Code executed in sandbox {sandbox_id} - Time: {execution_time_ms}ms, Exit: {result['exit_code']}")
            
            return result
            
        except Exception as e:
            error_msg = f"Code execution failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            
            # Stream error
            if stream_output:
                await self.streamer.stream_log(
                    sandbox_id,
                    'code_execution_error',
                    error_msg,
                    task_id=task_id
                )
            
            raise Exception(error_msg)
    
    async def _execute_with_streaming(
        self, 
        sandbox: SandboxSync, 
        sandbox_id: str, 
        code: str, 
        task_id: Optional[str]
    ) -> Dict[str, Any]:
        """Execute code with real-time stdout/stderr streaming."""
        
        # Create execution with streaming callbacks
        stdout_lines = []
        stderr_lines = []
        
        def on_stdout(line: str):
            stdout_lines.append(line)
            # Stream immediately
            asyncio.create_task(
                self.streamer.stream_log(
                    sandbox_id, 'stdout', line, task_id=task_id
                )
            )
        
        def on_stderr(line: str):
            stderr_lines.append(line)
            # Stream immediately
            asyncio.create_task(
                self.streamer.stream_log(
                    sandbox_id, 'stderr', line, task_id=task_id
                )
            )
        
        # Execute with streaming
        execution = sandbox.process.start(
            cmd=f"python3 -c \"{code.replace('\"', '\\"')}\"",
            timeout=self.max_execution_time,
            on_stdout=on_stdout,
            on_stderr=on_stderr
        )
        
        return {
            'exit_code': execution.exit_code,
            'stdout': '\n'.join(stdout_lines),
            'stderr': '\n'.join(stderr_lines)
        }
    
    async def install_packages(self, sandbox_id: str, packages: List[str]) -> Dict[str, Any]:
        """Install Python packages in a sandbox."""
        
        if sandbox_id not in self.active_sandboxes:
            raise Exception(f"Sandbox {sandbox_id} not found")
        
        # Validate package names for security
        for package in packages:
            if not self.security_validator.is_safe_package_name(package):
                raise Exception(f"Invalid or potentially unsafe package name: {package}")
        
        # Install packages
        install_cmd = f"pip install {' '.join(packages)}"
        
        return await self.execute_code(
            sandbox_id, 
            f"import subprocess; subprocess.run('{install_cmd}', shell=True)",
            stream_output=True
        )
    
    async def list_files(self, sandbox_id: str, path: str = '/') -> List[Dict[str, Any]]:
        """List files in sandbox directory."""
        
        if sandbox_id not in self.active_sandboxes:
            raise Exception(f"Sandbox {sandbox_id} not found")
        
        sandbox = self.active_sandboxes[sandbox_id]
        
        try:
            files = sandbox.filesystem.list(path)
            
            file_list = []
            for file in files:
                file_list.append({
                    'name': file.name,
                    'path': file.path,
                    'is_dir': file.is_dir,
                    'size': file.size if hasattr(file, 'size') else 0
                })
            
            return file_list
            
        except Exception as e:
            raise Exception(f"Failed to list files: {str(e)}")
    
    async def read_file(self, sandbox_id: str, file_path: str) -> str:
        """Read file content from sandbox."""
        
        if sandbox_id not in self.active_sandboxes:
            raise Exception(f"Sandbox {sandbox_id} not found")
        
        # Validate file path for security
        if not self.security_validator.is_safe_file_path(file_path):
            raise Exception(f"Unsafe file path: {file_path}")
        
        sandbox = self.active_sandboxes[sandbox_id]
        
        try:
            content = sandbox.filesystem.read(file_path)
            return content
        except Exception as e:
            raise Exception(f"Failed to read file {file_path}: {str(e)}")
    
    async def write_file(self, sandbox_id: str, file_path: str, content: str) -> bool:
        """Write content to file in sandbox."""
        
        if sandbox_id not in self.active_sandboxes:
            raise Exception(f"Sandbox {sandbox_id} not found")
        
        # Validate file path for security
        if not self.security_validator.is_safe_file_path(file_path):
            raise Exception(f"Unsafe file path: {file_path}")
        
        sandbox = self.active_sandboxes[sandbox_id]
        
        try:
            sandbox.filesystem.write(file_path, content)
            
            # Stream file write event
            await self.streamer.stream_log(
                sandbox_id,
                'file_write',
                f"File written: {file_path} ({len(content)} bytes)"
            )
            
            return True
        except Exception as e:
            raise Exception(f"Failed to write file {file_path}: {str(e)}")
    
    async def destroy_sandbox(self, sandbox_id: str) -> bool:
        """Destroy a sandbox and clean up resources."""
        
        try:
            # Remove from active sandboxes
            if sandbox_id in self.active_sandboxes:
                sandbox = self.active_sandboxes[sandbox_id]
                sandbox.close()
                del self.active_sandboxes[sandbox_id]
            
            # Remove metadata
            if sandbox_id in self.sandbox_metadata:
                del self.sandbox_metadata[sandbox_id]
            
            # Update database
            self.supabase.table('sandboxes').update({
                'status': 'stopped',
                'last_activity_at': datetime.utcnow().isoformat()
            }).eq('e2b_sandbox_id', sandbox_id).execute()
            
            # Stream destruction event
            await self.streamer.stream_sandbox_event(
                sandbox_id,
                'sandbox_destroyed',
                {'sandbox_id': sandbox_id, 'status': 'stopped'}
            )
            
            logger.info(f"✅ Sandbox {sandbox_id} destroyed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to destroy sandbox {sandbox_id}: {str(e)}")
            return False
    
    async def cleanup_expired_sandboxes(self) -> int:
        """Clean up expired sandboxes."""
        
        try:
            # Get expired sandboxes from database
            result = self.supabase.table('sandboxes').select('*').lt(
                'expires_at', datetime.utcnow().isoformat()
            ).eq('status', 'running').execute()
            
            cleaned_count = 0
            for sandbox_data in result.data:
                sandbox_id = sandbox_data['e2b_sandbox_id']
                if await self.destroy_sandbox(sandbox_id):
                    cleaned_count += 1
            
            logger.info(f"Cleaned up {cleaned_count} expired sandboxes")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired sandboxes: {str(e)}")
            return 0
    
    async def _get_user_sandbox_count(self, user_id: str) -> int:
        """Get count of active sandboxes for a user."""
        
        result = self.supabase.table('sandboxes').select(
            'id', count='exact'
        ).eq('user_id', user_id).eq('status', 'running').execute()
        
        return result.count or 0
    
    async def _update_sandbox_activity(self, sandbox_id: str) -> None:
        """Update sandbox last activity timestamp."""
        
        self.supabase.table('sandboxes').update({
            'last_activity_at': datetime.utcnow().isoformat()
        }).eq('e2b_sandbox_id', sandbox_id).execute()
    
    def get_active_sandboxes(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all active sandboxes."""
        
        active_info = {}
        for sandbox_id, metadata in self.sandbox_metadata.items():
            if sandbox_id in self.active_sandboxes:
                active_info[sandbox_id] = {
                    **metadata,
                    'is_active': True,
                    'uptime_seconds': int(time.time() - 
                        datetime.fromisoformat(metadata['metadata']['created_at']).timestamp())
                }
        
        return active_info
    
    async def get_sandbox_status(self, sandbox_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed status of a specific sandbox."""
        
        if sandbox_id not in self.active_sandboxes:
            return None
        
        metadata = self.sandbox_metadata.get(sandbox_id, {})
        
        return {
            'sandbox_id': sandbox_id,
            'status': 'running',
            'template': metadata.get('template'),
            'boot_time_ms': metadata.get('boot_time_ms'),
            'last_activity': metadata.get('last_activity_at'),
            'expires_at': metadata.get('expires_at'),
            'uptime_seconds': int(time.time() - 
                datetime.fromisoformat(metadata['metadata']['created_at']).timestamp()) if metadata.get('metadata', {}).get('created_at') else 0
        }