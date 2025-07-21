#!/usr/bin/env python3
"""
VibeCode IDE Backend API Testing Suite
Tests all backend functionality including Project Management, File Management, AI Integration, and WebSocket
"""

import asyncio
import aiohttp
import json
import uuid
import websockets
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
BACKEND_URL = "https://161f7bb9-e950-4bea-a299-cf405467d045.preview.emergentagent.com"
API_BASE_URL = f"{BACKEND_URL}/api"
WS_BASE_URL = BACKEND_URL.replace("https://", "wss://")

class VibeCodeAPITester:
    def __init__(self):
        self.session = None
        self.test_results = {
            "project_management": {"passed": 0, "failed": 0, "errors": []},
            "file_management": {"passed": 0, "failed": 0, "errors": []},
            "ai_integration": {"passed": 0, "failed": 0, "errors": []},
            "websocket_ai": {"passed": 0, "failed": 0, "errors": []},
            "chat_history": {"passed": 0, "failed": 0, "errors": []}
        }
        self.test_project_id = None
        self.test_file_id = None
        self.test_session_id = str(uuid.uuid4())

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
        """Test API health check"""
        try:
            async with self.session.get(f"{API_BASE_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "healthy":
                        print("✅ API Health Check: Backend is healthy")
                        return True
                    else:
                        print(f"❌ API Health Check: Unexpected response: {data}")
                        return False
                else:
                    print(f"❌ API Health Check: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ API Health Check: Connection error: {e}")
            return False

    # === PROJECT MANAGEMENT TESTS ===
    
    async def test_create_project(self):
        """Test project creation"""
        try:
            project_data = {
                "name": "VibeCode Test Project",
                "description": "A test project for the VibeCode IDE"
            }
            
            async with self.session.post(f"{API_BASE_URL}/projects", json=project_data) as response:
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
            async with self.session.get(f"{API_BASE_URL}/projects") as response:
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
            async with self.session.get(f"{API_BASE_URL}/projects/{self.test_project_id}") as response:
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
            
            async with self.session.post(f"{API_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
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
            
            async with self.session.post(f"{API_BASE_URL}/projects/{self.test_project_id}/files", json=folder_data) as response:
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
            async with self.session.get(f"{API_BASE_URL}/projects/{self.test_project_id}/files") as response:
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
            async with self.session.get(f"{API_BASE_URL}/files/{self.test_file_id}") as response:
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
            
            async with self.session.put(f"{API_BASE_URL}/files/{self.test_file_id}", json=update_data) as response:
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
            
            async with self.session.post(f"{API_BASE_URL}/ai/chat", json=chat_data) as response:
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

    async def test_code_generation(self):
        """Test AI code generation"""
        try:
            code_data = {
                "message": "def fibonacci(n):",
                "session_id": self.test_session_id
            }
            
            async with self.session.post(f"{API_BASE_URL}/ai/generate-code", json=code_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("generated_code") is not None:
                        self.log_test("ai_integration", "Code Generation", True)
                        return True
                    else:
                        self.log_test("ai_integration", "Code Generation", False, f"No generated code in response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("ai_integration", "Code Generation", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("ai_integration", "Code Generation", False, str(e))
            return False

    # === CHAT HISTORY TESTS ===
    
    async def test_get_chat_history(self):
        """Test chat history retrieval"""
        try:
            async with self.session.get(f"{API_BASE_URL}/ai/chat/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Should have at least one message from our AI chat test
                        if len(data) > 0:
                            self.log_test("chat_history", "Get Chat History", True)
                        else:
                            self.log_test("chat_history", "Get Chat History", False, "No chat history found")
                        return True
                    else:
                        self.log_test("chat_history", "Get Chat History", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("chat_history", "Get Chat History", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("chat_history", "Get Chat History", False, str(e))
            return False

    # === WEBSOCKET TESTS ===
    
    async def test_websocket_ai_chat(self):
        """Test WebSocket AI chat functionality"""
        try:
            ws_url = f"{WS_BASE_URL}/ws/ai/{self.test_session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Send a test message
                test_message = {
                    "message": "Hello, can you help me with Python programming?",
                    "context": {"current_file": "test.py"}
                }
                
                await websocket.send(json.dumps(test_message))
                
                # Wait for response with timeout
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    response_data = json.loads(response)
                    
                    if response_data.get("type") == "ai_response" and response_data.get("message"):
                        self.log_test("websocket_ai", "WebSocket AI Chat", True)
                        return True
                    else:
                        self.log_test("websocket_ai", "WebSocket AI Chat", False, f"Invalid response format: {response_data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("websocket_ai", "WebSocket AI Chat", False, "Response timeout")
                    return False
                    
        except Exception as e:
            self.log_test("websocket_ai", "WebSocket AI Chat", False, str(e))
            return False

    # === CLEANUP TESTS ===
    
    async def test_delete_file(self):
        """Test file deletion"""
        if not self.test_file_id:
            self.log_test("file_management", "Delete File", False, "No test file ID available")
            return False
            
        try:
            async with self.session.delete(f"{API_BASE_URL}/files/{self.test_file_id}") as response:
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
            async with self.session.delete(f"{API_BASE_URL}/projects/{self.test_project_id}") as response:
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
        print("🚀 Starting VibeCode IDE Backend API Tests")
        print(f"📡 Testing API at: {API_BASE_URL}")
        print(f"🔌 Testing WebSocket at: {WS_BASE_URL}")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Health check first
            health_ok = await self.test_health_check()
            if not health_ok:
                print("❌ Backend health check failed. Stopping tests.")
                return
            
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
            await self.test_code_generation()
            
            print("\n💬 Testing Chat History...")
            await self.test_get_chat_history()
            
            print("\n🔌 Testing WebSocket AI...")
            await self.test_websocket_ai_chat()
            
            print("\n🧹 Cleanup Tests...")
            await self.test_delete_file()
            await self.test_delete_project()
            
        finally:
            await self.cleanup_session()
        
        # Print summary
        self.print_test_summary()

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        critical_failures = []
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.replace('_', ' ').title()}: {status} ({passed} passed, {failed} failed)")
            
            if failed > 0:
                critical_failures.extend(results["errors"])
                for error in results["errors"]:
                    print(f"  ❌ {error}")
        
        print("-" * 60)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 ALL TESTS PASSED! Backend is fully functional.")
        else:
            print(f"⚠️  {total_failed} tests failed. Backend has issues that need attention.")
            
        print("=" * 60)
        
        return total_failed == 0, critical_failures

async def main():
    """Main test runner"""
    tester = VibeCodeAPITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())