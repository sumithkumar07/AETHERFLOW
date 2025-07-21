#!/usr/bin/env python3
"""
Comprehensive Backend Testing - All Features
Focus on testing all backend functionality with proper error handling
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime

# Backend URL
BACKEND_URL = "http://localhost:8001"
API_V1_BASE_URL = f"{BACKEND_URL}/api/v1"

class ComprehensiveBackendTester:
    def __init__(self):
        self.session = None
        self.test_project_id = None
        self.test_file_id = None
        self.test_session_id = str(uuid.uuid4())
        self.results = {
            "health_checks": [],
            "project_management": [],
            "file_management": [],
            "ai_integration": [],
            "cosmic_features": [],
            "collaboration": []
        }

    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()

    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()

    def log_result(self, category, test_name, success, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'success': success,
            'details': details
        }
        self.results[category].append(result)
        print(f"{status}: {test_name}")
        if not success and details:
            print(f"    Error: {details}")

    async def test_health_checks(self):
        """Test API health endpoints"""
        print("\n🏥 Testing Health Checks...")
        
        # Test basic API endpoint
        try:
            async with self.session.get(f"{BACKEND_URL}/api/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "status" in data and "version" in data:
                        self.log_result("health_checks", "Basic API Health Check", True)
                    else:
                        self.log_result("health_checks", "Basic API Health Check", False, f"Missing status/version in response")
                else:
                    self.log_result("health_checks", "Basic API Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("health_checks", "Basic API Health Check", False, str(e))

        # Test enhanced health endpoint
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "timestamp", "version", "database"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("health_checks", "Enhanced Health Check", False, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result("health_checks", "Enhanced Health Check", True)
                else:
                    self.log_result("health_checks", "Enhanced Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("health_checks", "Enhanced Health Check", False, str(e))

    async def test_project_management(self):
        """Test project management endpoints"""
        print("\n📁 Testing Project Management...")
        
        # Create project
        try:
            project_data = {
                "name": f"Backend Test Project {uuid.uuid4().hex[:8]}",
                "description": "Comprehensive backend testing project"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == project_data["name"] and data.get("id"):
                        self.test_project_id = data["id"]
                        self.log_result("project_management", "Create Project", True)
                    else:
                        self.log_result("project_management", "Create Project", False, f"Invalid response: {data}")
                elif response.status == 429:
                    # Rate limited - wait and retry once
                    await asyncio.sleep(2)
                    async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as retry_response:
                        if retry_response.status == 200:
                            data = await retry_response.json()
                            self.test_project_id = data["id"]
                            self.log_result("project_management", "Create Project", True)
                        else:
                            self.log_result("project_management", "Create Project", False, f"HTTP {retry_response.status} after retry")
                else:
                    error_text = await response.text()
                    self.log_result("project_management", "Create Project", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("project_management", "Create Project", False, str(e))

        # Get projects
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        self.log_result("project_management", "Get Projects", True)
                    else:
                        self.log_result("project_management", "Get Projects", False, f"Expected list, got: {type(data)}")
                else:
                    self.log_result("project_management", "Get Projects", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("project_management", "Get Projects", False, str(e))

        # Get single project
        if self.test_project_id:
            try:
                async with self.session.get(f"{API_V1_BASE_URL}/projects/{self.test_project_id}") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("id") == self.test_project_id:
                            self.log_result("project_management", "Get Single Project", True)
                        else:
                            self.log_result("project_management", "Get Single Project", False, f"Project ID mismatch")
                    else:
                        self.log_result("project_management", "Get Single Project", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result("project_management", "Get Single Project", False, str(e))

    async def test_file_management(self):
        """Test file management endpoints"""
        print("\n📄 Testing File Management...")
        
        if not self.test_project_id:
            self.log_result("file_management", "File Management Tests", False, "No test project available")
            return

        # Create file
        try:
            file_data = {
                "name": "test_file.py",
                "type": "file",
                "content": "# Test file for backend testing\nprint('Hello, VibeCode!')\n\ndef test_function():\n    return 'Backend test successful'"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files", json=file_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("name") == file_data["name"] and data.get("id"):
                        self.test_file_id = data["id"]
                        self.log_result("file_management", "Create File", True)
                    else:
                        self.log_result("file_management", "Create File", False, f"Invalid response: {data}")
                else:
                    error_text = await response.text()
                    self.log_result("file_management", "Create File", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("file_management", "Create File", False, str(e))

        # Get project files
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/projects/{self.test_project_id}/files") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        self.log_result("file_management", "Get Project Files", True)
                    else:
                        self.log_result("file_management", "Get Project Files", False, f"Expected list, got: {type(data)}")
                else:
                    self.log_result("file_management", "Get Project Files", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("file_management", "Get Project Files", False, str(e))

        # Get single file
        if self.test_file_id:
            try:
                async with self.session.get(f"{API_V1_BASE_URL}/files/{self.test_file_id}") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("id") == self.test_file_id and data.get("content"):
                            self.log_result("file_management", "Get Single File", True)
                        else:
                            self.log_result("file_management", "Get Single File", False, f"Invalid file data")
                    else:
                        self.log_result("file_management", "Get Single File", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result("file_management", "Get Single File", False, str(e))

            # Update file
            try:
                update_data = {
                    "content": "# Updated test file\nprint('Hello, Updated VibeCode!')\n\ndef updated_function():\n    return 'Backend update test successful'"
                }
                
                async with self.session.put(f"{API_V1_BASE_URL}/files/{self.test_file_id}", json=update_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("message"):
                            self.log_result("file_management", "Update File", True)
                        else:
                            self.log_result("file_management", "Update File", False, f"Unexpected response: {data}")
                    else:
                        self.log_result("file_management", "Update File", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result("file_management", "Update File", False, str(e))

    async def test_ai_integration(self):
        """Test AI integration endpoints"""
        print("\n🤖 Testing AI Integration...")
        
        # Test AI chat
        try:
            chat_data = {
                "message": "Write a simple Python function to calculate factorial",
                "session_id": self.test_session_id,
                "context": {"current_file": "test_file.py"}
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("response") and data.get("session_id"):
                        self.log_result("ai_integration", "AI Chat", True)
                    else:
                        self.log_result("ai_integration", "AI Chat", False, f"Invalid response format: {data}")
                else:
                    error_text = await response.text()
                    self.log_result("ai_integration", "AI Chat", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("ai_integration", "AI Chat", False, str(e))

        # Test chat history
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/ai/chat/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, dict) and "messages" in data:
                        self.log_result("ai_integration", "Chat History", True)
                    else:
                        self.log_result("ai_integration", "Chat History", False, f"Expected dict with messages, got: {type(data)}")
                else:
                    self.log_result("ai_integration", "Chat History", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("ai_integration", "Chat History", False, str(e))

    async def test_cosmic_features(self):
        """Test all cosmic features"""
        print("\n🌌 Testing Cosmic Features...")
        
        # Test genetic algorithm code evolution (PRIORITY)
        try:
            evolution_data = {
                "code": "function calculateArea(radius) { var area = 3.14 * radius * radius; console.log(area); return area; }",
                "language": "javascript",
                "generations": 3,
                "user_id": "backend_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/evolve-code", json=evolution_data) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "original_code", "evolved_code", "fitness_improvement", "generations", "evolution_id"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("cosmic_features", "Genetic Algorithm Code Evolution", False, f"Missing fields: {missing_fields}")
                    elif data.get("status") != "evolution_complete":
                        self.log_result("cosmic_features", "Genetic Algorithm Code Evolution", False, f"Invalid status: {data.get('status')}")
                    else:
                        self.log_result("cosmic_features", "Genetic Algorithm Code Evolution", True)
                else:
                    error_text = await response.text()
                    self.log_result("cosmic_features", "Genetic Algorithm Code Evolution", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("cosmic_features", "Genetic Algorithm Code Evolution", False, str(e))

        # Test karma reincarnation
        try:
            karma_data = {
                "code": "// Bad code example\nvar a = 1; var b = 2; var c = a + b; // TODO: refactor this",
                "language": "javascript",
                "user_id": "backend_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/karma/reincarnate", json=karma_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "reincarnation_complete":
                        self.log_result("cosmic_features", "Karma Reincarnation", True)
                    else:
                        self.log_result("cosmic_features", "Karma Reincarnation", False, f"Invalid status: {data.get('status')}")
                else:
                    error_text = await response.text()
                    self.log_result("cosmic_features", "Karma Reincarnation", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("cosmic_features", "Karma Reincarnation", False, str(e))

        # Test digital archaeology
        if self.test_project_id:
            try:
                archaeology_data = {
                    "project_id": self.test_project_id,
                    "user_id": "backend_test_user"
                }
                
                async with self.session.post(f"{API_V1_BASE_URL}/cosmic/archaeology/mine", json=archaeology_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("status") == "archaeology_complete":
                            self.log_result("cosmic_features", "Digital Archaeology", True)
                        else:
                            self.log_result("cosmic_features", "Digital Archaeology", False, f"Invalid status: {data.get('status')}")
                    else:
                        error_text = await response.text()
                        self.log_result("cosmic_features", "Digital Archaeology", False, f"HTTP {response.status}: {error_text}")
            except Exception as e:
                self.log_result("cosmic_features", "Digital Archaeology", False, str(e))

        # Test VIBE token economy
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/cosmic/vibe/balance/backend_test_user") as response:
                if response.status == 200:
                    data = await response.json()
                    if "balance" in data and "karma_level" in data:
                        self.log_result("cosmic_features", "VIBE Token Economy", True)
                    else:
                        self.log_result("cosmic_features", "VIBE Token Economy", False, f"Missing balance/karma_level")
                else:
                    self.log_result("cosmic_features", "VIBE Token Economy", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("cosmic_features", "VIBE Token Economy", False, str(e))

        # Test nexus events
        try:
            nexus_data = {
                "source_platform": "desktop",
                "target_platform": "mobile",
                "action": "sync_project",
                "payload": {"project_id": self.test_project_id or "test_project"},
                "user_id": "backend_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/nexus/create", json=nexus_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "nexus_created":
                        self.log_result("cosmic_features", "Nexus Events", True)
                    else:
                        self.log_result("cosmic_features", "Nexus Events", False, f"Invalid status: {data.get('status')}")
                else:
                    error_text = await response.text()
                    self.log_result("cosmic_features", "Nexus Events", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_result("cosmic_features", "Nexus Events", False, str(e))

        # Test cosmic debugging
        if self.test_project_id:
            try:
                debug_data = {
                    "project_id": self.test_project_id,
                    "user_id": "backend_test_user"
                }
                
                async with self.session.post(f"{API_V1_BASE_URL}/cosmic/debug/time-travel", json=debug_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("status") == "debug_session_started":
                            self.log_result("cosmic_features", "Cosmic Debugging", True)
                        else:
                            self.log_result("cosmic_features", "Cosmic Debugging", False, f"Invalid status: {data.get('status')}")
                    else:
                        error_text = await response.text()
                        self.log_result("cosmic_features", "Cosmic Debugging", False, f"HTTP {response.status}: {error_text}")
            except Exception as e:
                self.log_result("cosmic_features", "Cosmic Debugging", False, str(e))

        # Test reality metrics
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/cosmic/reality/metrics") as response:
                if response.status == 200:
                    data = await response.json()
                    if "reality_version" in data and "quantum_coherence" in data:
                        self.log_result("cosmic_features", "Reality Metrics", True)
                    else:
                        self.log_result("cosmic_features", "Reality Metrics", False, f"Missing required fields")
                else:
                    self.log_result("cosmic_features", "Reality Metrics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("cosmic_features", "Reality Metrics", False, str(e))

    async def test_collaboration(self):
        """Test collaboration features"""
        print("\n🤝 Testing Collaboration...")
        
        # Test collaboration health
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if "status" in data and "stats" in data:
                        self.log_result("collaboration", "Collaboration Health", True)
                    else:
                        self.log_result("collaboration", "Collaboration Health", False, f"Missing status/stats")
                else:
                    self.log_result("collaboration", "Collaboration Health", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("collaboration", "Collaboration Health", False, str(e))

        # Test collaboration stats
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/collaboration/stats") as response:
                if response.status == 200:
                    data = await response.json()
                    if "timestamp" in data and "database" in data:
                        self.log_result("collaboration", "Collaboration Statistics", True)
                    else:
                        self.log_result("collaboration", "Collaboration Statistics", False, f"Missing required fields")
                else:
                    self.log_result("collaboration", "Collaboration Statistics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("collaboration", "Collaboration Statistics", False, str(e))

    async def run_all_tests(self):
        """Run comprehensive backend tests"""
        print("🚀 COMPREHENSIVE BACKEND TESTING")
        print("=" * 60)
        print("🎯 Focus: Genetic Algorithm Code Evolution (Fixed Async Bug)")
        print("📊 Coverage: All Backend Features")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            await self.test_health_checks()
            await self.test_project_management()
            await self.test_file_management()
            await self.test_ai_integration()
            await self.test_cosmic_features()
            await self.test_collaboration()
            
        finally:
            await self.cleanup_session()
        
        # Print comprehensive summary
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE BACKEND TEST SUMMARY")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        
        for category, tests in self.results.items():
            passed = sum(1 for t in tests if t['success'])
            failed = sum(1 for t in tests if not t['success'])
            total_passed += passed
            total_failed += failed
            
            status = "✅" if failed == 0 else "❌"
            print(f"{status} {category.replace('_', ' ').title()}: {passed} passed, {failed} failed")
            
            # Show failed tests
            for test in tests:
                if not test['success']:
                    print(f"    ❌ {test['test']}: {test['details']}")
        
        total_tests = total_passed + total_failed
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 Overall Results:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {total_passed}")
        print(f"   ❌ Failed: {total_failed}")
        print(f"   📊 Success Rate: {success_rate:.1f}%")
        
        # Critical genetic algorithm result
        genetic_tests = []
        for tests in self.results.values():
            genetic_tests.extend([t for t in tests if 'Genetic Algorithm' in t['test']])
        
        print(f"\n🎯 CRITICAL RESULT - GENETIC ALGORITHM:")
        if genetic_tests:
            genetic_passed = all(t['success'] for t in genetic_tests)
            if genetic_passed:
                print("✅ GENETIC ALGORITHM CODE EVOLUTION IS WORKING!")
                print("🔧 The async bug fix was SUCCESSFUL!")
            else:
                print("❌ GENETIC ALGORITHM CODE EVOLUTION HAS ISSUES!")
                for test in genetic_tests:
                    if not test['success']:
                        print(f"   ❌ {test['test']}: {test['details']}")
        else:
            print("⚠️  No genetic algorithm tests found")
        
        return total_passed, total_failed

async def main():
    tester = ComprehensiveBackendTester()
    passed, failed = await tester.run_all_tests()
    
    if failed == 0:
        print("\n🎉 ALL BACKEND FEATURES ARE OPERATIONAL!")
        exit(0)
    else:
        print(f"\n⚠️  {failed} backend features need attention")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())