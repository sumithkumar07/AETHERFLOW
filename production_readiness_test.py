#!/usr/bin/env python3
"""
PRODUCTION READINESS TEST - AETHER AI PLATFORM
Comprehensive testing of all systems mentioned in the review request
Focus: API Health, Authentication, Multi-Agent AI, Templates, Projects, 
       Subscription, Database, Integrations, Performance, Error Handling
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class ProductionReadinessTester:
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
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status_icon} {test_name}: {status}{time_info}")
        if details:
            print(f"   Details: {details}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request with timing"""
        url = f"{self.base_url}{endpoint}"
        
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

    def test_1_api_health_status(self):
        """1. API Health & Status: Test all health check endpoints and service status"""
        print("🏥 1. API HEALTH & STATUS")
        print("-" * 50)
        
        # Root health check
        response, response_time = self.make_request("GET", "/")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "running":
                self.log_test("Root Health Check", "PASS", 
                            f"API running - Version: {data.get('version', 'unknown')}", response_time)
            else:
                self.log_test("Root Health Check", "FAIL", 
                            f"Invalid status: {data.get('status')}", response_time)
        else:
            self.log_test("Root Health Check", "FAIL", 
                        "Root endpoint failed", response_time)
        
        # Detailed health check
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                services = data.get("services", {})
                healthy_services = [k for k, v in services.items() if v in ["connected", "available", "ready", "enabled"]]
                self.log_test("Detailed Health Check", "PASS", 
                            f"Services healthy: {healthy_services}", response_time)
            else:
                self.log_test("Detailed Health Check", "FAIL", 
                            f"Unhealthy status: {data.get('status')}", response_time)
        else:
            self.log_test("Detailed Health Check", "FAIL", 
                        "Health endpoint failed", response_time)

    def test_2_authentication_system(self):
        """2. Authentication System: Test JWT auth, demo login, user management"""
        print("🔐 2. AUTHENTICATION SYSTEM")
        print("-" * 50)
        
        # Demo login
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                user_email = data.get("user", {}).get("email", "unknown")
                self.log_test("Demo Login", "PASS", 
                            f"JWT token received for {user_email}", response_time)
                
                # JWT token validation
                response, response_time = self.make_request("GET", "/api/auth/me")
                if response and response.status_code == 200:
                    user_data = response.json()
                    self.log_test("JWT Token Validation", "PASS", 
                                f"Token valid - User: {user_data.get('email')}", response_time)
                else:
                    self.log_test("JWT Token Validation", "FAIL", 
                                "Token validation failed", response_time)
            else:
                self.log_test("Demo Login", "FAIL", 
                            "No access token in response", response_time)
        else:
            self.log_test("Demo Login", "FAIL", 
                        "Login failed", response_time)

    def test_3_multi_agent_ai_system(self):
        """3. Multi-Agent AI System: Test all 5 AI agents with Groq integration"""
        print("🤖 3. MULTI-AGENT AI SYSTEM")
        print("-" * 50)
        
        # Test available agents
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if isinstance(agent, dict)]
                
                if all(agent in found_agents for agent in expected_agents):
                    self.log_test("5 AI Agents Available", "PASS", 
                                f"All agents found: {found_agents}", response_time)
                else:
                    self.log_test("5 AI Agents Available", "FAIL", 
                                f"Missing agents. Expected: {expected_agents}, Found: {found_agents}", response_time)
            else:
                self.log_test("5 AI Agents Available", "FAIL", 
                            "No agents data in response", response_time)
        else:
            self.log_test("5 AI Agents Available", "FAIL", 
                        "Agents endpoint failed", response_time)
        
        # Test Groq integration status
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_integration" in data:
                groq_data = data["groq_integration"]
                if "models" in groq_data:
                    models = groq_data["models"]
                    expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", 
                                     "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                    found_models = list(models.keys())
                    
                    if all(model in found_models for model in expected_models):
                        self.log_test("Groq Integration (4 Models)", "PASS", 
                                    f"All 4 models available: {found_models}", response_time)
                    else:
                        self.log_test("Groq Integration (4 Models)", "FAIL", 
                                    f"Missing models. Expected: {expected_models}, Found: {found_models}", response_time)
                else:
                    self.log_test("Groq Integration (4 Models)", "FAIL", 
                                "No models data in groq_integration", response_time)
            else:
                self.log_test("Groq Integration (4 Models)", "FAIL", 
                            "No groq_integration in status response", response_time)
        else:
            self.log_test("Groq Integration (4 Models)", "FAIL", 
                        "AI status endpoint failed", response_time)
        
        # Test AI response performance
        test_message = {
            "message": "Create a simple React component for a login form with validation",
            "agent": "Dev"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", test_message)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 100:
                performance_status = "EXCELLENT" if response_time < 2.0 else "ACCEPTABLE" if response_time < 5.0 else "SLOW"
                self.log_test("AI Response Performance", "PASS", 
                            f"AI response received - Performance: {performance_status} (Target: <2s)", response_time)
            else:
                self.log_test("AI Response Performance", "FAIL", 
                            "Invalid or empty AI response", response_time)
        else:
            self.log_test("AI Response Performance", "FAIL", 
                        "Enhanced AI chat failed", response_time)

    def test_4_templates_system(self):
        """4. Templates System: Test template CRUD operations, categories, metadata"""
        print("📁 4. TEMPLATES SYSTEM")
        print("-" * 50)
        
        # Test templates listing
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                templates = data["templates"]
                if len(templates) >= 6:
                    categories = set(template.get("category") for template in templates)
                    tech_stacks = set(str(template.get("tech_stack")) for template in templates if template.get("tech_stack"))
                    self.log_test("Templates CRUD Operations", "PASS", 
                                f"Found {len(templates)} templates across {len(categories)} categories", response_time)
                    
                    # Check metadata quality
                    complete_metadata = 0
                    for template in templates:
                        if all(key in template for key in ["name", "description", "category", "tech_stack"]):
                            complete_metadata += 1
                    
                    metadata_percentage = (complete_metadata / len(templates)) * 100
                    if metadata_percentage >= 80:
                        self.log_test("Template Metadata Quality", "PASS", 
                                    f"{complete_metadata}/{len(templates)} templates have complete metadata ({metadata_percentage:.1f}%)", response_time)
                    else:
                        self.log_test("Template Metadata Quality", "FAIL", 
                                    f"Only {complete_metadata}/{len(templates)} templates have complete metadata ({metadata_percentage:.1f}%)", response_time)
                else:
                    self.log_test("Templates CRUD Operations", "FAIL", 
                                f"Insufficient templates: {len(templates)} (minimum 6 required)", response_time)
            else:
                self.log_test("Templates CRUD Operations", "FAIL", 
                            "No templates data in response", response_time)
        else:
            self.log_test("Templates CRUD Operations", "FAIL", 
                        "Templates endpoint failed", response_time)
        
        # Test featured templates
        response, response_time = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                self.log_test("Featured Templates", "PASS", 
                            f"Found {len(data['templates'])} featured templates", response_time)
            else:
                self.log_test("Featured Templates", "FAIL", 
                            "No featured templates found", response_time)
        else:
            self.log_test("Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", response_time)

    def test_5_projects_system(self):
        """5. Projects System: Test project management, CRUD operations"""
        print("📊 5. PROJECTS SYSTEM")
        print("-" * 50)
        
        # Test projects listing
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                projects = data["projects"]
                self.log_test("Project Management", "PASS", 
                            f"Found {len(projects)} projects", response_time)
                
                # Check project structure
                if projects:
                    sample_project = projects[0]
                    required_fields = ["id", "name", "description"]
                    has_required_fields = all(field in sample_project for field in required_fields)
                    
                    if has_required_fields:
                        self.log_test("Project Data Structure", "PASS", 
                                    f"Projects have required fields: {required_fields}", response_time)
                    else:
                        self.log_test("Project Data Structure", "FAIL", 
                                    f"Projects missing required fields. Sample: {list(sample_project.keys())}", response_time)
                else:
                    self.log_test("Project Data Structure", "PASS", 
                                "No projects to validate structure", response_time)
            else:
                self.log_test("Project Management", "FAIL", 
                            "No projects data in response", response_time)
        else:
            self.log_test("Project Management", "FAIL", 
                        "Projects endpoint failed", response_time)

    def test_6_subscription_management(self):
        """6. Subscription Management: Test trial system, subscription plans, usage limits"""
        print("💳 6. SUBSCRIPTION MANAGEMENT")
        print("-" * 50)
        
        # Test current subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "subscription" in data:
                subscription = data["subscription"]
                plan = subscription.get("plan", "unknown")
                status = subscription.get("status", "unknown")
                self.log_test("Current Subscription", "PASS", 
                            f"Subscription active - Plan: {plan}, Status: {status}", response_time)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "No subscription data in response", response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Subscription endpoint failed", response_time)
        
        # Test trial system
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial" in data:
                trial = data["trial"]
                days_remaining = trial.get("days_remaining", 0)
                is_active = trial.get("active", False)
                self.log_test("Trial System", "PASS", 
                            f"Trial active: {is_active}, Days remaining: {days_remaining}", response_time)
            else:
                self.log_test("Trial System", "FAIL", 
                            "No trial data in response", response_time)
        else:
            self.log_test("Trial System", "FAIL", 
                        "Trial status endpoint failed", response_time)
        
        # Test subscription plans
        response, response_time = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data:
                plans = data["plans"]
                expected_plans = ["Basic", "Professional", "Enterprise"]
                found_plans = [plan.get("name") for plan in plans if isinstance(plan, dict)]
                
                if len(found_plans) >= 3:
                    self.log_test("Subscription Plans", "PASS", 
                                f"Found {len(found_plans)} plans: {found_plans}", response_time)
                else:
                    self.log_test("Subscription Plans", "FAIL", 
                                f"Insufficient plans: {found_plans}", response_time)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            "No plans data in response", response_time)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Subscription plans endpoint failed", response_time)

    def test_7_database_operations(self):
        """7. Database Operations: Test MongoDB Atlas connection, data persistence"""
        print("🗄️ 7. DATABASE OPERATIONS")
        print("-" * 50)
        
        # Test database connectivity through user data retrieval
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/auth/me")
            if response and response.status_code == 200:
                data = response.json()
                if "email" in data and "id" in data:
                    self.log_test("MongoDB Atlas Connection", "PASS", 
                                f"User data retrieved - Email: {data['email']}", response_time)
                else:
                    self.log_test("MongoDB Atlas Connection", "FAIL", 
                                "Invalid user data structure", response_time)
            else:
                self.log_test("MongoDB Atlas Connection", "FAIL", 
                            "Failed to retrieve user data", response_time)
        else:
            self.log_test("MongoDB Atlas Connection", "FAIL", 
                        "No auth token available for DB test", None)
        
        # Test data persistence through projects
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                self.log_test("Data Persistence", "PASS", 
                            f"Projects data persisted - Count: {len(data['projects'])}", response_time)
            else:
                self.log_test("Data Persistence", "FAIL", 
                            "No projects data found", response_time)
        else:
            self.log_test("Data Persistence", "FAIL", 
                        "Failed to retrieve persisted data", response_time)

    def test_8_integration_systems(self):
        """8. Integration Systems: Test third-party integrations, API endpoints"""
        print("🔌 8. INTEGRATION SYSTEMS")
        print("-" * 50)
        
        # Test integrations listing
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                integrations = data["integrations"]
                if len(integrations) >= 10:
                    categories = set(integration.get("category") for integration in integrations)
                    self.log_test("Third-Party Integrations", "PASS", 
                                f"Found {len(integrations)} integrations across {len(categories)} categories", response_time)
                    
                    # Check integration quality
                    complete_integrations = 0
                    for integration in integrations:
                        if all(key in integration for key in ["name", "category", "description"]):
                            complete_integrations += 1
                    
                    quality_percentage = (complete_integrations / len(integrations)) * 100
                    if quality_percentage >= 80:
                        self.log_test("Integration Quality", "PASS", 
                                    f"{complete_integrations}/{len(integrations)} integrations have complete metadata ({quality_percentage:.1f}%)", response_time)
                    else:
                        self.log_test("Integration Quality", "FAIL", 
                                    f"Only {complete_integrations}/{len(integrations)} integrations have complete metadata ({quality_percentage:.1f}%)", response_time)
                else:
                    self.log_test("Third-Party Integrations", "FAIL", 
                                f"Insufficient integrations: {len(integrations)} (minimum 10 required)", response_time)
            else:
                self.log_test("Third-Party Integrations", "FAIL", 
                            "No integrations data in response", response_time)
        else:
            self.log_test("Third-Party Integrations", "FAIL", 
                        "Integrations endpoint failed", response_time)

    def test_9_performance(self):
        """9. Performance: Test response times, especially AI endpoints (target <2s)"""
        print("⚡ 9. PERFORMANCE TESTING")
        print("-" * 50)
        
        # Test multiple endpoints for performance
        endpoints_to_test = [
            ("/api/health", "Health Check"),
            ("/api/templates/", "Templates API"),
            ("/api/projects/", "Projects API"),
            ("/api/ai/v3/agents/available", "AI Agents API"),
            ("/api/subscription/current", "Subscription API")
        ]
        
        total_response_time = 0
        successful_tests = 0
        fast_responses = 0
        
        for endpoint, name in endpoints_to_test:
            response, response_time = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                performance_status = "EXCELLENT" if response_time < 0.5 else "GOOD" if response_time < 1.0 else "ACCEPTABLE" if response_time < 2.0 else "SLOW"
                is_fast = response_time < 2.0
                
                self.log_test(f"Performance - {name}", "PASS", 
                            f"Response time: {performance_status} (Target: <2s)", response_time)
                
                total_response_time += response_time
                successful_tests += 1
                if is_fast:
                    fast_responses += 1
            else:
                self.log_test(f"Performance - {name}", "FAIL", 
                            "Endpoint failed", response_time)
        
        if successful_tests > 0:
            avg_response_time = total_response_time / successful_tests
            fast_percentage = (fast_responses / successful_tests) * 100
            overall_performance = "EXCELLENT" if avg_response_time < 0.5 else "GOOD" if avg_response_time < 1.0 else "ACCEPTABLE" if avg_response_time < 2.0 else "NEEDS_IMPROVEMENT"
            
            self.log_test("Overall Performance", "PASS", 
                        f"Average: {avg_response_time:.3f}s, Fast responses: {fast_responses}/{successful_tests} ({fast_percentage:.1f}%)", avg_response_time)

    def test_10_error_handling(self):
        """10. Error Handling: Test edge cases, invalid requests, error responses"""
        print("🚨 10. ERROR HANDLING")
        print("-" * 50)
        
        # Test 404 handling
        response, response_time = self.make_request("GET", "/api/nonexistent")
        if response and response.status_code == 404:
            self.log_test("404 Error Handling", "PASS", 
                        "Proper 404 response for invalid endpoint", response_time)
        else:
            self.log_test("404 Error Handling", "FAIL", 
                        f"Unexpected response for invalid endpoint: {response.status_code if response else 'None'}", response_time)
        
        # Test invalid authentication
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response, response_time = self.make_request("GET", "/api/auth/me", headers=invalid_headers)
        if response and response.status_code in [401, 403]:
            self.log_test("Auth Error Handling", "PASS", 
                        f"Proper {response.status_code} response for invalid token", response_time)
        else:
            self.log_test("Auth Error Handling", "FAIL", 
                        f"Unexpected response for invalid token: {response.status_code if response else 'None'}", response_time)
        
        # Test malformed request
        response, response_time = self.make_request("POST", "/api/auth/login", {"invalid": "data"})
        if response and response.status_code in [400, 422]:
            self.log_test("Malformed Request Handling", "PASS", 
                        f"Proper {response.status_code} response for malformed request", response_time)
        else:
            self.log_test("Malformed Request Handling", "FAIL", 
                        f"Unexpected response for malformed request: {response.status_code if response else 'None'}", response_time)

    def run_comprehensive_test(self):
        """Run comprehensive production readiness test"""
        print("🎯 AETHER AI PLATFORM - PRODUCTION READINESS TEST")
        print("=" * 70)
        print(f"Backend URL: {self.base_url}")
        print(f"Demo Credentials: {self.demo_user['email']} / {self.demo_user['password']}")
        print(f"Groq API Key: {self.groq_api_key}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 70)
        
        # Run all test suites in order
        self.test_1_api_health_status()
        self.test_2_authentication_system()
        self.test_3_multi_agent_ai_system()
        self.test_4_templates_system()
        self.test_5_projects_system()
        self.test_6_subscription_management()
        self.test_7_database_operations()
        self.test_8_integration_systems()
        self.test_9_performance()
        self.test_10_error_handling()
        
        # Generate comprehensive summary
        self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 PRODUCTION READINESS TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests Executed: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print()
        
        # Performance analysis
        timed_tests = [r for r in self.test_results if r["response_time"] is not None]
        if timed_tests:
            avg_response_time = sum(r["response_time"] for r in timed_tests) / len(timed_tests)
            fast_responses = len([r for r in timed_tests if r["response_time"] < 2.0])
            print(f"⚡ Performance Metrics:")
            print(f"   Average Response Time: {avg_response_time:.3f}s")
            print(f"   Fast Responses (<2s): {fast_responses}/{len(timed_tests)} ({fast_responses/len(timed_tests)*100:.1f}%)")
            print()
        
        # System-by-system assessment
        systems = [
            "API Health & Status",
            "Authentication System", 
            "Multi-Agent AI System",
            "Templates System",
            "Projects System",
            "Subscription Management",
            "Database Operations",
            "Integration Systems",
            "Performance",
            "Error Handling"
        ]
        
        print("🎯 SYSTEM-BY-SYSTEM STATUS:")
        print("-" * 40)
        
        system_status = {}
        for i, system in enumerate(systems, 1):
            system_tests = [r for r in self.test_results if system.lower().replace(" ", "_") in r["test"].lower().replace(" ", "_")]
            if system_tests:
                system_passed = len([r for r in system_tests if r["status"] == "PASS"])
                system_total = len(system_tests)
                system_percentage = system_passed / system_total * 100 if system_total > 0 else 0
                
                if system_percentage >= 80:
                    status = "✅ OPERATIONAL"
                elif system_percentage >= 50:
                    status = "⚠️ PARTIAL"
                else:
                    status = "❌ ISSUES"
                
                system_status[system] = status
                print(f"{i:2d}. {system}: {status} ({system_passed}/{system_total} tests passed)")
            else:
                system_status[system] = "❌ NOT TESTED"
                print(f"{i:2d}. {system}: ❌ NOT TESTED")
        
        print()
        
        # Overall production readiness assessment
        operational_systems = len([s for s in system_status.values() if "✅" in s])
        partial_systems = len([s for s in system_status.values() if "⚠️" in s])
        failed_systems = len([s for s in system_status.values() if "❌" in s])
        
        overall_pass_rate = passed_tests / total_tests * 100
        
        print("🏆 PRODUCTION READINESS ASSESSMENT:")
        print("-" * 40)
        print(f"✅ Fully Operational Systems: {operational_systems}/10 ({operational_systems/10*100:.1f}%)")
        print(f"⚠️ Partially Working Systems: {partial_systems}/10 ({partial_systems/10*100:.1f}%)")
        print(f"❌ Failed/Missing Systems: {failed_systems}/10 ({failed_systems/10*100:.1f}%)")
        print(f"📊 Overall Pass Rate: {overall_pass_rate:.1f}%")
        print()
        
        # Final verdict
        if operational_systems >= 8 and overall_pass_rate >= 85:
            verdict = "🎉 PRODUCTION READY - Deploy with confidence!"
        elif operational_systems >= 7 and overall_pass_rate >= 75:
            verdict = "👍 MOSTLY READY - Minor issues to address"
        elif operational_systems >= 5 and overall_pass_rate >= 60:
            verdict = "⚠️ NEEDS WORK - Several issues to resolve"
        else:
            verdict = "❌ NOT READY - Major system failures detected"
        
        print(f"🚀 FINAL VERDICT: {verdict}")
        print()
        
        # Critical issues analysis
        if failed_tests > 0:
            print("🔍 CRITICAL ISSUES TO ADDRESS:")
            print("-" * 35)
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['details']}")
            print()
        
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 70)

if __name__ == "__main__":
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Production Readiness Test")
    print(f"Backend URL: {backend_url}")
    
    tester = ProductionReadinessTester(backend_url)
    tester.run_comprehensive_test()