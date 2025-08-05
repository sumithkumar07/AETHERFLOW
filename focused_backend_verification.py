#!/usr/bin/env python3
"""
Focused Backend Verification Test - August 5, 2025
Verifies critical systems mentioned in the comprehensive testing request
"""

import requests
import json
import time
import sys
from datetime import datetime

class FocusedBackendVerifier:
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

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple:
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

    def test_authentication_system(self):
        """Test authentication with demo user"""
        print("🔐 Testing Authentication System...")
        
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                user_email = data.get('user', {}).get('email', 'unknown')
                self.log_test("Demo User Authentication", "PASS", 
                            f"Successfully authenticated: {user_email}", response_time)
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response_time)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Login failed", response_time)

    def test_multi_agent_ai_system(self):
        """Test the 5-agent AI system with enhanced endpoints"""
        print("🤖 Testing Multi-Agent AI System...")
        
        if not self.auth_token:
            self.log_test("Multi-Agent AI System", "SKIP", "No authentication token")
            return
        
        # Test Enhanced AI v3 agents endpoint
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agent_names = [agent.get("name", "unknown") for agent in data["agents"]]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [name for name in expected_agents if name in agent_names]
                
                if len(found_agents) >= 5:
                    self.log_test("Multi-Agent System - Available Agents", "PASS", 
                                f"Found {len(data['agents'])} agents: {', '.join(agent_names[:5])}", response_time)
                else:
                    self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                                f"Missing expected agents. Found: {found_agents}", response_time)
            else:
                self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                            f"Invalid agents response: {data}", response_time)
        else:
            self.log_test("Multi-Agent System - Available Agents", "FAIL", 
                        "Agents endpoint failed", response_time)
        
        # Test Enhanced AI v3 chat endpoint with performance measurement
        chat_request = {
            "message": "Build a simple task management app with React and Node.js",
            "enable_multi_agent": True,
            "conversation_id": "test_conv_001"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and "agent" in data:
                agent_used = data.get("agent", "unknown")
                response_length = len(data.get("response", ""))
                
                # Check if response time meets <2 second target
                performance_status = "EXCELLENT" if response_time < 2.0 else "NEEDS_OPTIMIZATION"
                
                self.log_test("Enhanced AI v3 Chat Performance", "PASS", 
                            f"Agent: {agent_used}, Response: {response_length} chars, Performance: {performance_status}", response_time)
            else:
                self.log_test("Enhanced AI v3 Chat Performance", "FAIL", 
                            "Missing response or agent data", response_time)
        else:
            self.log_test("Enhanced AI v3 Chat Performance", "FAIL", 
                        "Enhanced chat endpoint failed", response_time)

    def test_groq_integration(self):
        """Test Groq API integration and models"""
        print("⚡ Testing Groq Integration...")
        
        # Test AI models endpoint
        response, response_time = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data and len(data["models"]) >= 4:
                model_names = [model.get("name", "unknown") for model in data["models"]]
                groq_models = [name for name in model_names if "llama" in name.lower() or "mixtral" in name.lower()]
                
                if len(groq_models) >= 4:
                    self.log_test("Groq Models Integration", "PASS", 
                                f"Found {len(groq_models)} Groq models: {', '.join(groq_models[:4])}", response_time)
                else:
                    self.log_test("Groq Models Integration", "FAIL", 
                                f"Insufficient Groq models. Found: {groq_models}", response_time)
            else:
                self.log_test("Groq Models Integration", "FAIL", 
                            f"Invalid models response: {data}", response_time)
        else:
            self.log_test("Groq Models Integration", "FAIL", 
                        "Models endpoint failed", response_time)

    def test_subscription_trial_system(self):
        """Test 7-day trial and subscription system"""
        print("💳 Testing Subscription & Trial System...")
        
        if not self.auth_token:
            self.log_test("Subscription System", "SKIP", "No authentication token")
            return
        
        # Test trial status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "has_trial" in data and "trial_days_remaining" in data:
                days_remaining = data.get("trial_days_remaining", 0)
                trial_active = data.get("is_trial_active", False)
                self.log_test("Trial System Status", "PASS", 
                            f"Trial active: {trial_active}, Days remaining: {days_remaining}", response_time)
            else:
                self.log_test("Trial System Status", "FAIL", 
                            "Missing trial status data", response_time)
        else:
            self.log_test("Trial System Status", "FAIL", 
                        "Trial status endpoint failed", response_time)
        
        # Test current subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "current_usage" in data:
                plan = data.get("plan", "unknown")
                usage = data.get("current_usage", {})
                tokens_used = usage.get("tokens", 0)
                self.log_test("Current Subscription", "PASS", 
                            f"Plan: {plan}, Tokens used: {tokens_used}", response_time)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response_time)

    def test_templates_projects_system(self):
        """Test templates and projects endpoints"""
        print("📁 Testing Templates & Projects System...")
        
        # Test templates (public endpoint)
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 6:
                template_count = len(data["templates"])
                categories = set(template.get("category", "unknown") for template in data["templates"])
                self.log_test("Templates System", "PASS", 
                            f"Found {template_count} templates in {len(categories)} categories", response_time)
            else:
                self.log_test("Templates System", "FAIL", 
                            f"Insufficient templates. Found: {len(data.get('templates', []))}", response_time)
        else:
            self.log_test("Templates System", "FAIL", 
                        "Templates endpoint failed", response_time)
        
        # Test projects (requires auth)
        if self.auth_token:
            response, response_time = self.make_request("GET", "/api/projects/")
            if response and response.status_code == 200:
                data = response.json()
                if "projects" in data:
                    project_count = len(data["projects"])
                    self.log_test("Projects System", "PASS", 
                                f"Found {project_count} projects", response_time)
                else:
                    self.log_test("Projects System", "FAIL", 
                                "Missing projects data", response_time)
            else:
                self.log_test("Projects System", "FAIL", 
                            "Projects endpoint failed", response_time)

    def test_health_and_database(self):
        """Test system health and database connectivity"""
        print("🏥 Testing System Health & Database...")
        
        # Test health endpoint
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "services" in data and "status" in data:
                services = data["services"]
                healthy_services = [k for k, v in services.items() if v in ["connected", "available", "ready", "enabled"]]
                self.log_test("System Health Check", "PASS", 
                            f"Status: {data['status']}, Healthy services: {len(healthy_services)}/{len(services)}", response_time)
            else:
                self.log_test("System Health Check", "FAIL", 
                            "Missing health data", response_time)
        else:
            self.log_test("System Health Check", "FAIL", 
                        "Health endpoint failed", response_time)

    def test_performance_targets(self):
        """Test if system meets <2 second response target"""
        print("⚡ Testing Performance Targets...")
        
        if not self.auth_token:
            self.log_test("Performance Testing", "SKIP", "No authentication token")
            return
        
        # Test multiple endpoints for performance
        performance_tests = [
            ("GET", "/api/ai/v3/agents/available", None, "Agents List"),
            ("POST", "/api/ai/v3/chat/quick-response", {"message": "Hello"}, "Quick Response"),
            ("GET", "/api/templates/", None, "Templates List"),
            ("GET", "/api/subscription/current", None, "Subscription Status")
        ]
        
        fast_responses = 0
        total_tests = len(performance_tests)
        
        for method, endpoint, data, test_name in performance_tests:
            response, response_time = self.make_request(method, endpoint, data)
            if response and response.status_code == 200:
                if response_time < 2.0:
                    fast_responses += 1
                    self.log_test(f"Performance - {test_name}", "PASS", 
                                f"Response time: {response_time:.2f}s (Target: <2s)", response_time)
                else:
                    self.log_test(f"Performance - {test_name}", "FAIL", 
                                f"Response time: {response_time:.2f}s (Target: <2s)", response_time)
            else:
                self.log_test(f"Performance - {test_name}", "FAIL", 
                            "Endpoint failed", response_time)
        
        performance_percentage = (fast_responses / total_tests) * 100
        if performance_percentage >= 80:
            self.log_test("Overall Performance Target", "PASS", 
                        f"{fast_responses}/{total_tests} endpoints meet <2s target ({performance_percentage:.1f}%)")
        else:
            self.log_test("Overall Performance Target", "FAIL", 
                        f"Only {fast_responses}/{total_tests} endpoints meet <2s target ({performance_percentage:.1f}%)")

    def run_focused_verification(self):
        """Run all focused verification tests"""
        print("🚀 FOCUSED BACKEND VERIFICATION - AUGUST 5, 2025")
        print("=" * 60)
        print()
        
        start_time = time.time()
        
        # Run all tests
        self.test_authentication_system()
        self.test_multi_agent_ai_system()
        self.test_groq_integration()
        self.test_subscription_trial_system()
        self.test_templates_projects_system()
        self.test_health_and_database()
        self.test_performance_targets()
        
        # Generate summary
        total_time = time.time() - start_time
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        total = len(self.test_results)
        
        print("=" * 60)
        print("📊 VERIFICATION SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed} ({(passed/total)*100:.1f}%)")
        print(f"❌ Failed: {failed} ({(failed/total)*100:.1f}%)")
        print(f"⚠️ Skipped: {skipped} ({(skipped/total)*100:.1f}%)")
        print(f"⏱️ Total Time: {total_time:.2f} seconds")
        print()
        
        # Performance analysis
        response_times = [r["response_time"] for r in self.test_results if r["response_time"]]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            fast_responses = len([t for t in response_times if t < 2.0])
            print(f"📈 PERFORMANCE METRICS:")
            print(f"Average Response Time: {avg_response_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(response_times)} ({(fast_responses/len(response_times))*100:.1f}%)")
        
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "success_rate": (passed/total)*100 if total > 0 else 0,
            "total_time": total_time,
            "test_results": self.test_results
        }

if __name__ == "__main__":
    verifier = FocusedBackendVerifier()
    results = verifier.run_focused_verification()
    
    # Exit with appropriate code
    if results["failed"] == 0:
        print("🎉 ALL CRITICAL SYSTEMS VERIFIED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print(f"⚠️ {results['failed']} ISSUES FOUND - REVIEW REQUIRED")
        sys.exit(1)