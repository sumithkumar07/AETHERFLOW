#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING - GROQ AI FIXED - AUGUST 2025
Backend API Testing for Aether AI Platform
Tests all critical systems after Groq AI integration fixes
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class GroqAIBackendTester:
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
        """Make HTTP request with proper error handling and timing"""
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

    def test_groq_ai_integration(self):
        """Test GROQ AI INTEGRATION & MULTI-AGENT SYSTEM (HIGH PRIORITY)"""
        print("🤖 TESTING HIGH PRIORITY: GROQ AI INTEGRATION & MULTI-AGENT SYSTEM")
        print("=" * 70)
        
        # Test 1: AI System Status
        print("1. Testing AI System Status...")
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "operational":
                self.log_test("AI System Status", "PASS", 
                            f"AI system operational", response.status_code, response_time)
            else:
                self.log_test("AI System Status", "FAIL", 
                            f"AI system not operational. Status: {data.get('status')}", response.status_code, response_time)
        else:
            self.log_test("AI System Status", "FAIL", 
                        "AI status endpoint failed", response.status_code if response else None, response_time)
        
        # Test 2: All 4 Groq Models
        print("2. Testing All 4 Groq Models...")
        if response and response.status_code == 200:
            data = response.json()
            expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
            
            if "groq_integration" in data and "models" in data["groq_integration"]:
                models = data["groq_integration"]["models"]
                found_models = list(models.keys())
                
                all_models_ready = True
                for model in expected_models:
                    if model not in found_models:
                        all_models_ready = False
                        break
                    model_info = models.get(model, {})
                    if not (model_info.get("status") == "ready" and model_info.get("available") == True):
                        all_models_ready = False
                        break
                
                if all_models_ready:
                    self.log_test("All 4 Groq Models", "PASS", 
                                f"All models ready and available: {found_models}", response.status_code, response_time)
                else:
                    self.log_test("All 4 Groq Models", "FAIL", 
                                f"Some models not ready. Found: {found_models}", response.status_code, response_time)
            else:
                self.log_test("All 4 Groq Models", "FAIL", 
                            "Missing groq_integration.models data", response.status_code, response_time)
        
        # Test 3: Multi-Agent Chat
        print("3. Testing Multi-Agent Chat...")
        chat_data = {
            "message": "Build a scalable task management system with React and Node.js",
            "agent": "enhanced",
            "conversation_id": f"test_{int(time.time())}"
        }
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 50:
                if response_time < 2.0:
                    self.log_test("Multi-Agent Chat", "PASS", 
                                f"Enhanced chat working with {len(data['response'])} chars response", 
                                response.status_code, response_time)
                else:
                    self.log_test("Multi-Agent Chat", "FAIL", 
                                f"Response too slow: {response_time:.2f}s (target: <2s)", 
                                response.status_code, response_time)
            else:
                self.log_test("Multi-Agent Chat", "FAIL", 
                            f"Invalid response format or too short", response.status_code, response_time)
        else:
            self.log_test("Multi-Agent Chat", "FAIL", 
                        "Enhanced chat endpoint failed", response.status_code if response else None, response_time)
        
        # Test 4: Quick Response
        print("4. Testing Quick Response...")
        quick_data = {
            "message": "What is React?",
            "model": "llama-3.1-8b-instant"
        }
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", quick_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 20:
                if response_time < 2.0:
                    self.log_test("Quick Response", "PASS", 
                                f"Quick response working in {response_time:.2f}s", 
                                response.status_code, response_time)
                else:
                    self.log_test("Quick Response", "FAIL", 
                                f"Response too slow: {response_time:.2f}s (target: <2s)", 
                                response.status_code, response_time)
            else:
                self.log_test("Quick Response", "FAIL", 
                            "Invalid quick response format", response.status_code, response_time)
        else:
            self.log_test("Quick Response", "FAIL", 
                        "Quick response endpoint failed", response.status_code if response else None, response_time)
        
        # Test 5: Model Assignment
        print("5. Testing Model Assignment...")
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if isinstance(agent, dict)]
                
                if all(agent in found_agents for agent in expected_agents):
                    # Check specific model assignments
                    sage_agent = next((a for a in agents if a.get("name") == "Sage"), None)
                    if sage_agent and "llama-3.2-3b-preview" in str(sage_agent.get("model", "")):
                        self.log_test("Model Assignment", "PASS", 
                                    f"All 5 agents with correct model assignments", 
                                    response.status_code, response_time)
                    else:
                        self.log_test("Model Assignment", "FAIL", 
                                    f"Sage agent model assignment incorrect", 
                                    response.status_code, response_time)
                else:
                    self.log_test("Model Assignment", "FAIL", 
                                f"Missing agents. Found: {found_agents}", response.status_code, response_time)
            else:
                self.log_test("Model Assignment", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Model Assignment", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None, response_time)
        
        # Test 6: Response Quality
        print("6. Testing Response Quality...")
        quality_data = {
            "message": "Explain the benefits of microservices architecture for a SaaS platform",
            "agent": "Atlas",
            "conversation_id": f"quality_test_{int(time.time())}"
        }
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", quality_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data:
                response_text = data["response"]
                # Check for quality indicators
                quality_indicators = ["microservices", "scalability", "architecture", "benefits"]
                quality_score = sum(1 for indicator in quality_indicators if indicator.lower() in response_text.lower())
                
                if quality_score >= 3 and len(response_text) > 200:
                    self.log_test("Response Quality", "PASS", 
                                f"High quality response with {quality_score}/4 indicators, {len(response_text)} chars", 
                                response.status_code, response_time)
                else:
                    self.log_test("Response Quality", "FAIL", 
                                f"Low quality response: {quality_score}/4 indicators, {len(response_text)} chars", 
                                response.status_code, response_time)
            else:
                self.log_test("Response Quality", "FAIL", 
                            "No response content", response.status_code, response_time)
        else:
            self.log_test("Response Quality", "FAIL", 
                        "Quality test endpoint failed", response.status_code if response else None, response_time)

    def test_authentication_subscription(self):
        """Test AUTHENTICATION & SUBSCRIPTION SYSTEM"""
        print("🔐 TESTING: AUTHENTICATION & SUBSCRIPTION SYSTEM")
        print("=" * 60)
        
        # Test 1: JWT Token (already tested in authenticate, but verify)
        print("1. JWT Token Validation...")
        if self.auth_token:
            self.log_test("JWT Token Generation", "PASS", 
                        f"Valid JWT token generated and stored", None, None)
        else:
            self.log_test("JWT Token Generation", "FAIL", 
                        "No JWT token available", None, None)
        
        # Test 2: Trial System Status
        print("2. Testing Trial System Status...")
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial_active" in data and "days_remaining" in data:
                self.log_test("Trial System Status", "PASS", 
                            f"Trial active: {data.get('trial_active')}, Days remaining: {data.get('days_remaining')}", 
                            response.status_code, response_time)
            else:
                self.log_test("Trial System Status", "FAIL", 
                            "Missing trial status data", response.status_code, response_time)
        else:
            self.log_test("Trial System Status", "FAIL", 
                        "Trial status endpoint failed", response.status_code if response else None, response_time)
        
        # Test 3: Current Subscription
        print("3. Testing Current Subscription...")
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "subscription" in data:
                subscription = data["subscription"]
                if "plan" in subscription and "status" in subscription:
                    self.log_test("Current Subscription", "PASS", 
                                f"Plan: {subscription.get('plan')}, Status: {subscription.get('status')}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Current Subscription", "FAIL", 
                                "Missing subscription plan/status", response.status_code, response_time)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response.status_code, response_time)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response.status_code if response else None, response_time)
        
        # Test 4: Subscription Plans
        print("4. Testing Subscription Plans...")
        response, response_time = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data and len(data["plans"]) >= 3:
                plans = data["plans"]
                expected_plans = ["Basic", "Professional", "Enterprise"]
                found_plans = [plan.get("name") for plan in plans if isinstance(plan, dict)]
                
                if all(plan in found_plans for plan in expected_plans):
                    self.log_test("Subscription Plans", "PASS", 
                                f"All 3 plans available: {found_plans}", 
                                response.status_code, response_time)
                else:
                    self.log_test("Subscription Plans", "FAIL", 
                                f"Missing expected plans. Found: {found_plans}", 
                                response.status_code, response_time)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            f"Insufficient plans: {len(data.get('plans', []))}/3 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Subscription plans endpoint failed", response.status_code if response else None, response_time)

    def test_templates_projects(self):
        """Test TEMPLATES & PROJECTS SYSTEM"""
        print("📁 TESTING: TEMPLATES & PROJECTS SYSTEM")
        print("=" * 50)
        
        # Test 1: Templates API
        print("1. Testing Templates API...")
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 20:
                templates = data["templates"]
                self.log_test("Templates API", "PASS", 
                            f"Found {len(templates)} templates (20+ required)", 
                            response.status_code, response_time)
            else:
                self.log_test("Templates API", "FAIL", 
                            f"Insufficient templates: {len(data.get('templates', []))}/20 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Templates API", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None, response_time)
        
        # Test 2: Projects API
        print("2. Testing Projects API...")
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                projects = data["projects"]
                self.log_test("Projects API", "PASS", 
                            f"Found {len(projects)} projects", 
                            response.status_code, response_time)
            else:
                self.log_test("Projects API", "FAIL", 
                            "Missing projects data", response.status_code, response_time)
        else:
            self.log_test("Projects API", "FAIL", 
                        "Projects endpoint failed", response.status_code if response else None, response_time)
        
        # Test 3: Template Categories
        print("3. Testing Template Categories...")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                templates = data["templates"]
                categories = set()
                for template in templates:
                    if "category" in template:
                        categories.add(template["category"])
                
                if len(categories) >= 8:
                    self.log_test("Template Categories", "PASS", 
                                f"Found {len(categories)} categories", 
                                response.status_code, response_time)
                else:
                    self.log_test("Template Categories", "FAIL", 
                                f"Insufficient categories: {len(categories)}/8 required", 
                                response.status_code, response_time)
        
        # Test 4: Integration Hub
        print("4. Testing Integration Hub...")
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) >= 12:
                integrations = data["integrations"]
                self.log_test("Integration Hub", "PASS", 
                            f"Found {len(integrations)} integrations (12+ required)", 
                            response.status_code, response_time)
            else:
                self.log_test("Integration Hub", "FAIL", 
                            f"Insufficient integrations: {len(data.get('integrations', []))}/12 required", 
                            response.status_code, response_time)
        else:
            self.log_test("Integration Hub", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None, response_time)

    def test_performance_response_times(self):
        """Test PERFORMANCE & RESPONSE TIMES"""
        print("⚡ TESTING: PERFORMANCE & RESPONSE TIMES")
        print("=" * 50)
        
        # Test 1: Target Response Times (<2 seconds for AI)
        print("1. Testing AI Response Times...")
        test_messages = [
            "What is React?",
            "Explain microservices",
            "How to build a REST API?",
            "Database design best practices"
        ]
        
        fast_responses = 0
        total_time = 0
        
        for i, message in enumerate(test_messages, 1):
            print(f"   Testing message {i}/4...")
            chat_data = {
                "message": message,
                "model": "llama-3.1-8b-instant"
            }
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", chat_data)
            total_time += response_time
            
            if response and response.status_code == 200 and response_time < 2.0:
                fast_responses += 1
        
        average_time = total_time / len(test_messages)
        success_rate = (fast_responses / len(test_messages)) * 100
        
        if success_rate >= 80:
            self.log_test("AI Response Times", "PASS", 
                        f"{fast_responses}/{len(test_messages)} responses <2s, avg: {average_time:.2f}s", 
                        None, average_time)
        else:
            self.log_test("AI Response Times", "FAIL", 
                        f"Only {fast_responses}/{len(test_messages)} responses <2s, avg: {average_time:.2f}s", 
                        None, average_time)
        
        # Test 2: Enhanced AI v3 Performance
        print("2. Testing Enhanced AI v3 Performance...")
        enhanced_data = {
            "message": "Design a scalable e-commerce platform architecture",
            "agent": "enhanced",
            "conversation_id": f"perf_test_{int(time.time())}"
        }
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", enhanced_data)
        
        if response and response.status_code == 200:
            if response_time < 2.0:
                self.log_test("Enhanced AI v3 Performance", "PASS", 
                            f"Enhanced AI responding in {response_time:.2f}s", 
                            response.status_code, response_time)
            else:
                self.log_test("Enhanced AI v3 Performance", "FAIL", 
                            f"Enhanced AI too slow: {response_time:.2f}s (target: <2s)", 
                            response.status_code, response_time)
        else:
            self.log_test("Enhanced AI v3 Performance", "FAIL", 
                        "Enhanced AI endpoint failed", response.status_code if response else None, response_time)
        
        # Test 3: Concurrent Requests
        print("3. Testing Concurrent Requests...")
        import threading
        import queue
        
        def make_concurrent_request(q, message_id):
            data = {
                "message": f"Test concurrent request {message_id}",
                "model": "llama-3.1-8b-instant"
            }
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", data)
            q.put((response, response_time))
        
        # Test 3 concurrent requests
        q = queue.Queue()
        threads = []
        
        for i in range(3):
            thread = threading.Thread(target=make_concurrent_request, args=(q, i+1))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        successful_concurrent = 0
        total_concurrent_time = 0
        
        while not q.empty():
            response, response_time = q.get()
            total_concurrent_time += response_time
            if response and response.status_code == 200:
                successful_concurrent += 1
        
        if successful_concurrent >= 2:
            avg_concurrent_time = total_concurrent_time / 3
            self.log_test("Concurrent Requests", "PASS", 
                        f"{successful_concurrent}/3 concurrent requests successful, avg: {avg_concurrent_time:.2f}s", 
                        None, avg_concurrent_time)
        else:
            self.log_test("Concurrent Requests", "FAIL", 
                        f"Only {successful_concurrent}/3 concurrent requests successful", 
                        None, None)
        
        # Test 4: Database Performance
        print("4. Testing Database Performance...")
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "services" in data and data["services"].get("database") == "connected":
                if response_time < 1.0:
                    self.log_test("Database Performance", "PASS", 
                                f"Database connected, health check in {response_time:.2f}s", 
                                response.status_code, response_time)
                else:
                    self.log_test("Database Performance", "FAIL", 
                                f"Database slow: {response_time:.2f}s (target: <1s)", 
                                response.status_code, response_time)
            else:
                self.log_test("Database Performance", "FAIL", 
                            "Database not connected", response.status_code, response_time)
        else:
            self.log_test("Database Performance", "FAIL", 
                        "Health check endpoint failed", response.status_code if response else None, response_time)

    def test_competitive_features(self):
        """Test COMPETITIVE FEATURES VERIFICATION"""
        print("🏆 TESTING: COMPETITIVE FEATURES VERIFICATION")
        print("=" * 60)
        
        # Test 1: Enterprise Compliance
        print("1. Testing Enterprise Compliance...")
        response, response_time = self.make_request("GET", "/api/compliance/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if "compliance_status" in data or "soc2" in data or "gdpr" in data:
                self.log_test("Enterprise Compliance", "PASS", 
                            "Compliance dashboard accessible", response.status_code, response_time)
            else:
                self.log_test("Enterprise Compliance", "FAIL", 
                            "Missing compliance data", response.status_code, response_time)
        else:
            self.log_test("Enterprise Compliance", "FAIL", 
                        "Compliance endpoint not implemented", response.status_code if response else None, response_time)
        
        # Test 2: Mobile Experience
        print("2. Testing Mobile Experience...")
        response, response_time = self.make_request("GET", "/api/mobile/health")
        if response and response.status_code == 200:
            data = response.json()
            if "mobile_optimized" in data or "pwa_ready" in data or "status" in data:
                self.log_test("Mobile Experience", "PASS", 
                            "Mobile experience endpoints working", response.status_code, response_time)
            else:
                self.log_test("Mobile Experience", "FAIL", 
                            "Missing mobile optimization data", response.status_code, response_time)
        else:
            self.log_test("Mobile Experience", "FAIL", 
                        "Mobile endpoints not implemented", response.status_code if response else None, response_time)
        
        # Test 3: Advanced Analytics
        print("3. Testing Advanced Analytics...")
        response, response_time = self.make_request("GET", "/api/analytics/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if "overview" in data or "metrics" in data or "analytics" in data:
                self.log_test("Advanced Analytics", "PASS", 
                            "Analytics dashboard working", response.status_code, response_time)
            else:
                self.log_test("Advanced Analytics", "FAIL", 
                            "Missing analytics data", response.status_code, response_time)
        else:
            self.log_test("Advanced Analytics", "FAIL", 
                        "Analytics endpoints not implemented", response.status_code if response else None, response_time)
        
        # Test 4: Enhanced Onboarding
        print("4. Testing Enhanced Onboarding...")
        response, response_time = self.make_request("GET", "/api/onboarding/health")
        if response and response.status_code == 200:
            data = response.json()
            if "one_click_deploy" in data or "guided_setup" in data or "status" in data:
                self.log_test("Enhanced Onboarding", "PASS", 
                            "Onboarding endpoints working", response.status_code, response_time)
            else:
                self.log_test("Enhanced Onboarding", "FAIL", 
                            "Missing onboarding features", response.status_code, response_time)
        else:
            self.log_test("Enhanced Onboarding", "FAIL", 
                        "Onboarding endpoints not implemented", response.status_code if response else None, response_time)
        
        # Test 5: Workflow Builder
        print("5. Testing Workflow Builder...")
        response, response_time = self.make_request("GET", "/api/workflows/health")
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_engine" in data or "status" in data:
                self.log_test("Workflow Builder", "PASS", 
                            "Workflow builder endpoints working", response.status_code, response_time)
            else:
                self.log_test("Workflow Builder", "FAIL", 
                            "Missing workflow engine data", response.status_code, response_time)
        else:
            self.log_test("Workflow Builder", "FAIL", 
                        "Workflow endpoints not implemented", response.status_code if response else None, response_time)

    def run_comprehensive_test(self):
        """Run comprehensive backend testing"""
        print("🎯 AETHER AI PLATFORM - COMPREHENSIVE BACKEND TESTING")
        print("🚀 GROQ AI INTEGRATION VERIFICATION - AUGUST 2025")
        print("=" * 70)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with testing")
            return
        
        print("\n🤖 HIGH PRIORITY: GROQ AI INTEGRATION & MULTI-AGENT SYSTEM")
        print("=" * 70)
        self.test_groq_ai_integration()
        
        print("\n🔐 AUTHENTICATION & SUBSCRIPTION SYSTEM")
        print("=" * 60)
        self.test_authentication_subscription()
        
        print("\n📁 TEMPLATES & PROJECTS SYSTEM")
        print("=" * 50)
        self.test_templates_projects()
        
        print("\n⚡ PERFORMANCE & RESPONSE TIMES")
        print("=" * 50)
        self.test_performance_response_times()
        
        print("\n🏆 COMPETITIVE FEATURES VERIFICATION")
        print("=" * 60)
        self.test_competitive_features()
        
        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print()
        
        # System-by-system summary
        systems = [
            ("Groq AI Integration", "groq"),
            ("Authentication & Subscription", "auth"),
            ("Templates & Projects", "template"),
            ("Performance & Response Times", "performance"),
            ("Competitive Features", "competitive")
        ]
        
        print("🎯 SYSTEM STATUS:")
        print("-" * 40)
        
        for system_name, system_key in systems:
            system_tests = [r for r in self.test_results if system_key.lower() in r["test"].lower() or 
                           any(keyword in r["test"].lower() for keyword in system_name.lower().split())]
            if system_tests:
                system_passed = len([r for r in system_tests if r["status"] == "PASS"])
                system_total = len(system_tests)
                system_percentage = system_passed / system_total * 100 if system_total > 0 else 0
                
                if system_percentage >= 80:
                    status = "✅ WORKING"
                elif system_percentage >= 50:
                    status = "⚠️ PARTIAL"
                else:
                    status = "❌ FAILED"
                
                print(f"{system_name}: {status} ({system_passed}/{system_total} tests passed)")
        
        print()
        
        # Performance analysis
        response_times = [r["response_time"] for r in self.test_results if r["response_time"] is not None]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            fast_responses = len([t for t in response_times if t < 2.0])
            
            print("⚡ PERFORMANCE ANALYSIS:")
            print("-" * 30)
            print(f"Average Response Time: {avg_response_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(response_times)} ({fast_responses/len(response_times)*100:.1f}%)")
            print()
        
        # Final verdict
        if passed_tests / total_tests >= 0.8:
            verdict = "🎉 EXCELLENT - Production Ready"
        elif passed_tests / total_tests >= 0.6:
            verdict = "👍 GOOD - Minor Issues to Address"
        elif passed_tests / total_tests >= 0.4:
            verdict = "⚠️ NEEDS WORK - Major Issues Present"
        else:
            verdict = "❌ CRITICAL - Significant Development Required"
        
        print(f"FINAL VERDICT: {verdict}")
        print()
        
        # Critical issues
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL" and 
                           any(keyword in r["test"].lower() for keyword in ["groq", "ai", "auth", "performance"])]
        
        if critical_failures:
            print("🚨 CRITICAL ISSUES:")
            print("-" * 25)
            for result in critical_failures:
                print(f"❌ {result['test']}: {result['details']}")
            print()
        
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 60)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Groq AI Backend Testing")
    print(f"Backend URL: {backend_url}")
    
    tester = GroqAIBackendTester(backend_url)
    tester.run_comprehensive_test()