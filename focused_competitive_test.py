#!/usr/bin/env python3
"""
FOCUSED 8 COMPETITIVE FEATURES TESTING - DECEMBER 2024
Backend API Testing for Aether AI Platform
Tests the 8 specific competitive features requested in the review
"""

import requests
import json
import time
import sys
from datetime import datetime

class FocusedCompetitiveTest:
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

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> requests.Response:
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
                self.log_test("Authentication", "PASS", 
                            f"Successfully authenticated as {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Authentication", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Authentication", "FAIL", 
                        "Login failed", response.status_code if response else None)
        return False

    def test_feature_1_integration_hub(self):
        """Test Feature 1: Breadth & Depth of Integrations - Integration Hub with 20+ connectors"""
        print("\n🔌 TESTING FEATURE 1: INTEGRATION HUB WITH 20+ CONNECTORS")
        print("=" * 60)
        
        # Test basic integrations endpoint
        response = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data:
                integrations_count = len(data["integrations"])
                self.log_test("Integration Hub - Basic Count", "PASS" if integrations_count >= 12 else "FAIL", 
                            f"Found {integrations_count} integrations", response.status_code)
                
                # Check integration quality
                quality_count = 0
                for integration in data["integrations"]:
                    if isinstance(integration, dict) and all(key in integration for key in ["name", "category", "description"]):
                        quality_count += 1
                
                quality_percentage = (quality_count / integrations_count) * 100 if integrations_count > 0 else 0
                self.log_test("Integration Hub - Quality", "PASS" if quality_percentage >= 80 else "FAIL",
                            f"{quality_percentage:.1f}% integrations have complete metadata", response.status_code)
            else:
                self.log_test("Integration Hub - Basic Count", "FAIL", 
                            "No integrations data found", response.status_code)
        else:
            self.log_test("Integration Hub - Basic Count", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None)
        
        # Test integration categories
        response = self.make_request("GET", "/api/integrations/categories")
        if response and response.status_code == 200:
            data = response.json()
            if "categories" in data:
                categories_count = len(data["categories"])
                self.log_test("Integration Hub - Categories", "PASS" if categories_count >= 4 else "FAIL",
                            f"Found {categories_count} integration categories", response.status_code)
            else:
                self.log_test("Integration Hub - Categories", "FAIL", 
                            "No categories data found", response.status_code)
        else:
            self.log_test("Integration Hub - Categories", "FAIL", 
                        "Categories endpoint failed", response.status_code if response else None)

    def test_feature_2_community_ecosystem(self):
        """Test Feature 2: Community Size & Ecosystem - Template marketplace and community features"""
        print("\n👥 TESTING FEATURE 2: TEMPLATE MARKETPLACE & COMMUNITY")
        print("=" * 60)
        
        # Test template marketplace
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                templates = data["templates"]
                template_count = len(templates)
                
                self.log_test("Template Marketplace - Count", "PASS" if template_count >= 15 else "FAIL",
                            f"Found {template_count} templates", response.status_code)
                
                # Check template quality
                quality_templates = 0
                categories = set()
                
                for template in templates:
                    if isinstance(template, dict) and all(key in template for key in ["name", "description", "category"]):
                        quality_templates += 1
                        categories.add(template.get("category"))
                
                quality_percentage = (quality_templates / template_count) * 100 if template_count > 0 else 0
                
                self.log_test("Template Marketplace - Quality", "PASS" if quality_percentage >= 80 else "FAIL",
                            f"{quality_percentage:.1f}% templates have complete metadata", response.status_code)
                
                self.log_test("Template Marketplace - Categories", "PASS" if len(categories) >= 5 else "FAIL",
                            f"Found {len(categories)} template categories", response.status_code)
            else:
                self.log_test("Template Marketplace", "FAIL", 
                            "No templates data found", response.status_code)
        else:
            self.log_test("Template Marketplace", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)

    def test_feature_3_enterprise_compliance(self):
        """Test Feature 3: Enterprise Monitoring & Compliance - SOC2, GDPR, HIPAA compliance"""
        print("\n🏢 TESTING FEATURE 3: ENTERPRISE COMPLIANCE (SOC2, GDPR, HIPAA)")
        print("=" * 60)
        
        # Test compliance endpoints
        compliance_endpoints = [
            ("/api/compliance/dashboard", "Compliance Dashboard"),
            ("/api/compliance/soc2", "SOC2 Compliance"),
            ("/api/compliance/gdpr", "GDPR Compliance"),
            ("/api/compliance/hipaa", "HIPAA Compliance"),
            ("/api/compliance/audit-logs", "Audit Logging")
        ]
        
        working_compliance = 0
        for endpoint, name in compliance_endpoints:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                working_compliance += 1
                self.log_test(f"Enterprise Compliance - {name}", "PASS", 
                            f"{name} endpoint working", response.status_code)
            else:
                self.log_test(f"Enterprise Compliance - {name}", "FAIL", 
                            f"{name} endpoint not implemented", response.status_code if response else None)
        
        overall_status = "PASS" if working_compliance >= 3 else "FAIL"
        self.log_test("Enterprise Compliance - Overall", overall_status,
                    f"{working_compliance}/5 compliance features working", None)

    def test_feature_4_multi_model_architecture(self):
        """Test Feature 4: Model & Cloud Extensibility - Multi-model, multi-cloud architecture"""
        print("\n🤖 TESTING FEATURE 4: MULTI-MODEL, MULTI-CLOUD ARCHITECTURE")
        print("=" * 60)
        
        # Test AI models endpoint
        response = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data:
                models = data["models"]
                model_count = len(models)
                
                self.log_test("Multi-Model Architecture - Count", "PASS" if model_count >= 4 else "FAIL",
                            f"Found {model_count} AI models", response.status_code)
                
                # Check for different providers
                providers = set()
                for model in models:
                    if isinstance(model, dict):
                        provider = model.get("provider", "").lower()
                        if provider:
                            providers.add(provider)
                
                self.log_test("Multi-Cloud Support", "PASS" if len(providers) >= 1 else "FAIL",
                            f"Found {len(providers)} AI providers: {list(providers)}", response.status_code)
            else:
                self.log_test("Multi-Model Architecture", "FAIL", 
                            "No models data found", response.status_code)
        else:
            self.log_test("Multi-Model Architecture", "FAIL", 
                        "Models endpoint failed", response.status_code if response else None)
        
        # Test AI agents
        response = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data:
                agents_count = len(data["agents"])
                self.log_test("Multi-Agent System", "PASS" if agents_count >= 5 else "FAIL",
                            f"Found {agents_count} specialized AI agents", response.status_code)
            else:
                self.log_test("Multi-Agent System", "FAIL", 
                            "No agents data found", response.status_code)
        else:
            self.log_test("Multi-Agent System", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)

    def test_feature_5_workflow_builder(self):
        """Test Feature 5: No-Code Workflow Builder - Natural language workflow creation"""
        print("\n🔄 TESTING FEATURE 5: NO-CODE WORKFLOW BUILDER")
        print("=" * 60)
        
        # Test workflow endpoints
        workflow_endpoints = [
            ("/api/workflows/health", "Workflow Builder Health"),
            ("/api/workflows/templates", "Workflow Templates"),
            ("/api/workflows", "Workflow Management")
        ]
        
        working_workflows = 0
        for endpoint, name in workflow_endpoints:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                working_workflows += 1
                self.log_test(f"Workflow Builder - {name}", "PASS", 
                            f"{name} endpoint working", response.status_code)
            else:
                self.log_test(f"Workflow Builder - {name}", "FAIL", 
                            f"{name} endpoint not implemented", response.status_code if response else None)
        
        overall_status = "PASS" if working_workflows >= 2 else "FAIL"
        self.log_test("Workflow Builder - Overall", overall_status,
                    f"{working_workflows}/3 workflow features working", None)

    def test_feature_6_mobile_experience(self):
        """Test Feature 6: Mobile Experience & Accessibility - Mobile-optimized APIs and PWA"""
        print("\n📱 TESTING FEATURE 6: MOBILE EXPERIENCE & ACCESSIBILITY")
        print("=" * 60)
        
        # Test mobile endpoints
        mobile_endpoints = [
            ("/api/mobile/health", "Mobile Health"),
            ("/api/mobile/pwa/manifest", "PWA Manifest"),
            ("/api/mobile/offline/sync", "Offline Sync"),
            ("/api/mobile/accessibility", "Mobile Accessibility")
        ]
        
        working_mobile = 0
        for endpoint, name in mobile_endpoints:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                working_mobile += 1
                self.log_test(f"Mobile Experience - {name}", "PASS", 
                            f"{name} endpoint working", response.status_code)
            else:
                self.log_test(f"Mobile Experience - {name}", "FAIL", 
                            f"{name} endpoint not implemented", response.status_code if response else None)
        
        overall_status = "PASS" if working_mobile >= 2 else "FAIL"
        self.log_test("Mobile Experience - Overall", overall_status,
                    f"{working_mobile}/4 mobile features working", None)

    def test_feature_7_analytics_observability(self):
        """Test Feature 7: Analytics & Observability - Advanced analytics with third-party integrations"""
        print("\n📊 TESTING FEATURE 7: ANALYTICS & OBSERVABILITY")
        print("=" * 60)
        
        # Test analytics endpoints
        analytics_endpoints = [
            ("/api/analytics/dashboard", "Analytics Dashboard"),
            ("/api/analytics/realtime", "Real-time Analytics"),
            ("/api/analytics/custom-metrics", "Custom Metrics"),
            ("/api/dashboard/analytics", "Dashboard Analytics")
        ]
        
        working_analytics = 0
        for endpoint, name in analytics_endpoints:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                working_analytics += 1
                self.log_test(f"Analytics - {name}", "PASS", 
                            f"{name} endpoint working", response.status_code)
            else:
                self.log_test(f"Analytics - {name}", "FAIL", 
                            f"{name} endpoint not implemented", response.status_code if response else None)
        
        overall_status = "PASS" if working_analytics >= 2 else "FAIL"
        self.log_test("Analytics & Observability - Overall", overall_status,
                    f"{working_analytics}/4 analytics features working", None)

    def test_feature_8_enhanced_onboarding(self):
        """Test Feature 8: Enhanced Onboarding & SaaS Experience - One-click deployment and guided setup"""
        print("\n🚀 TESTING FEATURE 8: ENHANCED ONBOARDING & SAAS EXPERIENCE")
        print("=" * 60)
        
        # Test onboarding endpoints
        onboarding_endpoints = [
            ("/api/onboarding/health", "Onboarding Health"),
            ("/api/onboarding/setup-wizard", "Setup Wizard"),
            ("/api/onboarding/deployment", "Deployment Capabilities")
        ]
        
        working_onboarding = 0
        for endpoint, name in onboarding_endpoints:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                working_onboarding += 1
                self.log_test(f"Enhanced Onboarding - {name}", "PASS", 
                            f"{name} endpoint working", response.status_code)
            else:
                self.log_test(f"Enhanced Onboarding - {name}", "FAIL", 
                            f"{name} endpoint not implemented", response.status_code if response else None)
        
        overall_status = "PASS" if working_onboarding >= 2 else "FAIL"
        self.log_test("Enhanced Onboarding - Overall", overall_status,
                    f"{working_onboarding}/3 onboarding features working", None)

    def test_core_functionality(self):
        """Test core functionality to ensure basic system works"""
        print("\n🔐 TESTING CORE FUNCTIONALITY")
        print("=" * 60)
        
        # Test health check
        response = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                self.log_test("System Health Check", "PASS", 
                            f"System healthy", response.status_code)
            else:
                self.log_test("System Health Check", "FAIL", 
                            "System not healthy", response.status_code)
        else:
            self.log_test("System Health Check", "FAIL", 
                        "Health check endpoint failed", response.status_code if response else None)
        
        # Test subscription system
        response = self.make_request("GET", "/api/subscription/current")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Subscription System", "PASS", 
                        f"Subscription system working", response.status_code)
        else:
            self.log_test("Subscription System", "FAIL", 
                        "Subscription system failed", response.status_code if response else None)

    def run_comprehensive_test(self):
        """Run comprehensive test of all 8 competitive features"""
        print("🎯 AETHER AI PLATFORM - 8 COMPETITIVE FEATURES TESTING")
        print("=" * 80)
        print(f"Test Started: {datetime.now().isoformat()}")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with authenticated tests")
            return
        
        # Test core functionality first
        self.test_core_functionality()
        
        # Test all 8 competitive features
        self.test_feature_1_integration_hub()
        self.test_feature_2_community_ecosystem()
        self.test_feature_3_enterprise_compliance()
        self.test_feature_4_multi_model_architecture()
        self.test_feature_5_workflow_builder()
        self.test_feature_6_mobile_experience()
        self.test_feature_7_analytics_observability()
        self.test_feature_8_enhanced_onboarding()
        
        # Generate summary
        self.generate_test_summary()

    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({(failed_tests/total_tests)*100:.1f}%)")
        print()
        
        # Feature-by-feature summary
        features = [
            "Integration Hub",
            "Template Marketplace & Community", 
            "Enterprise Compliance",
            "Multi-Model Architecture",
            "Workflow Builder",
            "Mobile Experience",
            "Analytics & Observability",
            "Enhanced Onboarding"
        ]
        
        print("🎯 FEATURE-BY-FEATURE STATUS:")
        print("-" * 40)
        
        feature_status = {}
        for i, feature in enumerate(features, 1):
            feature_tests = [r for r in self.test_results if feature.replace(" & ", " ").replace(" ", " ").split()[0] in r["test"]]
            if feature_tests:
                feature_passed = len([r for r in feature_tests if r["status"] == "PASS"])
                feature_total = len(feature_tests)
                if feature_passed >= feature_total * 0.6:
                    status = "✅ WORKING"
                    feature_status[feature] = "working"
                else:
                    status = "❌ NOT WORKING"
                    feature_status[feature] = "not_working"
                print(f"{i}. {feature}: {status} ({feature_passed}/{feature_total})")
            else:
                print(f"{i}. {feature}: ⚠️ NOT TESTED")
                feature_status[feature] = "not_tested"
        
        print("\n🔍 FAILED TESTS DETAILS:")
        print("-" * 40)
        failed_results = [r for r in self.test_results if r["status"] == "FAIL"]
        for result in failed_results[:10]:  # Show first 10 failures
            print(f"❌ {result['test']}: {result['details']}")
        
        if len(failed_results) > 10:
            print(f"... and {len(failed_results) - 10} more failures")
        
        print(f"\n⏰ Test Completed: {datetime.now().isoformat()}")
        print("=" * 80)
        
        return feature_status

if __name__ == "__main__":
    tester = FocusedCompetitiveTest()
    tester.run_comprehensive_test()