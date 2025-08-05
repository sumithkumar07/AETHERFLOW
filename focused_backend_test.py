#!/usr/bin/env python3
"""
Focused Backend Testing for Aether AI Platform Core Capabilities
Tests the specific features mentioned in the review request
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class FocusedBackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def log_test(self, test_name: str, status: str, details: str = "", response_code: int = None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_code": response_code,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_code:
            print(f"   Response Code: {response_code}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
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
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def authenticate(self):
        """Authenticate with demo user"""
        print("🔐 Authenticating with demo user...")
        
        response = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo User Authentication", "PASS", 
                            f"Token received for {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Authentication failed", response.status_code if response else None)
        return False

    def test_multi_agent_system(self):
        """Test the 5-agent AI system (Dev, Luna, Atlas, Quinn, Sage)"""
        print("🤖 Testing Multi-Agent AI System (5 Agents)...")
        
        # Test 1: Get available agents
        response = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and isinstance(data["agents"], list):
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name", "") for agent in agents]
                
                if all(agent in found_agents for agent in expected_agents):
                    self.log_test("5 AI Agents Available", "PASS", 
                                f"All 5 agents found: {', '.join(found_agents)}", response.status_code)
                else:
                    missing = [a for a in expected_agents if a not in found_agents]
                    self.log_test("5 AI Agents Available", "FAIL", 
                                f"Missing agents: {missing}. Found: {found_agents}", response.status_code)
            else:
                self.log_test("5 AI Agents Available", "FAIL", 
                            f"Invalid agents response format. Expected list, got: {type(data.get('agents'))}", response.status_code)
        else:
            self.log_test("5 AI Agents Available", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)

    def test_app_building_capability(self):
        """Test comprehensive app building with multiple agents"""
        print("🏗️ Testing App Building Capability...")
        
        # Test comprehensive task management app request
        app_request = {
            "message": "Build a comprehensive Task Management Application with the following features: user authentication, real-time collaboration, task assignment, progress tracking, notifications, mobile responsiveness, and data analytics dashboard. Include proper database design, API architecture, testing strategy, and deployment plan.",
            "session_id": "app_build_test_session",
            "project_id": "task_management_app",
            "user_id": "demo_user",
            "include_context": True
        }
        
        start_time = time.time()
        response = self.make_request("POST", "/api/ai/v3/chat/enhanced", app_request)
        response_time = time.time() - start_time
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ["content", "session_id", "agent", "agents", "type"]
            
            if all(field in data for field in required_fields):
                content_length = len(data.get("content", ""))
                agents_involved = data.get("agents", [])
                agent_used = data.get("agent", "")
                
                # Check if response is comprehensive (should be substantial for complex app)
                if content_length > 500:  # Substantial response
                    self.log_test("Comprehensive App Building", "PASS", 
                                f"Generated {content_length} chars response in {response_time:.2f}s, Agent: {agent_used}, Agents: {agents_involved}", response.status_code)
                else:
                    self.log_test("Comprehensive App Building", "FAIL", 
                                f"Response too short ({content_length} chars) for complex app request", response.status_code)
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log_test("Comprehensive App Building", "FAIL", 
                            f"Missing required fields: {missing_fields}", response.status_code)
        else:
            self.log_test("Comprehensive App Building", "FAIL", 
                        "App building request failed", response.status_code if response else None)

    def test_authentication_system(self):
        """Test authentication and JWT token handling"""
        print("🔐 Testing Authentication System...")
        
        # Test getting current user profile (requires auth)
        if self.auth_token:
            response = self.make_request("GET", "/api/auth/me")
            if response and response.status_code == 200:
                data = response.json()
                if "email" in data and "name" in data:
                    self.log_test("JWT Token Validation", "PASS", 
                                f"Profile retrieved: {data.get('email')}", response.status_code)
                else:
                    self.log_test("JWT Token Validation", "FAIL", 
                                "Missing user profile data", response.status_code)
            else:
                self.log_test("JWT Token Validation", "FAIL", 
                            "Profile endpoint failed", response.status_code if response else None)

    def test_subscription_system(self):
        """Test trial status and usage limits"""
        print("💳 Testing Subscription System...")
        
        # Test trial status
        response = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "is_trial_active" in data and "trial_days_remaining" in data:
                trial_active = data.get("is_trial_active")
                days_remaining = data.get("trial_days_remaining", 0)
                self.log_test("Trial Status Check", "PASS", 
                            f"Trial active: {trial_active}, Days remaining: {days_remaining}", response.status_code)
            else:
                self.log_test("Trial Status Check", "FAIL", 
                            "Missing trial status fields", response.status_code)
        else:
            self.log_test("Trial Status Check", "FAIL", 
                        "Trial status endpoint failed", response.status_code if response else None)
        
        # Test current subscription
        response = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "status" in data:
                plan = data.get("plan")
                status = data.get("status")
                usage = data.get("current_usage", {})
                self.log_test("Current Subscription", "PASS", 
                            f"Plan: {plan}, Status: {status}, Usage: {usage}", response.status_code)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response.status_code)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response.status_code if response else None)

    def test_template_system(self):
        """Test all 6 templates are accessible"""
        print("📋 Testing Template System...")
        
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 6:
                templates = data["templates"]
                template_names = [t.get("name", "Unknown") for t in templates]
                self.log_test("6 Templates Available", "PASS", 
                            f"Found {len(templates)} templates: {', '.join(template_names[:6])}", response.status_code)
            else:
                template_count = len(data.get("templates", []))
                self.log_test("6 Templates Available", "FAIL", 
                            f"Expected 6+ templates, found {template_count}", response.status_code)
        else:
            self.log_test("6 Templates Available", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)

    def test_performance_enhanced_ai_v3(self):
        """Test performance of enhanced AI v3 endpoints"""
        print("⚡ Testing Enhanced AI v3 Performance...")
        
        # Test enhanced chat performance
        performance_request = {
            "message": "Create a simple React component for a todo item",
            "session_id": "performance_test_session",
            "include_context": False
        }
        
        start_time = time.time()
        response = self.make_request("POST", "/api/ai/v3/chat/enhanced", performance_request)
        response_time = time.time() - start_time
        
        if response and response.status_code == 200:
            if response_time < 2.0:
                self.log_test("Enhanced AI v3 Performance", "PASS", 
                            f"Response time: {response_time:.2f}s (target: <2s)", response.status_code)
            else:
                self.log_test("Enhanced AI v3 Performance", "FAIL", 
                            f"Response time: {response_time:.2f}s (exceeds 2s target)", response.status_code)
        else:
            self.log_test("Enhanced AI v3 Performance", "FAIL", 
                        "Enhanced AI v3 endpoint failed", response.status_code if response else None)
        
        # Test quick response performance
        start_time = time.time()
        response = self.make_request("POST", "/api/ai/v3/chat/quick-response", performance_request)
        response_time = time.time() - start_time
        
        if response and response.status_code == 200:
            if response_time < 2.0:
                self.log_test("Quick Response Performance", "PASS", 
                            f"Response time: {response_time:.2f}s (target: <2s)", response.status_code)
            else:
                self.log_test("Quick Response Performance", "FAIL", 
                            f"Response time: {response_time:.2f}s (exceeds 2s target)", response.status_code)
        else:
            self.log_test("Quick Response Performance", "FAIL", 
                        "Quick response endpoint failed", response.status_code if response else None)

    def test_groq_integration(self):
        """Test Groq integration with 4 models"""
        print("🚀 Testing Groq Integration...")
        
        # Test AI models endpoint to verify Groq models
        response = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data and len(data["models"]) >= 4:
                models = data["models"]
                model_names = [m.get("name", "Unknown") for m in models]
                
                # Check for Groq models
                groq_models = [m for m in model_names if "llama" in m.lower() or "mixtral" in m.lower()]
                if len(groq_models) >= 4:
                    self.log_test("4 Groq Models Available", "PASS", 
                                f"Found {len(groq_models)} Groq models: {', '.join(groq_models[:4])}", response.status_code)
                else:
                    self.log_test("4 Groq Models Available", "FAIL", 
                                f"Expected 4+ Groq models, found {len(groq_models)}: {groq_models}", response.status_code)
            else:
                model_count = len(data.get("models", []))
                self.log_test("4 Groq Models Available", "FAIL", 
                            f"Expected 4+ models, found {model_count}", response.status_code)
        else:
            self.log_test("4 Groq Models Available", "FAIL", 
                        "Models endpoint failed", response.status_code if response else None)

    def test_database_operations(self):
        """Test MongoDB Atlas connectivity and operations"""
        print("🗄️ Testing Database Operations...")
        
        # Test health check to verify database connectivity
        response = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            services = data.get("services", {})
            if services.get("database") == "connected":
                self.log_test("MongoDB Atlas Connectivity", "PASS", 
                            f"Database status: {services.get('database')}", response.status_code)
            else:
                self.log_test("MongoDB Atlas Connectivity", "FAIL", 
                            f"Database not connected: {services.get('database')}", response.status_code)
        else:
            self.log_test("MongoDB Atlas Connectivity", "FAIL", 
                        "Health check failed", response.status_code if response else None)
        
        # Test data operations by getting projects (requires database)
        response = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                project_count = len(data["projects"])
                self.log_test("Database Operations", "PASS", 
                            f"Successfully retrieved {project_count} projects from database", response.status_code)
            else:
                self.log_test("Database Operations", "FAIL", 
                            "No projects data returned", response.status_code)
        else:
            self.log_test("Database Operations", "FAIL", 
                        "Database operations failed", response.status_code if response else None)

    def run_focused_tests(self):
        """Run all focused tests for the review request"""
        print("🎯 Starting Focused Backend Testing for Aether AI Platform")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with authenticated tests")
            return
        
        # Run core capability tests
        self.test_multi_agent_system()
        self.test_app_building_capability()
        self.test_authentication_system()
        self.test_subscription_system()
        self.test_template_system()
        self.test_performance_enhanced_ai_v3()
        self.test_groq_integration()
        self.test_database_operations()
        
        # Print summary
        print("=" * 60)
        print("📊 FOCUSED TEST SUMMARY")
        print("=" * 60)
        
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        print("=" * 60)
        
        return self.test_results

if __name__ == "__main__":
    tester = FocusedBackendTester()
    results = tester.run_focused_tests()