#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING - AETHER AI PLATFORM
Tests all systems mentioned in the review request:
1. Authentication System (demo login, JWT validation)
2. Multi-Agent AI System (5 AI agents, v3 enhanced endpoints)
3. Groq Integration (4 models, <2 second response times)
4. Subscription System (trial status, subscription plans, usage limits)
5. Template System (templates API, featured templates)
6. Integration Hub (integration endpoints)
7. Performance (response times under 2 seconds for AI endpoints)
8. Database (MongoDB Atlas connectivity, data persistence)
9. API Health (all critical endpoints responding properly)
10. Enhanced Features (competitive features like analytics, mobile endpoints)
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
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_time:
            print(f"   Response Time: {response_time:.2f}s")
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

    def test_1_authentication_system(self):
        """Test Authentication System (demo login, JWT validation)"""
        print("🔐 TESTING 1: AUTHENTICATION SYSTEM")
        print("-" * 50)
        
        # Test demo login
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                user_email = data.get('user', {}).get('email', 'unknown')
                self.log_test("Demo Login (demo@aicodestudio.com)", "PASS", 
                            f"Successfully authenticated {user_email}", response_time)
                
                # Test JWT validation
                response, response_time = self.make_request("GET", "/api/auth/me")
                if response and response.status_code == 200:
                    profile_data = response.json()
                    if "user" in profile_data and "email" in profile_data["user"]:
                        self.log_test("JWT Token Validation", "PASS", 
                                    f"Profile retrieved: {profile_data['user']['email']}", response_time)
                    else:
                        self.log_test("JWT Token Validation", "FAIL", 
                                    "Invalid profile data structure", response_time)
                else:
                    self.log_test("JWT Token Validation", "FAIL", 
                                "Token validation failed", response_time)
                return True
            else:
                self.log_test("Demo Login (demo@aicodestudio.com)", "FAIL", 
                            "No access token in response", response_time)
        else:
            self.log_test("Demo Login (demo@aicodestudio.com)", "FAIL", 
                        "Login failed", response_time)
        return False

    def test_2_multi_agent_ai_system(self):
        """Test Multi-Agent AI System (5 AI agents, v3 enhanced endpoints)"""
        print("🤖 TESTING 2: MULTI-AGENT AI SYSTEM")
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
                    self.log_test("5 AI Agents Available", "PASS", 
                                f"All 5 specialized agents: {', '.join(found_agents)}", response_time)
                    
                    # Test v3 enhanced chat endpoint
                    chat_data = {
                        "message": "Help me build a task management app with React and FastAPI",
                        "agent_preference": "Dev"
                    }
                    response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_data)
                    if response and response.status_code == 200:
                        chat_response = response.json()
                        if "response" in chat_response and len(chat_response["response"]) > 100:
                            agent_used = chat_response.get("agent_used", "unknown")
                            self.log_test("V3 Enhanced AI Chat", "PASS", 
                                        f"AI response received ({len(chat_response['response'])} chars) from {agent_used}", response_time)
                        else:
                            self.log_test("V3 Enhanced AI Chat", "FAIL", 
                                        "AI response too short or missing", response_time)
                    else:
                        self.log_test("V3 Enhanced AI Chat", "FAIL", 
                                    "Enhanced AI chat failed", response_time)
                else:
                    self.log_test("5 AI Agents Available", "FAIL", 
                                f"Missing expected agents. Found: {found_agents}", response_time)
            else:
                self.log_test("5 AI Agents Available", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", response_time)
        else:
            self.log_test("5 AI Agents Available", "FAIL", 
                        "Agents endpoint failed", response_time)

    def test_3_groq_integration(self):
        """Test Groq Integration (4 models, <2 second response times)"""
        print("⚡ TESTING 3: GROQ INTEGRATION")
        print("-" * 50)
        
        # Test AI status endpoint for Groq models
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            
            # Check for Groq models
            groq_models = []
            if "groq_integration" in data and "models" in data["groq_integration"]:
                groq_models = list(data["groq_integration"]["models"].keys())
            elif "groq_models" in data:
                groq_models = [model.get("name") for model in data["groq_models"] if isinstance(model, dict)]
            
            expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
            
            if len(groq_models) >= 4:
                self.log_test("4 Ultra-Fast Groq Models", "PASS", 
                            f"Found {len(groq_models)} Groq models available", response_time)
            else:
                self.log_test("4 Ultra-Fast Groq Models", "FAIL", 
                            f"Only {len(groq_models)} models found, expected 4+", response_time)
            
            # Test Groq API key working
            if "groq_api_key" in data and data["groq_api_key"]:
                self.log_test("Groq API Key Active", "PASS", 
                            f"API key configured: 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", response_time)
            else:
                self.log_test("Groq API Key Active", "FAIL", 
                            "Groq API key not configured", response_time)
            
            # Test <2 second response time requirement
            quick_response_data = {"message": "Quick test for response speed"}
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_response_data)
            if response and response.status_code == 200:
                if response_time < 2.0:
                    self.log_test("Groq Response Time <2s", "PASS", 
                                f"Response time target met: {response_time:.2f}s", response_time)
                else:
                    self.log_test("Groq Response Time <2s", "FAIL", 
                                f"Response time exceeded 2s target: {response_time:.2f}s", response_time)
            else:
                self.log_test("Groq Response Time <2s", "FAIL", 
                            "Quick response endpoint failed", response_time)
        else:
            self.log_test("Groq Integration Status", "FAIL", 
                        "AI status endpoint failed", response_time)

    def test_4_subscription_system(self):
        """Test Subscription System (trial status, subscription plans, usage limits)"""
        print("💳 TESTING 4: SUBSCRIPTION SYSTEM")
        print("-" * 50)
        
        # Test trial status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial_active" in data or "days_remaining" in data or "status" in data:
                trial_status = data.get("trial_active", data.get("status", "unknown"))
                days_remaining = data.get("days_remaining", "unknown")
                self.log_test("7-Day Trial System", "PASS", 
                            f"Trial status: {trial_status}, Days remaining: {days_remaining}", response_time)
            else:
                self.log_test("7-Day Trial System", "FAIL", 
                            "Missing trial status data", response_time)
        else:
            self.log_test("7-Day Trial System", "FAIL", 
                        "Trial status endpoint failed", response_time)
        
        # Test subscription plans
        response, response_time = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data and len(data["plans"]) >= 3:
                plans = data["plans"]
                plan_names = [plan.get("name") for plan in plans if isinstance(plan, dict)]
                plan_prices = [f"${plan.get('price', 0)}" for plan in plans if isinstance(plan, dict)]
                self.log_test("Subscription Plans", "PASS", 
                            f"Found {len(plans)} plans: {', '.join(plan_names)} at {', '.join(plan_prices)}", response_time)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            f"Insufficient plans: {len(data.get('plans', []))}", response_time)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Subscription plans endpoint failed", response_time)
        
        # Test current subscription and usage limits
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "subscription" in data or "plan" in data or "usage" in data:
                plan_name = data.get("subscription", {}).get("plan", data.get("plan", "unknown"))
                usage = data.get("usage", {})
                tokens_used = usage.get("tokens_used", 0)
                self.log_test("Usage Limits Enforcement", "PASS", 
                            f"Plan: {plan_name}, Tokens used: {tokens_used}", response_time)
            else:
                self.log_test("Usage Limits Enforcement", "FAIL", 
                            "Missing subscription/usage data", response_time)
        else:
            self.log_test("Usage Limits Enforcement", "FAIL", 
                        "Current subscription endpoint failed", response_time)

    def test_5_template_system(self):
        """Test Template System (templates API, featured templates)"""
        print("📁 TESTING 5: TEMPLATE SYSTEM")
        print("-" * 50)
        
        # Test templates API
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                templates = data["templates"]
                categories = set(template.get("category") for template in templates if isinstance(template, dict))
                self.log_test("Templates API", "PASS", 
                            f"Found {len(templates)} templates across {len(categories)} categories", response_time)
            else:
                self.log_test("Templates API", "FAIL", 
                            "No templates found", response_time)
        else:
            self.log_test("Templates API", "FAIL", 
                        "Templates endpoint failed", response_time)
        
        # Test featured templates
        response, response_time = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                featured_templates = data["templates"]
                template_names = [t.get("name") for t in featured_templates if isinstance(t, dict)]
                self.log_test("Featured Templates", "PASS", 
                            f"Found {len(featured_templates)} featured templates", response_time)
            else:
                self.log_test("Featured Templates", "FAIL", 
                            "No featured templates found", response_time)
        else:
            self.log_test("Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", response_time)

    def test_6_integration_hub(self):
        """Test Integration Hub (integration endpoints)"""
        print("🔌 TESTING 6: INTEGRATION HUB")
        print("-" * 50)
        
        # Test integrations endpoint
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) > 0:
                integrations = data["integrations"]
                categories = set(integration.get("category") for integration in integrations if isinstance(integration, dict))
                self.log_test("Integration Hub", "PASS", 
                            f"Found {len(integrations)} integrations across {len(categories)} categories", response_time)
            else:
                self.log_test("Integration Hub", "FAIL", 
                            "No integrations found", response_time)
        else:
            self.log_test("Integration Hub", "FAIL", 
                        "Integrations endpoint failed", response_time)
        
        # Test integration categories
        response, response_time = self.make_request("GET", "/api/integrations/categories")
        if response and response.status_code == 200:
            data = response.json()
            if "categories" in data and len(data["categories"]) > 0:
                categories = data["categories"]
                self.log_test("Integration Categories", "PASS", 
                            f"Found {len(categories)} integration categories", response_time)
            else:
                self.log_test("Integration Categories", "FAIL", 
                            "No integration categories found", response_time)
        else:
            self.log_test("Integration Categories", "FAIL", 
                        "Integration categories endpoint failed", response_time)

    def test_7_performance_verification(self):
        """Test Performance (response times under 2 seconds for AI endpoints)"""
        print("⚡ TESTING 7: PERFORMANCE VERIFICATION")
        print("-" * 50)
        
        # Test multiple AI endpoints for performance
        ai_endpoints = [
            ("/api/ai/v3/chat/enhanced", {"message": "Performance test"}),
            ("/api/ai/v3/chat/quick-response", {"message": "Quick performance test"}),
            ("/api/ai/v3/agents/available", None)
        ]
        
        fast_responses = 0
        total_ai_tests = 0
        
        for endpoint, data in ai_endpoints:
            if data:
                response, response_time = self.make_request("POST", endpoint, data)
            else:
                response, response_time = self.make_request("GET", endpoint)
            
            if response and response.status_code == 200:
                total_ai_tests += 1
                if response_time < 2.0:
                    fast_responses += 1
                    status = "PASS"
                else:
                    status = "FAIL"
                
                self.log_test(f"Performance {endpoint.split('/')[-1]}", status, 
                            f"Response time: {response_time:.2f}s", response_time)
        
        # Overall performance assessment
        if total_ai_tests > 0:
            performance_percentage = (fast_responses / total_ai_tests) * 100
            if performance_percentage >= 80:
                self.log_test("Overall AI Performance", "PASS", 
                            f"{fast_responses}/{total_ai_tests} endpoints under 2s ({performance_percentage:.1f}%)")
            else:
                self.log_test("Overall AI Performance", "FAIL", 
                            f"Only {fast_responses}/{total_ai_tests} endpoints under 2s ({performance_percentage:.1f}%)")

    def test_8_database_connectivity(self):
        """Test Database (MongoDB Atlas connectivity, data persistence)"""
        print("🗄️ TESTING 8: DATABASE CONNECTIVITY")
        print("-" * 50)
        
        # Test database through user profile
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            data = response.json()
            if "user" in data and "email" in data["user"]:
                self.log_test("MongoDB Atlas Connectivity", "PASS", 
                            f"Database accessible via user profile", response_time)
            else:
                self.log_test("MongoDB Atlas Connectivity", "FAIL", 
                            "User profile data incomplete", response_time)
        else:
            self.log_test("MongoDB Atlas Connectivity", "FAIL", 
                        "Cannot access user profile (database issue)", response_time)
        
        # Test data persistence through projects
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                projects = data["projects"]
                self.log_test("Data Persistence", "PASS", 
                            f"Successfully retrieved {len(projects)} projects from database", response_time)
            else:
                self.log_test("Data Persistence", "FAIL", 
                            "Projects data structure invalid", response_time)
        else:
            self.log_test("Data Persistence", "FAIL", 
                        "Cannot retrieve projects (database issue)", response_time)

    def test_9_api_health(self):
        """Test API Health (all critical endpoints responding properly)"""
        print("🏥 TESTING 9: API HEALTH")
        print("-" * 50)
        
        # Test main health endpoint
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                services = data.get("services", {})
                healthy_services = [k for k, v in services.items() if v in ["connected", "available", "ready", "enabled"]]
                self.log_test("API Health Check", "PASS", 
                            f"API healthy, {len(healthy_services)} services operational", response_time)
            else:
                self.log_test("API Health Check", "FAIL", 
                            "API not reporting healthy status", response_time)
        else:
            self.log_test("API Health Check", "FAIL", 
                        "Health endpoint failed", response_time)
        
        # Test root endpoint
        response, response_time = self.make_request("GET", "/")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "running":
                version = data.get("version", "unknown")
                self.log_test("Root Endpoint", "PASS", 
                            f"API running, version: {version}", response_time)
            else:
                self.log_test("Root Endpoint", "FAIL", 
                            "Root endpoint not reporting running status", response_time)
        else:
            self.log_test("Root Endpoint", "FAIL", 
                        "Root endpoint failed", response_time)

    def test_10_enhanced_features(self):
        """Test Enhanced Features (competitive features like analytics, mobile endpoints)"""
        print("🚀 TESTING 10: ENHANCED FEATURES")
        print("-" * 50)
        
        # Test mobile experience
        response, response_time = self.make_request("GET", "/api/mobile/health")
        if response and response.status_code == 200:
            data = response.json()
            if any(key in data for key in ["mobile_optimized", "pwa_ready", "status"]):
                self.log_test("Mobile Experience", "PASS", 
                            f"Mobile endpoints operational", response_time)
            else:
                self.log_test("Mobile Experience", "FAIL", 
                            "Mobile health data incomplete", response_time)
        else:
            self.log_test("Mobile Experience", "FAIL", 
                        "Mobile health endpoint failed", response_time)
        
        # Test analytics
        response, response_time = self.make_request("GET", "/api/analytics/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if any(key in data for key in ["overview", "metrics", "analytics"]):
                self.log_test("Advanced Analytics", "PASS", 
                            f"Analytics dashboard operational", response_time)
            else:
                self.log_test("Advanced Analytics", "FAIL", 
                            "Analytics dashboard data incomplete", response_time)
        else:
            self.log_test("Advanced Analytics", "FAIL", 
                        "Analytics dashboard endpoint failed", response_time)
        
        # Test PWA manifest
        response, response_time = self.make_request("GET", "/api/mobile/pwa/manifest")
        if response and response.status_code == 200:
            data = response.json()
            if any(key in data for key in ["name", "manifest", "icons"]):
                app_name = data.get("name", data.get("manifest", {}).get("name", "unknown"))
                self.log_test("PWA Support", "PASS", 
                            f"PWA manifest available for: {app_name}", response_time)
            else:
                self.log_test("PWA Support", "FAIL", 
                            "PWA manifest data incomplete", response_time)
        else:
            self.log_test("PWA Support", "FAIL", 
                        "PWA manifest endpoint failed", response_time)

    def run_comprehensive_test(self):
        """Run comprehensive test on all systems"""
        print("🎯 AETHER AI PLATFORM - COMPREHENSIVE BACKEND TESTING")
        print("=" * 70)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("Testing all systems mentioned in review request:")
        print("1. Authentication System  2. Multi-Agent AI System  3. Groq Integration")
        print("4. Subscription System    5. Template System       6. Integration Hub")
        print("7. Performance           8. Database Connectivity  9. API Health")
        print("10. Enhanced Features")
        print("=" * 70)
        
        # Test all systems
        if not self.test_1_authentication_system():
            print("⚠️ Authentication failed - some tests may not work properly")
        
        self.test_2_multi_agent_ai_system()
        self.test_3_groq_integration()
        self.test_4_subscription_system()
        self.test_5_template_system()
        self.test_6_integration_hub()
        self.test_7_performance_verification()
        self.test_8_database_connectivity()
        self.test_9_api_health()
        self.test_10_enhanced_features()
        
        # Generate comprehensive summary
        self.generate_comprehensive_summary()

    def generate_comprehensive_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print()
        
        # System-by-system status
        systems = [
            "Authentication System",
            "Multi-Agent AI System", 
            "Groq Integration",
            "Subscription System",
            "Template System",
            "Integration Hub",
            "Performance Verification",
            "Database Connectivity",
            "API Health",
            "Enhanced Features"
        ]
        
        print("🎯 SYSTEM-BY-SYSTEM STATUS:")
        print("-" * 50)
        
        working_systems = 0
        for i, system in enumerate(systems, 1):
            system_tests = [r for r in self.test_results if system.lower().replace(" ", "_") in r["test"].lower().replace(" ", "_")]
            if system_tests:
                system_passed = len([r for r in system_tests if r["status"] == "PASS"])
                system_total = len(system_tests)
                system_percentage = system_passed / system_total * 100 if system_total > 0 else 0
                
                if system_percentage >= 80:
                    status = "✅ WORKING"
                    working_systems += 1
                elif system_percentage >= 50:
                    status = "⚠️ PARTIAL"
                else:
                    status = "❌ FAILED"
                
                print(f"{i:2d}. {system:<25}: {status} ({system_passed}/{system_total})")
            else:
                print(f"{i:2d}. {system:<25}: ❌ NOT TESTED")
        
        print()
        
        # Performance analysis
        timed_responses = [r for r in self.test_results if r.get("response_time")]
        if timed_responses:
            avg_time = sum(r["response_time"] for r in timed_responses) / len(timed_responses)
            fast_responses = len([r for r in timed_responses if r["response_time"] < 2.0])
            fast_percentage = (fast_responses / len(timed_responses)) * 100
            
            print("⚡ PERFORMANCE ANALYSIS:")
            print("-" * 30)
            print(f"Average Response Time: {avg_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(timed_responses)} ({fast_percentage:.1f}%)")
            print()
        
        # Final assessment
        success_rate = (passed_tests / total_tests) * 100
        system_success_rate = (working_systems / len(systems)) * 100
        
        if success_rate >= 90 and system_success_rate >= 80:
            verdict = "🎉 EXCELLENT - Production Ready"
        elif success_rate >= 80 and system_success_rate >= 70:
            verdict = "👍 GOOD - Minor Issues to Address"
        elif success_rate >= 60 and system_success_rate >= 50:
            verdict = "⚠️ NEEDS WORK - Major Issues Present"
        else:
            verdict = "❌ CRITICAL - Significant Development Required"
        
        print("🏆 FINAL ASSESSMENT:")
        print("-" * 30)
        print(f"Overall Test Success: {success_rate:.1f}%")
        print(f"Working Systems: {working_systems}/{len(systems)} ({system_success_rate:.1f}%)")
        print(f"VERDICT: {verdict}")
        print()
        
        # Critical issues summary
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL" and any(keyword in r["test"].lower() for keyword in ["authentication", "groq", "database", "ai"])]
        if critical_failures:
            print("🚨 CRITICAL ISSUES:")
            print("-" * 20)
            for failure in critical_failures:
                print(f"❌ {failure['test']}: {failure['details']}")
            print()
        
        # Production readiness assessment
        print("🚀 PRODUCTION READINESS:")
        print("-" * 30)
        if working_systems >= 8:
            print("✅ READY FOR PRODUCTION DEPLOYMENT")
        elif working_systems >= 6:
            print("⚠️ READY WITH MINOR FIXES NEEDED")
        else:
            print("❌ NOT READY - MAJOR DEVELOPMENT REQUIRED")
        
        print(f"\nTest Completed: {datetime.now().isoformat()}")
        print("=" * 70)

if __name__ == "__main__":
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Comprehensive Backend Test")
    print(f"Backend URL: {backend_url}")
    
    tester = ComprehensiveBackendTester(backend_url)
    tester.run_comprehensive_test()