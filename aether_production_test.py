#!/usr/bin/env python3
"""
AETHER AI PLATFORM - PRODUCTION READINESS TEST
Comprehensive Backend Testing for Production Deployment
Focus on Core AI Platform Functionality
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class AetherProductionTester:
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
        """Log test results"""
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
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_code:
            print(f"   Response Code: {response_code}")
        if response_time:
            print(f"   Response Time: {response_time:.2f}s")
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
                            response.status_code, response_time)
                return True
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response.status_code, response_time)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Login failed", response.status_code if response else None, response_time)
        return False

    def test_api_health_system_status(self):
        """Test API Health & System Status"""
        print("🏥 TESTING: API HEALTH & SYSTEM STATUS")
        print("-" * 50)
        
        # Test main health endpoint
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                self.log_test("API Health Check", "PASS", 
                            f"System healthy with services: {data.get('services', {})}", 
                            response.status_code, response_time)
            else:
                self.log_test("API Health Check", "FAIL", 
                            f"System not healthy: {data.get('status')}", 
                            response.status_code, response_time)
        else:
            self.log_test("API Health Check", "FAIL", 
                        "Health endpoint failed", 
                        response.status_code if response else None, response_time)
        
        # Test root endpoint
        response, response_time = self.make_request("GET", "/")
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data and "Aether AI" in data["message"]:
                self.log_test("Root Endpoint", "PASS", 
                            f"API running: {data.get('message')} v{data.get('version')}", 
                            response.status_code, response_time)
            else:
                self.log_test("Root Endpoint", "FAIL", 
                            "Invalid root response", response.status_code, response_time)
        else:
            self.log_test("Root Endpoint", "FAIL", 
                        "Root endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_multi_agent_ai_system(self):
        """Test Multi-Agent AI System with Groq Integration"""
        print("🤖 TESTING: MULTI-AGENT AI SYSTEM")
        print("-" * 50)
        
        # Test available agents
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if isinstance(agent, dict)]
                
                if all(agent in found_agents for agent in expected_agents):
                    self.log_test("Multi-Agent System - Available Agents", "PASS", 
                                f"All 5 specialized agents available: {', '.join(found_agents)}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                                f"Missing expected agents. Found: {found_agents}", 
                                response.status_code, response_time)
            else:
                self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                        "Agents endpoint failed", 
                        response.status_code if response else None, response_time)
        
        # Test AI status and Groq models
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_integration" in data and "models" in data["groq_integration"]:
                models = data["groq_integration"]["models"]
                expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                found_models = list(models.keys())
                
                if all(model in found_models for model in expected_models):
                    self.log_test("Groq AI Integration - Models", "PASS", 
                                f"All 4 ultra-fast Groq models available: {', '.join(found_models)}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Groq AI Integration - Models", "FAIL", 
                                f"Missing expected models. Found: {found_models}", 
                                response.status_code, response_time)
            else:
                self.log_test("Groq AI Integration - Models", "FAIL", 
                            "Missing Groq integration data", response.status_code, response_time)
        else:
            self.log_test("Groq AI Integration - Status", "FAIL", 
                        "AI status endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_ai_chat_performance(self):
        """Test AI Chat Performance - <2 second target"""
        print("⚡ TESTING: AI CHAT PERFORMANCE")
        print("-" * 50)
        
        # Test enhanced AI chat
        chat_data = {
            "message": "Hello, I need help building a simple task management app. What should I start with?",
            "conversation_id": "test_conversation_001"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 50:
                if response_time < 2.0:
                    self.log_test("Enhanced AI Chat - Performance", "PASS", 
                                f"Response received in {response_time:.2f}s (target: <2s)", 
                                response.status_code, response_time)
                else:
                    self.log_test("Enhanced AI Chat - Performance", "WARN", 
                                f"Response time {response_time:.2f}s exceeds 2s target", 
                                response.status_code, response_time)
                
                # Check if agent was selected
                if "agent_used" in data:
                    self.log_test("Enhanced AI Chat - Agent Selection", "PASS", 
                                f"Agent selected: {data.get('agent_used')}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Enhanced AI Chat - Agent Selection", "WARN", 
                                "No agent selection information", response.status_code, response_time)
            else:
                self.log_test("Enhanced AI Chat - Response Quality", "FAIL", 
                            f"Poor response quality: {len(data.get('response', ''))} chars", 
                            response.status_code, response_time)
        else:
            self.log_test("Enhanced AI Chat", "FAIL", 
                        "Enhanced chat endpoint failed", 
                        response.status_code if response else None, response_time)
        
        # Test quick response mode
        quick_data = {
            "message": "What is React?",
            "mode": "quick"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 20:
                if response_time < 2.0:
                    self.log_test("Quick Response Mode - Performance", "PASS", 
                                f"Quick response in {response_time:.2f}s (target: <2s)", 
                                response.status_code, response_time)
                else:
                    self.log_test("Quick Response Mode - Performance", "WARN", 
                                f"Quick response time {response_time:.2f}s exceeds 2s target", 
                                response.status_code, response_time)
            else:
                self.log_test("Quick Response Mode - Quality", "FAIL", 
                            f"Poor quick response quality: {len(data.get('response', ''))} chars", 
                            response.status_code, response_time)
        else:
            self.log_test("Quick Response Mode", "FAIL", 
                        "Quick response endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_subscription_trial_system(self):
        """Test Subscription & Trial System"""
        print("💳 TESTING: SUBSCRIPTION & TRIAL SYSTEM")
        print("-" * 50)
        
        # Test current subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "subscription" in data:
                subscription = data["subscription"]
                self.log_test("Current Subscription", "PASS", 
                            f"Plan: {subscription.get('plan')}, Status: {subscription.get('status')}", 
                            response.status_code, response_time)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response.status_code, response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Subscription endpoint failed", 
                        response.status_code if response else None, response_time)
        
        # Test trial status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial" in data:
                trial = data["trial"]
                self.log_test("Trial System", "PASS", 
                            f"Trial active: {trial.get('active')}, Days remaining: {trial.get('days_remaining')}", 
                            response.status_code, response_time)
            else:
                self.log_test("Trial System", "FAIL", 
                            "Missing trial data", response.status_code, response_time)
        else:
            self.log_test("Trial System", "FAIL", 
                        "Trial status endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_templates_system(self):
        """Test Templates System"""
        print("📄 TESTING: TEMPLATES SYSTEM")
        print("-" * 50)
        
        # Test templates marketplace
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 10:
                templates = data["templates"]
                categories = set(template.get("category") for template in templates if isinstance(template, dict))
                self.log_test("Templates Marketplace", "PASS", 
                            f"Found {len(templates)} templates across {len(categories)} categories", 
                            response.status_code, response_time)
            else:
                self.log_test("Templates Marketplace", "FAIL", 
                            f"Insufficient templates: {len(data.get('templates', []))}", 
                            response.status_code, response_time)
        else:
            self.log_test("Templates Marketplace", "FAIL", 
                        "Templates endpoint failed", 
                        response.status_code if response else None, response_time)
        
        # Test featured templates
        response, response_time = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                self.log_test("Featured Templates", "PASS", 
                            f"Found {len(data['templates'])} featured templates", 
                            response.status_code, response_time)
            else:
                self.log_test("Featured Templates", "FAIL", 
                            "No featured templates found", response.status_code, response_time)
        else:
            self.log_test("Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_projects_system(self):
        """Test Projects System"""
        print("📁 TESTING: PROJECTS SYSTEM")
        print("-" * 50)
        
        # Test projects list
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                projects = data["projects"]
                self.log_test("Projects System", "PASS", 
                            f"Found {len(projects)} projects for user", 
                            response.status_code, response_time)
            else:
                self.log_test("Projects System", "FAIL", 
                            "Missing projects data", response.status_code, response_time)
        else:
            self.log_test("Projects System", "FAIL", 
                        "Projects endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_integrations_system(self):
        """Test Integrations System"""
        print("🔌 TESTING: INTEGRATIONS SYSTEM")
        print("-" * 50)
        
        # Test integrations hub
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) >= 10:
                integrations = data["integrations"]
                categories = set(integration.get("category") for integration in integrations if isinstance(integration, dict))
                self.log_test("Integrations Hub", "PASS", 
                            f"Found {len(integrations)} integrations across {len(categories)} categories", 
                            response.status_code, response_time)
            else:
                self.log_test("Integrations Hub", "FAIL", 
                            f"Insufficient integrations: {len(data.get('integrations', []))}", 
                            response.status_code, response_time)
        else:
            self.log_test("Integrations Hub", "FAIL", 
                        "Integrations endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_database_operations(self):
        """Test Database Operations"""
        print("🗄️ TESTING: DATABASE OPERATIONS")
        print("-" * 50)
        
        # Database connectivity is tested implicitly through other operations
        # Test user profile access (requires database)
        response, response_time = self.make_request("GET", "/api/auth/profile")
        if response and response.status_code == 200:
            data = response.json()
            if "user" in data:
                user = data["user"]
                self.log_test("Database Connectivity - User Profile", "PASS", 
                            f"User profile accessible: {user.get('email')}", 
                            response.status_code, response_time)
            else:
                self.log_test("Database Connectivity - User Profile", "FAIL", 
                            "Missing user profile data", response.status_code, response_time)
        else:
            self.log_test("Database Connectivity", "FAIL", 
                        "User profile endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_security_jwt(self):
        """Test Security & JWT"""
        print("🔒 TESTING: SECURITY & JWT")
        print("-" * 50)
        
        # Test protected endpoint without token
        old_token = self.auth_token
        self.auth_token = None
        
        response, response_time = self.make_request("GET", "/api/auth/profile")
        if response and response.status_code == 401:
            self.log_test("JWT Security - Unauthorized Access", "PASS", 
                        "Protected endpoint properly rejects unauthorized requests", 
                        response.status_code, response_time)
        else:
            self.log_test("JWT Security - Unauthorized Access", "FAIL", 
                        f"Protected endpoint should return 401, got {response.status_code if response else 'None'}", 
                        response.status_code if response else None, response_time)
        
        # Restore token
        self.auth_token = old_token
        
        # Test with valid token
        response, response_time = self.make_request("GET", "/api/auth/profile")
        if response and response.status_code == 200:
            self.log_test("JWT Security - Authorized Access", "PASS", 
                        "Protected endpoint properly accepts valid JWT token", 
                        response.status_code, response_time)
        else:
            self.log_test("JWT Security - Authorized Access", "FAIL", 
                        "Protected endpoint should accept valid JWT token", 
                        response.status_code if response else None, response_time)

    def run_production_readiness_test(self):
        """Run comprehensive production readiness test"""
        print("🎯 AETHER AI PLATFORM - PRODUCTION READINESS TEST")
        print("=" * 60)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with testing")
            return
        
        # Run all critical tests
        self.test_api_health_system_status()
        self.test_multi_agent_ai_system()
        self.test_ai_chat_performance()
        self.test_subscription_trial_system()
        self.test_templates_system()
        self.test_projects_system()
        self.test_integrations_system()
        self.test_database_operations()
        self.test_security_jwt()
        
        # Generate summary
        self.generate_production_summary()

    def generate_production_summary(self):
        """Generate production readiness summary"""
        print("\n📊 PRODUCTION READINESS SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        warning_tests = len([r for r in self.test_results if r["status"] == "WARN"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"⚠️ Warnings: {warning_tests} ({warning_tests/total_tests*100:.1f}%)")
        print()
        
        # Performance analysis
        performance_tests = [r for r in self.test_results if r["response_time"] is not None]
        if performance_tests:
            avg_response_time = sum(r["response_time"] for r in performance_tests) / len(performance_tests)
            fast_responses = len([r for r in performance_tests if r["response_time"] < 2.0])
            
            print("⚡ PERFORMANCE METRICS:")
            print("-" * 30)
            print(f"Average Response Time: {avg_response_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(performance_tests)} ({fast_responses/len(performance_tests)*100:.1f}%)")
            print()
        
        # Critical systems assessment
        critical_systems = [
            "API Health Check",
            "Demo User Authentication", 
            "Multi-Agent System - Available Agents",
            "Groq AI Integration - Models",
            "Enhanced AI Chat",
            "Current Subscription",
            "Templates Marketplace"
        ]
        
        critical_passed = 0
        for system in critical_systems:
            system_tests = [r for r in self.test_results if system.lower() in r["test"].lower()]
            if system_tests and any(r["status"] == "PASS" for r in system_tests):
                critical_passed += 1
        
        print("🎯 CRITICAL SYSTEMS STATUS:")
        print("-" * 30)
        print(f"Critical Systems Working: {critical_passed}/{len(critical_systems)} ({critical_passed/len(critical_systems)*100:.1f}%)")
        print()
        
        # Final production readiness verdict
        if critical_passed >= 6 and passed_tests >= total_tests * 0.8:
            verdict = "🎉 PRODUCTION READY - Deploy with confidence"
            color = "🟢"
        elif critical_passed >= 5 and passed_tests >= total_tests * 0.7:
            verdict = "👍 MOSTLY READY - Minor issues to address"
            color = "🟡"
        elif critical_passed >= 4:
            verdict = "⚠️ NEEDS WORK - Address critical issues before deployment"
            color = "🟠"
        else:
            verdict = "❌ NOT READY - Significant issues require resolution"
            color = "🔴"
        
        print(f"PRODUCTION READINESS: {color} {verdict}")
        print()
        
        # Detailed failure analysis
        if failed_tests > 0:
            print("🔍 FAILED TESTS REQUIRING ATTENTION:")
            print("-" * 40)
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['details']}")
            print()
        
        # Performance warnings
        if warning_tests > 0:
            print("⚠️ PERFORMANCE WARNINGS:")
            print("-" * 25)
            for result in self.test_results:
                if result["status"] == "WARN":
                    print(f"⚠️ {result['test']}: {result['details']}")
            print()
        
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 60)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Production Readiness Test")
    print(f"Backend URL: {backend_url}")
    
    tester = AetherProductionTester(backend_url)
    tester.run_production_readiness_test()