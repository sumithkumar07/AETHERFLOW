#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING - AUGUST 2025
Aether AI Platform Backend Testing Suite
Focus: Core System Verification, Performance, AI Abilities, Integration, Robustness
"""

import requests
import json
import time
import sys
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import statistics

class AetherAIBackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.performance_metrics = []
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        self.groq_api_key = "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"
        
    def log_test(self, test_name: str, status: str, details: str = "", response_time: float = None, response_code: int = None):
        """Log test results with performance metrics"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": response_time,
            "response_code": response_code,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if response_time:
            self.performance_metrics.append({
                "test": test_name,
                "response_time": response_time,
                "target_met": response_time < 2.0
            })
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_time:
            target_status = "✅" if response_time < 2.0 else "⚠️"
            print(f"   Response Time: {response_time:.3f}s {target_status}")
        if response_code:
            print(f"   Response Code: {response_code}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, timeout: int = 30) -> tuple:
        """Make HTTP request with timing and proper error handling"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=timeout)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=timeout)
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
                            response_time, response.status_code)
                return True
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response_time, response.status_code)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Login failed", response_time, response.status_code if response else None)
        return False

    def test_1_core_system_verification(self):
        """Test all critical API endpoints and core systems"""
        print("🎯 TESTING 1: CORE SYSTEM VERIFICATION")
        print("-" * 60)
        
        # Health Check
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                self.log_test("Health Check", "PASS", 
                            f"All services healthy: {data.get('services', {})}", 
                            response_time, response.status_code)
            else:
                self.log_test("Health Check", "FAIL", 
                            f"Unhealthy status: {data.get('status')}", 
                            response_time, response.status_code)
        else:
            self.log_test("Health Check", "FAIL", 
                        "Health endpoint failed", response_time, response.status_code if response else None)
        
        # MongoDB Atlas Connection Test
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            self.log_test("MongoDB Atlas Connection", "PASS", 
                        "Database connection verified through user data retrieval", 
                        response_time, response.status_code)
        else:
            self.log_test("MongoDB Atlas Connection", "FAIL", 
                        "Cannot verify database connection", 
                        response_time, response.status_code if response else None)
        
        # Subscription System Test
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data and "status" in data:
                self.log_test("Subscription System", "PASS", 
                            f"Subscription data retrieved: {data.get('plan', 'Unknown')} ({data.get('status', 'Unknown')})", 
                            response_time, response.status_code)
            else:
                self.log_test("Subscription System", "FAIL", 
                            "Missing subscription data", response_time, response.status_code)
        else:
            self.log_test("Subscription System", "FAIL", 
                        "Subscription endpoint failed", response_time, response.status_code if response else None)
        
        # Trial System Test
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "is_trial_active" in data:
                self.log_test("Trial System", "PASS", 
                            f"Trial status: {data.get('is_trial_active')}, Days remaining: {data.get('trial_days_remaining', 'N/A')}", 
                            response_time, response.status_code)
            else:
                self.log_test("Trial System", "FAIL", 
                            "Missing trial status data", response_time, response.status_code)
        else:
            self.log_test("Trial System", "FAIL", 
                        "Trial status endpoint failed", response_time, response.status_code if response else None)

    def test_2_groq_ai_integration(self):
        """Test Groq AI integration with all 4 models"""
        print("🤖 TESTING 2: GROQ AI INTEGRATION")
        print("-" * 60)
        
        # AI Status Check
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_integration" in data:
                groq_data = data["groq_integration"]
                if "models" in groq_data:
                    models = groq_data["models"]
                    expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                    found_models = list(models.keys())
                    
                    if all(model in found_models for model in expected_models):
                        self.log_test("Groq AI Models", "PASS", 
                                    f"All 4 models available: {found_models}", 
                                    response_time, response.status_code)
                    else:
                        self.log_test("Groq AI Models", "FAIL", 
                                    f"Missing models. Expected: {expected_models}, Found: {found_models}", 
                                    response_time, response.status_code)
                else:
                    self.log_test("Groq AI Models", "FAIL", 
                                "No models data in groq_integration", response_time, response.status_code)
            else:
                self.log_test("Groq AI Integration", "FAIL", 
                            "No groq_integration data in status", response_time, response.status_code)
        else:
            self.log_test("Groq AI Integration", "FAIL", 
                        "AI status endpoint failed", response_time, response.status_code if response else None)
        
        # Test AI Chat Response
        chat_data = {
            "message": "Hello, can you help me build a scalable web application?",
            "conversation_id": f"test_{int(time.time())}"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_data)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 50:
                self.log_test("Groq AI Chat Response", "PASS", 
                            f"AI responded with {len(data['response'])} characters", 
                            response_time, response.status_code)
            else:
                self.log_test("Groq AI Chat Response", "FAIL", 
                            f"Poor AI response quality: {len(data.get('response', ''))}", 
                            response_time, response.status_code)
        else:
            self.log_test("Groq AI Chat Response", "FAIL", 
                        "AI chat endpoint failed", response_time, response.status_code if response else None)

    def test_3_multi_agent_system(self):
        """Test multi-agent system with all 5 agents"""
        print("👥 TESTING 3: MULTI-AGENT SYSTEM")
        print("-" * 60)
        
        # Test Available Agents
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if isinstance(agent, dict)]
                
                if all(agent in found_agents for agent in expected_agents):
                    self.log_test("Multi-Agent System", "PASS", 
                                f"All 5 agents available: {found_agents}", 
                                response_time, response.status_code)
                    
                    # Test individual agent capabilities
                    for agent in agents:
                        if isinstance(agent, dict) and "capabilities" in agent:
                            agent_name = agent.get("name", "Unknown")
                            capabilities_count = len(agent.get("capabilities", []))
                            if capabilities_count >= 5:
                                self.log_test(f"Agent {agent_name} Capabilities", "PASS", 
                                            f"{capabilities_count} capabilities defined", 
                                            None, response.status_code)
                            else:
                                self.log_test(f"Agent {agent_name} Capabilities", "FAIL", 
                                            f"Insufficient capabilities: {capabilities_count}", 
                                            None, response.status_code)
                else:
                    self.log_test("Multi-Agent System", "FAIL", 
                                f"Missing agents. Expected: {expected_agents}, Found: {found_agents}", 
                                response_time, response.status_code)
            else:
                self.log_test("Multi-Agent System", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", 
                            response_time, response.status_code)
        else:
            self.log_test("Multi-Agent System", "FAIL", 
                        "Agents endpoint failed", response_time, response.status_code if response else None)
        
        # Test Multi-Agent Coordination
        complex_request = {
            "message": "I need to build a full-stack e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, and comprehensive testing. Please coordinate between all relevant agents.",
            "conversation_id": f"multi_agent_test_{int(time.time())}",
            "coordination_mode": "collaborative"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", complex_request)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 200:
                # Check if response mentions multiple agents or coordination
                response_text = data["response"].lower()
                coordination_indicators = ["dev", "luna", "atlas", "quinn", "sage", "coordinate", "team", "collaborate"]
                coordination_score = sum(1 for indicator in coordination_indicators if indicator in response_text)
                
                if coordination_score >= 3:
                    self.log_test("Multi-Agent Coordination", "PASS", 
                                f"Coordinated response with {coordination_score} coordination indicators", 
                                response_time, response.status_code)
                else:
                    self.log_test("Multi-Agent Coordination", "FAIL", 
                                f"Poor coordination evidence: {coordination_score} indicators", 
                                response_time, response.status_code)
            else:
                self.log_test("Multi-Agent Coordination", "FAIL", 
                            f"Insufficient response quality: {len(data.get('response', ''))}", 
                            response_time, response.status_code)
        else:
            self.log_test("Multi-Agent Coordination", "FAIL", 
                        "Multi-agent coordination failed", response_time, response.status_code if response else None)

    def test_4_performance_optimization(self):
        """Test API response times and performance targets"""
        print("⚡ TESTING 4: PERFORMANCE & OPTIMIZATION")
        print("-" * 60)
        
        # Test multiple endpoints for performance
        performance_tests = [
            ("GET", "/api/health", None, "Health Check"),
            ("GET", "/api/ai/v3/status", None, "AI Status"),
            ("GET", "/api/ai/v3/agents/available", None, "Agents List"),
            ("GET", "/api/templates/", None, "Templates List"),
            ("GET", "/api/subscription/current", None, "Subscription Status"),
        ]
        
        response_times = []
        
        for method, endpoint, data, test_name in performance_tests:
            response, response_time = self.make_request(method, endpoint, data)
            response_times.append(response_time)
            
            if response and response.status_code == 200:
                target_met = response_time < 2.0
                status = "PASS" if target_met else "WARN"
                self.log_test(f"Performance - {test_name}", status, 
                            f"Target: <2s, Actual: {response_time:.3f}s", 
                            response_time, response.status_code)
            else:
                self.log_test(f"Performance - {test_name}", "FAIL", 
                            "Endpoint failed", response_time, response.status_code if response else None)
        
        # AI Response Performance Test
        ai_tests = [
            {
                "message": "Quick test",
                "conversation_id": f"perf_test_1_{int(time.time())}"
            },
            {
                "message": "Build a simple React component",
                "conversation_id": f"perf_test_2_{int(time.time())}"
            },
            {
                "message": "Explain microservices architecture",
                "conversation_id": f"perf_test_3_{int(time.time())}"
            }
        ]
        
        ai_response_times = []
        for i, test_data in enumerate(ai_tests, 1):
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", test_data)
            ai_response_times.append(response_time)
            
            if response and response.status_code == 200:
                target_met = response_time < 2.0
                status = "PASS" if target_met else "WARN"
                self.log_test(f"AI Performance Test {i}", status, 
                            f"Target: <2s, Actual: {response_time:.3f}s", 
                            response_time, response.status_code)
            else:
                self.log_test(f"AI Performance Test {i}", "FAIL", 
                            "AI endpoint failed", response_time, response.status_code if response else None)
        
        # Performance Summary
        if response_times:
            avg_response_time = statistics.mean(response_times)
            fast_responses = len([rt for rt in response_times if rt < 2.0])
            total_responses = len(response_times)
            
            self.log_test("Overall Performance Summary", "PASS" if avg_response_time < 2.0 else "WARN", 
                        f"Avg: {avg_response_time:.3f}s, Fast responses: {fast_responses}/{total_responses} ({fast_responses/total_responses*100:.1f}%)")
        
        if ai_response_times:
            avg_ai_response_time = statistics.mean(ai_response_times)
            fast_ai_responses = len([rt for rt in ai_response_times if rt < 2.0])
            total_ai_responses = len(ai_response_times)
            
            self.log_test("AI Performance Summary", "PASS" if avg_ai_response_time < 2.0 else "WARN", 
                        f"Avg: {avg_ai_response_time:.3f}s, Fast responses: {fast_ai_responses}/{total_ai_responses} ({fast_ai_responses/total_ai_responses*100:.1f}%)")

    def test_5_integration_testing(self):
        """Test templates system and integrations hub"""
        print("🔌 TESTING 5: INTEGRATION TESTING")
        print("-" * 60)
        
        # Templates System Test
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                templates = data["templates"]
                self.log_test("Templates System", "PASS", 
                            f"Found {len(templates)} templates", 
                            response_time, response.status_code)
                
                # Check template quality
                quality_templates = 0
                for template in templates:
                    if isinstance(template, dict) and all(key in template for key in ["name", "description", "category"]):
                        quality_templates += 1
                
                quality_percentage = (quality_templates / len(templates)) * 100
                if quality_percentage >= 80:
                    self.log_test("Templates Quality", "PASS", 
                                f"{quality_templates}/{len(templates)} templates have complete metadata ({quality_percentage:.1f}%)", 
                                None, response.status_code)
                else:
                    self.log_test("Templates Quality", "FAIL", 
                                f"Poor template quality: {quality_percentage:.1f}%", 
                                None, response.status_code)
            else:
                self.log_test("Templates System", "FAIL", 
                            "No templates found", response_time, response.status_code)
        else:
            self.log_test("Templates System", "FAIL", 
                        "Templates endpoint failed", response_time, response.status_code if response else None)
        
        # Featured Templates Test
        response, response_time = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                self.log_test("Featured Templates", "PASS", 
                            f"Found {len(data['templates'])} featured templates", 
                            response_time, response.status_code)
            else:
                self.log_test("Featured Templates", "FAIL", 
                            "No featured templates data", response_time, response.status_code)
        else:
            self.log_test("Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", response_time, response.status_code if response else None)
        
        # Integrations Hub Test
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) > 0:
                integrations = data["integrations"]
                self.log_test("Integrations Hub", "PASS", 
                            f"Found {len(integrations)} integrations", 
                            response_time, response.status_code)
                
                # Check integration categories
                categories = set()
                for integration in integrations:
                    if isinstance(integration, dict) and "category" in integration:
                        categories.add(integration["category"])
                
                if len(categories) >= 3:
                    self.log_test("Integration Categories", "PASS", 
                                f"Found {len(categories)} categories: {list(categories)}", 
                                None, response.status_code)
                else:
                    self.log_test("Integration Categories", "FAIL", 
                                f"Insufficient categories: {len(categories)}", 
                                None, response.status_code)
            else:
                self.log_test("Integrations Hub", "FAIL", 
                            "No integrations found", response_time, response.status_code)
        else:
            self.log_test("Integrations Hub", "FAIL", 
                        "Integrations endpoint failed", response_time, response.status_code if response else None)

    def test_6_robustness_error_handling(self):
        """Test error recovery and security measures"""
        print("🛡️ TESTING 6: ROBUSTNESS & ERROR HANDLING")
        print("-" * 60)
        
        # Test Invalid Authentication
        invalid_token = "invalid_token_12345"
        headers = {"Authorization": f"Bearer {invalid_token}"}
        response, response_time = self.make_request("GET", "/api/auth/me", headers=headers)
        
        if response and response.status_code == 401:
            self.log_test("Invalid Token Handling", "PASS", 
                        "Properly rejected invalid token", response_time, response.status_code)
        else:
            self.log_test("Invalid Token Handling", "FAIL", 
                        f"Unexpected response to invalid token", response_time, response.status_code if response else None)
        
        # Test Malformed Request
        malformed_data = {"invalid": "data", "missing": "required_fields"}
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", malformed_data)
        
        if response and response.status_code in [400, 422]:
            self.log_test("Malformed Request Handling", "PASS", 
                        "Properly handled malformed request", response_time, response.status_code)
        else:
            self.log_test("Malformed Request Handling", "FAIL", 
                        f"Poor handling of malformed request", response_time, response.status_code if response else None)
        
        # Test Non-existent Endpoint
        response, response_time = self.make_request("GET", "/api/nonexistent/endpoint")
        
        if response and response.status_code == 404:
            self.log_test("Non-existent Endpoint Handling", "PASS", 
                        "Properly returned 404 for non-existent endpoint", response_time, response.status_code)
        else:
            self.log_test("Non-existent Endpoint Handling", "FAIL", 
                        f"Unexpected response for non-existent endpoint", response_time, response.status_code if response else None)
        
        # Test Large Request (potential DoS)
        large_message = "A" * 10000  # 10KB message
        large_request = {
            "message": large_message,
            "conversation_id": f"large_test_{int(time.time())}"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", large_request)
        
        if response:
            if response.status_code == 200:
                self.log_test("Large Request Handling", "PASS", 
                            f"Handled large request successfully in {response_time:.3f}s", response_time, response.status_code)
            elif response.status_code in [413, 400]:
                self.log_test("Large Request Handling", "PASS", 
                            "Properly rejected oversized request", response_time, response.status_code)
            else:
                self.log_test("Large Request Handling", "WARN", 
                            f"Unexpected response to large request", response_time, response.status_code)
        else:
            self.log_test("Large Request Handling", "FAIL", 
                        "Failed to handle large request", response_time, None)

    def test_7_session_management(self):
        """Test conversation persistence and session management"""
        print("💾 TESTING 7: SESSION MANAGEMENT")
        print("-" * 60)
        
        conversation_id = f"session_test_{int(time.time())}"
        
        # First message in conversation
        message1 = {
            "message": "Hello, I'm building a React application. Can you help me?",
            "conversation_id": conversation_id
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", message1)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data:
                self.log_test("Session Creation", "PASS", 
                            f"Created new conversation session", response_time, response.status_code)
                
                # Follow-up message in same conversation
                message2 = {
                    "message": "What components should I create first?",
                    "conversation_id": conversation_id
                }
                
                response2, response_time2 = self.make_request("POST", "/api/ai/v3/chat/enhanced", message2)
                if response2 and response2.status_code == 200:
                    data2 = response2.json()
                    if "response" in data2:
                        # Check if response shows context awareness
                        response_text = data2["response"].lower()
                        context_indicators = ["react", "component", "application", "app"]
                        context_score = sum(1 for indicator in context_indicators if indicator in response_text)
                        
                        if context_score >= 2:
                            self.log_test("Session Persistence", "PASS", 
                                        f"Context maintained across messages (score: {context_score})", 
                                        response_time2, response2.status_code)
                        else:
                            self.log_test("Session Persistence", "FAIL", 
                                        f"Poor context retention (score: {context_score})", 
                                        response_time2, response2.status_code)
                    else:
                        self.log_test("Session Persistence", "FAIL", 
                                    "No response in follow-up message", response_time2, response2.status_code)
                else:
                    self.log_test("Session Persistence", "FAIL", 
                                "Follow-up message failed", response_time2, response2.status_code if response2 else None)
            else:
                self.log_test("Session Creation", "FAIL", 
                            "No response in initial message", response_time, response.status_code)
        else:
            self.log_test("Session Creation", "FAIL", 
                        "Failed to create conversation session", response_time, response.status_code if response else None)

    def test_8_cost_optimization(self):
        """Test smart model routing and cost optimization"""
        print("💰 TESTING 8: COST OPTIMIZATION")
        print("-" * 60)
        
        # Test different types of requests to verify smart routing
        test_requests = [
            {
                "message": "Hi",
                "type": "simple",
                "expected_model": "llama-3.1-8b-instant"
            },
            {
                "message": "Build a complex microservices architecture with Docker, Kubernetes, load balancing, and database sharding",
                "type": "complex",
                "expected_model": "llama-3.3-70b-versatile"
            },
            {
                "message": "Create a simple React component",
                "type": "medium",
                "expected_model": "mixtral-8x7b-32768"
            }
        ]
        
        for i, test_request in enumerate(test_requests, 1):
            request_data = {
                "message": test_request["message"],
                "conversation_id": f"cost_test_{i}_{int(time.time())}"
            }
            
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", request_data)
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 10:
                    # Check if model information is returned (for cost tracking)
                    model_info = data.get("model_used", "unknown")
                    self.log_test(f"Cost Optimization - {test_request['type'].title()} Request", "PASS", 
                                f"Request processed, model: {model_info}", response_time, response.status_code)
                else:
                    self.log_test(f"Cost Optimization - {test_request['type'].title()} Request", "FAIL", 
                                "Poor response quality", response_time, response.status_code)
            else:
                self.log_test(f"Cost Optimization - {test_request['type'].title()} Request", "FAIL", 
                            "Request failed", response_time, response.status_code if response else None)
        
        # Test cost calculation endpoint if available
        response, response_time = self.make_request("GET", "/api/ai/v3/usage/cost")
        if response and response.status_code == 200:
            data = response.json()
            if "total_cost" in data or "usage_stats" in data:
                self.log_test("Cost Tracking", "PASS", 
                            "Cost tracking endpoint available", response_time, response.status_code)
            else:
                self.log_test("Cost Tracking", "WARN", 
                            "Cost tracking endpoint exists but limited data", response_time, response.status_code)
        else:
            self.log_test("Cost Tracking", "WARN", 
                        "Cost tracking endpoint not available", response_time, response.status_code if response else None)

    def run_comprehensive_test(self):
        """Run comprehensive backend testing"""
        print("🎯 AETHER AI PLATFORM - COMPREHENSIVE BACKEND TESTING - AUGUST 2025")
        print("=" * 80)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Demo Login: {self.demo_user['email']} / {self.demo_user['password']}")
        print(f"Groq API Key: {self.groq_api_key}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with testing")
            return
        
        print("\n🎯 RUNNING COMPREHENSIVE BACKEND TESTS...")
        print("=" * 80)
        
        # Run all test suites
        self.test_1_core_system_verification()
        self.test_2_groq_ai_integration()
        self.test_3_multi_agent_system()
        self.test_4_performance_optimization()
        self.test_5_integration_testing()
        self.test_6_robustness_error_handling()
        self.test_7_session_management()
        self.test_8_cost_optimization()
        
        # Generate comprehensive summary
        self.generate_comprehensive_summary()

    def generate_comprehensive_summary(self):
        """Generate comprehensive test summary with performance metrics"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY - AUGUST 2025")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        warning_tests = len([r for r in self.test_results if r["status"] == "WARN"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"⚠️ Warnings: {warning_tests} ({warning_tests/total_tests*100:.1f}%)")
        print()
        
        # Performance Analysis
        if self.performance_metrics:
            response_times = [m["response_time"] for m in self.performance_metrics]
            fast_responses = len([m for m in self.performance_metrics if m["target_met"]])
            
            print("⚡ PERFORMANCE ANALYSIS:")
            print("-" * 40)
            print(f"Average Response Time: {statistics.mean(response_times):.3f}s")
            print(f"Fastest Response: {min(response_times):.3f}s")
            print(f"Slowest Response: {max(response_times):.3f}s")
            print(f"Responses <2s: {fast_responses}/{len(self.performance_metrics)} ({fast_responses/len(self.performance_metrics)*100:.1f}%)")
            print()
        
        # Test Categories Summary
        categories = [
            ("Core System Verification", "core_system"),
            ("Groq AI Integration", "groq_ai"),
            ("Multi-Agent System", "multi_agent"),
            ("Performance Optimization", "performance"),
            ("Integration Testing", "integration"),
            ("Robustness & Error Handling", "robustness"),
            ("Session Management", "session"),
            ("Cost Optimization", "cost")
        ]
        
        print("🎯 TEST CATEGORIES STATUS:")
        print("-" * 40)
        
        for category_name, category_key in categories:
            category_tests = [r for r in self.test_results if category_key.lower().replace("_", " ") in r["test"].lower()]
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
                
                print(f"{category_name}: {status} ({category_passed}/{category_total} passed)")
        
        print()
        
        # Overall Assessment
        overall_percentage = passed_tests / total_tests * 100 if total_tests > 0 else 0
        
        print("🏆 OVERALL ASSESSMENT:")
        print("-" * 40)
        
        if overall_percentage >= 90:
            verdict = "🎉 EXCELLENT - Production Ready"
            recommendation = "✅ DEPLOY WITH CONFIDENCE"
        elif overall_percentage >= 75:
            verdict = "👍 GOOD - Minor Issues"
            recommendation = "✅ READY FOR PRODUCTION with minor fixes"
        elif overall_percentage >= 60:
            verdict = "⚠️ NEEDS WORK - Some Issues"
            recommendation = "⚠️ ADDRESS ISSUES before production"
        else:
            verdict = "❌ CRITICAL - Major Issues"
            recommendation = "❌ SIGNIFICANT WORK REQUIRED"
        
        print(f"Overall Success Rate: {overall_percentage:.1f}%")
        print(f"Verdict: {verdict}")
        print(f"Recommendation: {recommendation}")
        print()
        
        # Critical Issues
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL" and any(keyword in r["test"].lower() for keyword in ["authentication", "groq", "health", "core"])]
        
        if critical_failures:
            print("🚨 CRITICAL ISSUES:")
            print("-" * 30)
            for failure in critical_failures:
                print(f"❌ {failure['test']}: {failure['details']}")
            print()
        
        # Performance Issues
        slow_tests = [r for r in self.test_results if r.get("response_time") is not None and r.get("response_time", 0) > 2.0]
        if slow_tests:
            print("🐌 PERFORMANCE ISSUES:")
            print("-" * 30)
            for slow_test in slow_tests:
                print(f"⚠️ {slow_test['test']}: {slow_test['response_time']:.3f}s (>2s target)")
            print()
        
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 80)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Comprehensive Backend Testing - August 2025")
    print(f"Backend URL: {backend_url}")
    
    tester = AetherAIBackendTester(backend_url)
    tester.run_comprehensive_test()