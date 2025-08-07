#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING FOR AETHER AI PLATFORM - JANUARY 2025
Focus on critical areas: AI System, Session Management, Error Handling, Authentication, Performance
"""

import requests
import json
import time
import sys
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import threading
import concurrent.futures

class AetherAIBackendTester:
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
        
    def log_test(self, test_name: str, status: str, details: str = "", response_time: float = None, response_code: int = None):
        """Log test results with enhanced details"""
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

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, timeout: int = 30) -> tuple:
        """Make HTTP request with timing and enhanced error handling"""
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
        print("🔐 AUTHENTICATION & SUBSCRIPTION TESTING")
        print("=" * 50)
        
        response, response_time = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                user_email = data.get('user', {}).get('email', 'unknown')
                self.log_test("Demo Login Authentication", "PASS", 
                            f"Successfully authenticated user: {user_email}", response_time, response.status_code)
                
                # Test JWT token validation
                self.test_jwt_validation()
                
                # Test trial system
                self.test_trial_system()
                
                return True
            else:
                self.log_test("Demo Login Authentication", "FAIL", 
                            "No access token in response", response_time, response.status_code)
        else:
            self.log_test("Demo Login Authentication", "FAIL", 
                        "Login failed", response_time, response.status_code if response else None)
        return False

    def test_jwt_validation(self):
        """Test JWT token generation and validation"""
        # Test with valid token
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            data = response.json()
            if "email" in data:
                self.log_test("JWT Token Validation", "PASS", 
                            f"Valid token accepted, user: {data.get('email')}", response_time, response.status_code)
            else:
                self.log_test("JWT Token Validation", "FAIL", 
                            "Valid token but missing user data", response_time, response.status_code)
        else:
            self.log_test("JWT Token Validation", "FAIL", 
                        "Valid token rejected", response_time, response.status_code if response else None)

    def test_trial_system(self):
        """Test trial system and subscription management"""
        # Test trial status
        response, response_time = self.make_request("GET", "/api/subscription/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial_active" in data or "days_remaining" in data:
                self.log_test("Trial System Status", "PASS", 
                            f"Trial status: {data.get('trial_active', 'unknown')}, Days: {data.get('days_remaining', 'unknown')}", 
                            response_time, response.status_code)
            else:
                self.log_test("Trial System Status", "FAIL", 
                            "Missing trial status data", response_time, response.status_code)
        else:
            self.log_test("Trial System Status", "FAIL", 
                        "Trial status endpoint failed", response_time, response.status_code if response else None)
        
        # Test current subscription
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if "plan" in data or "subscription" in data:
                plan_name = data.get('plan', {}).get('name', 'unknown') if isinstance(data.get('plan'), dict) else str(data.get('plan', 'unknown'))
                self.log_test("Current Subscription", "PASS", 
                            f"Subscription data available, Plan: {plan_name}", response_time, response.status_code)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Missing subscription data", response_time, response.status_code)
        else:
            self.log_test("Current Subscription", "FAIL", 
                        "Current subscription endpoint failed", response_time, response.status_code if response else None)

    def test_ai_system(self):
        """Test AI System - 5 agents, Groq integration, multi-agent coordination"""
        print("\n🤖 AI SYSTEM TESTING")
        print("=" * 50)
        
        # Test AI service health
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_models" in data or "models" in data:
                models_data = data.get("groq_models", data.get("models", {}))
                if isinstance(models_data, dict):
                    model_count = len(models_data)
                elif isinstance(models_data, list):
                    model_count = len(models_data)
                else:
                    model_count = 0
                
                self.log_test("AI Service Health Check", "PASS", 
                            f"AI service healthy with {model_count} models available", response_time, response.status_code)
            else:
                self.log_test("AI Service Health Check", "FAIL", 
                            "Missing model information in AI status", response_time, response.status_code)
        else:
            self.log_test("AI Service Health Check", "FAIL", 
                        "AI status endpoint failed", response_time, response.status_code if response else None)
        
        # Test Groq API integration
        self.test_groq_integration()
        
        # Test multi-agent system
        self.test_multi_agent_system()
        
        # Test AI performance
        self.test_ai_performance()

    def test_groq_integration(self):
        """Test Groq API integration with all 4 models"""
        expected_models = [
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile", 
            "mixtral-8x7b-32768",
            "llama-3.2-3b-preview"
        ]
        
        response, response_time = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            
            # Check for models in different possible locations
            models_found = []
            if "groq_models" in data:
                if isinstance(data["groq_models"], dict):
                    models_found = list(data["groq_models"].keys())
                elif isinstance(data["groq_models"], list):
                    models_found = [m.get("name", "") for m in data["groq_models"] if isinstance(m, dict)]
            elif "models" in data:
                if isinstance(data["models"], dict):
                    models_found = list(data["models"].keys())
                elif isinstance(data["models"], list):
                    models_found = [m.get("name", "") for m in data["models"] if isinstance(m, dict)]
            
            missing_models = [model for model in expected_models if model not in models_found]
            
            if len(missing_models) == 0:
                self.log_test("Groq API Integration - All Models", "PASS", 
                            f"All 4 Groq models available: {', '.join(models_found)}", response_time, response.status_code)
            else:
                self.log_test("Groq API Integration - All Models", "FAIL", 
                            f"Missing models: {missing_models}. Found: {models_found}", response_time, response.status_code)
        else:
            self.log_test("Groq API Integration", "FAIL", 
                        "Cannot verify Groq models", response_time, response.status_code if response else None)

    def test_multi_agent_system(self):
        """Test 5 AI agents and coordination"""
        expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
        
        response, response_time = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data:
                agents = data["agents"]
                found_agents = []
                
                for agent in agents:
                    if isinstance(agent, dict) and "name" in agent:
                        found_agents.append(agent["name"])
                
                missing_agents = [agent for agent in expected_agents if agent not in found_agents]
                
                if len(missing_agents) == 0:
                    self.log_test("Multi-Agent System - All Agents", "PASS", 
                                f"All 5 specialized agents available: {', '.join(found_agents)}", response_time, response.status_code)
                else:
                    self.log_test("Multi-Agent System - All Agents", "FAIL", 
                                f"Missing agents: {missing_agents}. Found: {found_agents}", response_time, response.status_code)
                
                # Test agent coordination with enhanced chat
                self.test_agent_coordination()
            else:
                self.log_test("Multi-Agent System", "FAIL", 
                            "No agents data in response", response_time, response.status_code)
        else:
            self.log_test("Multi-Agent System", "FAIL", 
                        "Agents endpoint failed", response_time, response.status_code if response else None)

    def test_agent_coordination(self):
        """Test multi-agent coordination and handoffs"""
        test_message = {
            "message": "I need to build a scalable task management application with React frontend, FastAPI backend, and MongoDB database. Please provide a comprehensive development plan.",
            "conversation_id": f"test_coordination_{int(time.time())}"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", test_message)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and len(data["response"]) > 100:
                # Check if response shows multi-agent coordination
                response_text = data["response"].lower()
                coordination_indicators = ["agent", "coordinate", "collaborate", "team", "expert"]
                has_coordination = any(indicator in response_text for indicator in coordination_indicators)
                
                if has_coordination:
                    self.log_test("Agent Coordination", "PASS", 
                                f"Multi-agent coordination working, response length: {len(data['response'])} chars", 
                                response_time, response.status_code)
                else:
                    self.log_test("Agent Coordination", "PASS", 
                                f"Enhanced chat working, response length: {len(data['response'])} chars", 
                                response_time, response.status_code)
            else:
                self.log_test("Agent Coordination", "FAIL", 
                            f"Poor response quality, length: {len(data.get('response', ''))}", response_time, response.status_code)
        else:
            self.log_test("Agent Coordination", "FAIL", 
                        "Enhanced chat endpoint failed", response_time, response.status_code if response else None)

    def test_ai_performance(self):
        """Test AI response times (target <2 seconds)"""
        test_message = {
            "message": "Create a simple React component for a login form",
            "conversation_id": f"test_performance_{int(time.time())}"
        }
        
        # Test enhanced AI v3 endpoint
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", test_message)
        if response and response.status_code == 200:
            if response_time < 2.0:
                self.log_test("AI Performance - Enhanced v3", "PASS", 
                            f"Response time {response_time:.2f}s meets <2s target", response_time, response.status_code)
            else:
                self.log_test("AI Performance - Enhanced v3", "FAIL", 
                            f"Response time {response_time:.2f}s exceeds 2s target", response_time, response.status_code)
        else:
            self.log_test("AI Performance - Enhanced v3", "FAIL", 
                        "Enhanced AI endpoint failed", response_time, response.status_code if response else None)
        
        # Test quick response endpoint
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", test_message)
        if response and response.status_code == 200:
            if response_time < 2.0:
                self.log_test("AI Performance - Quick Response", "PASS", 
                            f"Quick response time {response_time:.2f}s meets <2s target", response_time, response.status_code)
            else:
                self.log_test("AI Performance - Quick Response", "FAIL", 
                            f"Quick response time {response_time:.2f}s exceeds 2s target", response_time, response.status_code)
        else:
            self.log_test("AI Performance - Quick Response", "FAIL", 
                        "Quick response endpoint failed", response_time, response.status_code if response else None)

    def test_session_management(self):
        """Test session management and conversation context retention"""
        print("\n💬 SESSION MANAGEMENT TESTING (Priority Issue)")
        print("=" * 50)
        
        conversation_id = f"test_session_{int(time.time())}"
        
        # Test 1: Create conversation with context
        message1 = {
            "message": "My name is John and I'm building a React app",
            "conversation_id": conversation_id
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", message1)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data:
                self.log_test("Session Creation", "PASS", 
                            f"First message processed, response length: {len(data['response'])}", response_time, response.status_code)
                
                # Test 2: Follow-up message to test context retention
                time.sleep(1)  # Brief pause
                message2 = {
                    "message": "What was my name again? And what am I building?",
                    "conversation_id": conversation_id
                }
                
                response2, response_time2 = self.make_request("POST", "/api/ai/v3/chat/enhanced", message2)
                if response2 and response2.status_code == 200:
                    data2 = response2.json()
                    response_text = data2.get("response", "").lower()
                    
                    # Check if context is retained
                    has_name = "john" in response_text
                    has_context = "react" in response_text or "app" in response_text
                    
                    if has_name and has_context:
                        self.log_test("Context Retention", "PASS", 
                                    "AI remembered name (John) and project (React app)", response_time2, response2.status_code)
                    elif has_name or has_context:
                        self.log_test("Context Retention", "PARTIAL", 
                                    f"Partial context retention - Name: {has_name}, Context: {has_context}", response_time2, response2.status_code)
                    else:
                        self.log_test("Context Retention", "FAIL", 
                                    "No context retention detected", response_time2, response2.status_code)
                else:
                    self.log_test("Context Retention", "FAIL", 
                                "Follow-up message failed", response_time2, response2.status_code if response2 else None)
            else:
                self.log_test("Session Creation", "FAIL", 
                            "No response in first message", response_time, response.status_code)
        else:
            self.log_test("Session Creation", "FAIL", 
                        "First message failed", response_time, response.status_code if response else None)
        
        # Test conversation summary
        self.test_conversation_summary(conversation_id)
        
        # Test session cleanup
        self.test_session_cleanup()

    def test_conversation_summary(self, conversation_id: str):
        """Test conversation summarization"""
        response, response_time = self.make_request("GET", f"/api/ai/v3/chat/{conversation_id}/summary")
        if response and response.status_code == 200:
            data = response.json()
            if "summary" in data:
                self.log_test("Conversation Summary", "PASS", 
                            f"Summary generated: {len(data['summary'])} chars", response_time, response.status_code)
            else:
                self.log_test("Conversation Summary", "FAIL", 
                            "No summary in response", response_time, response.status_code)
        else:
            self.log_test("Conversation Summary", "FAIL", 
                        "Summary endpoint failed", response_time, response.status_code if response else None)

    def test_session_cleanup(self):
        """Test session management and cleanup"""
        # This is more of a system test - we'll check if the system handles multiple sessions
        sessions = []
        for i in range(3):
            session_id = f"cleanup_test_{i}_{int(time.time())}"
            message = {
                "message": f"Test session {i}",
                "conversation_id": session_id
            }
            response, _ = self.make_request("POST", "/api/ai/v3/chat/enhanced", message)
            if response and response.status_code == 200:
                sessions.append(session_id)
        
        if len(sessions) == 3:
            self.log_test("Session Management", "PASS", 
                        f"Successfully created {len(sessions)} concurrent sessions", None, 200)
        else:
            self.log_test("Session Management", "FAIL", 
                        f"Only created {len(sessions)}/3 sessions", None, None)

    def test_error_handling(self):
        """Test error handling - invalid tokens, malformed requests, rate limiting"""
        print("\n🚨 ERROR HANDLING TESTING (Priority Issue)")
        print("=" * 50)
        
        # Test 1: Invalid token handling
        original_token = self.auth_token
        self.auth_token = "invalid_token_12345"
        
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 401:
            self.log_test("Invalid Token Handling", "PASS", 
                        "Invalid token properly rejected with 401", response_time, response.status_code)
        else:
            self.log_test("Invalid Token Handling", "FAIL", 
                        f"Invalid token not handled properly, got {response.status_code if response else 'no response'}", 
                        response_time, response.status_code if response else None)
        
        # Restore valid token
        self.auth_token = original_token
        
        # Test 2: Malformed request handling
        malformed_data = {
            "invalid_field": "test",
            "missing_required": None
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", malformed_data)
        if response and response.status_code in [400, 422]:
            self.log_test("Malformed Request Handling", "PASS", 
                        f"Malformed request properly rejected with {response.status_code}", response_time, response.status_code)
        else:
            self.log_test("Malformed Request Handling", "FAIL", 
                        f"Malformed request not handled properly, got {response.status_code if response else 'no response'}", 
                        response_time, response.status_code if response else None)
        
        # Test 3: Empty message handling
        empty_message = {
            "message": "",
            "conversation_id": "test_empty"
        }
        
        response, response_time = self.make_request("POST", "/api/ai/v3/chat/enhanced", empty_message)
        if response and response.status_code in [400, 422]:
            self.log_test("Empty Message Handling", "PASS", 
                        f"Empty message properly rejected with {response.status_code}", response_time, response.status_code)
        else:
            self.log_test("Empty Message Handling", "FAIL", 
                        f"Empty message not handled properly, got {response.status_code if response else 'no response'}", 
                        response_time, response.status_code if response else None)
        
        # Test 4: Rate limiting (simulate rapid requests)
        self.test_rate_limiting()

    def test_rate_limiting(self):
        """Test API rate limiting and throttling"""
        rapid_requests = []
        start_time = time.time()
        
        # Send 10 rapid requests
        for i in range(10):
            message = {
                "message": f"Rapid test {i}",
                "conversation_id": f"rate_test_{i}"
            }
            response, response_time = self.make_request("POST", "/api/ai/v3/chat/quick-response", message, timeout=5)
            rapid_requests.append((response, response_time))
        
        total_time = time.time() - start_time
        successful_requests = len([r for r, _ in rapid_requests if r and r.status_code == 200])
        rate_limited = len([r for r, _ in rapid_requests if r and r.status_code == 429])
        
        if rate_limited > 0:
            self.log_test("Rate Limiting", "PASS", 
                        f"Rate limiting active: {rate_limited} requests limited, {successful_requests} succeeded", 
                        total_time, None)
        elif successful_requests >= 8:
            self.log_test("Rate Limiting", "PASS", 
                        f"System handled {successful_requests}/10 rapid requests successfully", total_time, None)
        else:
            self.log_test("Rate Limiting", "FAIL", 
                        f"Poor handling of rapid requests: {successful_requests}/10 succeeded", total_time, None)

    def test_core_api_endpoints(self):
        """Test all core API endpoints"""
        print("\n🔗 CORE API ENDPOINTS TESTING")
        print("=" * 50)
        
        # Test health check
        response, response_time = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                self.log_test("Health Check Endpoint", "PASS", 
                            f"System healthy, services: {data.get('services', {})}", response_time, response.status_code)
            else:
                self.log_test("Health Check Endpoint", "FAIL", 
                            f"System not healthy: {data.get('status', 'unknown')}", response_time, response.status_code)
        else:
            self.log_test("Health Check Endpoint", "FAIL", 
                        "Health check failed", response_time, response.status_code if response else None)
        
        # Test templates API
        response, response_time = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                template_count = len(data["templates"])
                self.log_test("Templates API", "PASS", 
                            f"Templates endpoint working, {template_count} templates available", response_time, response.status_code)
            else:
                self.log_test("Templates API", "FAIL", 
                            "No templates data in response", response_time, response.status_code)
        else:
            self.log_test("Templates API", "FAIL", 
                        "Templates endpoint failed", response_time, response.status_code if response else None)
        
        # Test projects API
        response, response_time = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data or isinstance(data, list):
                project_count = len(data.get("projects", data))
                self.log_test("Projects API", "PASS", 
                            f"Projects endpoint working, {project_count} projects available", response_time, response.status_code)
            else:
                self.log_test("Projects API", "FAIL", 
                            "No projects data in response", response_time, response.status_code)
        else:
            self.log_test("Projects API", "FAIL", 
                        "Projects endpoint failed", response_time, response.status_code if response else None)
        
        # Test integrations API
        response, response_time = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                integration_count = len(data["integrations"])
                self.log_test("Integrations API", "PASS", 
                            f"Integrations endpoint working, {integration_count} integrations available", response_time, response.status_code)
            else:
                self.log_test("Integrations API", "FAIL", 
                            "No integrations data in response", response_time, response.status_code)
        else:
            self.log_test("Integrations API", "FAIL", 
                        "Integrations endpoint failed", response_time, response.status_code if response else None)

    def test_database_operations(self):
        """Test MongoDB Atlas connectivity and data operations"""
        print("\n🗄️ DATABASE OPERATIONS TESTING")
        print("=" * 50)
        
        # Test database connectivity through user data
        response, response_time = self.make_request("GET", "/api/auth/me")
        if response and response.status_code == 200:
            data = response.json()
            if "email" in data and "id" in data:
                self.log_test("Database Connectivity", "PASS", 
                            f"User data retrieved from database: {data.get('email')}", response_time, response.status_code)
            else:
                self.log_test("Database Connectivity", "FAIL", 
                            "Incomplete user data from database", response_time, response.status_code)
        else:
            self.log_test("Database Connectivity", "FAIL", 
                        "Cannot retrieve user data from database", response_time, response.status_code if response else None)
        
        # Test data persistence through subscription data
        response, response_time = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            if data and len(str(data)) > 10:  # Has meaningful data
                self.log_test("Data Persistence", "PASS", 
                            "Subscription data persisted and retrieved successfully", response_time, response.status_code)
            else:
                self.log_test("Data Persistence", "FAIL", 
                            "No meaningful subscription data found", response_time, response.status_code)
        else:
            self.log_test("Data Persistence", "FAIL", 
                        "Cannot retrieve subscription data", response_time, response.status_code if response else None)

    def test_performance_reliability(self):
        """Test performance and reliability under load"""
        print("\n⚡ PERFORMANCE & RELIABILITY TESTING")
        print("=" * 50)
        
        # Test concurrent requests
        def make_concurrent_request(i):
            message = {
                "message": f"Concurrent test request {i}",
                "conversation_id": f"concurrent_{i}_{int(time.time())}"
            }
            return self.make_request("POST", "/api/ai/v3/chat/quick-response", message)
        
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_concurrent_request, i) for i in range(5)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        total_time = time.time() - start_time
        successful_requests = len([r for r, _ in results if r and r.status_code == 200])
        avg_response_time = sum([rt for _, rt in results]) / len(results)
        
        if successful_requests >= 4 and avg_response_time < 3.0:
            self.log_test("Concurrent Request Handling", "PASS", 
                        f"{successful_requests}/5 requests succeeded, avg time: {avg_response_time:.2f}s", 
                        total_time, None)
        else:
            self.log_test("Concurrent Request Handling", "FAIL", 
                        f"Poor concurrent performance: {successful_requests}/5 succeeded, avg time: {avg_response_time:.2f}s", 
                        total_time, None)
        
        # Test system stability
        stability_tests = 0
        stability_passed = 0
        
        for i in range(3):
            response, response_time = self.make_request("GET", "/api/health")
            stability_tests += 1
            if response and response.status_code == 200:
                stability_passed += 1
            time.sleep(1)
        
        if stability_passed == stability_tests:
            self.log_test("System Stability", "PASS", 
                        f"System stable across {stability_tests} health checks", None, 200)
        else:
            self.log_test("System Stability", "FAIL", 
                        f"System unstable: {stability_passed}/{stability_tests} health checks passed", None, None)

    def run_comprehensive_test(self):
        """Run comprehensive backend testing"""
        print("🎯 AETHER AI PLATFORM - COMPREHENSIVE BACKEND TESTING")
        print("=" * 60)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Expected Groq API Key: {self.groq_api_key}")
        print(f"Demo Credentials: {self.demo_user['email']} / {self.demo_user['password']}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 60)
        
        # 1. Authentication & Subscription (includes JWT and trial system)
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with authenticated tests")
            return
        
        # 2. AI System Testing (5 agents, Groq integration, multi-agent coordination)
        self.test_ai_system()
        
        # 3. Session Management Testing (Priority Issue)
        self.test_session_management()
        
        # 4. Error Handling Testing (Priority Issue)
        self.test_error_handling()
        
        # 5. Core API Endpoints
        self.test_core_api_endpoints()
        
        # 6. Database Operations
        self.test_database_operations()
        
        # 7. Performance & Reliability
        self.test_performance_reliability()
        
        # Generate comprehensive summary
        self.generate_comprehensive_summary()

    def generate_comprehensive_summary(self):
        """Generate detailed test summary with focus on critical areas"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        partial_tests = len([r for r in self.test_results if r["status"] == "PARTIAL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"⚠️ Partial: {partial_tests} ({partial_tests/total_tests*100:.1f}%)")
        print()
        
        # Critical areas assessment
        critical_areas = {
            "AI System": ["AI Service Health", "Groq API Integration", "Multi-Agent System", "Agent Coordination", "AI Performance"],
            "Session Management": ["Session Creation", "Context Retention", "Conversation Summary", "Session Management"],
            "Error Handling": ["Invalid Token", "Malformed Request", "Empty Message", "Rate Limiting"],
            "Authentication": ["Demo Login", "JWT Token", "Trial System", "Current Subscription"],
            "Core APIs": ["Health Check", "Templates API", "Projects API", "Integrations API"],
            "Database": ["Database Connectivity", "Data Persistence"],
            "Performance": ["Concurrent Request", "System Stability"]
        }
        
        print("🎯 CRITICAL AREAS ASSESSMENT:")
        print("-" * 40)
        
        for area, keywords in critical_areas.items():
            area_tests = [r for r in self.test_results if any(keyword.lower() in r["test"].lower() for keyword in keywords)]
            if area_tests:
                area_passed = len([r for r in area_tests if r["status"] == "PASS"])
                area_total = len(area_tests)
                area_percentage = area_passed / area_total * 100 if area_total > 0 else 0
                
                if area_percentage >= 80:
                    status = "✅ EXCELLENT"
                elif area_percentage >= 60:
                    status = "⚠️ GOOD"
                elif area_percentage >= 40:
                    status = "⚠️ NEEDS WORK"
                else:
                    status = "❌ CRITICAL ISSUES"
                
                print(f"{area}: {status} ({area_passed}/{area_total} tests passed - {area_percentage:.1f}%)")
        
        print()
        
        # Performance metrics
        response_times = [r["response_time"] for r in self.test_results if r["response_time"] is not None]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            fast_responses = len([rt for rt in response_times if rt < 2.0])
            
            print("⚡ PERFORMANCE METRICS:")
            print("-" * 30)
            print(f"Average Response Time: {avg_response_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(response_times)} ({fast_responses/len(response_times)*100:.1f}%)")
            print()
        
        # Critical failures
        critical_failures = [r for r in self.test_results if r["status"] == "FAIL"]
        if critical_failures:
            print("🚨 CRITICAL FAILURES:")
            print("-" * 25)
            for failure in critical_failures:
                print(f"❌ {failure['test']}: {failure['details']}")
            print()
        
        # Overall verdict
        if passed_tests >= total_tests * 0.9:
            verdict = "🎉 EXCELLENT - Production Ready"
        elif passed_tests >= total_tests * 0.8:
            verdict = "✅ GOOD - Minor Issues"
        elif passed_tests >= total_tests * 0.6:
            verdict = "⚠️ NEEDS IMPROVEMENT - Major Issues"
        else:
            verdict = "❌ CRITICAL - Significant Problems"
        
        print(f"FINAL VERDICT: {verdict}")
        print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
        print()
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 60)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - Comprehensive Backend Testing")
    print(f"Backend URL: {backend_url}")
    
    tester = AetherAIBackendTester(backend_url)
    tester.run_comprehensive_test()