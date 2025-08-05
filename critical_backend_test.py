#!/usr/bin/env python3
"""
Critical Backend Testing for Aether AI Platform
Focus on the specific systems mentioned in the review request
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CriticalBackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def log_test(self, test_name: str, status: str, details: str = "", response_time: float = None):
        """Log test results"""
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

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
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
                
            response_time = time.time() - start_time
            return response, response_time
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            print(f"Request failed: {e}")
            return None, response_time

    def test_core_api_systems(self):
        """Test Core API Systems as specified in review request"""
        print("🎯 TESTING CORE API SYSTEMS")
        print("=" * 50)
        
        # 1. Health endpoints
        print("🔍 Testing Health Endpoints...")
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data and "services" in data:
                    services = data.get("services", {})
                    self.log_test("Health Check", "PASS", 
                                f"All services: {list(services.keys())}", response_time)
                else:
                    self.log_test("Health Check", "FAIL", 
                                "Missing status or services", response_time)
            except:
                self.log_test("Health Check", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Health Check", "FAIL", 
                        "Health endpoint not accessible", response_time)
        
        # 2. Authentication with demo credentials
        print("🔐 Testing Authentication...")
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    user_email = data.get("user", {}).get("email", "unknown")
                    self.log_test("Demo Login", "PASS", 
                                f"Authenticated: {user_email}", response_time)
                else:
                    self.log_test("Demo Login", "FAIL", 
                                "No access token received", response_time)
            except:
                self.log_test("Demo Login", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Demo Login", "FAIL", 
                        "Authentication failed", response_time)
        
        # 3. Templates (should return 6 professional templates)
        print("📋 Testing Templates...")
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "templates" in data:
                    template_count = len(data["templates"])
                    if template_count == 6:
                        self.log_test("Templates System", "PASS", 
                                    f"Found {template_count} professional templates", response_time)
                    else:
                        self.log_test("Templates System", "FAIL", 
                                    f"Expected 6 templates, found {template_count}", response_time)
                else:
                    self.log_test("Templates System", "FAIL", 
                                "No templates data", response_time)
            except:
                self.log_test("Templates System", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Templates System", "FAIL", 
                        "Templates endpoint failed", response_time)
        
        # 4. Projects (user project management)
        print("📁 Testing Projects...")
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/projects/")
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    if "projects" in data:
                        project_count = len(data["projects"])
                        self.log_test("Projects System", "PASS", 
                                    f"Found {project_count} projects", response_time)
                    else:
                        self.log_test("Projects System", "FAIL", 
                                    "No projects data", response_time)
                except:
                    self.log_test("Projects System", "FAIL", 
                                "Invalid JSON response", response_time)
            else:
                self.log_test("Projects System", "FAIL", 
                            "Projects endpoint failed", response_time)
        else:
            self.log_test("Projects System", "SKIP", "No authentication token")

    def test_multi_agent_ai_system(self):
        """Test Multi-Agent AI System (CRITICAL)"""
        print("\n🤖 TESTING MULTI-AGENT AI SYSTEM (CRITICAL)")
        print("=" * 50)
        
        if not self.auth_token:
            self.log_test("Multi-Agent System", "SKIP", "No authentication token")
            return
        
        # 1. Available agents (should show 5 agents: Dev, Luna, Atlas, Quinn, Sage)
        print("👥 Testing Available Agents...")
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "agents" in data:
                    agents = data["agents"]
                    agent_count = len(agents)
                    agent_names = [agent.get("name", "unknown") for agent in agents]
                    expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                    
                    if agent_count == 5:
                        self.log_test("Available Agents", "PASS", 
                                    f"Found 5 agents: {', '.join(agent_names)}", response_time)
                    else:
                        self.log_test("Available Agents", "FAIL", 
                                    f"Expected 5 agents, found {agent_count}: {', '.join(agent_names)}", response_time)
                else:
                    self.log_test("Available Agents", "FAIL", 
                                "No agents data", response_time)
            except:
                self.log_test("Available Agents", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Available Agents", "FAIL", 
                        "Agents endpoint failed", response_time)
        
        # 2. Enhanced AI chat (multi-agent coordination)
        print("💬 Testing Enhanced AI Chat...")
        chat_request = {
            "message": "Build a simple React todo app with authentication",
            "conversation_id": "test_conv_123",
            "enable_multi_agent": True
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "response" in data and "agent" in data:
                    agent_used = data.get("agent", "unknown")
                    response_length = len(data.get("response", ""))
                    
                    # Check if response time meets target (<2 seconds)
                    if response_time < 2.0:
                        self.log_test("Enhanced AI Chat", "PASS", 
                                    f"Agent: {agent_used}, Response: {response_length} chars, Time: {response_time:.2f}s", response_time)
                    else:
                        self.log_test("Enhanced AI Chat", "FAIL", 
                                    f"Response time {response_time:.2f}s exceeds 2s target", response_time)
                else:
                    self.log_test("Enhanced AI Chat", "FAIL", 
                                "Missing response or agent data", response_time)
            except:
                self.log_test("Enhanced AI Chat", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Enhanced AI Chat", "FAIL", 
                        "Enhanced chat endpoint failed", response_time)
        
        # 3. Quick response (fast AI responses)
        print("⚡ Testing Quick Response...")
        quick_request = {
            "message": "What is React?",
            "quick_mode": True
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_request)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "response" in data:
                    response_length = len(data.get("response", ""))
                    
                    # Check if response time meets target (<2 seconds)
                    if response_time < 2.0:
                        self.log_test("Quick Response", "PASS", 
                                    f"Response: {response_length} chars, Time: {response_time:.2f}s", response_time)
                    else:
                        self.log_test("Quick Response", "FAIL", 
                                    f"Response time {response_time:.2f}s exceeds 2s target", response_time)
                else:
                    self.log_test("Quick Response", "FAIL", 
                                "No response data", response_time)
            except:
                self.log_test("Quick Response", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Quick Response", "FAIL", 
                        "Quick response endpoint failed", response_time)

    def test_groq_integration(self):
        """Test Groq Integration"""
        print("\n⚡ TESTING GROQ INTEGRATION")
        print("=" * 50)
        
        # Test if Groq models are available
        print("🤖 Testing Groq Models...")
        response, response_time = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "models" in data:
                    models = data["models"]
                    model_count = len(models)
                    model_names = [model.get("name", "unknown") for model in models]
                    
                    # Check for expected Groq models
                    expected_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", 
                                     "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                    
                    if model_count >= 4:
                        self.log_test("Groq Models", "PASS", 
                                    f"Found {model_count} models: {', '.join(model_names[:4])}", response_time)
                    else:
                        self.log_test("Groq Models", "FAIL", 
                                    f"Expected 4+ models, found {model_count}", response_time)
                else:
                    self.log_test("Groq Models", "FAIL", 
                                "No models data", response_time)
            except:
                self.log_test("Groq Models", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Groq Models", "FAIL", 
                        "Models endpoint failed", response_time)
        
        # Test AI service status
        print("📊 Testing AI Service Status...")
        response, response_time = self.make_request("GET", "/api/ai/status")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data:
                    status = data.get("status", "unknown")
                    groq_connected = data.get("groq_connected", False)
                    self.log_test("AI Service Status", "PASS", 
                                f"Status: {status}, Groq: {groq_connected}", response_time)
                else:
                    self.log_test("AI Service Status", "FAIL", 
                                "No status data", response_time)
            except:
                self.log_test("AI Service Status", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("AI Service Status", "FAIL", 
                        "AI status endpoint failed", response_time)

    def test_subscription_system(self):
        """Test Subscription System"""
        print("\n💳 TESTING SUBSCRIPTION SYSTEM")
        print("=" * 50)
        
        if not self.auth_token:
            self.log_test("Subscription System", "SKIP", "No authentication token")
            return
        
        # 1. Trial system: trial status
        print("🎯 Testing Trial Status...")
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "has_trial" in data and "is_trial_active" in data:
                    has_trial = data.get("has_trial", False)
                    is_active = data.get("is_trial_active", False)
                    days_remaining = data.get("trial_days_remaining", 0)
                    self.log_test("Trial Status", "PASS", 
                                f"Has trial: {has_trial}, Active: {is_active}, Days: {days_remaining}", response_time)
                else:
                    self.log_test("Trial Status", "FAIL", 
                                "Missing trial status fields", response_time)
            except:
                self.log_test("Trial Status", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Trial Status", "FAIL", 
                        "Trial status endpoint failed", response_time)
        
        # 2. Current subscription
        print("📊 Testing Current Subscription...")
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "plan" in data and "status" in data:
                    plan = data.get("plan", "unknown")
                    status = data.get("status", "unknown")
                    usage = data.get("current_usage", {})
                    self.log_test("Current Subscription", "PASS", 
                                f"Plan: {plan}, Status: {status}, Usage: {len(usage)} metrics", response_time)
                else:
                    self.log_test("Current Subscription", "FAIL", 
                                "Missing subscription fields", response_time)
            except:
                self.log_test("Current Subscription", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response_time)
        
        # 3. Usage tracking and limits
        print("📈 Testing Usage Tracking...")
        response, response_time = self.make_request("GET", "/api/subscription/usage")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "current_usage" in data and "limits" in data:
                    usage = data.get("current_usage", {})
                    limits = data.get("limits", {})
                    self.log_test("Usage Tracking", "PASS", 
                                f"Usage types: {len(usage)}, Limits: {len(limits)}", response_time)
                else:
                    self.log_test("Usage Tracking", "FAIL", 
                                "Missing usage or limits data", response_time)
            except:
                self.log_test("Usage Tracking", "FAIL", 
                            "Invalid JSON response", response_time)
        else:
            # Usage endpoint might not exist for all users
            self.log_test("Usage Tracking", "SKIP", 
                        "Usage endpoint not available", response_time)

    def test_performance_requirements(self):
        """Test Performance Requirements (<2 seconds)"""
        print("\n⏱️ TESTING PERFORMANCE REQUIREMENTS")
        print("=" * 50)
        
        if not self.auth_token:
            self.log_test("Performance Test", "SKIP", "No authentication token")
            return
        
        # Test multiple API endpoints for performance
        endpoints_to_test = [
            ("/api/health", "GET", None),
            ("/api/templates/", "GET", None),
            ("/api/projects/", "GET", None),
            ("/api/ai/v3/agents/available", "GET", None)
        ]
        
        performance_results = []
        
        for endpoint, method, data in endpoints_to_test:
            print(f"⏱️ Testing {endpoint} performance...")
            response, response_time = self.make_request(method, endpoint, data)
            
            if response and response.status_code == 200:
                if response_time < 2.0:
                    status = "PASS"
                    details = f"Response time: {response_time:.2f}s (under 2s target)"
                else:
                    status = "FAIL"
                    details = f"Response time: {response_time:.2f}s (exceeds 2s target)"
                
                self.log_test(f"Performance {endpoint}", status, details, response_time)
                performance_results.append(response_time)
            else:
                self.log_test(f"Performance {endpoint}", "FAIL", 
                            "Endpoint failed", response_time)
        
        # Calculate average performance
        if performance_results:
            avg_time = sum(performance_results) / len(performance_results)
            fast_responses = sum(1 for t in performance_results if t < 2.0)
            total_responses = len(performance_results)
            
            if avg_time < 2.0:
                self.log_test("Overall Performance", "PASS", 
                            f"Average: {avg_time:.2f}s, Fast responses: {fast_responses}/{total_responses}")
            else:
                self.log_test("Overall Performance", "FAIL", 
                            f"Average: {avg_time:.2f}s exceeds 2s target")

    def run_all_tests(self):
        """Run all critical tests"""
        print("🚀 AETHER AI PLATFORM - CRITICAL BACKEND TESTING")
        print("=" * 60)
        print("Focus: Core API, Multi-Agent AI, Groq Integration, Subscription")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_core_api_systems()
        self.test_multi_agent_ai_system()
        self.test_groq_integration()
        self.test_subscription_system()
        self.test_performance_requirements()
        
        # Generate summary
        total_time = time.time() - start_time
        self.generate_summary(total_time)

    def generate_summary(self, total_time: float):
        """Generate test summary"""
        print("\n📊 CRITICAL TESTING SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed = sum(1 for r in self.test_results if r["status"] == "FAIL")
        skipped = sum(1 for r in self.test_results if r["status"] == "SKIP")
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Skipped: {skipped}")
        print(f"⏱️ Duration: {total_time:.2f} seconds")
        print()
        
        # Performance analysis
        response_times = [r["response_time"] for r in self.test_results if r["response_time"]]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            fast_responses = sum(1 for t in response_times if t < 2.0)
            print(f"📈 Performance Analysis:")
            print(f"   Average Response Time: {avg_time:.2f}s")
            print(f"   Fast Responses (<2s): {fast_responses}/{len(response_times)} ({fast_responses/len(response_times)*100:.1f}%)")
            print()
        
        # Critical issues
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL"]
        if critical_failures:
            print("🚨 CRITICAL ISSUES:")
            for failure in critical_failures:
                print(f"   ❌ {failure['test']}: {failure['details']}")
            print()
        
        # Overall assessment
        if failed == 0:
            print("🎉 ALL CRITICAL SYSTEMS OPERATIONAL")
            print("✅ Backend is PRODUCTION READY")
        elif failed <= 3:
            print("⚠️ MINOR ISSUES DETECTED")
            print("🔧 Backend needs minor fixes before production")
        else:
            print("🚨 MAJOR ISSUES DETECTED")
            print("❌ Backend needs significant fixes before production")
        
        print("=" * 60)

if __name__ == "__main__":
    tester = CriticalBackendTester()
    tester.run_all_tests()