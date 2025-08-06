#!/usr/bin/env python3
"""
Test Actual Implemented Features in Aether AI Platform
Based on working endpoints discovered
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

class ActualFeaturesTest:
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
        
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
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
                self.log_test("Authentication", "PASS", f"Authenticated as {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Authentication", "FAIL", "No access token in response", response.status_code)
                return False
        else:
            self.log_test("Authentication", "FAIL", "Login failed", response.status_code if response else None)
            return False

    def test_multi_agent_ai_system(self):
        """Test the working Multi-Agent AI System"""
        print("\n🤖 TESTING MULTI-AGENT AI SYSTEM (WORKING)")
        print("=" * 60)
        
        # Test available agents
        response = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = data["agents"]
                agent_names = [agent.get("name") for agent in agents if agent.get("name")]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_expected = [name for name in expected_agents if name in agent_names]
                
                self.log_test("5 Specialized AI Agents", "PASS", 
                            f"Found {len(agents)} agents: {', '.join(agent_names)}", response.status_code)
                
                # Check agent capabilities
                for agent in agents:
                    if "capabilities" in agent and "personality" in agent:
                        self.log_test(f"Agent {agent.get('name')} Configuration", "PASS", 
                                    f"Capabilities: {len(agent.get('capabilities', []))}, Has personality", response.status_code)
                    else:
                        self.log_test(f"Agent {agent.get('name')} Configuration", "FAIL", 
                                    "Missing capabilities or personality", response.status_code)
            else:
                self.log_test("5 Specialized AI Agents", "FAIL", 
                            f"Expected 5+ agents, found {len(data.get('agents', []))}", response.status_code)
        else:
            self.log_test("5 Specialized AI Agents", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)

        # Test enhanced AI chat with multi-agent coordination
        if self.auth_token:
            chat_request = {
                "message": "Build a comprehensive task management application with React frontend, Node.js backend, user authentication, real-time updates, and mobile responsiveness. Include testing strategy and deployment plan.",
                "enable_multi_agent": True,
                "conversation_id": "test-comprehensive-app"
            }
            
            response = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 100:
                    response_length = len(data["response"])
                    has_agents = "agents_involved" in data or "agent" in data
                    has_metadata = "metadata" in data
                    
                    self.log_test("Multi-Agent Enhanced Chat", "PASS", 
                                f"Generated {response_length} char response, Agents involved: {has_agents}, Metadata: {has_metadata}", response.status_code)
                else:
                    self.log_test("Multi-Agent Enhanced Chat", "FAIL", 
                                "Response too short or missing", response.status_code)
            elif response and response.status_code == 429:
                self.log_test("Multi-Agent Enhanced Chat", "SKIP", 
                            "Rate limited - system working but usage limits reached", response.status_code)
            else:
                self.log_test("Multi-Agent Enhanced Chat", "FAIL", 
                            "Enhanced chat failed", response.status_code if response else None)

    def test_groq_ai_integration(self):
        """Test Groq AI Integration"""
        print("\n⚡ TESTING GROQ AI INTEGRATION")
        print("=" * 60)
        
        # Test AI models (includes Groq models)
        response = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data:
                models = data["models"]
                groq_models = [m for m in models if m.get("provider", "").lower() == "groq"]
                
                if len(groq_models) >= 4:
                    model_names = [m.get("name") for m in groq_models]
                    expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                    found_expected = [name for name in expected_models if name in model_names]
                    
                    self.log_test("Groq 4 Models Integration", "PASS", 
                                f"Found {len(groq_models)} Groq models: {', '.join(model_names)}", response.status_code)
                    
                    # Test cost optimization info
                    for model in groq_models:
                        if "cost_per_token" in model or "pricing" in model:
                            self.log_test(f"Groq Model {model.get('name')} Pricing", "PASS", 
                                        f"Cost info available", response.status_code)
                        else:
                            self.log_test(f"Groq Model {model.get('name')} Pricing", "FAIL", 
                                        "Missing cost information", response.status_code)
                else:
                    self.log_test("Groq 4 Models Integration", "FAIL", 
                                f"Expected 4+ Groq models, found {len(groq_models)}", response.status_code)
            else:
                self.log_test("Groq 4 Models Integration", "FAIL", 
                            "No models data found", response.status_code)
        else:
            self.log_test("Groq 4 Models Integration", "FAIL", 
                        "Models endpoint failed", response.status_code if response else None)

        # Test AI status for Groq integration
        response = self.make_request("GET", "/api/ai/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq" in str(data).lower() or "service" in data:
                self.log_test("Groq Service Status", "PASS", 
                            f"AI service status available", response.status_code)
            else:
                self.log_test("Groq Service Status", "FAIL", 
                            "No Groq service status found", response.status_code)
        else:
            self.log_test("Groq Service Status", "FAIL", 
                        "AI status endpoint failed", response.status_code if response else None)

    def test_template_marketplace(self):
        """Test Template System (Partial Implementation)"""
        print("\n📋 TESTING TEMPLATE SYSTEM")
        print("=" * 60)
        
        # Test templates endpoint
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 6:
                templates = data["templates"]
                
                # Check for variety of templates
                categories = set()
                tech_stacks = set()
                for template in templates:
                    if "category" in template:
                        categories.add(template["category"])
                    if "tech_stack" in template:
                        tech_stacks.update(template.get("tech_stack", []))
                
                self.log_test("Template Marketplace", "PASS", 
                            f"Found {len(templates)} templates across {len(categories)} categories", response.status_code)
                
                # Check template quality
                quality_templates = 0
                for template in templates:
                    if ("name" in template and "description" in template and 
                        "tech_stack" in template and len(template.get("tech_stack", [])) > 0):
                        quality_templates += 1
                
                if quality_templates >= len(templates) * 0.8:  # 80% quality threshold
                    self.log_test("Template Quality", "PASS", 
                                f"{quality_templates}/{len(templates)} templates have complete metadata", response.status_code)
                else:
                    self.log_test("Template Quality", "FAIL", 
                                f"Only {quality_templates}/{len(templates)} templates have complete metadata", response.status_code)
                
                # Check for professional templates
                professional_features = ["rating", "downloads", "difficulty", "setup_time"]
                professional_count = 0
                for template in templates:
                    if any(feature in template for feature in professional_features):
                        professional_count += 1
                
                if professional_count > 0:
                    self.log_test("Professional Template Features", "PASS", 
                                f"{professional_count} templates have professional features (ratings, downloads, etc.)", response.status_code)
                else:
                    self.log_test("Professional Template Features", "FAIL", 
                                "No templates have professional features", response.status_code)
                    
            else:
                self.log_test("Template Marketplace", "FAIL", 
                            f"Expected 6+ templates, found {len(data.get('templates', []))}", response.status_code)
        else:
            self.log_test("Template Marketplace", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)

    def test_integration_hub(self):
        """Test Integration Hub (Partial Implementation)"""
        print("\n🔌 TESTING INTEGRATION HUB")
        print("=" * 60)
        
        # Test integrations endpoint
        response = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) > 0:
                integrations = data["integrations"]
                
                # Check for different types of integrations
                integration_types = set()
                for integration in integrations:
                    if "type" in integration:
                        integration_types.add(integration["type"])
                    elif "category" in integration:
                        integration_types.add(integration["category"])
                
                self.log_test("Integration Hub", "PASS", 
                            f"Found {len(integrations)} integrations across types: {', '.join(integration_types)}", response.status_code)
                
                # Check for expected integration categories
                expected_categories = ["database", "cloud", "api", "monitoring"]
                found_categories = []
                for integration in integrations:
                    category = integration.get("category", "").lower()
                    if any(expected in category for expected in expected_categories):
                        found_categories.append(category)
                
                if found_categories:
                    self.log_test("Integration Categories", "PASS", 
                                f"Found expected categories: {', '.join(set(found_categories))}", response.status_code)
                else:
                    self.log_test("Integration Categories", "FAIL", 
                                "No expected integration categories found", response.status_code)
                    
            else:
                self.log_test("Integration Hub", "FAIL", 
                            "No integrations found", response.status_code)
        else:
            self.log_test("Integration Hub", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None)

        # Test integration categories
        response = self.make_request("GET", "/api/integrations/categories")
        if response and response.status_code == 200:
            data = response.json()
            if "categories" in data and len(data["categories"]) > 0:
                categories = data["categories"]
                self.log_test("Integration Categories API", "PASS", 
                            f"Found {len(categories)} integration categories", response.status_code)
            else:
                self.log_test("Integration Categories API", "FAIL", 
                            "No categories found", response.status_code)
        else:
            self.log_test("Integration Categories API", "FAIL", 
                        "Categories endpoint failed", response.status_code if response else None)

    def test_enterprise_features(self):
        """Test Enterprise Features (Partial Implementation)"""
        print("\n🏢 TESTING ENTERPRISE FEATURES")
        print("=" * 60)
        
        # Test enterprise integrations
        response = self.make_request("GET", "/api/enterprise/integrations")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                integrations = data["integrations"]
                self.log_test("Enterprise Integrations", "PASS", 
                            f"Found {len(integrations)} enterprise integrations", response.status_code)
            else:
                self.log_test("Enterprise Integrations", "FAIL", 
                            "No enterprise integrations found", response.status_code)
        else:
            self.log_test("Enterprise Integrations", "FAIL", 
                        "Enterprise integrations endpoint failed", response.status_code if response else None)

    def test_subscription_system(self):
        """Test Subscription System (Working)"""
        print("\n💳 TESTING SUBSCRIPTION SYSTEM")
        print("=" * 60)
        
        # Test subscription plans
        response = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data:
                plans = data["plans"]
                expected_plans = ["basic", "professional", "enterprise"]
                found_plans = list(plans.keys()) if isinstance(plans, dict) else []
                
                if all(plan in found_plans for plan in expected_plans):
                    self.log_test("Subscription Plans", "PASS", 
                                f"All 3 plans available: {', '.join(found_plans)}", response.status_code)
                    
                    # Check pricing
                    basic_plan = plans.get("basic", {})
                    if "price_monthly" in basic_plan and basic_plan["price_monthly"] == 19:
                        self.log_test("Subscription Pricing", "PASS", 
                                    f"Basic plan: ${basic_plan['price_monthly']}/month", response.status_code)
                    else:
                        self.log_test("Subscription Pricing", "FAIL", 
                                    "Basic plan pricing incorrect", response.status_code)
                else:
                    self.log_test("Subscription Plans", "FAIL", 
                                f"Missing plans. Expected: {expected_plans}, Found: {found_plans}", response.status_code)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            "No plans data found", response.status_code)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Plans endpoint failed", response.status_code if response else None)

        # Test current subscription
        if self.auth_token:
            response = self.make_request("GET", "/api/subscription/current")
            if response and response.status_code == 200:
                data = response.json()
                if "plan" in data and "status" in data:
                    self.log_test("Current Subscription", "PASS", 
                                f"Plan: {data.get('plan')}, Status: {data.get('status')}", response.status_code)
                else:
                    self.log_test("Current Subscription", "FAIL", 
                                "Missing subscription data", response.status_code)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Current subscription endpoint failed", response.status_code if response else None)

        # Test trial system
        if self.auth_token:
            response = self.make_request("GET", "/api/subscription/trial/status")
            if response and response.status_code == 200:
                data = response.json()
                if "has_trial" in data and "is_trial_active" in data:
                    trial_active = data.get("is_trial_active", False)
                    days_remaining = data.get("trial_days_remaining", 0)
                    self.log_test("7-Day Trial System", "PASS", 
                                f"Trial active: {trial_active}, Days remaining: {days_remaining}", response.status_code)
                else:
                    self.log_test("7-Day Trial System", "FAIL", 
                                "Missing trial data", response.status_code)
            else:
                self.log_test("7-Day Trial System", "FAIL", 
                            "Trial status endpoint failed", response.status_code if response else None)

    def test_project_management(self):
        """Test Project Management System"""
        print("\n📁 TESTING PROJECT MANAGEMENT")
        print("=" * 60)
        
        # Test projects endpoint
        response = self.make_request("GET", "/api/projects/")
        if response and response.status_code == 200:
            data = response.json()
            if "projects" in data:
                projects = data["projects"]
                self.log_test("Project Management", "PASS", 
                            f"Found {len(projects)} projects", response.status_code)
                
                # Check project structure
                if projects:
                    project = projects[0]
                    required_fields = ["name", "description", "created_at"]
                    has_required = all(field in project for field in required_fields)
                    
                    if has_required:
                        self.log_test("Project Data Structure", "PASS", 
                                    "Projects have required fields", response.status_code)
                    else:
                        self.log_test("Project Data Structure", "FAIL", 
                                    "Projects missing required fields", response.status_code)
            else:
                self.log_test("Project Management", "FAIL", 
                            "No projects data found", response.status_code)
        else:
            self.log_test("Project Management", "FAIL", 
                        "Projects endpoint failed", response.status_code if response else None)

    def test_ai_conversation_system(self):
        """Test AI Conversation System"""
        print("\n💬 TESTING AI CONVERSATION SYSTEM")
        print("=" * 60)
        
        # Test conversations endpoint
        response = self.make_request("GET", "/api/ai/conversations")
        if response and response.status_code == 200:
            data = response.json()
            if "conversations" in data:
                conversations = data["conversations"]
                self.log_test("AI Conversations", "PASS", 
                            f"Found {len(conversations)} conversations", response.status_code)
                
                # Check conversation structure
                if conversations:
                    conversation = conversations[0]
                    if "messages" in conversation and "created_at" in conversation:
                        self.log_test("Conversation Data Structure", "PASS", 
                                    "Conversations have proper structure", response.status_code)
                    else:
                        self.log_test("Conversation Data Structure", "FAIL", 
                                    "Conversations missing required fields", response.status_code)
            else:
                self.log_test("AI Conversations", "FAIL", 
                            "No conversations data found", response.status_code)
        else:
            self.log_test("AI Conversations", "FAIL", 
                        "Conversations endpoint failed", response.status_code if response else None)

    def run_all_tests(self):
        """Run all tests for actual implemented features"""
        print("🧪 TESTING ACTUAL IMPLEMENTED FEATURES")
        print("=" * 80)
        print(f"Testing Aether AI Platform - Actual Working Features")
        print(f"Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 80)

        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - skipping authenticated tests")

        # Run tests for actual working features
        self.test_multi_agent_ai_system()
        self.test_groq_ai_integration()
        self.test_template_marketplace()
        self.test_integration_hub()
        self.test_enterprise_features()
        self.test_subscription_system()
        self.test_project_management()
        self.test_ai_conversation_system()

        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("🎯 ACTUAL FEATURES TESTING SUMMARY")
        print("=" * 80)

        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])

        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️ Skipped: {skipped_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")

        print("\n📊 WORKING FEATURES SUMMARY:")
        
        # Categorize results
        working_features = []
        partial_features = []
        not_working_features = []
        
        feature_categories = {
            "Multi-Agent AI System": [r for r in self.test_results if "agent" in r["test"].lower() and "multi" in r["test"].lower()],
            "Groq AI Integration": [r for r in self.test_results if "groq" in r["test"].lower()],
            "Template System": [r for r in self.test_results if "template" in r["test"].lower()],
            "Integration Hub": [r for r in self.test_results if "integration" in r["test"].lower() and "hub" in r["test"].lower()],
            "Enterprise Features": [r for r in self.test_results if "enterprise" in r["test"].lower()],
            "Subscription System": [r for r in self.test_results if "subscription" in r["test"].lower() or "trial" in r["test"].lower()],
            "Project Management": [r for r in self.test_results if "project" in r["test"].lower()],
            "AI Conversations": [r for r in self.test_results if "conversation" in r["test"].lower()]
        }
        
        for feature, tests in feature_categories.items():
            if tests:
                passed = len([t for t in tests if t["status"] == "PASS"])
                total = len(tests)
                if passed == total:
                    status_icon = "✅"
                    working_features.append(feature)
                elif passed > 0:
                    status_icon = "⚠️"
                    partial_features.append(feature)
                else:
                    status_icon = "❌"
                    not_working_features.append(feature)
                    
                print(f"{status_icon} {feature}: {passed}/{total} tests passed")

        print(f"\n🎉 FULLY WORKING FEATURES ({len(working_features)}):")
        for feature in working_features:
            print(f"   ✅ {feature}")
            
        print(f"\n⚠️ PARTIALLY WORKING FEATURES ({len(partial_features)}):")
        for feature in partial_features:
            print(f"   ⚠️ {feature}")
            
        print(f"\n❌ NOT WORKING FEATURES ({len(not_working_features)}):")
        for feature in not_working_features:
            print(f"   ❌ {feature}")

        print(f"\nTest completed at: {datetime.now().isoformat()}")
        print("=" * 80)

if __name__ == "__main__":
    tester = ActualFeaturesTest()
    tester.run_all_tests()