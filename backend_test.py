#!/usr/bin/env python3
"""
VibeCode IDE Backend API Testing Suite - Production Enhancement Tests
Tests all backend functionality including enhanced health checks, validation, rate limiting, 
error handling, pagination, and performance improvements
"""

import asyncio
import aiohttp
import json
import uuid
import websockets
from datetime import datetime
import sys
import os
import time

# Get backend URL from frontend .env file
BACKEND_URL = "https://99bd7699-a098-4b55-be53-998746d5ad7c.preview.emergentagent.com"
API_BASE_URL = f"{BACKEND_URL}/api"
API_V1_BASE_URL = f"{BACKEND_URL}/api/v1"
WS_BASE_URL = BACKEND_URL.replace("https://", "wss://")

class VibeCodeAPITester:
    def __init__(self):
        self.session = None
        self.test_results = {
            "health_checks": {"passed": 0, "failed": 0, "errors": []},
            "project_management": {"passed": 0, "failed": 0, "errors": []},
            "file_management": {"passed": 0, "failed": 0, "errors": []},
            "validation_tests": {"passed": 0, "failed": 0, "errors": []},
            "rate_limiting": {"passed": 0, "failed": 0, "errors": []},
            "error_handling": {"passed": 0, "failed": 0, "errors": []},
            "pagination": {"passed": 0, "failed": 0, "errors": []},
            "ai_integration": {"passed": 0, "failed": 0, "errors": []},
            "websocket_ai": {"passed": 0, "failed": 0, "errors": []},
            "chat_history": {"passed": 0, "failed": 0, "errors": []},
            "collaboration": {"passed": 0, "failed": 0, "errors": []}
        }
        self.test_project_id = None
        self.test_file_id = None
        self.test_session_id = str(uuid.uuid4())
        self.test_room_id = None

    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()

    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()

    def log_test(self, category, test_name, success, error=None):
        """Log test results"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]["failed"] += 1
            self.test_results[category]["errors"].append(f"{test_name}: {error}")
            print(f"❌ {test_name}: {error}")

    async def test_health_check(self):
        """Test basic API health check"""
        try:
            async with self.session.get(f"{API_BASE_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "healthy":
                        self.log_test("health_checks", "Basic API Health Check", True)
                        return True
                    else:
                        self.log_test("health_checks", "Basic API Health Check", False, f"Unexpected response: {data}")
                        return False
                else:
                    self.log_test("health_checks", "Basic API Health Check", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("health_checks", "Basic API Health Check", False, str(e))
            return False

    async def test_enhanced_health_check(self):
        """Test enhanced /api/v1/health endpoint with detailed status"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "timestamp", "version", "database", "ai_engine", "environment"]
                    
                    # Check all required fields are present
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        self.log_test("health_checks", "Enhanced Health Check", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check status is healthy or degraded
                    if data.get("status") not in ["healthy", "degraded"]:
                        self.log_test("health_checks", "Enhanced Health Check", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    # Check version is present
                    if not data.get("version"):
                        self.log_test("health_checks", "Enhanced Health Check", False, "Version not specified")
                        return False
                    
                    self.log_test("health_checks", "Enhanced Health Check", True)
                    return True
                else:
                    self.log_test("health_checks", "Enhanced Health Check", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("health_checks", "Enhanced Health Check", False, str(e))
            return False

    # === VALIDATION TESTS ===
    
    async def test_project_validation_valid(self):
        """Test project creation with valid data"""
        try:
            project_data = {
                "name": "Valid Project Name",
                "description": "A valid project description for testing validation"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == project_data["name"] and data.get("id"):
                        self.test_project_id = data["id"]  # Store for later tests
                        self.log_test("validation_tests", "Project Creation - Valid Data", True)
                        return True
                    else:
                        self.log_test("validation_tests", "Project Creation - Valid Data", False, f"Invalid response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("validation_tests", "Project Creation - Valid Data", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "Project Creation - Valid Data", False, str(e))
            return False

    async def test_project_validation_invalid_name(self):
        """Test project creation with invalid name (empty)"""
        try:
            project_data = {
                "name": "",  # Invalid: empty name
                "description": "Test description"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 422:  # Validation error expected
                    self.log_test("validation_tests", "Project Creation - Invalid Empty Name", True)
                    return True
                else:
                    self.log_test("validation_tests", "Project Creation - Invalid Empty Name", False, f"Expected 422, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "Project Creation - Invalid Empty Name", False, str(e))
            return False

    async def test_project_validation_invalid_chars(self):
        """Test project creation with invalid characters"""
        try:
            project_data = {
                "name": "Invalid<>Name",  # Invalid: contains < and >
                "description": "Test description"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 422:  # Validation error expected
                    self.log_test("validation_tests", "Project Creation - Invalid Characters", True)
                    return True
                else:
                    self.log_test("validation_tests", "Project Creation - Invalid Characters", False, f"Expected 422, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "Project Creation - Invalid Characters", False, str(e))
            return False

    async def test_file_validation_valid(self):
        """Test file creation with valid data"""
        if not self.test_project_id:
            self.log_test("validation_tests", "File Creation - Valid Data", False, "No test project available")
            return False
            
        try:
            file_data = {
                "name": "valid_file.py",
                "type": "file",
                "content": "# Valid Python file\nprint('Hello World')"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == file_data["name"] and data.get("id"):
                        self.test_file_id = data["id"]  # Store for later tests
                        self.log_test("validation_tests", "File Creation - Valid Data", True)
                        return True
                    else:
                        self.log_test("validation_tests", "File Creation - Valid Data", False, f"Invalid response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("validation_tests", "File Creation - Valid Data", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "File Creation - Valid Data", False, str(e))
            return False

    async def test_file_validation_invalid_name(self):
        """Test file creation with invalid name (path traversal)"""
        if not self.test_project_id:
            self.log_test("validation_tests", "File Creation - Invalid Name", False, "No test project available")
            return False
            
        try:
            file_data = {
                "name": "../../../etc/passwd",  # Invalid: path traversal
                "type": "file",
                "content": "malicious content"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
                if response.status == 422:  # Validation error expected
                    self.log_test("validation_tests", "File Creation - Invalid Name", True)
                    return True
                else:
                    self.log_test("validation_tests", "File Creation - Invalid Name", False, f"Expected 422, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "File Creation - Invalid Name", False, str(e))
            return False

    async def test_file_validation_invalid_type(self):
        """Test file creation with invalid type"""
        if not self.test_project_id:
            self.log_test("validation_tests", "File Creation - Invalid Type", False, "No test project available")
            return False
            
        try:
            file_data = {
                "name": "test.txt",
                "type": "invalid_type",  # Invalid: not 'file' or 'folder'
                "content": "test content"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
                if response.status == 422:  # Validation error expected
                    self.log_test("validation_tests", "File Creation - Invalid Type", True)
                    return True
                else:
                    self.log_test("validation_tests", "File Creation - Invalid Type", False, f"Expected 422, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("validation_tests", "File Creation - Invalid Type", False, str(e))
            return False

    # === RATE LIMITING TESTS ===
    
    async def test_rate_limiting_health_check(self):
        """Test rate limiting on health check endpoint (10/minute)"""
        try:
            # Make 12 rapid requests to exceed the 10/minute limit
            success_count = 0
            rate_limited = False
            
            for i in range(12):
                async with self.session.get(f"{API_V1_BASE_URL}/health") as response:
                    if response.status == 200:
                        success_count += 1
                    elif response.status == 429:  # Rate limited
                        rate_limited = True
                        break
                    await asyncio.sleep(0.1)  # Small delay between requests
            
            if rate_limited and success_count >= 10:
                self.log_test("rate_limiting", "Health Check Rate Limiting", True)
                return True
            else:
                self.log_test("rate_limiting", "Health Check Rate Limiting", False, f"Expected rate limiting after 10 requests, got {success_count} successes, rate_limited: {rate_limited}")
                return False
                
        except Exception as e:
            self.log_test("rate_limiting", "Health Check Rate Limiting", False, str(e))
            return False

    async def test_rate_limiting_project_creation(self):
        """Test rate limiting on project creation (10/minute)"""
        try:
            # Make 12 rapid requests to exceed the 10/minute limit
            success_count = 0
            rate_limited = False
            created_projects = []
            
            for i in range(12):
                project_data = {
                    "name": f"Rate Limit Test Project {i}",
                    "description": f"Test project {i} for rate limiting"
                }
                
                async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        created_projects.append(data.get("id"))
                        success_count += 1
                    elif response.status == 429:  # Rate limited
                        rate_limited = True
                        break
                    await asyncio.sleep(0.1)  # Small delay between requests
            
            # Clean up created projects
            for project_id in created_projects:
                if project_id:
                    try:
                        async with self.session.delete(f"{API_V1_BASE_URL}/projects/{project_id}") as response:
                            pass  # Ignore cleanup errors
                    except:
                        pass
            
            if rate_limited and success_count >= 10:
                self.log_test("rate_limiting", "Project Creation Rate Limiting", True)
                return True
            else:
                self.log_test("rate_limiting", "Project Creation Rate Limiting", False, f"Expected rate limiting after 10 requests, got {success_count} successes, rate_limited: {rate_limited}")
                return False
                
        except Exception as e:
            self.log_test("rate_limiting", "Project Creation Rate Limiting", False, str(e))
            return False

    # === ERROR HANDLING TESTS ===
    
    async def test_error_handling_404(self):
        """Test 404 error handling for non-existent project"""
        try:
            fake_project_id = str(uuid.uuid4())
            async with self.session.get(f"{API_V1_BASE_URL}/projects/{fake_project_id}") as response:
                if response.status == 404:
                    data = await response.json()
                    if "detail" in data and "not found" in data["detail"].lower():
                        self.log_test("error_handling", "404 Error Handling", True)
                        return True
                    else:
                        self.log_test("error_handling", "404 Error Handling", False, f"Invalid error response: {data}")
                        return False
                else:
                    self.log_test("error_handling", "404 Error Handling", False, f"Expected 404, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("error_handling", "404 Error Handling", False, str(e))
            return False

    async def test_error_handling_409_duplicate(self):
        """Test 409 error handling for duplicate project name"""
        if not self.test_project_id:
            self.log_test("error_handling", "409 Duplicate Error Handling", False, "No test project available")
            return False
            
        try:
            # Get the existing project name
            async with self.session.get(f"{API_V1_BASE_URL}/projects/{self.test_project_id}") as response:
                if response.status != 200:
                    self.log_test("error_handling", "409 Duplicate Error Handling", False, "Could not get existing project")
                    return False
                
                existing_project = await response.json()
                existing_name = existing_project.get("name")
                
                if not existing_name:
                    self.log_test("error_handling", "409 Duplicate Error Handling", False, "Could not get existing project name")
                    return False
            
            # Try to create a project with the same name
            duplicate_data = {
                "name": existing_name,
                "description": "Duplicate project for testing"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=duplicate_data) as response:
                if response.status == 409:
                    data = await response.json()
                    if "detail" in data and "already exists" in data["detail"].lower():
                        self.log_test("error_handling", "409 Duplicate Error Handling", True)
                        return True
                    else:
                        self.log_test("error_handling", "409 Duplicate Error Handling", False, f"Invalid error response: {data}")
                        return False
                else:
                    self.log_test("error_handling", "409 Duplicate Error Handling", False, f"Expected 409, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("error_handling", "409 Duplicate Error Handling", False, str(e))
            return False

    async def test_error_handling_400_bad_request(self):
        """Test 400 error handling for malformed request"""
        try:
            # Send malformed JSON (missing required fields)
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json={}) as response:
                if response.status in [400, 422]:  # Either is acceptable for validation errors
                    data = await response.json()
                    if "detail" in data:
                        self.log_test("error_handling", "400 Bad Request Error Handling", True)
                        return True
                    else:
                        self.log_test("error_handling", "400 Bad Request Error Handling", False, f"Invalid error response: {data}")
                        return False
                else:
                    self.log_test("error_handling", "400 Bad Request Error Handling", False, f"Expected 400/422, got {response.status}")
                    return False
        except Exception as e:
            self.log_test("error_handling", "400 Bad Request Error Handling", False, str(e))
            return False

    # === PAGINATION TESTS ===
    
    async def test_pagination_default(self):
        """Test default pagination on project listing"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Default should return projects (could be empty or have projects)
                        self.log_test("pagination", "Default Pagination", True)
                        return True
                    else:
                        self.log_test("pagination", "Default Pagination", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    self.log_test("pagination", "Default Pagination", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("pagination", "Default Pagination", False, str(e))
            return False

    async def test_pagination_with_limit(self):
        """Test pagination with limit parameter"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects?limit=5") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) <= 5:
                        self.log_test("pagination", "Pagination with Limit", True)
                        return True
                    else:
                        self.log_test("pagination", "Pagination with Limit", False, f"Expected list with ≤5 items, got: {len(data) if isinstance(data, list) else type(data)}")
                        return False
                else:
                    self.log_test("pagination", "Pagination with Limit", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("pagination", "Pagination with Limit", False, str(e))
            return False

    async def test_pagination_with_skip(self):
        """Test pagination with skip parameter"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects?skip=0&limit=10") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        self.log_test("pagination", "Pagination with Skip", True)
                        return True
                    else:
                        self.log_test("pagination", "Pagination with Skip", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    self.log_test("pagination", "Pagination with Skip", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("pagination", "Pagination with Skip", False, str(e))
            return False

    # === PROJECT MANAGEMENT TESTS ===
    
    async def test_create_project(self):
        """Test project creation"""
        try:
            project_data = {
                "name": "VibeCode Test Project",
                "description": "A test project for the VibeCode IDE"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == project_data["name"] and data.get("id"):
                        self.test_project_id = data["id"]
                        self.log_test("project_management", "Create Project", True)
                        return True
                    else:
                        self.log_test("project_management", "Create Project", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("project_management", "Create Project", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("project_management", "Create Project", False, str(e))
            return False

    async def test_get_projects(self):
        """Test getting all projects"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Check if our test project is in the list
                        found_project = any(p.get("id") == self.test_project_id for p in data)
                        if found_project:
                            self.log_test("project_management", "Get Projects", True)
                            return True
                        else:
                            self.log_test("project_management", "Get Projects", False, "Test project not found in list")
                            return False
                    else:
                        self.log_test("project_management", "Get Projects", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("project_management", "Get Projects", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("project_management", "Get Projects", False, str(e))
            return False

    async def test_get_single_project(self):
        """Test getting a single project"""
        if not self.test_project_id:
            self.log_test("project_management", "Get Single Project", False, "No test project ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects/{self.test_project_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("id") == self.test_project_id:
                        self.log_test("project_management", "Get Single Project", True)
                        return True
                    else:
                        self.log_test("project_management", "Get Single Project", False, f"Project ID mismatch: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("project_management", "Get Single Project", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("project_management", "Get Single Project", False, str(e))
            return False

    # === FILE MANAGEMENT TESTS ===
    
    async def test_create_file(self):
        """Test file creation"""
        if not self.test_project_id:
            self.log_test("file_management", "Create File", False, "No test project ID available")
            return False
            
        try:
            file_data = {
                "name": "main.py",
                "type": "file",
                "content": "# VibeCode Test File\nprint('Hello, VibeCode!')\n\ndef main():\n    return 'Welcome to VibeCode IDE'\n\nif __name__ == '__main__':\n    main()"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == file_data["name"] and data.get("id"):
                        self.test_file_id = data["id"]
                        self.log_test("file_management", "Create File", True)
                        return True
                    else:
                        self.log_test("file_management", "Create File", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Create File", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Create File", False, str(e))
            return False

    async def test_create_folder(self):
        """Test folder creation"""
        if not self.test_project_id:
            self.log_test("file_management", "Create Folder", False, "No test project ID available")
            return False
            
        try:
            folder_data = {
                "name": "src",
                "type": "folder"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=folder_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == folder_data["name"] and data.get("type") == "folder":
                        self.log_test("file_management", "Create Folder", True)
                        return True
                    else:
                        self.log_test("file_management", "Create Folder", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Create Folder", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Create Folder", False, str(e))
            return False

    async def test_get_project_files(self):
        """Test getting project files"""
        if not self.test_project_id:
            self.log_test("file_management", "Get Project Files", False, "No test project ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) > 0:
                        # Should have at least the root folder and our test file
                        self.log_test("file_management", "Get Project Files", True)
                        return True
                    else:
                        self.log_test("file_management", "Get Project Files", False, f"Expected non-empty list, got: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Get Project Files", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Get Project Files", False, str(e))
            return False

    async def test_get_single_file(self):
        """Test getting a single file"""
        if not self.test_file_id:
            self.log_test("file_management", "Get Single File", False, "No test file ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/files/{self.test_file_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("id") == self.test_file_id and data.get("content"):
                        self.log_test("file_management", "Get Single File", True)
                        return True
                    else:
                        self.log_test("file_management", "Get Single File", False, f"Invalid file data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Get Single File", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Get Single File", False, str(e))
            return False

    async def test_update_file(self):
        """Test file content update"""
        if not self.test_file_id:
            self.log_test("file_management", "Update File", False, "No test file ID available")
            return False
            
        try:
            update_data = {
                "content": "# Updated VibeCode Test File\nprint('Hello, Updated VibeCode!')\n\ndef updated_main():\n    return 'Updated Welcome to VibeCode IDE'\n\nif __name__ == '__main__':\n    updated_main()"
            }
            
            async with self.session.put(f"{API_V1_BASE_URL}/files/{self.test_file_id}", json=update_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("message"):
                        self.log_test("file_management", "Update File", True)
                        return True
                    else:
                        self.log_test("file_management", "Update File", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Update File", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Update File", False, str(e))
            return False

    # === AI INTEGRATION TESTS ===
    
    async def test_ai_chat(self):
        """Test AI chat functionality"""
        try:
            chat_data = {
                "message": "Write a simple Python function to calculate the factorial of a number",
                "session_id": self.test_session_id,
                "context": {"current_file": "main.py"}
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("response") and data.get("session_id"):
                        self.log_test("ai_integration", "AI Chat", True)
                        return True
                    else:
                        self.log_test("ai_integration", "AI Chat", False, f"Invalid response format: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("ai_integration", "AI Chat", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("ai_integration", "AI Chat", False, str(e))
            return False

    async def test_ai_model_info(self):
        """Test AI model information in response"""
        try:
            chat_data = {
                "message": "Hello, what model are you using?",
                "session_id": self.test_session_id
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if (data.get("model") == "meta-llama/llama-4-maverick" and 
                        data.get("frontend_processing") == True):
                        self.log_test("ai_integration", "AI Model Information", True)
                        return True
                    else:
                        self.log_test("ai_integration", "AI Model Information", False, f"Invalid model info: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("ai_integration", "AI Model Information", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("ai_integration", "AI Model Information", False, str(e))
            return False

    # === CHAT HISTORY TESTS ===
    
    async def test_get_chat_history(self):
        """Test chat history retrieval"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/ai/chat/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, dict) and "messages" in data:
                        # Should have at least one message from our AI chat test
                        messages = data.get("messages", [])
                        if len(messages) > 0:
                            self.log_test("chat_history", "Get Chat History", True)
                        else:
                            self.log_test("chat_history", "Get Chat History", False, "No chat history found")
                        return True
                    else:
                        self.log_test("chat_history", "Get Chat History", False, f"Expected dict with messages, got: {type(data)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("chat_history", "Get Chat History", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("chat_history", "Get Chat History", False, str(e))
            return False

    # === WEBSOCKET TESTS ===
    
    async def test_websocket_connection_establishment(self):
        """Test WebSocket connection establishment and initial message"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for initial connection established message
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "connection_established" and 
                        response_data.get("status") == "connected" and
                        response_data.get("session_id") == self.test_session_id):
                        self.log_test("websocket_ai", "WebSocket Connection Establishment", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Connection Establishment", False, f"Invalid connection message: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Connection Establishment", False, "Connection establishment timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Connection Establishment", False, str(e))
            return False

    async def test_websocket_chat_message(self):
        """Test WebSocket chat message processing"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Send a chat message
                test_message = {
                    "type": "chat",
                    "message": "Hello, can you help me with Python programming?",
                    "context": {"current_file": "test.py"}
                }
                
                await websocket.send(json.dumps(test_message))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "ai_response" and 
                        response_data.get("message") and
                        response_data.get("session_id") == self.test_session_id and
                        response_data.get("frontend_ai") == True):
                        self.log_test("websocket_ai", "WebSocket Chat Message", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Chat Message", False, f"Invalid chat response: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Chat Message", False, "Chat response timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Chat Message", False, str(e))
            return False

    async def test_websocket_ping_pong(self):
        """Test WebSocket ping/pong keepalive mechanism"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Send a ping message
                ping_message = {
                    "type": "ping",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await websocket.send(json.dumps(ping_message))
                
                # Wait for pong response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "pong" and 
                        response_data.get("timestamp")):
                        self.log_test("websocket_ai", "WebSocket Ping/Pong", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Ping/Pong", False, f"Invalid pong response: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Ping/Pong", False, "Pong response timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Ping/Pong", False, str(e))
            return False

    async def test_websocket_keepalive_timeout(self):
        """Test WebSocket keepalive mechanism with 30-second timeout"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Wait for keepalive message (should come after 30 seconds of inactivity)
                # We'll wait up to 35 seconds to account for timing variations
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=35.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "keepalive" and 
                        response_data.get("message") == "Connection active" and
                        response_data.get("timestamp")):
                        self.log_test("websocket_ai", "WebSocket Keepalive Timeout", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Keepalive Timeout", False, f"Invalid keepalive message: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Keepalive Timeout", False, "Keepalive message not received within 35 seconds")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Keepalive Timeout", False, str(e))
            return False

    async def test_websocket_invalid_json(self):
        """Test WebSocket error handling with invalid JSON"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Send invalid JSON
                await websocket.send("invalid json message")
                
                # Wait for error response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "error" and 
                        "Invalid JSON format" in response_data.get("message", "") and
                        response_data.get("session_id") == self.test_session_id):
                        self.log_test("websocket_ai", "WebSocket Invalid JSON Handling", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Invalid JSON Handling", False, f"Invalid error response: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Invalid JSON Handling", False, "Error response timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Invalid JSON Handling", False, str(e))
            return False

    async def test_websocket_unknown_message_type(self):
        """Test WebSocket error handling with unknown message type"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Send message with unknown type
                unknown_message = {
                    "type": "unknown_type",
                    "message": "This is an unknown message type"
                }
                
                await websocket.send(json.dumps(unknown_message))
                
                # Wait for error response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "error" and 
                        "Unknown message type: unknown_type" in response_data.get("message", "") and
                        response_data.get("session_id") == self.test_session_id):
                        self.log_test("websocket_ai", "WebSocket Unknown Message Type Handling", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket Unknown Message Type Handling", False, f"Invalid error response: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket Unknown Message Type Handling", False, "Error response timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Unknown Message Type Handling", False, str(e))
            return False

    async def test_websocket_graceful_disconnect(self):
        """Test WebSocket graceful disconnection"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established message
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Send a message to ensure connection is active
                test_message = {
                    "type": "ping"
                }
                await websocket.send(json.dumps(test_message))
                
                # Wait for pong response
                await asyncio.wait_for(websocket.recv(), timeout=10.0)
                
                # Close connection gracefully
                await websocket.close()
                
                # Connection should be closed without errors
                self.log_test("websocket_ai", "WebSocket Graceful Disconnect", True)
                return True
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket Graceful Disconnect", False, str(e))
            return False

    # === COLLABORATION TESTS ===
    
    async def test_collaboration_health(self):
        """Test collaboration service health endpoint"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/health") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "timestamp", "stats"]
                    
                    # Check all required fields are present
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        self.log_test("collaboration", "Collaboration Health Check", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check stats structure
                    stats = data.get("stats", {})
                    stats_fields = ["active_rooms", "active_users", "file_versions_tracked", "operation_queues"]
                    missing_stats = [field for field in stats_fields if field not in stats]
                    if missing_stats:
                        self.log_test("collaboration", "Collaboration Health Check", False, f"Missing stats: {missing_stats}")
                        return False
                    
                    self.log_test("collaboration", "Collaboration Health Check", True)
                    return True
                else:
                    self.log_test("collaboration", "Collaboration Health Check", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Collaboration Health Check", False, str(e))
            return False

    async def test_collaboration_stats(self):
        """Test collaboration statistics endpoint"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/stats") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["timestamp", "database", "active", "rooms"]
                    
                    # Check all required fields are present
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        self.log_test("collaboration", "Collaboration Statistics", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check database stats structure
                    db_stats = data.get("database", {})
                    db_fields = ["total_rooms", "total_users", "total_chat_messages", "total_edit_operations"]
                    missing_db = [field for field in db_fields if field not in db_stats]
                    if missing_db:
                        self.log_test("collaboration", "Collaboration Statistics", False, f"Missing database stats: {missing_db}")
                        return False
                    
                    self.log_test("collaboration", "Collaboration Statistics", True)
                    return True
                else:
                    self.log_test("collaboration", "Collaboration Statistics", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Collaboration Statistics", False, str(e))
            return False

    async def test_create_collaboration_room(self):
        """Test creating a collaboration room"""
        if not self.test_project_id:
            self.log_test("collaboration", "Create Collaboration Room", False, "No test project ID available")
            return False
            
        try:
            room_data = {
                "project_id": self.test_project_id,
                "name": "VibeCode Collaboration Room",
                "description": "A test collaboration room for real-time coding",
                "is_public": True,
                "max_users": 10
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/collaboration/rooms", json=room_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == room_data["name"] and data.get("id"):
                        self.test_room_id = data["id"]
                        self.log_test("collaboration", "Create Collaboration Room", True)
                        return True
                    else:
                        self.log_test("collaboration", "Create Collaboration Room", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Create Collaboration Room", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Create Collaboration Room", False, str(e))
            return False

    async def test_get_collaboration_room(self):
        """Test getting collaboration room information"""
        if not self.test_room_id:
            self.log_test("collaboration", "Get Collaboration Room", False, "No test room ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/rooms/{self.test_room_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if "room" in data and "stats" in data:
                        room = data["room"]
                        if room.get("id") == self.test_room_id:
                            self.log_test("collaboration", "Get Collaboration Room", True)
                            return True
                        else:
                            self.log_test("collaboration", "Get Collaboration Room", False, f"Room ID mismatch: {room}")
                            return False
                    else:
                        self.log_test("collaboration", "Get Collaboration Room", False, f"Missing room or stats: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Get Collaboration Room", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Get Collaboration Room", False, str(e))
            return False

    async def test_get_project_rooms(self):
        """Test getting all collaboration rooms for a project"""
        if not self.test_project_id:
            self.log_test("collaboration", "Get Project Rooms", False, "No test project ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/projects/{self.test_project_id}/rooms") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Should have at least our test room
                        found_room = any(room.get("id") == self.test_room_id for room in data)
                        if found_room:
                            self.log_test("collaboration", "Get Project Rooms", True)
                            return True
                        else:
                            self.log_test("collaboration", "Get Project Rooms", False, "Test room not found in project rooms")
                            return False
                    else:
                        self.log_test("collaboration", "Get Project Rooms", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Get Project Rooms", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Get Project Rooms", False, str(e))
            return False

    async def test_send_chat_message(self):
        """Test sending a chat message to collaboration room"""
        if not self.test_room_id:
            self.log_test("collaboration", "Send Chat Message", False, "No test room ID available")
            return False
            
        try:
            chat_data = {
                "message": "Hello everyone! Let's collaborate on this VibeCode project!",
                "message_type": "text",
                "metadata": {"test": True}
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/collaboration/rooms/{self.test_room_id}/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("message") == chat_data["message"] and data.get("id"):
                        self.log_test("collaboration", "Send Chat Message", True)
                        return True
                    else:
                        self.log_test("collaboration", "Send Chat Message", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Send Chat Message", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Send Chat Message", False, str(e))
            return False

    async def test_get_chat_history(self):
        """Test getting chat history from collaboration room"""
        if not self.test_room_id:
            self.log_test("collaboration", "Get Chat History", False, "No test room ID available")
            return False
            
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/rooms/{self.test_room_id}/chat") as response:
                if response.status == 200:
                    data = await response.json()
                    if "messages" in data and isinstance(data["messages"], list):
                        # Should have at least one message from our send test
                        messages = data["messages"]
                        if len(messages) > 0:
                            self.log_test("collaboration", "Get Chat History", True)
                        else:
                            self.log_test("collaboration", "Get Chat History", False, "No chat messages found")
                        return True
                    else:
                        self.log_test("collaboration", "Get Chat History", False, f"Expected messages list, got: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Get Chat History", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Get Chat History", False, str(e))
            return False

    async def test_apply_edit_operations(self):
        """Test applying edit operations to a file"""
        if not self.test_file_id:
            self.log_test("collaboration", "Apply Edit Operations", False, "No test file ID available")
            return False
            
        try:
            edit_data = {
                "file_id": self.test_file_id,
                "operations": [
                    {
                        "operation_type": "insert",
                        "position": 0,
                        "content": "# Collaborative Edit Test\n",
                        "user_id": "test_user"
                    }
                ],
                "base_version": 0
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/collaboration/files/{self.test_file_id}/edit", json=edit_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and "new_version" in data:
                        self.log_test("collaboration", "Apply Edit Operations", True)
                        return True
                    else:
                        self.log_test("collaboration", "Apply Edit Operations", False, f"Invalid response data: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("collaboration", "Apply Edit Operations", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("collaboration", "Apply Edit Operations", False, str(e))
            return False

    async def test_websocket_collaboration(self):
        """Test WebSocket collaboration connection"""
        if not self.test_room_id:
            self.log_test("collaboration", "WebSocket Collaboration", False, "No test room ID available")
            return False
            
        try:
            ws_url = f"{WS_BASE_URL}/api/v1/collaboration/rooms/{self.test_room_id}/ws?user_name=TestUser&avatar_color=%23FF5733"
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection confirmation
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if (response_data.get("type") == "connected" and 
                        response_data.get("room_id") == self.test_room_id and
                        response_data.get("user_id")):
                        
                        # Test ping/pong
                        ping_message = {
                            "type": "ping",
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                        await websocket.send(json.dumps(ping_message))
                        
                        # Wait for pong response
                        pong_response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                        pong_data = json.loads(pong_response)
                        
                        if pong_data.get("type") == "pong":
                            self.log_test("collaboration", "WebSocket Collaboration", True)
                            return True
                        else:
                            self.log_test("collaboration", "WebSocket Collaboration", False, f"Invalid pong response: {pong_data}")
                            return False
                    else:
                        self.log_test("collaboration", "WebSocket Collaboration", False, f"Invalid connection message: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("collaboration", "WebSocket Collaboration", False, "Connection timeout")
                    return False
                    
        except Exception as e:
            self.log_test("collaboration", "WebSocket Collaboration", False, str(e))
            return False

    # === CLEANUP TESTS ===
    
    async def test_delete_file(self):
        """Test file deletion"""
        if not self.test_file_id:
            self.log_test("file_management", "Delete File", False, "No test file ID available")
            return False
            
        try:
            async with self.session.delete(f"{API_V1_BASE_URL}/files/{self.test_file_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("message"):
                        self.log_test("file_management", "Delete File", True)
                        return True
                    else:
                        self.log_test("file_management", "Delete File", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("file_management", "Delete File", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("file_management", "Delete File", False, str(e))
            return False

    async def test_delete_project(self):
        """Test project deletion"""
        if not self.test_project_id:
            self.log_test("project_management", "Delete Project", False, "No test project ID available")
            return False
            
        try:
            async with self.session.delete(f"{API_V1_BASE_URL}/projects/{self.test_project_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("message"):
                        self.log_test("project_management", "Delete Project", True)
                        return True
                    else:
                        self.log_test("project_management", "Delete Project", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("project_management", "Delete Project", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("project_management", "Delete Project", False, str(e))
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting VibeCode IDE Backend API Production Enhancement Tests")
        print(f"📡 Testing API at: {API_BASE_URL}")
        print(f"📡 Testing API v1 at: {API_V1_BASE_URL}")
        print(f"🔌 Testing WebSocket at: {WS_BASE_URL}")
        print("=" * 80)
        
        await self.setup_session()
        
        try:
            # Health checks first
            print("\n🏥 Testing Health Checks...")
            health_ok = await self.test_health_check()
            await self.test_enhanced_health_check()
            
            if not health_ok:
                print("❌ Basic backend health check failed. Continuing with other tests...")
            
            # Validation tests
            print("\n✅ Testing Input Validation...")
            await self.test_project_validation_valid()
            await self.test_project_validation_invalid_name()
            await self.test_project_validation_invalid_chars()
            await self.test_file_validation_valid()
            await self.test_file_validation_invalid_name()
            await self.test_file_validation_invalid_type()
            
            # Rate limiting tests
            print("\n🚦 Testing Rate Limiting...")
            await self.test_rate_limiting_health_check()
            await self.test_rate_limiting_project_creation()
            
            # Error handling tests
            print("\n🚨 Testing Error Handling...")
            await self.test_error_handling_404()
            await self.test_error_handling_409_duplicate()
            await self.test_error_handling_400_bad_request()
            
            # Pagination tests
            print("\n📄 Testing Pagination...")
            await self.test_pagination_default()
            await self.test_pagination_with_limit()
            await self.test_pagination_with_skip()
            
            print("\n📁 Testing Project Management API...")
            await self.test_create_project()
            await self.test_get_projects()
            await self.test_get_single_project()
            
            print("\n📄 Testing File Management API...")
            await self.test_create_file()
            await self.test_create_folder()
            await self.test_get_project_files()
            await self.test_get_single_file()
            await self.test_update_file()
            
            print("\n🤖 Testing AI Integration...")
            await self.test_ai_chat()
            await self.test_ai_model_info()
            
            print("\n💬 Testing Chat History...")
            await self.test_get_chat_history()
            
            print("\n🤝 Testing Real-Time Collaboration...")
            await self.test_collaboration_health()
            await self.test_collaboration_stats()
            await self.test_create_collaboration_room()
            await self.test_get_collaboration_room()
            await self.test_get_project_rooms()
            await self.test_send_chat_message()
            await self.test_get_chat_history()
            await self.test_apply_edit_operations()
            await self.test_websocket_collaboration()
            
            print("\n🔌 Testing WebSocket AI (Comprehensive Timeout & Keepalive Tests)...")
            await self.test_websocket_connection_establishment()
            await self.test_websocket_chat_message()
            await self.test_websocket_ping_pong()
            await self.test_websocket_invalid_json()
            await self.test_websocket_unknown_message_type()
            await self.test_websocket_graceful_disconnect()
            
            # Note: Keepalive timeout test takes 35+ seconds, running separately
            print("\n⏱️  Testing WebSocket Keepalive (30+ second test)...")
            await self.test_websocket_keepalive_timeout()
            
            print("\n🧹 Cleanup Tests...")
            await self.test_delete_file()
            await self.test_delete_project()
            
        finally:
            await self.cleanup_session()
        
        # Print summary
        self.print_test_summary()

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 PRODUCTION ENHANCEMENT TEST SUMMARY")
        print("=" * 80)
        
        total_passed = 0
        total_failed = 0
        critical_failures = []
        
        # Define test category order and display names
        categories = [
            ("health_checks", "Health Checks"),
            ("validation_tests", "Input Validation"),
            ("rate_limiting", "Rate Limiting"),
            ("error_handling", "Error Handling"),
            ("pagination", "Pagination"),
            ("project_management", "Project Management"),
            ("file_management", "File Management"),
            ("ai_integration", "AI Integration"),
            ("chat_history", "Chat History"),
            ("collaboration", "Real-Time Collaboration"),
            ("websocket_ai", "WebSocket AI")
        ]
        
        for category_key, display_name in categories:
            if category_key in self.test_results:
                results = self.test_results[category_key]
                passed = results["passed"]
                failed = results["failed"]
                total_passed += passed
                total_failed += failed
                
                status = "✅ PASS" if failed == 0 else "❌ FAIL"
                print(f"{display_name}: {status} ({passed} passed, {failed} failed)")
                
                if failed > 0:
                    critical_failures.extend(results["errors"])
                    for error in results["errors"]:
                        print(f"  ❌ {error}")
        
        print("-" * 80)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 ALL PRODUCTION ENHANCEMENT TESTS PASSED! Backend is production-ready.")
        else:
            print(f"⚠️  {total_failed} tests failed. Backend has issues that need attention.")
            
        print("=" * 80)
        
        return total_failed == 0, critical_failures

async def main():
    """Main test runner"""
    tester = VibeCodeAPITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())