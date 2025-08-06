#!/usr/bin/env python3
"""
COMPREHENSIVE 8 COMPETITIVE FEATURES TESTING - JANUARY 2025
Backend API Testing for Aether AI Platform
Tests all 8 competitive features for production readiness
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CompetitiveFeaturesTester:
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

    def authenticate(self):
        """Authenticate with demo user"""
        print("🔐 Authenticating with demo user...")
        
        response = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo User Authentication", "PASS", 
                            f"Token received for {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Demo User Authentication", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Demo User Authentication", "FAIL", 
                        "Login failed", response.status_code if response else None)
        return False

    def test_1_integration_hub(self):
        """Test Integration Hub - 12+ integrations across categories"""
        print("🔌 TESTING FEATURE 1: INTEGRATION HUB")
        print("-" * 50)
        
        # Test main integrations endpoint
        response = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) >= 12:
                integrations = data["integrations"]
                self.log_test("Integration Hub - Count", "PASS", 
                            f"Found {len(integrations)} integrations (12+ required)", response.status_code)
                
                # Check integration quality
                quality_check = True
                categories = set()
                for integration in integrations:
                    if not all(key in integration for key in ["name", "category", "description"]):
                        quality_check = False
                        break
                    categories.add(integration.get("category"))
                
                if quality_check:
                    self.log_test("Integration Hub - Quality", "PASS", 
                                f"All integrations have complete metadata across {len(categories)} categories", response.status_code)
                else:
                    self.log_test("Integration Hub - Quality", "FAIL", 
                                "Some integrations missing required metadata", response.status_code)
            else:
                self.log_test("Integration Hub - Count", "FAIL", 
                            f"Insufficient integrations: {len(data.get('integrations', []))}/12 required", response.status_code)
        else:
            self.log_test("Integration Hub", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None)
        
        # Test integration categories
        response = self.make_request("GET", "/api/integrations/categories")
        if response and response.status_code == 200:
            data = response.json()
            if "categories" in data and len(data["categories"]) >= 4:
                self.log_test("Integration Categories", "PASS", 
                            f"Found {len(data['categories'])} integration categories", response.status_code)
            else:
                self.log_test("Integration Categories", "FAIL", 
                            f"Insufficient categories: {len(data.get('categories', []))}", response.status_code)
        else:
            self.log_test("Integration Categories", "FAIL", 
                        "Categories endpoint failed", response.status_code if response else None)

    def test_2_template_marketplace(self):
        """Test Template Marketplace - 20+ professional templates"""
        print("📁 TESTING FEATURE 2: TEMPLATE MARKETPLACE")
        print("-" * 50)
        
        # Test templates endpoint
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 20:
                templates = data["templates"]
                self.log_test("Template Marketplace - Count", "PASS", 
                            f"Found {len(templates)} templates (20+ required)", response.status_code)
                
                # Check template quality
                quality_check = True
                categories = set()
                tech_stacks = set()
                for template in templates:
                    if not all(key in template for key in ["name", "description", "category"]):
                        quality_check = False
                        break
                    categories.add(template.get("category"))
                    if "tech_stack" in template:
                        tech_stacks.add(str(template.get("tech_stack")))
                
                if quality_check and len(categories) >= 8:
                    self.log_test("Template Marketplace - Quality", "PASS", 
                                f"Professional templates across {len(categories)} categories with {len(tech_stacks)} tech stacks", response.status_code)
                else:
                    self.log_test("Template Marketplace - Quality", "FAIL", 
                                f"Quality issues. Categories: {len(categories)}, Quality: {quality_check}", response.status_code)
            else:
                self.log_test("Template Marketplace - Count", "FAIL", 
                            f"Insufficient templates: {len(data.get('templates', []))}/20 required", response.status_code)
        else:
            self.log_test("Template Marketplace", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)
        
        # Test featured templates
        response = self.make_request("GET", "/api/templates/featured")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                self.log_test("Featured Templates", "PASS", 
                            f"Found {len(data['templates'])} featured templates", response.status_code)
            else:
                self.log_test("Featured Templates", "FAIL", 
                            "No featured templates data", response.status_code)
        else:
            self.log_test("Featured Templates", "FAIL", 
                        "Featured templates endpoint failed", response.status_code if response else None)

    def test_3_multi_model_architecture(self):
        """Test Multi-Model Architecture - 4 Groq models + 5 AI agents"""
        print("🤖 TESTING FEATURE 3: MULTI-MODEL ARCHITECTURE")
        print("-" * 50)
        
        # Test AI service status
        response = self.make_request("GET", "/api/ai/v3/status")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_models" in data and len(data["groq_models"]) >= 4:
                models = data["groq_models"]
                expected_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                found_models = [model.get("name") for model in models if isinstance(model, dict)]
                
                if all(model in found_models for model in expected_models):
                    self.log_test("Multi-Model Architecture - Groq Models", "PASS", 
                                f"All 4 Groq models available: {', '.join(found_models)}", response.status_code)
                else:
                    self.log_test("Multi-Model Architecture - Groq Models", "FAIL", 
                                f"Missing expected models. Found: {found_models}", response.status_code)
            else:
                self.log_test("Multi-Model Architecture - Groq Models", "FAIL", 
                            f"Insufficient models: {len(data.get('groq_models', []))}/4 required", response.status_code)
        else:
            self.log_test("Multi-Model Architecture - Status", "FAIL", 
                        "AI status endpoint failed", response.status_code if response else None)
        
        # Test available agents
        response = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data and len(data["agents"]) >= 5:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if isinstance(agent, dict)]
                
                if all(agent in found_agents for agent in expected_agents):
                    self.log_test("Multi-Model Architecture - AI Agents", "PASS", 
                                f"All 5 specialized agents available: {', '.join(found_agents)}", response.status_code)
                else:
                    self.log_test("Multi-Model Architecture - AI Agents", "FAIL", 
                                f"Missing expected agents. Found: {found_agents}", response.status_code)
            else:
                self.log_test("Multi-Model Architecture - AI Agents", "FAIL", 
                            f"Insufficient agents: {len(data.get('agents', []))}/5 required", response.status_code)
        else:
            self.log_test("Multi-Model Architecture - Agents", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)

    def test_4_enterprise_compliance(self):
        """Test Enterprise Compliance - SOC2, GDPR, HIPAA"""
        print("🏢 TESTING FEATURE 4: ENTERPRISE COMPLIANCE")
        print("-" * 50)
        
        # Test compliance dashboard
        response = self.make_request("GET", "/api/compliance/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if "compliance_status" in data:
                self.log_test("Enterprise Compliance - Dashboard", "PASS", 
                            f"Compliance dashboard accessible with status data", response.status_code)
            else:
                self.log_test("Enterprise Compliance - Dashboard", "FAIL", 
                            "Missing compliance status data", response.status_code)
        else:
            self.log_test("Enterprise Compliance - Dashboard", "FAIL", 
                        "Compliance dashboard endpoint failed", response.status_code if response else None)
        
        # Test SOC2 compliance
        response = self.make_request("GET", "/api/compliance/soc2/status")
        if response and response.status_code == 200:
            data = response.json()
            if "soc2_status" in data:
                self.log_test("SOC2 Compliance", "PASS", 
                            f"SOC2 compliance tracking available", response.status_code)
            else:
                self.log_test("SOC2 Compliance", "FAIL", 
                            "Missing SOC2 status data", response.status_code)
        else:
            self.log_test("SOC2 Compliance", "FAIL", 
                        "SOC2 endpoint not implemented", response.status_code if response else None)
        
        # Test GDPR compliance
        response = self.make_request("GET", "/api/compliance/gdpr/status")
        if response and response.status_code == 200:
            data = response.json()
            if "gdpr_status" in data:
                self.log_test("GDPR Compliance", "PASS", 
                            f"GDPR compliance tracking available", response.status_code)
            else:
                self.log_test("GDPR Compliance", "FAIL", 
                            "Missing GDPR status data", response.status_code)
        else:
            self.log_test("GDPR Compliance", "FAIL", 
                        "GDPR endpoint not implemented", response.status_code if response else None)
        
        # Test HIPAA compliance
        response = self.make_request("GET", "/api/compliance/hipaa/status")
        if response and response.status_code == 200:
            data = response.json()
            if "hipaa_status" in data:
                self.log_test("HIPAA Compliance", "PASS", 
                            f"HIPAA compliance tracking available", response.status_code)
            else:
                self.log_test("HIPAA Compliance", "FAIL", 
                            "Missing HIPAA status data", response.status_code)
        else:
            self.log_test("HIPAA Compliance", "FAIL", 
                        "HIPAA endpoint not implemented", response.status_code if response else None)

    def test_5_mobile_experience(self):
        """Test Mobile Experience - PWA, offline sync"""
        print("📱 TESTING FEATURE 5: MOBILE EXPERIENCE")
        print("-" * 50)
        
        # Test mobile health
        response = self.make_request("GET", "/api/mobile/health")
        if response and response.status_code == 200:
            data = response.json()
            if "mobile_optimized" in data and "pwa_ready" in data:
                self.log_test("Mobile Experience - Health", "PASS", 
                            f"Mobile optimization: {data.get('mobile_optimized')}, PWA: {data.get('pwa_ready')}", response.status_code)
            else:
                self.log_test("Mobile Experience - Health", "FAIL", 
                            "Missing mobile optimization indicators", response.status_code)
        else:
            self.log_test("Mobile Experience - Health", "FAIL", 
                        "Mobile health endpoint not implemented", response.status_code if response else None)
        
        # Test PWA manifest
        response = self.make_request("GET", "/api/mobile/pwa/manifest")
        if response and response.status_code == 200:
            data = response.json()
            if "name" in data and "icons" in data:
                self.log_test("PWA Manifest", "PASS", 
                            f"PWA manifest available with app name: {data.get('name')}", response.status_code)
            else:
                self.log_test("PWA Manifest", "FAIL", 
                            "Invalid PWA manifest structure", response.status_code)
        else:
            self.log_test("PWA Manifest", "FAIL", 
                        "PWA manifest endpoint not implemented", response.status_code if response else None)
        
        # Test offline sync
        response = self.make_request("GET", "/api/mobile/offline/sync")
        if response and response.status_code == 200:
            data = response.json()
            if "sync_enabled" in data:
                self.log_test("Offline Sync", "PASS", 
                            f"Offline sync capability: {data.get('sync_enabled')}", response.status_code)
            else:
                self.log_test("Offline Sync", "FAIL", 
                            "Missing offline sync data", response.status_code)
        else:
            self.log_test("Offline Sync", "FAIL", 
                        "Offline sync endpoint not implemented", response.status_code if response else None)

    def test_6_advanced_analytics(self):
        """Test Advanced Analytics - Dashboard, third-party"""
        print("📊 TESTING FEATURE 6: ADVANCED ANALYTICS")
        print("-" * 50)
        
        # Test analytics dashboard
        response = self.make_request("GET", "/api/analytics/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if "metrics" in data and "charts" in data:
                self.log_test("Advanced Analytics - Dashboard", "PASS", 
                            f"Analytics dashboard with {len(data.get('metrics', []))} metrics", response.status_code)
            else:
                self.log_test("Advanced Analytics - Dashboard", "FAIL", 
                            "Missing dashboard metrics or charts", response.status_code)
        else:
            self.log_test("Advanced Analytics - Dashboard", "FAIL", 
                        "Analytics dashboard endpoint not implemented", response.status_code if response else None)
        
        # Test third-party integrations
        response = self.make_request("GET", "/api/analytics/integrations")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                integrations = data["integrations"]
                expected_integrations = ["google_analytics", "mixpanel", "amplitude"]
                found_integrations = [i.get("name") for i in integrations if isinstance(i, dict)]
                
                if any(integration in found_integrations for integration in expected_integrations):
                    self.log_test("Analytics Third-Party Integrations", "PASS", 
                                f"Third-party analytics integrations available: {found_integrations}", response.status_code)
                else:
                    self.log_test("Analytics Third-Party Integrations", "FAIL", 
                                f"No major analytics integrations found: {found_integrations}", response.status_code)
            else:
                self.log_test("Analytics Third-Party Integrations", "FAIL", 
                            "Missing integrations data", response.status_code)
        else:
            self.log_test("Analytics Third-Party Integrations", "FAIL", 
                        "Analytics integrations endpoint not implemented", response.status_code if response else None)
        
        # Test deep tracing
        response = self.make_request("GET", "/api/analytics/tracing")
        if response and response.status_code == 200:
            data = response.json()
            if "tracing_enabled" in data:
                self.log_test("Deep Tracing", "PASS", 
                            f"Deep tracing capability: {data.get('tracing_enabled')}", response.status_code)
            else:
                self.log_test("Deep Tracing", "FAIL", 
                            "Missing tracing data", response.status_code)
        else:
            self.log_test("Deep Tracing", "FAIL", 
                        "Deep tracing endpoint not implemented", response.status_code if response else None)

    def test_7_enhanced_onboarding(self):
        """Test Enhanced Onboarding - Setup wizard"""
        print("🚀 TESTING FEATURE 7: ENHANCED ONBOARDING")
        print("-" * 50)
        
        # Test onboarding health
        response = self.make_request("GET", "/api/onboarding/health")
        if response and response.status_code == 200:
            data = response.json()
            if "one_click_deploy" in data and "guided_setup" in data:
                self.log_test("Enhanced Onboarding - Health", "PASS", 
                            f"One-click deploy: {data.get('one_click_deploy')}, Guided setup: {data.get('guided_setup')}", response.status_code)
            else:
                self.log_test("Enhanced Onboarding - Health", "FAIL", 
                            "Missing onboarding features", response.status_code)
        else:
            self.log_test("Enhanced Onboarding - Health", "FAIL", 
                        "Onboarding health endpoint not implemented", response.status_code if response else None)
        
        # Test setup wizard
        response = self.make_request("GET", "/api/onboarding/wizard/steps")
        if response and response.status_code == 200:
            data = response.json()
            if "steps" in data and len(data["steps"]) >= 3:
                self.log_test("Setup Wizard", "PASS", 
                            f"Setup wizard with {len(data['steps'])} steps available", response.status_code)
            else:
                self.log_test("Setup Wizard", "FAIL", 
                            f"Insufficient wizard steps: {len(data.get('steps', []))}", response.status_code)
        else:
            self.log_test("Setup Wizard", "FAIL", 
                        "Setup wizard endpoint not implemented", response.status_code if response else None)
        
        # Test one-click deployment
        response = self.make_request("GET", "/api/onboarding/deployment")
        if response and response.status_code == 200:
            data = response.json()
            if "deployment_options" in data:
                self.log_test("One-Click Deployment", "PASS", 
                            f"Deployment options available: {len(data.get('deployment_options', []))}", response.status_code)
            else:
                self.log_test("One-Click Deployment", "FAIL", 
                            "Missing deployment options", response.status_code)
        else:
            self.log_test("One-Click Deployment", "FAIL", 
                        "One-click deployment endpoint not implemented", response.status_code if response else None)

    def test_8_workflow_builder(self):
        """Test Workflow Builder - Visual drag-and-drop"""
        print("🔄 TESTING FEATURE 8: WORKFLOW BUILDER")
        print("-" * 50)
        
        # Test workflow health
        response = self.make_request("GET", "/api/workflows/health")
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_engine" in data:
                self.log_test("Workflow Builder - Health", "PASS", 
                            f"Workflow engine status: {data.get('workflow_engine')}", response.status_code)
            else:
                self.log_test("Workflow Builder - Health", "FAIL", 
                            "Missing workflow engine status", response.status_code)
        else:
            self.log_test("Workflow Builder - Health", "FAIL", 
                        "Workflow health endpoint not implemented", response.status_code if response else None)
        
        # Test workflow templates
        response = self.make_request("GET", "/api/workflows/templates")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) >= 5:
                self.log_test("Workflow Templates", "PASS", 
                            f"Found {len(data['templates'])} workflow templates", response.status_code)
            else:
                self.log_test("Workflow Templates", "FAIL", 
                            f"Insufficient workflow templates: {len(data.get('templates', []))}", response.status_code)
        else:
            self.log_test("Workflow Templates", "FAIL", 
                        "Workflow templates endpoint not implemented", response.status_code if response else None)
        
        # Test workflow creation
        workflow_data = {
            "name": "Test Workflow",
            "description": "A test workflow for validation",
            "steps": [
                {"type": "trigger", "name": "Start"},
                {"type": "action", "name": "Process"},
                {"type": "condition", "name": "Check"},
                {"type": "action", "name": "Complete"}
            ]
        }
        
        response = self.make_request("POST", "/api/workflows/create", workflow_data)
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_id" in data and "status" in data:
                self.log_test("Workflow Creation", "PASS", 
                            f"Workflow created with ID: {data.get('workflow_id')}", response.status_code)
            else:
                self.log_test("Workflow Creation", "FAIL", 
                            "Invalid workflow creation response", response.status_code)
        else:
            self.log_test("Workflow Creation", "FAIL", 
                        "Workflow creation endpoint not implemented", response.status_code if response else None)

    def run_comprehensive_test(self):
        """Run comprehensive test of all 8 competitive features"""
        print("🎯 AETHER AI PLATFORM - 8 COMPETITIVE FEATURES TESTING")
        print("=" * 60)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with testing")
            return
        
        print("\n🚀 TESTING ALL 8 COMPETITIVE FEATURES...")
        print("=" * 60)
        
        # Test all 8 competitive features
        self.test_1_integration_hub()
        self.test_2_template_marketplace()
        self.test_3_multi_model_architecture()
        self.test_4_enterprise_compliance()
        self.test_5_mobile_experience()
        self.test_6_advanced_analytics()
        self.test_7_enhanced_onboarding()
        self.test_8_workflow_builder()
        
        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"⚠️ Skipped: {skipped_tests} ({skipped_tests/total_tests*100:.1f}%)")
        print()
        
        # Feature-by-feature summary
        features = [
            "Integration Hub",
            "Template Marketplace", 
            "Multi-Model Architecture",
            "Enterprise Compliance",
            "Mobile Experience",
            "Advanced Analytics",
            "Enhanced Onboarding",
            "Workflow Builder"
        ]
        
        print("🎯 COMPETITIVE FEATURES STATUS:")
        print("-" * 40)
        
        feature_status = {}
        for i, feature in enumerate(features, 1):
            feature_tests = [r for r in self.test_results if feature.lower().replace(" ", "_") in r["test"].lower()]
            if feature_tests:
                feature_passed = len([r for r in feature_tests if r["status"] == "PASS"])
                feature_total = len(feature_tests)
                feature_percentage = feature_passed / feature_total * 100 if feature_total > 0 else 0
                
                if feature_percentage >= 80:
                    status = "✅ WORKING"
                elif feature_percentage >= 50:
                    status = "⚠️ PARTIAL"
                else:
                    status = "❌ FAILED"
                
                feature_status[feature] = status
                print(f"{i}. {feature}: {status} ({feature_passed}/{feature_total} tests passed)")
            else:
                feature_status[feature] = "❌ NOT TESTED"
                print(f"{i}. {feature}: ❌ NOT TESTED")
        
        print()
        
        # Overall assessment
        working_features = len([s for s in feature_status.values() if "✅" in s])
        partial_features = len([s for s in feature_status.values() if "⚠️" in s])
        failed_features = len([s for s in feature_status.values() if "❌" in s])
        
        print("🏆 OVERALL COMPETITIVE ASSESSMENT:")
        print("-" * 40)
        print(f"✅ Fully Working Features: {working_features}/8 ({working_features/8*100:.1f}%)")
        print(f"⚠️ Partially Working Features: {partial_features}/8 ({partial_features/8*100:.1f}%)")
        print(f"❌ Failed/Missing Features: {failed_features}/8 ({failed_features/8*100:.1f}%)")
        print()
        
        # Final verdict
        if working_features >= 6:
            verdict = "🎉 EXCELLENT - Production Ready"
        elif working_features >= 4:
            verdict = "👍 GOOD - Minor Issues to Address"
        elif working_features >= 2:
            verdict = "⚠️ NEEDS WORK - Major Issues Present"
        else:
            verdict = "❌ CRITICAL - Significant Development Required"
        
        print(f"FINAL VERDICT: {verdict}")
        print()
        
        # Detailed failure analysis
        if failed_tests > 0:
            print("🔍 FAILED TESTS ANALYSIS:")
            print("-" * 30)
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['details']}")
            print()
        
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 60)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - 8 Competitive Features Test")
    print(f"Backend URL: {backend_url}")
    
    tester = CompetitiveFeaturesTester(backend_url)
    tester.run_comprehensive_test()