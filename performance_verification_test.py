#!/usr/bin/env python3
"""
PERFORMANCE OPTIMIZATION VERIFICATION TEST
Focused testing for the <2 second AI response target achievement
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class PerformanceVerificationTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        self.groq_api_key = "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"
        
    def log_test(self, test_name: str, status: str, details: str = "", response_time: float = None):
        """Log test results with performance metrics"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        time_info = f" ({response_time:.2f}s)" if response_time else ""
        print(f"{status_icon} {test_name}: {status}{time_info}")
        if details:
            print(f"   Details: {details}")
        print()

    def make_timed_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request with timing"""
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
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            end_time = time.time()
            response_time = end_time - start_time
            return response, response_time
        except requests.exceptions.RequestException as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"Request failed: {e}")
            return None, response_time

    def authenticate(self):
        """Authenticate with demo user"""
        print("🔐 Authenticating with demo user...")
        response, response_time = self.make_timed_request("POST", "/api/auth/login", self.demo_user)
        
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo Authentication", "PASS", 
                            f"Authenticated as {data.get('user', {}).get('email')}", response_time)
                return True
            else:
                self.log_test("Demo Authentication", "FAIL", 
                            "No access token in response", response_time)
                return False
        else:
            self.log_test("Demo Authentication", "FAIL", 
                        "Authentication failed", response_time)
            return False

    def test_groq_integration_performance(self):
        """Test Groq API integration and performance"""
        print("🚀 Testing Groq Integration Performance...")
        
        if not self.auth_token:
            self.log_test("Groq Integration Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: AI Services Health Check
        response, response_time = self.make_timed_request("GET", "/api/ai/status")
        if response and response.status_code == 200:
            data = response.json()
            if "service" in data and "status" in data:
                self.log_test("AI Services Health Check", "PASS", 
                            f"AI service status: {data.get('status')}", response_time)
            else:
                self.log_test("AI Services Health Check", "FAIL", 
                            "Missing AI status info", response_time)
        else:
            self.log_test("AI Services Health Check", "FAIL", 
                        "AI status endpoint failed", response_time)
        
        # Test 2: Groq Models Availability
        response, response_time = self.make_timed_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data and len(data["models"]) >= 4:
                groq_models = [m for m in data["models"] if "llama" in m.get("name", "").lower() or "mixtral" in m.get("name", "").lower()]
                if len(groq_models) >= 4:
                    self.log_test("Groq Models Availability", "PASS", 
                                f"Found {len(groq_models)} Groq models available", response_time)
                else:
                    self.log_test("Groq Models Availability", "FAIL", 
                                f"Only {len(groq_models)} Groq models found, expected 4+", response_time)
            else:
                self.log_test("Groq Models Availability", "FAIL", 
                            f"Insufficient models found: {len(data.get('models', []))}", response_time)
        else:
            self.log_test("Groq Models Availability", "FAIL", 
                        "AI models endpoint failed", response_time)

    def test_single_agent_performance(self):
        """Test single agent response performance"""
        print("⚡ Testing Single Agent Performance...")
        
        if not self.auth_token:
            self.log_test("Single Agent Performance Test", "SKIP", "No authentication token available")
            return
        
        # Test different types of queries for performance
        test_queries = [
            {
                "name": "Simple Code Generation",
                "message": "Create a simple JavaScript function to add two numbers",
                "model": "llama-3.1-8b-instant",
                "agent": "developer"
            },
            {
                "name": "Complex Architecture Question", 
                "message": "Design a scalable microservices architecture for an e-commerce platform",
                "model": "llama-3.3-70b-versatile",
                "agent": "architect"
            },
            {
                "name": "UI/UX Design Request",
                "message": "Create a modern dashboard design with dark theme and responsive layout",
                "model": "mixtral-8x7b-32768", 
                "agent": "designer"
            }
        ]
        
        performance_results = []
        
        for query in test_queries:
            response, response_time = self.make_timed_request("POST", "/api/ai/chat", {
                "message": query["message"],
                "model": query["model"],
                "agent": query["agent"]
            })
            
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 100:
                    # Check if response time meets <2 second target
                    meets_target = response_time < 2.0
                    status = "PASS" if meets_target else "FAIL"
                    target_info = "✅ <2s target met" if meets_target else "❌ >2s target missed"
                    
                    self.log_test(f"Single Agent - {query['name']}", status, 
                                f"Model: {query['model']}, {target_info}", response_time)
                    performance_results.append({
                        "query": query["name"],
                        "time": response_time,
                        "meets_target": meets_target
                    })
                else:
                    self.log_test(f"Single Agent - {query['name']}", "FAIL", 
                                "Invalid or empty response", response_time)
            else:
                self.log_test(f"Single Agent - {query['name']}", "FAIL", 
                            "Request failed", response_time)
        
        # Summary of single agent performance
        if performance_results:
            avg_time = sum(r["time"] for r in performance_results) / len(performance_results)
            target_met_count = sum(1 for r in performance_results if r["meets_target"])
            target_percentage = (target_met_count / len(performance_results)) * 100
            
            overall_status = "PASS" if target_percentage >= 80 else "FAIL"
            self.log_test("Single Agent Performance Summary", overall_status,
                        f"Average: {avg_time:.2f}s, Target met: {target_met_count}/{len(performance_results)} ({target_percentage:.1f}%)")

    def test_multi_agent_coordination_performance(self):
        """Test multi-agent coordination performance"""
        print("🤖 Testing Multi-Agent Coordination Performance...")
        
        if not self.auth_token:
            self.log_test("Multi-Agent Coordination Test", "SKIP", "No authentication token available")
            return
        
        # Test 1: Enhanced AI v3 Multi-Agent Chat
        complex_request = {
            "message": "Build a complete full-stack e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, user authentication, admin dashboard, and comprehensive testing strategy",
            "enable_multi_agent": True,
            "project_type": "full_stack_app",
            "complexity": "high"
        }
        
        response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/enhanced", complex_request)
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ["response", "agents_involved", "coordination_summary", "next_actions"]
            
            if all(field in data for field in required_fields):
                meets_target = response_time < 2.0
                status = "PASS" if meets_target else "FAIL"
                target_info = "✅ <2s target met" if meets_target else "❌ >2s target missed"
                
                agents_count = len(data.get("agents_involved", []))
                self.log_test("Multi-Agent Enhanced Chat", status,
                            f"{agents_count} agents coordinated, {target_info}", response_time)
            else:
                missing = [f for f in required_fields if f not in data]
                self.log_test("Multi-Agent Enhanced Chat", "FAIL",
                            f"Missing fields: {missing}", response_time)
        else:
            self.log_test("Multi-Agent Enhanced Chat", "FAIL",
                        "Enhanced chat endpoint failed", response_time)
        
        # Test 2: Quick Response Mode
        quick_request = {
            "message": "What are the best practices for React component optimization?",
            "quick_mode": True
        }
        
        response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/quick-response", quick_request)
        
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 50:
                meets_target = response_time < 2.0
                status = "PASS" if meets_target else "FAIL"
                target_info = "✅ <2s target met" if meets_target else "❌ >2s target missed"
                
                self.log_test("Quick Response Mode", status,
                            f"Fast response delivered, {target_info}", response_time)
            else:
                self.log_test("Quick Response Mode", "FAIL",
                            "Invalid response content", response_time)
        else:
            self.log_test("Quick Response Mode", "FAIL",
                        "Quick response endpoint failed", response_time)

    def test_all_groq_models_performance(self):
        """Test all 4 Groq models for performance"""
        print("🔧 Testing All Groq Models Performance...")
        
        if not self.auth_token:
            self.log_test("Groq Models Performance Test", "SKIP", "No authentication token available")
            return
        
        # Test all 4 Groq models mentioned in the review request
        groq_models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant", 
            "mixtral-8x7b-32768",
            "llama-3.2-3b-preview"
        ]
        
        test_message = "Create a simple Python function to calculate fibonacci numbers"
        model_results = []
        
        for model in groq_models:
            response, response_time = self.make_timed_request("POST", "/api/ai/chat", {
                "message": test_message,
                "model": model,
                "agent": "developer"
            })
            
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data and "model_used" in data:
                    meets_target = response_time < 2.0
                    status = "PASS" if meets_target else "FAIL"
                    target_info = "✅ <2s" if meets_target else "❌ >2s"
                    
                    self.log_test(f"Groq Model - {model}", status,
                                f"Used: {data.get('model_used')}, {target_info}", response_time)
                    model_results.append({
                        "model": model,
                        "time": response_time,
                        "meets_target": meets_target
                    })
                else:
                    self.log_test(f"Groq Model - {model}", "FAIL",
                                "Invalid response format", response_time)
            else:
                self.log_test(f"Groq Model - {model}", "FAIL",
                            "Model request failed", response_time)
        
        # Summary of all models performance
        if model_results:
            avg_time = sum(r["time"] for r in model_results) / len(model_results)
            target_met_count = sum(1 for r in model_results if r["meets_target"])
            target_percentage = (target_met_count / len(model_results)) * 100
            
            overall_status = "PASS" if target_percentage >= 75 else "FAIL"
            self.log_test("All Groq Models Performance Summary", overall_status,
                        f"Average: {avg_time:.2f}s, Target met: {target_met_count}/{len(model_results)} ({target_percentage:.1f}%)")

    def test_system_stability_under_load(self):
        """Test system stability with multiple concurrent requests"""
        print("🔄 Testing System Stability Under Load...")
        
        if not self.auth_token:
            self.log_test("System Stability Test", "SKIP", "No authentication token available")
            return
        
        # Test multiple requests in sequence to check stability
        stability_requests = [
            {"message": "Create a React component", "model": "llama-3.1-8b-instant"},
            {"message": "Design a database schema", "model": "llama-3.3-70b-versatile"},
            {"message": "Write unit tests", "model": "mixtral-8x7b-32768"},
            {"message": "Optimize performance", "model": "llama-3.2-3b-preview"},
            {"message": "Deploy to production", "model": "llama-3.1-8b-instant"}
        ]
        
        successful_requests = 0
        total_time = 0
        fast_responses = 0
        
        for i, req in enumerate(stability_requests):
            response, response_time = self.make_timed_request("POST", "/api/ai/chat", req)
            total_time += response_time
            
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data:
                    successful_requests += 1
                    if response_time < 2.0:
                        fast_responses += 1
        
        success_rate = (successful_requests / len(stability_requests)) * 100
        fast_rate = (fast_responses / len(stability_requests)) * 100
        avg_time = total_time / len(stability_requests)
        
        if success_rate >= 80 and fast_rate >= 60:
            status = "PASS"
        else:
            status = "FAIL"
        
        self.log_test("System Stability Under Load", status,
                    f"Success: {successful_requests}/{len(stability_requests)} ({success_rate:.1f}%), "
                    f"Fast responses: {fast_responses}/{len(stability_requests)} ({fast_rate:.1f}%), "
                    f"Avg time: {avg_time:.2f}s")

    def test_subscription_and_trial_system(self):
        """Test subscription and trial system functionality"""
        print("💳 Testing Subscription and Trial System...")
        
        if not self.auth_token:
            self.log_test("Subscription System Test", "SKIP", "No authentication token available")
            return
        
        # Test trial status
        response, response_time = self.make_timed_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "has_trial" in data and "trial_days_remaining" in data:
                self.log_test("Trial Status Check", "PASS",
                            f"Trial status: {data.get('is_trial_active')}, Days remaining: {data.get('trial_days_remaining')}", response_time)
            else:
                self.log_test("Trial Status Check", "FAIL",
                            "Missing trial status fields", response_time)
        else:
            self.log_test("Trial Status Check", "FAIL",
                        "Trial status endpoint failed", response_time)
        
        # Test current subscription
        response, response_time = self.make_timed_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "current_usage" in data:
                self.log_test("Current Subscription Check", "PASS",
                            f"Plan: {data.get('plan')}, Status: {data.get('status')}", response_time)
            else:
                self.log_test("Current Subscription Check", "FAIL",
                            "Missing subscription fields", response_time)
        else:
            self.log_test("Current Subscription Check", "FAIL",
                        "Current subscription endpoint failed", response_time)

    def run_performance_verification(self):
        """Run complete performance verification test suite"""
        print("🎯 STARTING PERFORMANCE OPTIMIZATION VERIFICATION")
        print("=" * 60)
        print(f"Target: <2 second AI response times")
        print(f"Groq API Key: {self.groq_api_key[:20]}...")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        print()
        
        start_time = time.time()
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        # Run all performance tests
        self.test_groq_integration_performance()
        self.test_single_agent_performance()
        self.test_multi_agent_coordination_performance()
        self.test_all_groq_models_performance()
        self.test_system_stability_under_load()
        self.test_subscription_and_trial_system()
        
        end_time = time.time()
        total_test_time = end_time - start_time
        
        # Generate performance summary
        self.generate_performance_summary(total_test_time)

    def generate_performance_summary(self, total_test_time: float):
        """Generate comprehensive performance summary"""
        print("\n" + "=" * 60)
        print("🎯 PERFORMANCE VERIFICATION SUMMARY")
        print("=" * 60)
        
        # Count results
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        # Performance metrics
        timed_results = [r for r in self.test_results if r["response_time"] is not None]
        if timed_results:
            avg_response_time = sum(r["response_time"] for r in timed_results) / len(timed_results)
            fast_responses = len([r for r in timed_results if r["response_time"] < 2.0])
            fast_percentage = (fast_responses / len(timed_results)) * 100
        else:
            avg_response_time = 0
            fast_responses = 0
            fast_percentage = 0
        
        print(f"📊 TEST RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        print(f"   ❌ Failed: {failed_tests} ({(failed_tests/total_tests)*100:.1f}%)")
        print(f"   ⚠️ Skipped: {skipped_tests} ({(skipped_tests/total_tests)*100:.1f}%)")
        print()
        
        print(f"⚡ PERFORMANCE METRICS:")
        print(f"   Average Response Time: {avg_response_time:.2f} seconds")
        print(f"   Fast Responses (<2s): {fast_responses}/{len(timed_results)} ({fast_percentage:.1f}%)")
        print(f"   Total Test Duration: {total_test_time:.2f} seconds")
        print()
        
        # Performance target assessment
        target_met = fast_percentage >= 80
        print(f"🎯 PERFORMANCE TARGET ASSESSMENT:")
        print(f"   Target: <2 second AI responses")
        print(f"   Achievement: {fast_percentage:.1f}% of responses under 2 seconds")
        print(f"   Status: {'✅ TARGET MET' if target_met else '❌ TARGET NOT MET'}")
        print()
        
        # Critical issues
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL" and "authentication" not in r["test"].lower()]
        if critical_failures:
            print(f"🚨 CRITICAL ISSUES:")
            for failure in critical_failures:
                print(f"   ❌ {failure['test']}: {failure['details']}")
            print()
        
        # Overall assessment
        overall_success = passed_tests >= (total_tests * 0.8) and target_met
        print(f"🏆 OVERALL ASSESSMENT:")
        print(f"   Status: {'✅ PERFORMANCE OPTIMIZATIONS SUCCESSFUL' if overall_success else '❌ PERFORMANCE OPTIMIZATIONS NEED WORK'}")
        print(f"   Recommendation: {'Deploy with confidence' if overall_success else 'Further optimization required'}")
        print()
        
        print("=" * 60)

if __name__ == "__main__":
    tester = PerformanceVerificationTester()
    tester.run_performance_verification()