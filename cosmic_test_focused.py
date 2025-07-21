#!/usr/bin/env python3
"""
Focused Cosmic Features Testing - Priority on Genetic Algorithm Code Evolution
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime

# Backend URL
BACKEND_URL = "http://localhost:8001"
API_V1_BASE_URL = f"{BACKEND_URL}/api/v1"

class CosmicTester:
    def __init__(self):
        self.session = None
        self.test_project_id = None
        self.results = []

    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()

    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()

    def log_result(self, test_name, success, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        print(f"{status}: {test_name}")
        if not success and details:
            print(f"    Error: {details}")

    async def create_test_project(self):
        """Create a test project for cosmic features"""
        try:
            project_data = {
                "name": f"Cosmic Test Project {uuid.uuid4().hex[:8]}",
                "description": "Test project for cosmic features"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.test_project_id = data["id"]
                    return True
                else:
                    return False
        except Exception:
            return False

    async def test_genetic_algorithm_code_evolution(self):
        """PRIORITY TEST: Genetic Algorithm Code Evolution - The main focus"""
        try:
            # Test with JavaScript code
            js_evolution_data = {
                "code": "function calculateSum(a, b) { var result = a + b; console.log(result); return result; }",
                "language": "javascript",
                "generations": 3,
                "user_id": "cosmic_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/evolve-code", json=js_evolution_data) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check required fields
                    required_fields = ["status", "original_code", "evolved_code", "fitness_improvement", "generations", "evolution_id"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Genetic Algorithm - JavaScript Evolution", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check status
                    if data.get("status") != "evolution_complete":
                        self.log_result("Genetic Algorithm - JavaScript Evolution", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    # Check that we have generations data
                    if not data.get("generations") or len(data.get("generations", [])) == 0:
                        self.log_result("Genetic Algorithm - JavaScript Evolution", False, "No generation data returned")
                        return False
                    
                    self.log_result("Genetic Algorithm - JavaScript Evolution", True, f"Evolution ID: {data.get('evolution_id')}")
                    
                    # Test with Python code
                    python_evolution_data = {
                        "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)",
                        "language": "python",
                        "generations": 2,
                        "user_id": "cosmic_test_user"
                    }
                    
                    async with self.session.post(f"{API_V1_BASE_URL}/cosmic/evolve-code", json=python_evolution_data) as py_response:
                        if py_response.status == 200:
                            py_data = await py_response.json()
                            if py_data.get("status") == "evolution_complete":
                                self.log_result("Genetic Algorithm - Python Evolution", True, f"Evolution ID: {py_data.get('evolution_id')}")
                                return True
                            else:
                                self.log_result("Genetic Algorithm - Python Evolution", False, f"Python evolution failed: {py_data}")
                                return False
                        else:
                            error_text = await py_response.text()
                            self.log_result("Genetic Algorithm - Python Evolution", False, f"HTTP {py_response.status}: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_result("Genetic Algorithm - JavaScript Evolution", False, f"HTTP {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Genetic Algorithm Code Evolution", False, str(e))
            return False

    async def test_karma_reincarnation(self):
        """Test karma reincarnation system"""
        try:
            karma_data = {
                "code": "// This is terrible code\nvar x = 1; var y = 2; var z = x + y; // TODO: fix this mess",
                "language": "javascript",
                "user_id": "cosmic_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/karma/reincarnate", json=karma_data) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "code_hash", "quality", "karma_debt", "reincarnation_path", "message", "cycles"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Karma Reincarnation System", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    if data.get("status") != "reincarnation_complete":
                        self.log_result("Karma Reincarnation System", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    self.log_result("Karma Reincarnation System", True, f"Path: {data.get('reincarnation_path')}, Karma Debt: {data.get('karma_debt')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Karma Reincarnation System", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Karma Reincarnation System", False, str(e))
            return False

    async def test_digital_archaeology(self):
        """Test digital archaeology mining"""
        if not self.test_project_id:
            self.log_result("Digital Archaeology Mining", False, "No test project available")
            return False
            
        try:
            archaeology_data = {
                "project_id": self.test_project_id,
                "user_id": "cosmic_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/archaeology/mine", json=archaeology_data) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "findings", "vibe_earned", "files_analyzed", "session_id"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Digital Archaeology Mining", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    if data.get("status") != "archaeology_complete":
                        self.log_result("Digital Archaeology Mining", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    self.log_result("Digital Archaeology Mining", True, f"Files analyzed: {data.get('files_analyzed')}, VIBE earned: {data.get('vibe_earned')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Digital Archaeology Mining", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Digital Archaeology Mining", False, str(e))
            return False

    async def test_vibe_token_economy(self):
        """Test VIBE token economy endpoints"""
        try:
            # Test balance retrieval
            async with self.session.get(f"{API_V1_BASE_URL}/cosmic/vibe/balance/cosmic_test_user") as response:
                if response.status == 200:
                    balance_data = await response.json()
                    required_fields = ["user_id", "balance", "karma_level"]
                    missing_fields = [field for field in required_fields if field not in balance_data]
                    
                    if missing_fields:
                        self.log_result("VIBE Token Economy - Balance", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    self.log_result("VIBE Token Economy - Balance", True, f"Balance: {balance_data.get('balance')}, Karma Level: {balance_data.get('karma_level')}")
                    
                    # Test transaction
                    transaction_data = {
                        "user_id": "cosmic_test_user",
                        "amount": 50,
                        "transaction_type": "mine",
                        "reason": "Testing cosmic features"
                    }
                    
                    async with self.session.post(f"{API_V1_BASE_URL}/cosmic/vibe/transaction", json=transaction_data) as tx_response:
                        if tx_response.status == 200:
                            tx_data = await tx_response.json()
                            if tx_data.get("status") == "transaction_complete":
                                self.log_result("VIBE Token Economy - Transaction", True, f"Transaction ID: {tx_data.get('transaction_id')}")
                                return True
                            else:
                                self.log_result("VIBE Token Economy - Transaction", False, f"Transaction failed: {tx_data}")
                                return False
                        else:
                            error_text = await tx_response.text()
                            self.log_result("VIBE Token Economy - Transaction", False, f"HTTP {tx_response.status}: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_result("VIBE Token Economy - Balance", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("VIBE Token Economy", False, str(e))
            return False

    async def test_nexus_events(self):
        """Test nexus events system"""
        try:
            nexus_data = {
                "source_platform": "desktop",
                "target_platform": "mobile",
                "action": "sync_project",
                "payload": {"project_id": self.test_project_id or "test_project"},
                "user_id": "cosmic_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/nexus/create", json=nexus_data) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "event_id", "description", "quantum_signature", "result"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Nexus Events System", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    if data.get("status") != "nexus_created":
                        self.log_result("Nexus Events System", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    self.log_result("Nexus Events System", True, f"Event ID: {data.get('event_id')}, Quantum Signature: {data.get('quantum_signature')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Nexus Events System", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Nexus Events System", False, str(e))
            return False

    async def test_cosmic_debugging(self):
        """Test cosmic debugging with time travel"""
        if not self.test_project_id:
            self.log_result("Cosmic Debugging", False, "No test project available")
            return False
            
        try:
            debug_data = {
                "project_id": self.test_project_id,
                "user_id": "cosmic_test_user"
            }
            
            async with self.session.post(f"{API_V1_BASE_URL}/cosmic/debug/time-travel", json=debug_data) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "session_id", "destination", "available_timepoints", "message", "temporal_status"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Cosmic Debugging", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    if data.get("status") != "debug_session_started":
                        self.log_result("Cosmic Debugging", False, f"Invalid status: {data.get('status')}")
                        return False
                    
                    self.log_result("Cosmic Debugging", True, f"Session ID: {data.get('session_id')}, Destination: {data.get('destination')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Cosmic Debugging", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Cosmic Debugging", False, str(e))
            return False

    async def test_reality_metrics(self):
        """Test reality metrics endpoint"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/cosmic/reality/metrics") as response:
                if response.status == 200:
                    data = await response.json()
                    # The actual response structure from the cosmic service
                    required_fields = ["reality_version", "cosmic_time", "vibe_frequency", "quantum_coherence", "cosmic_harmony_index"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Reality Metrics", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    self.log_result("Reality Metrics", True, f"Reality Version: {data.get('reality_version')}, Quantum Coherence: {data.get('quantum_coherence')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Reality Metrics", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Reality Metrics", False, str(e))
            return False

    async def test_cosmic_status(self):
        """Test cosmic system status"""
        try:
            async with self.session.get(f"{API_V1_BASE_URL}/cosmic/reality/status") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["cosmic_status", "reality_version", "quantum_coherence", "active_features"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result("Cosmic System Status", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    if data.get("cosmic_status") != "operational":
                        self.log_result("Cosmic System Status", False, f"System not operational: {data.get('cosmic_status')}")
                        return False
                    
                    self.log_result("Cosmic System Status", True, f"Status: {data.get('cosmic_status')}, Features: {len(data.get('active_features', []))}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Cosmic System Status", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Cosmic System Status", False, str(e))
            return False

    async def run_all_tests(self):
        """Run all cosmic feature tests"""
        print("🌌 COSMIC FEATURES COMPREHENSIVE TESTING")
        print("=" * 60)
        print("🎯 PRIORITY: Testing Genetic Algorithm Code Evolution (Fixed Async Bug)")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Create test project first
            print("\n📁 Setting up test project...")
            if await self.create_test_project():
                print(f"✅ Test project created: {self.test_project_id}")
            else:
                print("❌ Failed to create test project")
            
            print("\n🧬 PRIORITY TEST: Genetic Algorithm Code Evolution")
            print("-" * 50)
            await self.test_genetic_algorithm_code_evolution()
            
            print("\n♻️ Testing Karma Reincarnation System")
            print("-" * 50)
            await self.test_karma_reincarnation()
            
            print("\n⛏️ Testing Digital Archaeology Mining")
            print("-" * 50)
            await self.test_digital_archaeology()
            
            print("\n💎 Testing VIBE Token Economy")
            print("-" * 50)
            await self.test_vibe_token_economy()
            
            print("\n🌐 Testing Nexus Events System")
            print("-" * 50)
            await self.test_nexus_events()
            
            print("\n⏰ Testing Cosmic Debugging")
            print("-" * 50)
            await self.test_cosmic_debugging()
            
            print("\n📊 Testing Reality Metrics")
            print("-" * 50)
            await self.test_reality_metrics()
            
            print("\n🌌 Testing Cosmic System Status")
            print("-" * 50)
            await self.test_cosmic_status()
            
        finally:
            await self.cleanup_session()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🌌 COSMIC FEATURES TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r['success'])
        failed = sum(1 for r in self.results if not r['success'])
        total = len(self.results)
        
        print(f"📊 Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/total*100):.1f}%")
        
        print("\n🎯 CRITICAL RESULT - GENETIC ALGORITHM CODE EVOLUTION:")
        genetic_tests = [r for r in self.results if 'Genetic Algorithm' in r['test']]
        if genetic_tests:
            all_genetic_passed = all(r['success'] for r in genetic_tests)
            if all_genetic_passed:
                print("✅ GENETIC ALGORITHM CODE EVOLUTION IS WORKING!")
                print("🔧 The async bug fix was successful!")
            else:
                print("❌ GENETIC ALGORITHM CODE EVOLUTION HAS ISSUES!")
                for test in genetic_tests:
                    if not test['success']:
                        print(f"   ❌ {test['test']}: {test['details']}")
        
        print("\n📋 Detailed Results:")
        for result in self.results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if not result['success'] and result['details']:
                print(f"    └─ {result['details']}")
        
        return passed, failed

async def main():
    tester = CosmicTester()
    passed, failed = await tester.run_all_tests()
    
    if failed == 0:
        print("\n🎉 ALL COSMIC FEATURES ARE OPERATIONAL!")
        exit(0)
    else:
        print(f"\n⚠️  {failed} cosmic features need attention")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())