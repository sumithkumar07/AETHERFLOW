#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Aether AI Platform - GROQ INTEGRATION
Tests all critical systems as requested in the review
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class ComprehensiveBackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def log_test(self, test_name: str, status: str, details: str = "", response_code: int = None, response_time: float = None):
        """Log test results with response time"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_code": response_code,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        time_info = f" ({response_time:.2f}s)" if response_time else ""
        print(f"{status_icon} {test_name}: {status}{time_info}")
        if details:
            print(f"   Details: {details}")
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

    def test_1_groq_ai_integration(self):
        """Test GROQ AI Integration & Multi-Agent System"""
        print("🚀 TESTING GROQ AI INTEGRATION & MULTI-AGENT SYSTEM")
        print("=" * 60)
        
        # Test 1: Health check with AI services
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("services", {}).get("ai") == "available":
                self.log_test("AI Services Health Check", "PASS", 
                            f"AI services available: {data.get('services')}", response.status_code, response_time)
            else:
                self.log_test("AI Services Health Check", "FAIL", 
                            "AI services not available", response.status_code, response_time)
        else:
            self.log_test("AI Services Health Check", "FAIL", 
                        "Health endpoint failed", response.status_code if response else None, response_time)
        
        # Test 2: Available AI agents
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = [agent["name"] for agent in data["agents"]]
                self.log_test("Multi-Agent System Available", "PASS", 
                            f"Found {len(data['agents'])} agents: {', '.join(agents)}", response.status_code, response_time)
            else:
                self.log_test("Multi-Agent System Available", "FAIL", 
                            f"Expected 5+ agents, got {len(data.get('agents', []))}", response.status_code, response_time)
        else:
            self.log_test("Multi-Agent System Available", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None, response_time)

    def test_2_authentication_system(self):
        """Test Authentication & Demo Login"""
        print("🔐 TESTING AUTHENTICATION & SUBSCRIPTION SYSTEM")
        print("=" * 60)
        
        # Test demo login
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                user_email = data.get("user", {}).get("email", "unknown")
                self.log_test("Demo Login", "PASS", 
                            f"Successfully logged in as {user_email}", response.status_code, response_time)
            else:
                self.log_test("Demo Login", "FAIL", 
                            "No access token in response", response.status_code, response_time)
        else:
            self.log_test("Demo Login", "FAIL", 
                        "Login failed", response.status_code if response else None, response_time)
        
        # Test JWT token validation
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/auth/me")
            if response and response.status_code == 200:
                data = response.json()
                if "email" in data and data["email"] == self.demo_user["email"]:
                    self.log_test("JWT Token Validation", "PASS", 
                                f"Token valid for user: {data['email']}", response.status_code, response_time)
                else:
                    self.log_test("JWT Token Validation", "FAIL", 
                                "Token validation returned wrong user", response.status_code, response_time)
            else:
                self.log_test("JWT Token Validation", "FAIL", 
                            "Token validation failed", response.status_code if response else None, response_time)

    def test_3_trial_subscription_system(self):
        """Test Trial System & Subscription Management"""
        print("💳 TESTING TRIAL SYSTEM & SUBSCRIPTION MANAGEMENT")
        print("=" * 60)
        
        if not self.auth_token:
            self.log_test("Trial System Test", "SKIP", "No authentication token available")
            return
        
        # Test trial status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "has_trial" in data and "is_trial_active" in data:
                trial_status = "Active" if data.get("is_trial_active") else "Inactive"
                days_remaining = data.get("trial_days_remaining", 0)
                self.log_test("Trial Status API", "PASS", 
                            f"Trial status: {trial_status}, Days remaining: {days_remaining}", response.status_code, response_time)
            else:
                self.log_test("Trial Status API", "FAIL", 
                            "Missing trial status fields", response.status_code, response_time)
        else:
            self.log_test("Trial Status API", "FAIL", 
                        "Trial status endpoint failed", response.status_code if response else None, response_time)
        
        # Test subscription plans
        response, response_time = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data:
                plans = list(data["plans"].keys())
                expected_plans = ["basic", "professional", "enterprise"]
                if all(plan in plans for plan in expected_plans):
                    basic_price = data["plans"]["basic"].get("price_monthly", 0)
                    pro_price = data["plans"]["professional"].get("price_monthly", 0)
                    ent_price = data["plans"]["enterprise"].get("price_monthly", 0)
                    self.log_test("Subscription Plans", "PASS", 
                                f"All plans available: Basic ${basic_price}, Pro ${pro_price}, Enterprise ${ent_price}", response.status_code, response_time)
                else:
                    self.log_test("Subscription Plans", "FAIL", 
                                f"Missing plans. Expected: {expected_plans}, Got: {plans}", response.status_code, response_time)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            "No plans data in response", response.status_code, response_time)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Plans endpoint failed", response.status_code if response else None, response_time)
        
        # Test current subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "status" in data:
                plan = data.get("plan")
                status = data.get("status")
                usage = data.get("current_usage", {})
                self.log_test("Current Subscription", "PASS", 
                            f"Plan: {plan}, Status: {status}, Usage: {usage.get('tokens_used', 0)} tokens", response.status_code, response_time)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response.status_code, response_time)
        elif response and response.status_code == 404:
            self.log_test("Current Subscription", "PASS", 
                        "No subscription found (expected for some users)", response.status_code, response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response.status_code if response else None, response_time)

    def test_4_groq_ai_performance(self):
        """Test Groq AI Performance & Response Times"""
        print("⚡ TESTING GROQ AI PERFORMANCE & RESPONSE TIMES")
        print("=" * 60)
        
        if not self.auth_token:
            self.log_test("AI Performance Test", "SKIP", "No authentication token available")
            return
        
        # Test enhanced AI chat with response time measurement
        test_message = "Create a simple React component for displaying user profiles"
        chat_request = {
            "message": test_message,
            "session_id": "test_session_123",
            "user_id": "demo_user",
            "include_context": True
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            if "content" in data and "agent" in data:
                agent = data.get("agent", "unknown")
                model = data.get("model_used", "unknown")
                if response_time < 2.0:
                    self.log_test("Groq AI Response Speed", "PASS", 
                                f"Ultra-fast response from {agent} using {model}", response.status_code, response_time)
                elif response_time < 5.0:
                    self.log_test("Groq AI Response Speed", "PASS", 
                                f"Fast response from {agent} using {model}", response.status_code, response_time)
                else:
                    self.log_test("Groq AI Response Speed", "FAIL", 
                                f"Slow response from {agent} using {model} (>{response_time:.2f}s)", response.status_code, response_time)
            else:
                self.log_test("Groq AI Response Speed", "FAIL", 
                            "Missing response content or agent info", response.status_code, response_time)
        else:
            self.log_test("Groq AI Response Speed", "FAIL", 
                        "Enhanced AI chat failed", response.status_code if response else None, response_time)
        
        # Test quick response endpoint
        quick_request = {
            "message": "What is React?",
            "user_id": "demo_user"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_request)
        if response and response.status_code == 200:
            data = response.json()
            if "content" in data:
                if response_time < 1.0:
                    self.log_test("Quick Response Speed", "PASS", 
                                f"Ultra-fast quick response", response.status_code, response_time)
                elif response_time < 2.0:
                    self.log_test("Quick Response Speed", "PASS", 
                                f"Fast quick response", response.status_code, response_time)
                else:
                    self.log_test("Quick Response Speed", "FAIL", 
                                f"Slow quick response (>{response_time:.2f}s)", response.status_code, response_time)
            else:
                self.log_test("Quick Response Speed", "FAIL", 
                            "Missing response content", response.status_code, response_time)
        else:
            self.log_test("Quick Response Speed", "FAIL", 
                        "Quick response endpoint failed", response.status_code if response else None, response_time)

    def test_5_core_api_endpoints(self):
        """Test Core API Endpoints"""
        print("🔧 TESTING CORE API ENDPOINTS")
        print("=" * 60)
        
        # Test projects endpoint
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/projects/")
            if response and response.status_code == 200:
                data = response.json()
                if "projects" in data:
                    project_count = len(data["projects"])
                    self.log_test("Projects API", "PASS", 
                                f"Found {project_count} projects", response.status_code, response_time)
                else:
                    self.log_test("Projects API", "FAIL", 
                                "Missing projects data", response.status_code, response_time)
            else:
                self.log_test("Projects API", "FAIL", 
                            "Projects endpoint failed", response.status_code if response else None, response_time)
        
        # Test templates endpoint (public)
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                template_count = len(data["templates"])
                self.log_test("Templates API", "PASS", 
                            f"Found {template_count} templates", response.status_code, response_time)
            else:
                self.log_test("Templates API", "FAIL", 
                            "Missing templates data", response.status_code, response_time)
        else:
            self.log_test("Templates API", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None, response_time)

    def test_6_database_connectivity(self):
        """Test Database Connectivity"""
        print("🗄️ TESTING DATABASE CONNECTIVITY")
        print("=" * 60)
        
        # Test health check includes database status
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            db_status = data.get("services", {}).get("database")
            if db_status == "connected":
                self.log_test("MongoDB Atlas Connection", "PASS", 
                            "Database connection healthy", response.status_code, response_time)
            else:
                self.log_test("MongoDB Atlas Connection", "FAIL", 
                            f"Database status: {db_status}", response.status_code, response_time)
        else:
            self.log_test("MongoDB Atlas Connection", "FAIL", 
                        "Health check failed", response.status_code if response else None, response_time)
        
        # Test user data persistence (if authenticated)
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/auth/me")
            if response and response.status_code == 200:
                data = response.json()
                if "email" in data and "created_at" in data:
                    self.log_test("User Data Persistence", "PASS", 
                                f"User data retrieved from database", response.status_code, response_time)
                else:
                    self.log_test("User Data Persistence", "FAIL", 
                                "Incomplete user data", response.status_code, response_time)
            else:
                self.log_test("User Data Persistence", "FAIL", 
                            "User data retrieval failed", response.status_code if response else None, response_time)

    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        print("🚀 STARTING COMPREHENSIVE BACKEND TESTING - AETHER AI PLATFORM")
        print("=" * 80)
        print(f"Testing backend at: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_1_groq_ai_integration()
        self.test_2_authentication_system()
        self.test_3_trial_subscription_system()
        self.test_4_groq_ai_performance()
        self.test_5_core_api_endpoints()
        self.test_6_database_connectivity()
        
        # Calculate summary
        total_time = time.time() - start_time
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        # Performance analysis
        response_times = [r["response_time"] for r in self.test_results if r["response_time"] is not None]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        fast_responses = len([t for t in response_times if t < 2.0])
        
        print("=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Skipped: {skipped}")
        print(f"⏱️ Total Duration: {total_time:.2f} seconds")
        print(f"📈 Average Response Time: {avg_response_time:.2f} seconds")
        print(f"⚡ Fast Responses (<2s): {fast_responses}/{len(response_times)}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        # Overall assessment
        if failed == 0 and passed > 0:
            print("\n🎉 ALL CRITICAL SYSTEMS WORKING!")
            print("✅ Groq AI Integration: OPERATIONAL")
            print("✅ Authentication System: OPERATIONAL") 
            print("✅ Database Connectivity: OPERATIONAL")
            print("✅ Performance: MEETING REQUIREMENTS")
        elif failed <= 2 and passed > failed:
            print("\n⚠️ MOSTLY OPERATIONAL WITH MINOR ISSUES")
        else:
            print("\n🚨 CRITICAL ISSUES DETECTED")
            print("Backend requires immediate attention")
        
        print("=" * 80)
        
        # Save detailed results
        with open("/app/comprehensive_test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total_tests": total_tests,
                    "passed": passed,
                    "failed": failed,
                    "skipped": skipped,
                    "total_time": total_time,
                    "avg_response_time": avg_response_time,
                    "fast_responses": fast_responses
                },
                "results": self.test_results
            }, f, indent=2, default=str)
        
        print(f"📄 Detailed results saved to: /app/comprehensive_test_results.json")
        
        return passed, failed, skipped

if __name__ == "__main__":
    tester = ComprehensiveBackendTester()
    passed, failed, skipped = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)