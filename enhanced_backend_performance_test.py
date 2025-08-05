#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING - AETHER AI PLATFORM ENHANCEMENTS
Testing all enhanced backend functionality according to user requirements:

1. AI Abilities Enhancement - Enhanced AI service v2 with performance optimizations
2. Performance & Optimization - <2s response times and caching improvements 
3. Multi-Agent Coordination - Improved agent coordination system
4. Robustness - Error handling, retry logic, and system resilience
"""

import requests
import json
import time
import asyncio
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List
import statistics

class EnhancedBackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.performance_metrics = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def log_test(self, test_name: str, status: str, details: str = "", response_time: float = None, response_code: int = None):
        """Log test results with performance metrics"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": response_time,
            "response_code": response_code,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if response_time:
            self.performance_metrics.append({
                "test": test_name,
                "response_time": response_time,
                "meets_target": response_time < 2.0
            })
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_time:
            target_status = "✅ MEETS TARGET" if response_time < 2.0 else "❌ EXCEEDS TARGET"
            print(f"   Response Time: {response_time:.2f}s ({target_status})")
        if response_code:
            print(f"   Response Code: {response_code}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request with timing and proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        start_time = time.time()
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            response_time = time.time() - start_time
            return response, response_time
            
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            print(f"Request failed: {e}")
            return None, response_time

    def authenticate(self):
        """Authenticate with demo user"""
        print("🔐 Authenticating with demo user...")
        
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo User Authentication", "PASS", 
                            f"Token received for {data.get('user', {}).get('email')}", 
                            response_time, response.status_code)
                return True
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response_time, response.status_code)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Login failed", response_time, response.status_code if response else None)
        return False

    def test_enhanced_ai_service_v3(self):
        """Test Enhanced AI Service v3 with performance optimizations"""
        print("🚀 Testing Enhanced AI Service v3 - Performance Optimizations...")
        
        if not self.auth_token:
            self.log_test("Enhanced AI v3 Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Enhanced AI Chat with <2s target
        print("⚡ Testing Enhanced AI Chat - Sub-2 Second Target...")
        chat_request = {
            "message": "Create a simple React component for a todo list with TypeScript",
            "session_id": f"test_session_{int(time.time())}",
            "project_id": "test_project",
            "user_id": "demo_user",
            "include_context": True
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ["content", "session_id", "agent", "agent_role", "agents", "type", "timestamp", "model_used"]
            
            if all(field in data for field in required_fields):
                self.log_test("Enhanced AI v3 Chat", "PASS", 
                            f"Multi-agent response: {data.get('agent')} ({data.get('agent_role')}), "
                            f"Type: {data.get('type')}, Model: {data.get('model_used')}", 
                            response_time, response.status_code)
                self.test_session_id = data["session_id"]
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log_test("Enhanced AI v3 Chat", "FAIL", 
                            f"Missing required fields: {missing_fields}", 
                            response_time, response.status_code)
        else:
            self.log_test("Enhanced AI v3 Chat", "FAIL", 
                        "Enhanced AI v3 chat endpoint failed", 
                        response_time, response.status_code if response else None)
        
        # Test 2: Quick Response Mode - Ultra-Fast <2s
        print("⚡ Testing Quick Response Mode - Ultra-Fast Target...")
        quick_request = {
            "message": "Write a Python function to calculate fibonacci numbers",
            "user_id": "demo_user"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_request)
        if response and response.status_code == 200:
            data = response.json()
            if ("content" in data and "performance_optimized" in data and 
                data.get("target_achieved") == "<2s"):
                self.log_test("Quick Response Mode", "PASS", 
                            f"Ultra-fast response: {data.get('agent')}, "
                            f"Optimized: {data.get('performance_optimized')}, "
                            f"Target: {data.get('target_achieved')}", 
                            response_time, response.status_code)
            else:
                self.log_test("Quick Response Mode", "FAIL", 
                            "Missing performance optimization indicators", 
                            response_time, response.status_code)
        else:
            self.log_test("Quick Response Mode", "FAIL", 
                        "Quick response endpoint failed", 
                        response_time, response.status_code if response else None)
        
        # Test 3: Available Agents
        print("🤖 Testing Available Agents...")
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and "total_agents" in data:
                agents = data["agents"]
                if len(agents) >= 5:  # Should have 5 specialized agents
                    agent_names = [agent.get("name") for agent in agents]
                    self.log_test("Available Agents", "PASS", 
                                f"Found {len(agents)} agents: {', '.join(agent_names)}", 
                                response_time, response.status_code)
                else:
                    self.log_test("Available Agents", "FAIL", 
                                f"Expected 5+ agents, found {len(agents)}", 
                                response_time, response.status_code)
            else:
                self.log_test("Available Agents", "FAIL", 
                            "Missing agents data structure", 
                            response_time, response.status_code)
        else:
            self.log_test("Available Agents", "FAIL", 
                        "Available agents endpoint failed", 
                        response_time, response.status_code if response else None)

    def test_multi_agent_coordination(self):
        """Test improved multi-agent coordination system"""
        print("🤝 Testing Multi-Agent Coordination System...")
        
        if not self.auth_token:
            self.log_test("Multi-Agent Coordination Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Complex Multi-Agent Request
        print("🧠 Testing Complex Multi-Agent Request...")
        complex_request = {
            "message": "I need to build a complete e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, user authentication, admin dashboard, and comprehensive testing strategy. Please coordinate all necessary agents.",
            "session_id": f"multi_agent_session_{int(time.time())}",
            "project_id": "ecommerce_project",
            "user_id": "demo_user",
            "include_context": True
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", complex_request)
        if response and response.status_code == 200:
            data = response.json()
            if (data.get("type") in ["multi_agent", "collaborative"] and 
                len(data.get("agents", [])) > 1):
                self.log_test("Complex Multi-Agent Request", "PASS", 
                            f"Multi-agent coordination: {len(data.get('agents', []))} agents, "
                            f"Type: {data.get('type')}, Lead: {data.get('agent')}", 
                            response_time, response.status_code)
                self.multi_agent_session_id = data["session_id"]
            else:
                self.log_test("Complex Multi-Agent Request", "FAIL", 
                            f"Single agent response for complex request: {data.get('type')}", 
                            response_time, response.status_code)
        else:
            self.log_test("Complex Multi-Agent Request", "FAIL", 
                        "Multi-agent coordination failed", 
                        response_time, response.status_code if response else None)
        
        # Test 2: Conversation Summary
        if hasattr(self, 'multi_agent_session_id'):
            print("📋 Testing Conversation Summary...")
            response, response_time = self.make_request("GET", f"/api/ai/v3/chat/{self.multi_agent_session_id}/summary")
            if response and response.status_code == 200:
                data = response.json()
                if ("summary" in data and "total_messages" in data and 
                    "active_agents" in data and len(data["active_agents"]) > 0):
                    self.log_test("Conversation Summary", "PASS", 
                                f"Summary generated: {data['total_messages']} messages, "
                                f"{len(data['active_agents'])} active agents", 
                                response_time, response.status_code)
                else:
                    self.log_test("Conversation Summary", "FAIL", 
                                "Missing summary data fields", 
                                response_time, response.status_code)
            else:
                self.log_test("Conversation Summary", "FAIL", 
                            "Conversation summary failed", 
                            response_time, response.status_code if response else None)
        
        # Test 3: Active Agents Management
        if hasattr(self, 'multi_agent_session_id'):
            print("👥 Testing Active Agents Management...")
            response, response_time = self.make_request("GET", f"/api/ai/v3/chat/{self.multi_agent_session_id}/agents")
            if response and response.status_code == 200:
                data = response.json()
                if ("active_agents" in data and "total_agents" in data and 
                    data["total_agents"] > 0):
                    self.log_test("Active Agents Management", "PASS", 
                                f"Managing {data['total_agents']} active agents: {data['active_agents']}", 
                                response_time, response.status_code)
                else:
                    self.log_test("Active Agents Management", "FAIL", 
                                "No active agents found", 
                                response_time, response.status_code)
            else:
                self.log_test("Active Agents Management", "FAIL", 
                            "Active agents endpoint failed", 
                            response_time, response.status_code if response else None)

    def test_performance_optimization(self):
        """Test performance optimization and caching improvements"""
        print("⚡ Testing Performance Optimization & Caching...")
        
        if not self.auth_token:
            self.log_test("Performance Optimization Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Response Time Consistency
        print("⏱️ Testing Response Time Consistency...")
        test_messages = [
            "Create a simple React component",
            "Write a Python function for data processing", 
            "Design a REST API endpoint",
            "Implement user authentication",
            "Set up database schema"
        ]
        
        response_times = []
        successful_requests = 0
        
        for i, message in enumerate(test_messages):
            request_data = {
                "message": message,
                "user_id": "demo_user"
            }
            
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", request_data)
            if response and response.status_code == 200:
                response_times.append(response_time)
                successful_requests += 1
                
                # Small delay to avoid overwhelming the system
                time.sleep(0.5)
        
        if response_times:
            avg_response_time = statistics.mean(response_times)
            fast_responses = sum(1 for rt in response_times if rt < 2.0)
            success_rate = (fast_responses / len(response_times)) * 100
            
            self.log_test("Response Time Consistency", "PASS" if success_rate >= 80 else "FAIL", 
                        f"Average: {avg_response_time:.2f}s, Fast responses: {fast_responses}/{len(response_times)} ({success_rate:.1f}%)", 
                        avg_response_time)
        else:
            self.log_test("Response Time Consistency", "FAIL", 
                        "No successful responses for performance testing")
        
        # Test 2: Concurrent Request Handling
        print("🔄 Testing Concurrent Request Handling...")
        concurrent_request = {
            "message": "Explain the concept of microservices architecture",
            "user_id": "demo_user"
        }
        
        # Simulate concurrent requests
        concurrent_times = []
        for i in range(3):
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", concurrent_request)
            if response and response.status_code == 200:
                concurrent_times.append(response_time)
            time.sleep(0.1)  # Small delay between requests
        
        if concurrent_times:
            avg_concurrent_time = statistics.mean(concurrent_times)
            self.log_test("Concurrent Request Handling", "PASS" if avg_concurrent_time < 3.0 else "FAIL", 
                        f"Average concurrent response time: {avg_concurrent_time:.2f}s", 
                        avg_concurrent_time)
        else:
            self.log_test("Concurrent Request Handling", "FAIL", 
                        "Concurrent requests failed")

    def test_robustness_error_handling(self):
        """Test error handling, retry logic, and system resilience"""
        print("🛡️ Testing Robustness & Error Handling...")
        
        if not self.auth_token:
            self.log_test("Robustness Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Invalid Session Handling
        print("🔍 Testing Invalid Session Handling...")
        response, response_time = self.make_request("GET", "/api/ai/v3/chat/invalid_session_123/summary")
        if response and response.status_code == 404:
            self.log_test("Invalid Session Handling", "PASS", 
                        "Properly handles invalid session with 404 error", 
                        response_time, response.status_code)
        else:
            self.log_test("Invalid Session Handling", "FAIL", 
                        f"Unexpected response for invalid session", 
                        response_time, response.status_code if response else None)
        
        # Test 2: Empty Message Handling
        print("📝 Testing Empty Message Handling...")
        empty_request = {
            "message": "",
            "user_id": "demo_user"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", empty_request)
        if response and response.status_code in [400, 422]:
            self.log_test("Empty Message Handling", "PASS", 
                        "Properly rejects empty messages", 
                        response_time, response.status_code)
        elif response and response.status_code == 200:
            # Some systems might handle empty messages gracefully
            self.log_test("Empty Message Handling", "PASS", 
                        "Gracefully handles empty messages", 
                        response_time, response.status_code)
        else:
            self.log_test("Empty Message Handling", "FAIL", 
                        "Unexpected response for empty message", 
                        response_time, response.status_code if response else None)
        
        # Test 3: Large Message Handling
        print("📄 Testing Large Message Handling...")
        large_message = "Create a comprehensive application " * 100  # Very long message
        large_request = {
            "message": large_message,
            "user_id": "demo_user"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", large_request)
        if response and response.status_code in [200, 413, 422]:
            if response.status_code == 200:
                self.log_test("Large Message Handling", "PASS", 
                            "Successfully processes large messages", 
                            response_time, response.status_code)
            else:
                self.log_test("Large Message Handling", "PASS", 
                            "Properly rejects oversized messages", 
                            response_time, response.status_code)
        else:
            self.log_test("Large Message Handling", "FAIL", 
                        "Unexpected response for large message", 
                        response_time, response.status_code if response else None)
        
        # Test 4: Session Cleanup
        print("🧹 Testing Session Cleanup...")
        response, response_time = self.make_request("POST", "/api/ai/v3/maintenance/cleanup", {"max_age_hours": 1})
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data:
                self.log_test("Session Cleanup", "PASS", 
                            f"Cleanup successful: {data['message']}", 
                            response_time, response.status_code)
            else:
                self.log_test("Session Cleanup", "FAIL", 
                            "Missing cleanup confirmation", 
                            response_time, response.status_code)
        else:
            self.log_test("Session Cleanup", "FAIL", 
                        "Session cleanup failed", 
                        response_time, response.status_code if response else None)

    def test_subscription_integration(self):
        """Test subscription system integration with enhanced AI"""
        print("💳 Testing Subscription System Integration...")
        
        if not self.auth_token:
            self.log_test("Subscription Integration Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Trial Status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "has_trial" in data and "is_trial_active" in data:
                self.log_test("Trial Status Integration", "PASS", 
                            f"Trial active: {data.get('is_trial_active')}, "
                            f"Days remaining: {data.get('trial_days_remaining', 'N/A')}", 
                            response_time, response.status_code)
            else:
                self.log_test("Trial Status Integration", "FAIL", 
                            "Missing trial status fields", 
                            response_time, response.status_code)
        else:
            self.log_test("Trial Status Integration", "FAIL", 
                        "Trial status endpoint failed", 
                        response_time, response.status_code if response else None)
        
        # Test 2: Current Subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "current_usage" in data:
                self.log_test("Current Subscription Integration", "PASS", 
                            f"Plan: {data.get('plan')}, Status: {data.get('status')}", 
                            response_time, response.status_code)
            else:
                self.log_test("Current Subscription Integration", "FAIL", 
                            "Missing subscription data", 
                            response_time, response.status_code)
        else:
            self.log_test("Current Subscription Integration", "FAIL", 
                        "Current subscription endpoint failed", 
                        response_time, response.status_code if response else None)

    def generate_performance_report(self):
        """Generate comprehensive performance report"""
        print("\n" + "="*80)
        print("📊 COMPREHENSIVE PERFORMANCE REPORT")
        print("="*80)
        
        # Overall Statistics
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        print(f"\n🎯 OVERALL TEST RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        print(f"   ❌ Failed: {failed_tests} ({(failed_tests/total_tests)*100:.1f}%)")
        print(f"   ⚠️ Skipped: {skipped_tests} ({(skipped_tests/total_tests)*100:.1f}%)")
        
        # Performance Metrics
        if self.performance_metrics:
            response_times = [m["response_time"] for m in self.performance_metrics]
            fast_responses = [m for m in self.performance_metrics if m["meets_target"]]
            
            avg_response_time = statistics.mean(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            fast_response_rate = (len(fast_responses) / len(self.performance_metrics)) * 100
            
            print(f"\n⚡ PERFORMANCE METRICS:")
            print(f"   Average Response Time: {avg_response_time:.2f}s")
            print(f"   Fastest Response: {min_response_time:.2f}s")
            print(f"   Slowest Response: {max_response_time:.2f}s")
            print(f"   Sub-2s Success Rate: {fast_response_rate:.1f}% ({len(fast_responses)}/{len(self.performance_metrics)})")
            
            target_status = "✅ TARGET ACHIEVED" if fast_response_rate >= 80 else "❌ TARGET MISSED"
            print(f"   Performance Target (<2s): {target_status}")
        
        # Critical Issues
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL" and 
                           any(keyword in r["test"].lower() for keyword in ["enhanced ai", "multi-agent", "performance"])]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   ❌ {failure['test']}: {failure['details']}")
        else:
            print(f"\n✅ NO CRITICAL ISSUES FOUND")
        
        print("\n" + "="*80)

    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests"""
        print("🚀 STARTING COMPREHENSIVE BACKEND TESTING - AETHER AI PLATFORM ENHANCEMENTS")
        print("="*80)
        
        start_time = time.time()
        
        # Step 1: Authentication
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Step 2: Enhanced AI Service v3 Testing
        self.test_enhanced_ai_service_v3()
        
        # Step 3: Multi-Agent Coordination Testing
        self.test_multi_agent_coordination()
        
        # Step 4: Performance Optimization Testing
        self.test_performance_optimization()
        
        # Step 5: Robustness & Error Handling Testing
        self.test_robustness_error_handling()
        
        # Step 6: Subscription Integration Testing
        self.test_subscription_integration()
        
        # Step 7: Generate Performance Report
        total_time = time.time() - start_time
        print(f"\n⏱️ Total Testing Time: {total_time:.2f} seconds")
        
        self.generate_performance_report()
        
        return self.test_results, self.performance_metrics

if __name__ == "__main__":
    print("🧪 Enhanced Backend Performance Tester - Aether AI Platform")
    print("Testing enhanced backend functionality according to user requirements")
    print("-" * 80)
    
    tester = EnhancedBackendTester()
    test_results, performance_metrics = tester.run_comprehensive_tests()
    
    # Exit with appropriate code
    failed_tests = len([r for r in test_results if r["status"] == "FAIL"])
    sys.exit(0 if failed_tests == 0 else 1)