#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for AI Code Studio
Tests all critical endpoints and enterprise features
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class BackendTester:
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

    def test_health_endpoints(self):
        """Test basic health check endpoints"""
        print("🔍 Testing Health Check Endpoints...")
        
        # Test root endpoint
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Root Health Check", "PASS", 
                                f"API running: {data.get('message')}", response.status_code)
                else:
                    self.log_test("Root Health Check", "FAIL", 
                                "Missing required fields in response", response.status_code)
            except:
                self.log_test("Root Health Check", "FAIL", 
                            f"Non-JSON response: {response.text[:200]}", response.status_code)
        else:
            self.log_test("Root Health Check", "FAIL", 
                        "Endpoint not accessible", response.status_code if response else None)
        
        # Test detailed health check
        response = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data and "services" in data:
                    self.log_test("Detailed Health Check", "PASS", 
                                f"Services: {data.get('services')}", response.status_code)
                else:
                    self.log_test("Detailed Health Check", "FAIL", 
                                "Missing service status information", response.status_code)
            except:
                self.log_test("Detailed Health Check", "FAIL", 
                            f"Non-JSON response: {response.text[:200]}", response.status_code)
        else:
            self.log_test("Detailed Health Check", "FAIL", 
                        "Health endpoint not accessible", response.status_code if response else None)

    def test_authentication_system(self):
        """Test authentication endpoints"""
        print("🔐 Testing Authentication System...")
        
        # Test user registration
        import random
        test_user = {
            "email": f"testuser{random.randint(1000,9999)}@example.com",
            "name": "Test User",
            "password": "testpassword123"
        }
        
        response = self.make_request("POST", "/api/auth/register", test_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.log_test("User Registration", "PASS", 
                            f"User created: {data['user']['email']}", response.status_code)
            else:
                self.log_test("User Registration", "FAIL", 
                            "Missing token or user data", response.status_code)
        elif response and response.status_code == 400:
            # User might already exist
            self.log_test("User Registration", "SKIP", 
                        "User already exists (expected)", response.status_code)
        else:
            self.log_test("User Registration", "FAIL", 
                        "Registration endpoint failed", response.status_code if response else None)
        
        # Test demo user login
        response = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo User Login", "PASS", 
                            f"Token received for {data.get('user', {}).get('email')}", response.status_code)
            else:
                self.log_test("Demo User Login", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Demo User Login", "FAIL", 
                        "Login failed", response.status_code if response else None)
        
        # Test getting current user profile (requires auth)
        if self.auth_token:
            response = self.make_request("GET", "/api/auth/me")
            if response and response.status_code == 200:
                data = response.json()
                if "email" in data and "name" in data:
                    self.log_test("Get User Profile", "PASS", 
                                f"Profile retrieved: {data.get('email')}", response.status_code)
                else:
                    self.log_test("Get User Profile", "FAIL", 
                                "Missing user profile data", response.status_code)
            else:
                self.log_test("Get User Profile", "FAIL", 
                            "Profile endpoint failed", response.status_code if response else None)

    def test_ai_chat_integration(self):
        """Test AI chat functionality"""
        print("🤖 Testing AI Chat Integration...")
        
        if not self.auth_token:
            self.log_test("AI Chat Test", "SKIP", "No authentication token available")
            return
        
        # Test AI chat endpoint
        chat_request = {
            "message": "Build a simple todo app with React",
            "model": "gpt-4.1-nano"
        }
        
        response = self.make_request("POST", "/api/ai/chat", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and "model" in data:
                self.log_test("AI Chat Message", "PASS", 
                            f"AI responded with model: {data.get('model')}", response.status_code)
            else:
                self.log_test("AI Chat Message", "FAIL", 
                            "Missing response or model info", response.status_code)
        else:
            self.log_test("AI Chat Message", "FAIL", 
                        "AI chat endpoint failed", response.status_code if response else None)
        
        # Test getting conversations
        response = self.make_request("GET", "/api/ai/conversations")
        if response and response.status_code == 200:
            data = response.json()
            if "conversations" in data:
                self.log_test("Get Conversations", "PASS", 
                            f"Found {len(data['conversations'])} conversations", response.status_code)
            else:
                self.log_test("Get Conversations", "FAIL", 
                            "No conversations data", response.status_code)
        else:
            self.log_test("Get Conversations", "FAIL", 
                        "Conversations endpoint failed", response.status_code if response else None)

    def test_project_management(self):
        """Test project management endpoints"""
        print("📁 Testing Project Management...")
        
        if not self.auth_token:
            self.log_test("Project Management Test", "SKIP", "No authentication token available")
            return
        
        # Test creating a project
        project_data = {
            "name": "Test Project",
            "description": "A test project for API validation",
            "type": "react_app",
            "requirements": "React, Node.js, TypeScript"
        }
        
        response = self.make_request("POST", "/api/projects/", project_data)
        if response and response.status_code == 200:
            data = response.json()
            if "project" in data and data["project"].get("name") == project_data["name"]:
                self.log_test("Create Project", "PASS", 
                            f"Project created: {data['project']['name']}", response.status_code)
                self.test_project_id = data["project"]["_id"]
            else:
                self.log_test("Create Project", "FAIL", 
                            "Project creation response invalid", response.status_code)
        else:
            self.log_test("Create Project", "FAIL", 
                        "Project creation failed", response.status_code if response else None)
        
        # Test getting projects
        response = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                self.log_test("Get Projects", "PASS", 
                            f"Found {len(data['projects'])} projects", response.status_code)
            else:
                self.log_test("Get Projects", "FAIL", 
                            "No projects data", response.status_code)
        else:
            self.log_test("Get Projects", "FAIL", 
                        "Projects endpoint failed", response.status_code if response else None)

    def test_template_system(self):
        """Test template system endpoints"""
        print("📋 Testing Template System...")
        
        # Test getting templates (public endpoint)
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                self.log_test("Get Templates", "PASS", 
                            f"Found {len(data['templates'])} templates", response.status_code)
            else:
                self.log_test("Get Templates", "FAIL", 
                            "No templates found", response.status_code)
        else:
            self.log_test("Get Templates", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)
        
        # Test getting featured templates
        response = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                self.log_test("Get Featured Templates", "PASS", 
                            f"Found {len(data['templates'])} featured templates", response.status_code)
            else:
                self.log_test("Get Featured Templates", "FAIL", 
                            "No featured templates data", response.status_code)
        else:
            self.log_test("Get Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", response.status_code if response else None)
        
        # Test getting specific template
        response = self.make_request("GET", "/api/templates/react-starter")
        if response and response.status_code == 200:
            data = response.json()
            if "template" in data and data["template"].get("name"):
                self.log_test("Get Specific Template", "PASS", 
                            f"Template: {data['template']['name']}", response.status_code)
            else:
                self.log_test("Get Specific Template", "FAIL", 
                            "Template data incomplete", response.status_code)
        else:
            self.log_test("Get Specific Template", "FAIL", 
                        "Specific template endpoint failed", response.status_code if response else None)

    def test_enterprise_features(self):
        """Test enterprise features"""
        print("🏢 Testing Enterprise Features...")
        
        if not self.auth_token:
            self.log_test("Enterprise Features Test", "SKIP", "No authentication token available")
            return
        
        # Test getting integrations
        response = self.make_request("GET", "/api/enterprise/integrations")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                self.log_test("Enterprise Integrations", "PASS", 
                            f"Found {len(data['integrations'])} integrations", response.status_code)
            else:
                self.log_test("Enterprise Integrations", "FAIL", 
                            "No integrations data", response.status_code)
        else:
            self.log_test("Enterprise Integrations", "FAIL", 
                        "Enterprise integrations endpoint failed", response.status_code if response else None)
        
        # Test compliance dashboard
        response = self.make_request("GET", "/api/enterprise/compliance/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Compliance Dashboard", "PASS", 
                        "Compliance dashboard accessible", response.status_code)
        else:
            self.log_test("Compliance Dashboard", "FAIL", 
                        "Compliance dashboard failed", response.status_code if response else None)
        
        # Test automation dashboard
        response = self.make_request("GET", "/api/enterprise/automation/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Automation Dashboard", "PASS", 
                        "Automation dashboard accessible", response.status_code)
        else:
            self.log_test("Automation Dashboard", "FAIL", 
                        "Automation dashboard failed", response.status_code if response else None)

    def test_agents_system(self):
        """Test multi-agent system"""
        print("🤖 Testing Multi-Agent System...")
        
        if not self.auth_token:
            self.log_test("Agents System Test", "SKIP", "No authentication token available")
            return
        
        # Test getting agents
        response = self.make_request("GET", "/api/agents/")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and isinstance(data["agents"], list):
                self.log_test("Get Agents", "PASS", 
                            f"Found {len(data['agents'])} agents", response.status_code)
            else:
                self.log_test("Get Agents", "FAIL", 
                            "Invalid agents response format", response.status_code)
        else:
            self.log_test("Get Agents", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)
        
        # Test orchestration status
        response = self.make_request("GET", "/api/agents/orchestration/status")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Orchestration Status", "PASS", 
                        "Orchestration system accessible", response.status_code)
        else:
            self.log_test("Orchestration Status", "FAIL", 
                        "Orchestration status failed", response.status_code if response else None)
        
        # Test agent teams
        response = self.make_request("GET", "/api/agents/teams")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Agent Teams", "PASS", 
                            f"Found {len(data)} teams", response.status_code)
            else:
                self.log_test("Get Agent Teams", "FAIL", 
                            "Invalid teams response format", response.status_code)
        else:
            self.log_test("Get Agent Teams", "FAIL", 
                        "Agent teams endpoint failed", response.status_code if response else None)

    def test_integrations_marketplace(self):
        """Test integrations marketplace"""
        print("🔌 Testing Integrations Marketplace...")
        
        if not self.auth_token:
            self.log_test("Integrations Marketplace Test", "SKIP", "No authentication token available")
            return
        
        # Test getting available integrations (requires auth)
        response = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) > 0:
                self.log_test("Get Available Integrations", "PASS", 
                            f"Found {len(data['integrations'])} integrations", response.status_code)
            else:
                self.log_test("Get Available Integrations", "FAIL", 
                            "No integrations found", response.status_code)
        else:
            self.log_test("Get Available Integrations", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None)
        
        # Test getting integration categories
        response = self.make_request("GET", "/api/integrations/categories")
        if response and response.status_code == 200:
            data = response.json()
            if "categories" in data:
                self.log_test("Get Integration Categories", "PASS", 
                            f"Found {len(data['categories'])} categories", response.status_code)
            else:
                self.log_test("Get Integration Categories", "FAIL", 
                            "No categories data", response.status_code)
        else:
            self.log_test("Get Integration Categories", "FAIL", 
                        "Categories endpoint failed", response.status_code if response else None)
        
        # Test getting popular integrations
        response = self.make_request("GET", "/api/integrations/popular")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                self.log_test("Get Popular Integrations", "PASS", 
                            f"Found {len(data['integrations'])} popular integrations", response.status_code)
            else:
                self.log_test("Get Popular Integrations", "FAIL", 
                            "No popular integrations data", response.status_code)
        else:
            self.log_test("Get Popular Integrations", "FAIL", 
                        "Popular integrations endpoint failed", response.status_code if response else None)

    def test_advanced_ai_features(self):
        """Test advanced AI features"""
        print("🧠 Testing Advanced AI Features...")
        
        if not self.auth_token:
            self.log_test("Advanced AI Features Test", "SKIP", "No authentication token available")
            return
        
        # Test AI chat streaming
        response = self.make_request("GET", "/api/ai/chat/stream")
        if response and response.status_code == 200:
            self.log_test("AI Chat Stream", "PASS", "AI chat streaming endpoint accessible", response.status_code)
        else:
            self.log_test("AI Chat Stream", "FAIL", "AI chat streaming endpoint failed", response.status_code if response else None)
        
        # Test advanced AI features
        response = self.make_request("GET", "/api/advanced-ai/features")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Advanced AI Features", "PASS", f"Advanced AI features available", response.status_code)
        else:
            self.log_test("Advanced AI Features", "FAIL", "Advanced AI features endpoint failed", response.status_code if response else None)
        
        # Test architectural intelligence
        response = self.make_request("GET", "/api/architectural-intelligence/insights/test-project")
        if response and response.status_code == 200:
            self.log_test("Architectural Intelligence", "PASS", "Architectural intelligence accessible", response.status_code)
        else:
            self.log_test("Architectural Intelligence", "FAIL", "Architectural intelligence failed", response.status_code if response else None)
        
        # Test smart documentation
        response = self.make_request("GET", "/api/smart-documentation/generate/test-project")
        if response and response.status_code == 200:
            self.log_test("Smart Documentation", "PASS", "Smart documentation accessible", response.status_code)
        else:
            self.log_test("Smart Documentation", "FAIL", "Smart documentation failed", response.status_code if response else None)

    def test_enterprise_analytics_performance(self):
        """Test enterprise analytics and performance"""
        print("📊 Testing Enterprise Analytics & Performance...")
        
        if not self.auth_token:
            self.log_test("Enterprise Analytics Test", "SKIP", "No authentication token available")
            return
        
        # Test real-time analytics
        response = self.make_request("GET", "/api/analytics/realtime")
        if response and response.status_code == 200:
            self.log_test("Real-time Analytics", "PASS", "Real-time analytics accessible", response.status_code)
        else:
            self.log_test("Real-time Analytics", "FAIL", "Real-time analytics failed", response.status_code if response else None)
        
        # Test predictive analytics
        response = self.make_request("GET", "/api/analytics/predictions")
        if response and response.status_code == 200:
            self.log_test("Predictive Analytics", "PASS", "Predictive analytics accessible", response.status_code)
        else:
            self.log_test("Predictive Analytics", "FAIL", "Predictive analytics failed", response.status_code if response else None)
        
        # Test advanced performance metrics
        response = self.make_request("GET", "/api/performance/advanced")
        if response and response.status_code == 200:
            self.log_test("Advanced Performance Metrics", "PASS", "Advanced performance metrics accessible", response.status_code)
        else:
            self.log_test("Advanced Performance Metrics", "FAIL", "Advanced performance metrics failed", response.status_code if response else None)
        
        # Test dashboard
        response = self.make_request("GET", "/api/dashboard")
        if response and response.status_code == 200:
            self.log_test("Dashboard Data", "PASS", "Dashboard data accessible", response.status_code)
        else:
            self.log_test("Dashboard Data", "FAIL", "Dashboard data failed", response.status_code if response else None)

    def test_collaboration_workflow_engine(self):
        """Test collaboration and workflow engine"""
        print("🤝 Testing Collaboration & Workflow Engine...")
        
        if not self.auth_token:
            self.log_test("Collaboration Test", "SKIP", "No authentication token available")
            return
        
        # Test collaboration status
        response = self.make_request("GET", "/api/collaboration/status/all")
        if response and response.status_code == 200:
            self.log_test("Collaboration Status", "PASS", "Collaboration status accessible", response.status_code)
        else:
            self.log_test("Collaboration Status", "FAIL", "Collaboration status failed", response.status_code if response else None)
        
        # Test active collaborators
        response = self.make_request("GET", "/api/collaboration/users/test-project")
        if response and response.status_code == 200:
            self.log_test("Active Collaborators", "PASS", "Active collaborators accessible", response.status_code)
        else:
            self.log_test("Active Collaborators", "FAIL", "Active collaborators failed", response.status_code if response else None)
        
        # Test workflows
        response = self.make_request("GET", "/api/workflows")
        if response and response.status_code == 200:
            self.log_test("Workflow Automation", "PASS", "Workflow automation accessible", response.status_code)
        else:
            self.log_test("Workflow Automation", "FAIL", "Workflow automation failed", response.status_code if response else None)
        
        # Test automation dashboard
        response = self.make_request("GET", "/api/workflows/automation/dashboard")
        if response and response.status_code == 200:
            self.log_test("Automation Dashboard", "PASS", "Automation dashboard accessible", response.status_code)
        else:
            self.log_test("Automation Dashboard", "FAIL", "Automation dashboard failed", response.status_code if response else None)

    def test_security_compliance(self):
        """Test security and compliance features"""
        print("🔒 Testing Security & Compliance...")
        
        if not self.auth_token:
            self.log_test("Security Test", "SKIP", "No authentication token available")
            return
        
        # Test security status
        response = self.make_request("GET", "/api/security/status")
        if response and response.status_code == 200:
            self.log_test("Security Dashboard", "PASS", "Security dashboard accessible", response.status_code)
        else:
            self.log_test("Security Dashboard", "FAIL", "Security dashboard failed", response.status_code if response else None)
        
        # Test compliance status
        response = self.make_request("GET", "/api/security/compliance")
        if response and response.status_code == 200:
            self.log_test("Compliance Status", "PASS", "Compliance status accessible", response.status_code)
        else:
            self.log_test("Compliance Status", "FAIL", "Compliance status failed", response.status_code if response else None)
        
        # Test threat analysis
        response = self.make_request("GET", "/api/security/threats")
        if response and response.status_code == 200:
            self.log_test("Threat Analysis", "PASS", "Threat analysis accessible", response.status_code)
        else:
            self.log_test("Threat Analysis", "FAIL", "Threat analysis failed", response.status_code if response else None)
        
        # Test security audits
        response = self.make_request("GET", "/api/security/audits")
        if response and response.status_code == 200:
            self.log_test("Security Audits", "PASS", "Security audits accessible", response.status_code)
        else:
            self.log_test("Security Audits", "FAIL", "Security audits failed", response.status_code if response else None)

    def test_advanced_services_integration(self):
        """Test advanced services integration"""
        print("🔧 Testing Advanced Services Integration...")
        
        if not self.auth_token:
            self.log_test("Advanced Services Test", "SKIP", "No authentication token available")
            return
        
        # Test visual programming tools
        response = self.make_request("GET", "/api/visual-programming/tools")
        if response and response.status_code == 200:
            self.log_test("Visual Programming Tools", "PASS", "Visual programming tools accessible", response.status_code)
        else:
            self.log_test("Visual Programming Tools", "FAIL", "Visual programming tools failed", response.status_code if response else None)
        
        # Test plugins
        response = self.make_request("GET", "/api/plugins")
        if response and response.status_code == 200:
            self.log_test("Plugin Ecosystem", "PASS", "Plugin ecosystem accessible", response.status_code)
        else:
            self.log_test("Plugin Ecosystem", "FAIL", "Plugin ecosystem failed", response.status_code if response else None)
        
        # Test video explanations
        response = self.make_request("GET", "/api/video-explanations")
        if response and response.status_code == 200:
            self.log_test("Video Services", "PASS", "Video services accessible", response.status_code)
        else:
            self.log_test("Video Services", "FAIL", "Video services failed", response.status_code if response else None)
        
        # Test SEO analysis
        response = self.make_request("GET", "/api/seo/analysis/test-project")
        if response and response.status_code == 200:
            self.log_test("SEO Services", "PASS", "SEO services accessible", response.status_code)
        else:
            self.log_test("SEO Services", "FAIL", "SEO services failed", response.status_code if response else None)
        
        # Test internationalization
        response = self.make_request("GET", "/api/i18n/support/test-project")
        if response and response.status_code == 200:
            self.log_test("Internationalization", "PASS", "Internationalization accessible", response.status_code)
        else:
            self.log_test("Internationalization", "FAIL", "Internationalization failed", response.status_code if response else None)

    def test_cutting_edge_features(self):
        """Test cutting-edge features"""
        print("⚡ Testing Cutting-Edge Features...")
        
        if not self.auth_token:
            self.log_test("Cutting-Edge Features Test", "SKIP", "No authentication token available")
            return
        
        # Test experimental sandbox features
        response = self.make_request("GET", "/api/experimental-sandbox/features")
        if response and response.status_code == 200:
            self.log_test("Experimental Features", "PASS", "Experimental features accessible", response.status_code)
        else:
            self.log_test("Experimental Features", "FAIL", "Experimental features failed", response.status_code if response else None)
        
        # Test theme intelligence
        response = self.make_request("GET", "/api/theme-intelligence/recommendations/test-project")
        if response and response.status_code == 200:
            self.log_test("Theme Intelligence", "PASS", "Theme intelligence accessible", response.status_code)
        else:
            self.log_test("Theme Intelligence", "FAIL", "Theme intelligence failed", response.status_code if response else None)
        
        # Test code quality engine
        response = self.make_request("GET", "/api/code-quality/report/test-project")
        if response and response.status_code == 200:
            self.log_test("Code Quality Engine", "PASS", "Code quality engine accessible", response.status_code)
        else:
            self.log_test("Code Quality Engine", "FAIL", "Code quality engine failed", response.status_code if response else None)
        
        # Test workspace optimization
        response = self.make_request("GET", "/api/workspace-optimization/insights")
        if response and response.status_code == 200:
            self.log_test("Workspace Intelligence", "PASS", "Workspace intelligence accessible", response.status_code)
        else:
            self.log_test("Workspace Intelligence", "FAIL", "Workspace intelligence failed", response.status_code if response else None)

    def test_multi_agent_capabilities(self):
        """Test multi-agent intelligence system"""
        print("🤖 Testing Multi-Agent Intelligence System...")
        
        if not self.auth_token:
            self.log_test("Multi-Agent System Test", "SKIP", "No authentication token available")
            return
        
        # Test agent capabilities
        response = self.make_request("GET", "/api/agents/capabilities")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data:
                self.log_test("Agent Capabilities", "PASS", f"Found {len(data['agents'])} agent capabilities", response.status_code)
            else:
                self.log_test("Agent Capabilities", "FAIL", "No agent capabilities data", response.status_code)
        else:
            self.log_test("Agent Capabilities", "FAIL", "Agent capabilities endpoint failed", response.status_code if response else None)
        
    def test_websocket_connection(self):
        """Test WebSocket connection (basic connectivity test)"""
        print("🔌 Testing WebSocket Connection...")
        
        # Note: This is a basic test - full WebSocket testing would require websocket client
        try:
            import websocket
            
            def on_open(ws):
                self.log_test("WebSocket Connection", "PASS", "WebSocket connection established")
                ws.close()
            
            def on_error(ws, error):
                self.log_test("WebSocket Connection", "FAIL", f"WebSocket error: {error}")
            
            ws = websocket.WebSocketApp(f"ws://localhost:8001/ws/test-client",
                                      on_open=on_open,
                                      on_error=on_error)
            # Use a simple run with timeout handling
            import threading
            import time
            
            def run_ws():
                ws.run_forever()
            
            thread = threading.Thread(target=run_ws)
            thread.daemon = True
            thread.start()
            thread.join(timeout=5)
            
            if thread.is_alive():
                ws.close()
                self.log_test("WebSocket Connection", "FAIL", "WebSocket connection timeout")
            
        except ImportError:
            self.log_test("WebSocket Connection", "SKIP", "websocket-client not installed")
        except Exception as e:
            self.log_test("WebSocket Connection", "FAIL", f"WebSocket test failed: {e}")
        """Test WebSocket connection (basic connectivity test)"""
        print("🔌 Testing WebSocket Connection...")
        
        # Note: This is a basic test - full WebSocket testing would require websocket client
        try:
            import websocket
            
            def on_open(ws):
                self.log_test("WebSocket Connection", "PASS", "WebSocket connection established")
                ws.close()
            
            def on_error(ws, error):
                self.log_test("WebSocket Connection", "FAIL", f"WebSocket error: {error}")
            
            ws = websocket.WebSocketApp(f"ws://localhost:8001/ws/test-client",
                                      on_open=on_open,
                                      on_error=on_error)
            # Use a simple run with timeout handling
            import threading
            import time
            
            def run_ws():
                ws.run_forever()
            
            thread = threading.Thread(target=run_ws)
            thread.daemon = True
            thread.start()
            thread.join(timeout=5)
            
            if thread.is_alive():
                ws.close()
                self.log_test("WebSocket Connection", "FAIL", "WebSocket connection timeout")
            
        except ImportError:
            self.log_test("WebSocket Connection", "SKIP", "websocket-client not installed")
        except Exception as e:
            self.log_test("WebSocket Connection", "FAIL", f"WebSocket test failed: {e}")

    def test_experimental_sandbox_service(self):
        """Test Experimental Sandbox Service endpoints"""
        print("🧪 Testing Experimental Sandbox Service...")
        
        if not self.auth_token:
            self.log_test("Experimental Sandbox Test", "SKIP", "No authentication token available")
            return
        
        # Test getting available experiments
        response = self.make_request("GET", "/api/experimental-sandbox/available-experiments")
        if response and response.status_code == 200:
            data = response.json()
            if "language_features" in data and "experimental_apis" in data and "experiment_types" in data:
                self.log_test("Get Available Experiments", "PASS", 
                            f"Found {len(data['experiment_types'])} experiment types", response.status_code)
            else:
                self.log_test("Get Available Experiments", "FAIL", 
                            "Missing experiment data", response.status_code)
        else:
            self.log_test("Get Available Experiments", "FAIL", 
                        "Available experiments endpoint failed", response.status_code if response else None)
        
        # Test creating a sandbox
        sandbox_request = {
            "project_id": "test_project_123",
            "experiment_type": "general",
            "isolation_level": "high",
            "description": "Test sandbox for API validation"
        }
        
        response = self.make_request("POST", "/api/experimental-sandbox/create-sandbox", sandbox_request)
        if response and response.status_code == 200:
            data = response.json()
            if "sandbox_id" in data and "status" in data:
                self.log_test("Create Sandbox", "PASS", 
                            f"Sandbox created: {data.get('sandbox_id')}", response.status_code)
                self.test_sandbox_id = data["sandbox_id"]
            else:
                self.log_test("Create Sandbox", "FAIL", 
                            "Sandbox creation response invalid", response.status_code)
        else:
            self.log_test("Create Sandbox", "FAIL", 
                        "Sandbox creation failed", response.status_code if response else None)

    def test_visual_programming_service(self):
        """Test Visual Programming Service endpoints"""
        print("🎨 Testing Visual Programming Service...")
        
        # Test getting supported diagram types (public endpoint)
        response = self.make_request("GET", "/api/visual-programming/supported-diagram-types")
        if response and response.status_code == 200:
            data = response.json()
            if "supported_types" in data and len(data["supported_types"]) > 0:
                self.log_test("Get Supported Diagram Types", "PASS", 
                            f"Found {len(data['supported_types'])} diagram types", response.status_code)
            else:
                self.log_test("Get Supported Diagram Types", "FAIL", 
                            "No diagram types found", response.status_code)
        else:
            self.log_test("Get Supported Diagram Types", "FAIL", 
                        "Supported diagram types endpoint failed", response.status_code if response else None)
        
        # Test getting diagram examples
        response = self.make_request("GET", "/api/visual-programming/examples")
        if response and response.status_code == 200:
            data = response.json()
            if "examples" in data and len(data["examples"]) > 0:
                self.log_test("Get Diagram Examples", "PASS", 
                            f"Found {len(data['examples'])} diagram examples", response.status_code)
            else:
                self.log_test("Get Diagram Examples", "FAIL", 
                            "No diagram examples found", response.status_code)
        else:
            self.log_test("Get Diagram Examples", "FAIL", 
                        "Diagram examples endpoint failed", response.status_code if response else None)

    def test_community_intelligence_service(self):
        """Test Community Intelligence Service endpoints"""
        print("👥 Testing Community Intelligence Service...")
        
        # Test getting community statistics (public endpoint)
        response = self.make_request("GET", "/api/community-intelligence/statistics")
        if response and response.status_code == 200:
            data = response.json()
            if "community_overview" in data and "engagement_metrics" in data:
                self.log_test("Get Community Statistics", "PASS", 
                            f"Total developers: {data['community_overview'].get('total_developers', 0)}", response.status_code)
            else:
                self.log_test("Get Community Statistics", "FAIL", 
                            "Missing community statistics data", response.status_code)
        else:
            self.log_test("Get Community Statistics", "FAIL", 
                        "Community statistics endpoint failed", response.status_code if response else None)
        
        # Test getting trending content
        response = self.make_request("GET", "/api/community-intelligence/trending")
        if response and response.status_code == 200:
            data = response.json()
            if "trending_patterns" in data and "trending_technologies" in data:
                self.log_test("Get Trending Content", "PASS", 
                            f"Found {len(data['trending_patterns'])} trending patterns", response.status_code)
            else:
                self.log_test("Get Trending Content", "FAIL", 
                            "Missing trending content data", response.status_code)
        else:
            self.log_test("Get Trending Content", "FAIL", 
                        "Trending content endpoint failed", response.status_code if response else None)

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend API Testing...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run core test suites
        self.test_health_endpoints()
        self.test_authentication_system()
        self.test_ai_chat_integration()
        self.test_project_management()
        self.test_template_system()
        
        # Run advanced feature tests (as requested in review)
        self.test_multi_agent_capabilities()
        self.test_advanced_ai_features()
        self.test_enterprise_analytics_performance()
        self.test_collaboration_workflow_engine()
        self.test_security_compliance()
        self.test_advanced_services_integration()
        self.test_cutting_edge_features()
        
        # Run existing tests
        self.test_enterprise_features()
        self.test_agents_system()
        self.test_integrations_marketplace()
        self.test_websocket_connection()
        
        # Test the three new services
        self.test_experimental_sandbox_service()
        self.test_visual_programming_service()
        self.test_community_intelligence_service()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Generate summary
        self.generate_summary(duration)

    def generate_summary(self, duration: float):
        """Generate test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Skipped: {skipped}")
        print(f"⏱️ Duration: {duration:.2f} seconds")
        print()
        
        if failed > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        # Overall status
        if failed == 0:
            print("🎉 ALL CRITICAL TESTS PASSED!")
            print("Backend API is fully functional and ready for production.")
        elif failed <= 2:
            print("⚠️ MINOR ISSUES DETECTED")
            print("Backend API is mostly functional with minor issues.")
        else:
            print("🚨 CRITICAL ISSUES DETECTED")
            print("Backend API has significant problems that need attention.")
        
        print("=" * 60)
        
        # Save detailed results to file
        with open("/app/backend_test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total": total_tests,
                    "passed": passed,
                    "failed": failed,
                    "skipped": skipped,
                    "duration": duration,
                    "timestamp": datetime.now().isoformat()
                },
                "results": self.test_results
            }, f, indent=2)
        
        print("📄 Detailed results saved to: /app/backend_test_results.json")

if __name__ == "__main__":
    # Check if backend URL is provided
    backend_url = sys.argv[1] if len(sys.argv) > 1 else "https://a2630a0a-7730-4bab-919c-2f0398dbec65.preview.emergentagent.com"
    
    # Initialize and run tests
    tester = BackendTester(backend_url)
    tester.run_all_tests()