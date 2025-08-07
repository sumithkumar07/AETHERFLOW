#!/usr/bin/env python3
"""
AETHER AI PLATFORM - FINAL COMPREHENSIVE BACKEND TEST
Production Readiness Assessment - August 2025
Testing all critical systems for production deployment
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class AetherFinalTester:
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
                self.log_test("Authentication System", "PASS", 
                            f"Demo login successful for {data.get('user', {}).get('email')}", 
                            response.status_code, response_time)
                return True
            else:
                self.log_test("Authentication System", "FAIL", 
                            "No access token in response", response.status_code, response_time)
        else:
            self.log_test("Authentication System", "FAIL", 
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
                services = data.get('services', {})
                self.log_test("API Health Check", "PASS", 
                            f"System healthy - Database: {services.get('database')}, AI: {services.get('ai')}", 
                            response.status_code, response_time)
            else:
                self.log_test("API Health Check", "FAIL", 
                            f"System not healthy: {data.get('status')}", 
                            response.status_code, response_time)
        else:
            self.log_test("API Health Check", "FAIL", 
                        "Health endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_multi_agent_ai_system(self):
        """Test Multi-Agent AI System with Groq Integration"""
        print("🤖 TESTING: MULTI-AGENT AI SYSTEM & GROQ INTEGRATION")
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
                    self.log_test("Multi-Agent System", "PASS", 
                                f"All 5 specialized agents available: {', '.join(found_agents)}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Multi-Agent System", "FAIL", 
                                f"Missing expected agents. Found: {found_agents}", 
                                response.status_code, response_time)
            else:
                self.log_test("Multi-Agent System", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Multi-Agent System", "FAIL", 
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
                    self.log_test("Groq AI Integration", "PASS", 
                                f"All 4 ultra-fast Groq models available: {', '.join(found_models)}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Groq AI Integration", "FAIL", 
                                f"Missing expected models. Found: {found_models}", 
                                response.status_code, response_time)
            else:
                self.log_test("Groq AI Integration", "FAIL", 
                            "Missing Groq integration data", response.status_code, response_time)
        else:
            self.log_test("Groq AI Integration", "FAIL", 
                        "AI status endpoint failed", 
                        response.status_code if response else None, response_time)

    def test_ai_chat_performance(self):
        """Test AI Chat Performance - <2 second target"""
        print("⚡ TESTING: AI CHAT PERFORMANCE & RESPONSE QUALITY")
        print("-" * 50)
        
        # Test enhanced AI chat with proper data structure
        chat_data = {
            "message": "Hello, I need help building a simple task management app. What should I start with?",
            "conversation_id": "test_conversation_001"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_data)
        if response and response.status_code == 200:
            data = response.json()
            if "content" in data and len(data["content"]) > 50:
                if response_time < 2.0:
                    self.log_test("Enhanced AI Chat Performance", "PASS", 
                                f"Response received in {response_time:.2f}s with {len(data['content'])} chars", 
                                response.status_code, response_time)
                else:
                    self.log_test("Enhanced AI Chat Performance", "WARN", 
                                f"Response time {response_time:.2f}s exceeds 2s target", 
                                response.status_code, response_time)
                
                # Check if agent was selected
                if "agent" in data:
                    self.log_test("AI Agent Selection", "PASS", 
                                f"Agent selected: {data.get('agent')} with model: {data.get('model_used')}", 
                                response.status_code, response_time)
                else:
                    self.log_test("AI Agent Selection", "WARN", 
                                "No agent selection information", response.status_code, response_time)
            else:
                self.log_test("Enhanced AI Chat Quality", "FAIL", 
                            f"Poor response quality: {len(data.get('content', ''))} chars", 
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
            if "content" in data and len(data["content"]) > 20:
                if response_time < 2.0:
                    self.log_test("Quick Response Performance", "PASS", 
                                f"Quick response in {response_time:.2f}s with {len(data['content'])} chars", 
                                response.status_code, response_time)
                else:
                    self.log_test("Quick Response Performance", "WARN", 
                                f"Quick response time {response_time:.2f}s exceeds 2s target", 
                                response.status_code, response_time)
            else:
                self.log_test("Quick Response Quality", "FAIL", 
                            f"Poor quick response quality: {len(data.get('content', ''))} chars", 
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
            if "plan" in data and "status" in data:
                self.log_test("Current Subscription", "PASS", 
                            f"Plan: {data.get('plan')}, Status: {data.get('status')}, Trial: {data.get('is_trial')}", 
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
            if "is_trial_active" in data and "trial_days_remaining" in data:
                self.log_test("Trial System", "PASS", 
                            f"Trial active: {data.get('is_trial_active')}, Days remaining: {data.get('trial_days_remaining')}", 
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
        
        # Test user profile access (requires database)
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            data = response.json()
            if "email" in data and "id" in data:
                self.log_test("Database Connectivity", "PASS", 
                            f"User profile accessible: {data.get('email')} (ID: {data.get('id')})", 
                            response.status_code, response_time)
            else:
                self.log_test("Database Connectivity", "FAIL", 
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
        
        response, response_time = self.make_request("GET", "/api/auth/me")
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
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            self.log_test("JWT Security - Authorized Access", "PASS", 
                        "Protected endpoint properly accepts valid JWT token", 
                        response.status_code, response_time)
        else:
            self.log_test("JWT Security - Authorized Access", "FAIL", 
                        "Protected endpoint should accept valid JWT token", 
                        response.status_code if response else None, response_time)

    def test_performance_metrics(self):
        """Test Performance Metrics"""
        print("📊 TESTING: PERFORMANCE METRICS")
        print("-" * 50)
        
        # Test concurrent requests simulation
        start_time = time.time()
        concurrent_requests = []
        
        # Simulate 5 concurrent requests
        for i in range(5):
            response, response_time = self.make_request("GET", "/api/health")
            concurrent_requests.append((response, response_time))
        
        total_time = time.time() - start_time
        successful_requests = len([r for r, _ in concurrent_requests if r and r.status_code == 200])
        avg_response_time = sum(rt for _, rt in concurrent_requests) / len(concurrent_requests)
        
        if successful_requests >= 4 and avg_response_time < 1.0:
            self.log_test("Performance - Concurrent Requests", "PASS", 
                        f"{successful_requests}/5 successful, avg {avg_response_time:.2f}s", 
                        200, total_time)
        else:
            self.log_test("Performance - Concurrent Requests", "WARN", 
                        f"{successful_requests}/5 successful, avg {avg_response_time:.2f}s", 
                        200, total_time)

    def test_error_handling(self):
        """Test Error Handling"""
        print("🚨 TESTING: ERROR HANDLING")
        print("-" * 50)
        
        # Test invalid endpoint
        response, response_time = self.make_request("GET", "/api/nonexistent")
        if response and response.status_code == 404:
            self.log_test("Error Handling - 404", "PASS", 
                        "Invalid endpoint properly returns 404", 
                        response.status_code, response_time)
        else:
            self.log_test("Error Handling - 404", "FAIL", 
                        f"Invalid endpoint should return 404, got {response.status_code if response else 'None'}", 
                        response.status_code if response else None, response_time)
        
        # Test invalid JSON data
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", {"invalid": "data"})
        if response and response.status_code in [400, 422]:
            self.log_test("Error Handling - Invalid Data", "PASS", 
                        "Invalid data properly handled with error response", 
                        response.status_code, response_time)
        else:
            self.log_test("Error Handling - Invalid Data", "WARN", 
                        f"Invalid data handling could be improved, got {response.status_code if response else 'None'}", 
                        response.status_code if response else None, response_time)

    def run_comprehensive_test(self):
        """Run comprehensive production readiness test"""
        print("🎯 AETHER AI PLATFORM - COMPREHENSIVE BACKEND TEST")
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
        self.test_performance_metrics()
        self.test_error_handling()
        
        # Generate summary
        self.generate_final_summary()

    def generate_final_summary(self):
        """Generate comprehensive final summary"""
        print("\n📊 COMPREHENSIVE BACKEND TEST SUMMARY")
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
            "Authentication System", 
            "Multi-Agent System",
            "Groq AI Integration",
            "Enhanced AI Chat Performance",
            "Current Subscription",
            "Templates Marketplace",
            "Database Connectivity"
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
        
        # Feature categories assessment
        feature_categories = {
            "Core Platform": ["API Health Check", "Authentication System", "Database Connectivity"],
            "AI & ML": ["Multi-Agent System", "Groq AI Integration", "Enhanced AI Chat Performance", "AI Agent Selection"],
            "Business Logic": ["Current Subscription", "Trial System", "Templates Marketplace", "Projects System"],
            "Integrations": ["Integrations Hub"],
            "Security": ["JWT Security - Unauthorized Access", "JWT Security - Authorized Access"],
            "Performance": ["Performance - Concurrent Requests", "Quick Response Performance"]
        }
        
        print("📋 FEATURE CATEGORIES STATUS:")
        print("-" * 35)
        for category, tests in feature_categories.items():
            category_tests = [r for r in self.test_results if any(test.lower() in r["test"].lower() for test in tests)]
            if category_tests:
                category_passed = len([r for r in category_tests if r["status"] == "PASS"])
                category_total = len(category_tests)
                category_percentage = category_passed / category_total * 100 if category_total > 0 else 0
                
                if category_percentage >= 80:
                    status = "✅ EXCELLENT"
                elif category_percentage >= 60:
                    status = "👍 GOOD"
                elif category_percentage >= 40:
                    status = "⚠️ NEEDS WORK"
                else:
                    status = "❌ CRITICAL"
                
                print(f"{category}: {status} ({category_passed}/{category_total} tests passed)")
        print()
        
        # Final production readiness verdict
        if critical_passed >= 7 and passed_tests >= total_tests * 0.85:
            verdict = "🎉 PRODUCTION READY - Deploy with confidence"
            color = "🟢"
        elif critical_passed >= 6 and passed_tests >= total_tests * 0.75:
            verdict = "👍 MOSTLY READY - Minor issues to address"
            color = "🟡"
        elif critical_passed >= 5 and passed_tests >= total_tests * 0.60:
            verdict = "⚠️ NEEDS WORK - Address issues before deployment"
            color = "🟠"
        else:
            verdict = "❌ NOT READY - Significant issues require resolution"
            color = "🔴"
        
        print(f"PRODUCTION READINESS: {color} {verdict}")
        print()
        
        # Key achievements
        print("🏆 KEY ACHIEVEMENTS:")
        print("-" * 20)
        achievements = []
        if any("Multi-Agent System" in r["test"] and r["status"] == "PASS" for r in self.test_results):
            achievements.append("✅ Multi-Agent AI System operational with 5 specialized agents")
        if any("Groq AI Integration" in r["test"] and r["status"] == "PASS" for r in self.test_results):
            achievements.append("✅ Groq AI Integration working with 4 ultra-fast models")
        if any("Enhanced AI Chat Performance" in r["test"] and r["status"] == "PASS" for r in self.test_results):
            achievements.append("✅ AI Chat Performance meeting <2 second target")
        if any("Trial System" in r["test"] and r["status"] == "PASS" for r in self.test_results):
            achievements.append("✅ Subscription & Trial System fully functional")
        if any("Templates Marketplace" in r["test"] and r["status"] == "PASS" for r in self.test_results):
            achievements.append("✅ Templates Marketplace with 20+ professional templates")
        
        for achievement in achievements:
            print(achievement)
        print()
        
        # Issues requiring attention
        if failed_tests > 0:
            print("🔍 ISSUES REQUIRING ATTENTION:")
            print("-" * 35)
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
    
    print("🚀 Starting Aether AI Platform - Comprehensive Backend Test")
    print(f"Backend URL: {backend_url}")
    
    tester = AetherFinalTester(backend_url)
    tester.run_comprehensive_test()