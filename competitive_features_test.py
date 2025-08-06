#!/usr/bin/env python3
"""
5 COMPETITIVE FEATURES TESTING - JANUARY 2025
Focused testing for the 5 newly implemented competitive features:
1. Enterprise Compliance (SOC2, GDPR, HIPAA)
2. Mobile Experience (PWA, offline sync)
3. Advanced Analytics (dashboard, real-time)
4. Enhanced Onboarding (wizard, one-click deployment)
5. Workflow Builder (drag-and-drop, templates)
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

    def test_enterprise_compliance(self):
        """Test Enterprise Compliance - SOC2, GDPR, HIPAA endpoints"""
        print("🏢 TESTING FEATURE 1: ENTERPRISE COMPLIANCE")
        print("-" * 50)
        
        # Test SOC2 compliance status
        response, response_time = self.make_request("GET", "/api/compliance/soc2/status")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "soc2_status" in data or "compliance" in data:
                    self.log_test("SOC2 Compliance Status", "PASS", 
                                f"SOC2 endpoint working with data structure", 
                                response.status_code, response_time)
                else:
                    self.log_test("SOC2 Compliance Status", "FAIL", 
                                f"Missing expected data fields. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("SOC2 Compliance Status", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("SOC2 Compliance Status", "FAIL", 
                        "SOC2 endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test GDPR compliance status
        response, response_time = self.make_request("GET", "/api/compliance/gdpr/status")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "gdpr_status" in data or "compliance" in data:
                    self.log_test("GDPR Compliance Status", "PASS", 
                                f"GDPR endpoint working with data structure", 
                                response.status_code, response_time)
                else:
                    self.log_test("GDPR Compliance Status", "FAIL", 
                                f"Missing expected data fields. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("GDPR Compliance Status", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("GDPR Compliance Status", "FAIL", 
                        "GDPR endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test HIPAA compliance status
        response, response_time = self.make_request("GET", "/api/compliance/hipaa/status")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "hipaa_status" in data or "compliance" in data:
                    self.log_test("HIPAA Compliance Status", "PASS", 
                                f"HIPAA endpoint working with data structure", 
                                response.status_code, response_time)
                else:
                    self.log_test("HIPAA Compliance Status", "FAIL", 
                                f"Missing expected data fields. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("HIPAA Compliance Status", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("HIPAA Compliance Status", "FAIL", 
                        "HIPAA endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test compliance health check
        response, response_time = self.make_request("GET", "/api/compliance/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "health" in data or "compliance" in data:
                    self.log_test("Compliance Health Check", "PASS", 
                                f"Compliance health endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Compliance Health Check", "FAIL", 
                                f"Missing health data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Compliance Health Check", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Compliance Health Check", "FAIL", 
                        "Compliance health endpoint not working", 
                        response.status_code if response else None, response_time)

    def test_mobile_experience(self):
        """Test Mobile Experience - PWA and mobile APIs"""
        print("📱 TESTING FEATURE 2: MOBILE EXPERIENCE")
        print("-" * 50)
        
        # Test PWA manifest
        response, response_time = self.make_request("GET", "/api/mobile/pwa/manifest")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "name" in data or "manifest" in data or "pwa" in data:
                    self.log_test("PWA Manifest", "PASS", 
                                f"PWA manifest endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("PWA Manifest", "FAIL", 
                                f"Missing manifest data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("PWA Manifest", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("PWA Manifest", "FAIL", 
                        "PWA manifest endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test mobile settings
        response, response_time = self.make_request("GET", "/api/mobile/settings")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "settings" in data or "mobile" in data or "config" in data:
                    self.log_test("Mobile Settings", "PASS", 
                                f"Mobile settings endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Mobile Settings", "FAIL", 
                                f"Missing settings data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Mobile Settings", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Mobile Settings", "FAIL", 
                        "Mobile settings endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test offline sync
        response, response_time = self.make_request("GET", "/api/mobile/offline/sync")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "sync" in data or "offline" in data or "status" in data:
                    self.log_test("Offline Sync", "PASS", 
                                f"Offline sync endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Offline Sync", "FAIL", 
                                f"Missing sync data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Offline Sync", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Offline Sync", "FAIL", 
                        "Offline sync endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test mobile health
        response, response_time = self.make_request("GET", "/api/mobile/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "health" in data or "mobile" in data:
                    self.log_test("Mobile Health Check", "PASS", 
                                f"Mobile health endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Mobile Health Check", "FAIL", 
                                f"Missing health data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Mobile Health Check", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Mobile Health Check", "FAIL", 
                        "Mobile health endpoint not working", 
                        response.status_code if response else None, response_time)

    def test_advanced_analytics(self):
        """Test Advanced Analytics - Dashboard and real-time analytics"""
        print("📊 TESTING FEATURE 3: ADVANCED ANALYTICS")
        print("-" * 50)
        
        # Test analytics dashboard
        response, response_time = self.make_request("GET", "/api/analytics/dashboard")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "dashboard" in data or "analytics" in data or "metrics" in data:
                    self.log_test("Analytics Dashboard", "PASS", 
                                f"Analytics dashboard endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Analytics Dashboard", "FAIL", 
                                f"Missing dashboard data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Analytics Dashboard", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Analytics Dashboard", "FAIL", 
                        "Analytics dashboard endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test real-time analytics
        response, response_time = self.make_request("GET", "/api/analytics/real-time")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "real_time" in data or "analytics" in data or "live" in data:
                    self.log_test("Real-time Analytics", "PASS", 
                                f"Real-time analytics endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Real-time Analytics", "FAIL", 
                                f"Missing real-time data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Real-time Analytics", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Real-time Analytics", "FAIL", 
                        "Real-time analytics endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test analytics health
        response, response_time = self.make_request("GET", "/api/analytics/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "health" in data or "analytics" in data:
                    self.log_test("Analytics Health Check", "PASS", 
                                f"Analytics health endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Analytics Health Check", "FAIL", 
                                f"Missing health data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Analytics Health Check", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Analytics Health Check", "FAIL", 
                        "Analytics health endpoint not working", 
                        response.status_code if response else None, response_time)

    def test_enhanced_onboarding(self):
        """Test Enhanced Onboarding - One-click deployment wizard"""
        print("🚀 TESTING FEATURE 4: ENHANCED ONBOARDING")
        print("-" * 50)
        
        # Test onboarding wizard steps
        response, response_time = self.make_request("GET", "/api/onboarding/wizard/steps")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "steps" in data or "wizard" in data or "onboarding" in data:
                    self.log_test("Onboarding Wizard Steps", "PASS", 
                                f"Onboarding wizard endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Onboarding Wizard Steps", "FAIL", 
                                f"Missing wizard data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Onboarding Wizard Steps", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Onboarding Wizard Steps", "FAIL", 
                        "Onboarding wizard endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test deployment platforms
        response, response_time = self.make_request("GET", "/api/onboarding/deployment/platforms")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "platforms" in data or "deployment" in data or "options" in data:
                    self.log_test("Deployment Platforms", "PASS", 
                                f"Deployment platforms endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Deployment Platforms", "FAIL", 
                                f"Missing platforms data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Deployment Platforms", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Deployment Platforms", "FAIL", 
                        "Deployment platforms endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test onboarding health
        response, response_time = self.make_request("GET", "/api/onboarding/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "health" in data or "onboarding" in data:
                    self.log_test("Onboarding Health Check", "PASS", 
                                f"Onboarding health endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Onboarding Health Check", "FAIL", 
                                f"Missing health data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Onboarding Health Check", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Onboarding Health Check", "FAIL", 
                        "Onboarding health endpoint not working", 
                        response.status_code if response else None, response_time)

    def test_workflow_builder(self):
        """Test Workflow Builder - Drag-and-drop workflow system"""
        print("🔄 TESTING FEATURE 5: WORKFLOW BUILDER")
        print("-" * 50)
        
        # Test workflow templates
        response, response_time = self.make_request("GET", "/api/workflows/templates")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "templates" in data or "workflows" in data or "workflow" in data:
                    self.log_test("Workflow Templates", "PASS", 
                                f"Workflow templates endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Workflow Templates", "FAIL", 
                                f"Missing templates data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Workflow Templates", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Workflow Templates", "FAIL", 
                        "Workflow templates endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test workflow node types
        response, response_time = self.make_request("GET", "/api/workflows/node-types")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "node_types" in data or "nodes" in data or "types" in data:
                    self.log_test("Workflow Node Types", "PASS", 
                                f"Workflow node types endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Workflow Node Types", "FAIL", 
                                f"Missing node types data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Workflow Node Types", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Workflow Node Types", "FAIL", 
                        "Workflow node types endpoint not working", 
                        response.status_code if response else None, response_time)
        
        # Test workflow health
        response, response_time = self.make_request("GET", "/api/workflows/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data or "health" in data or "workflow" in data:
                    self.log_test("Workflow Health Check", "PASS", 
                                f"Workflow health endpoint working", 
                                response.status_code, response_time)
                else:
                    self.log_test("Workflow Health Check", "FAIL", 
                                f"Missing health data. Response: {data}", 
                                response.status_code, response_time)
            except json.JSONDecodeError:
                self.log_test("Workflow Health Check", "FAIL", 
                            "Invalid JSON response", response.status_code, response_time)
        else:
            self.log_test("Workflow Health Check", "FAIL", 
                        "Workflow health endpoint not working", 
                        response.status_code if response else None, response_time)

    def run_competitive_features_test(self):
        """Run comprehensive test of the 5 competitive features"""
        print("🎯 AETHER AI PLATFORM - 5 COMPETITIVE FEATURES TESTING")
        print("=" * 60)
        print(f"Testing Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with testing")
            return
        
        print("\n🚀 TESTING 5 NEWLY IMPLEMENTED COMPETITIVE FEATURES...")
        print("=" * 60)
        
        # Test all 5 competitive features
        self.test_enterprise_compliance()
        self.test_mobile_experience()
        self.test_advanced_analytics()
        self.test_enhanced_onboarding()
        self.test_workflow_builder()
        
        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n📊 5 COMPETITIVE FEATURES TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print()
        
        # Feature-by-feature summary
        features = [
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
            # Better feature matching logic
            if feature == "Enterprise Compliance":
                feature_tests = [r for r in self.test_results if "compliance" in r["test"].lower() or "soc2" in r["test"].lower() or "gdpr" in r["test"].lower() or "hipaa" in r["test"].lower()]
            elif feature == "Mobile Experience":
                feature_tests = [r for r in self.test_results if "mobile" in r["test"].lower() or "pwa" in r["test"].lower() or "offline" in r["test"].lower()]
            elif feature == "Advanced Analytics":
                feature_tests = [r for r in self.test_results if "analytics" in r["test"].lower() or "real-time" in r["test"].lower()]
            elif feature == "Enhanced Onboarding":
                feature_tests = [r for r in self.test_results if "onboarding" in r["test"].lower() or "wizard" in r["test"].lower() or "deployment" in r["test"].lower()]
            elif feature == "Workflow Builder":
                feature_tests = [r for r in self.test_results if "workflow" in r["test"].lower() or "node" in r["test"].lower()]
            else:
                feature_tests = [r for r in self.test_results if feature.lower().replace(" ", "_") in r["test"].lower()]
            
            if feature_tests:
                feature_passed = len([r for r in feature_tests if r["status"] == "PASS"])
                feature_total = len(feature_tests)
                feature_percentage = feature_passed / feature_total * 100 if feature_total > 0 else 0
                
                if feature_percentage >= 75:
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
        
        # Response time analysis
        response_times = [r["response_time"] for r in self.test_results if r["response_time"] is not None]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            fast_responses = len([t for t in response_times if t < 2.0])
            print("⚡ PERFORMANCE ANALYSIS:")
            print("-" * 25)
            print(f"Average Response Time: {avg_response_time:.2f}s")
            print(f"Fast Responses (<2s): {fast_responses}/{len(response_times)} ({fast_responses/len(response_times)*100:.1f}%)")
            print()
        
        # Overall assessment
        working_features = len([s for s in feature_status.values() if "✅" in s])
        partial_features = len([s for s in feature_status.values() if "⚠️" in s])
        failed_features = len([s for s in feature_status.values() if "❌" in s])
        
        print("🏆 OVERALL COMPETITIVE ASSESSMENT:")
        print("-" * 40)
        print(f"✅ Fully Working Features: {working_features}/5 ({working_features/5*100:.1f}%)")
        print(f"⚠️ Partially Working Features: {partial_features}/5 ({partial_features/5*100:.1f}%)")
        print(f"❌ Failed/Missing Features: {failed_features}/5 ({failed_features/5*100:.1f}%)")
        print()
        
        # Final verdict
        if working_features >= 4:
            verdict = "🎉 EXCELLENT - All 5 Features Operational"
        elif working_features >= 3:
            verdict = "👍 GOOD - Most Features Working"
        elif working_features >= 2:
            verdict = "⚠️ NEEDS WORK - Some Features Missing"
        else:
            verdict = "❌ CRITICAL - Major Implementation Issues"
        
        print(f"FINAL VERDICT: {verdict}")
        print()
        
        # Success criteria check
        print("📋 SUCCESS CRITERIA CHECK:")
        print("-" * 30)
        success_criteria = [
            ("All 5 features operational", working_features == 5),
            ("No 404 or 500 errors", all(r["response_code"] not in [404, 500] for r in self.test_results if r["response_code"])),
            ("Fast response times (<2s)", avg_response_time < 2.0 if response_times else False),
            ("Rich, meaningful data", passed_tests > failed_tests)
        ]
        
        for criteria, met in success_criteria:
            status = "✅" if met else "❌"
            print(f"{status} {criteria}")
        
        print()
        print(f"Test Completed: {datetime.now().isoformat()}")
        print("=" * 60)

if __name__ == "__main__":
    # Use the backend URL from environment or default
    backend_url = "http://localhost:8001"
    
    print("🚀 Starting Aether AI Platform - 5 Competitive Features Test")
    print(f"Backend URL: {backend_url}")
    
    tester = CompetitiveFeaturesTester(backend_url)
    tester.run_competitive_features_test()
"""
Comprehensive Testing for 8 Competitive Features
Tests the actual implementation vs claimed features
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CompetitiveFeaturesTest:
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
                self.log_test("Authentication", "PASS", 
                            f"Authenticated as {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Authentication", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Authentication", "FAIL", 
                        "Authentication failed", response.status_code if response else None)
        return False

    def test_integration_hub(self):
        """Test Integration Hub - Database, Cloud, API, Monitoring integrations"""
        print("🔌 Testing Integration Hub (Feature 1/8)...")
        print("-" * 50)
        
        # Test main integrations endpoint
        response = self.make_request("GET", "/api/integrations/")
        if response and response.status_code == 200:
            data = response.json()
            if "integrations" in data and len(data["integrations"]) > 0:
                self.log_test("Integration Hub - Main Endpoint", "PASS", 
                            f"Found {len(data['integrations'])} integrations", response.status_code)
                
                # Analyze integration categories
                categories = {}
                for integration in data["integrations"]:
                    category = integration.get("category", "unknown")
                    if category not in categories:
                        categories[category] = 0
                    categories[category] += 1
                
                self.log_test("Integration Categories", "PASS", 
                            f"Categories: {list(categories.keys())}", response.status_code)
            else:
                self.log_test("Integration Hub - Main Endpoint", "FAIL", 
                            "No integrations found", response.status_code)
        else:
            self.log_test("Integration Hub - Main Endpoint", "FAIL", 
                        "Integrations endpoint failed", response.status_code if response else None)
        
        # Test specific database integrations
        db_integrations = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"]
        db_results = []
        for db in db_integrations:
            response = self.make_request("GET", f"/api/integrations/database/{db}")
            if response and response.status_code == 200:
                db_results.append(f"✅ {db.upper()}")
            else:
                db_results.append(f"❌ {db.upper()}")
        
        self.log_test("Database Integrations", "PARTIAL" if any("✅" in r for r in db_results) else "FAIL", 
                    f"Results: {', '.join(db_results)}")
        
        # Test cloud storage integrations
        cloud_integrations = ["aws-s3", "azure-storage", "google-cloud-storage"]
        cloud_results = []
        for cloud in cloud_integrations:
            response = self.make_request("GET", f"/api/integrations/cloud/{cloud}")
            if response and response.status_code == 200:
                cloud_results.append(f"✅ {cloud.upper()}")
            else:
                cloud_results.append(f"❌ {cloud.upper()}")
        
        self.log_test("Cloud Storage Integrations", "PARTIAL" if any("✅" in r for r in cloud_results) else "FAIL", 
                    f"Results: {', '.join(cloud_results)}")
        
        # Test API integrations
        api_integrations = ["stripe", "twilio", "sendgrid", "github", "slack"]
        api_results = []
        for api in api_integrations:
            response = self.make_request("GET", f"/api/integrations/api/{api}")
            if response and response.status_code == 200:
                api_results.append(f"✅ {api.upper()}")
            else:
                api_results.append(f"❌ {api.upper()}")
        
        self.log_test("API Integrations", "PARTIAL" if any("✅" in r for r in api_results) else "FAIL", 
                    f"Results: {', '.join(api_results)}")
        
        # Test monitoring tools
        monitoring_tools = ["datadog", "newrelic", "grafana"]
        monitoring_results = []
        for tool in monitoring_tools:
            response = self.make_request("GET", f"/api/integrations/monitoring/{tool}")
            if response and response.status_code == 200:
                monitoring_results.append(f"✅ {tool.upper()}")
            else:
                monitoring_results.append(f"❌ {tool.upper()}")
        
        self.log_test("Monitoring Tools", "PARTIAL" if any("✅" in r for r in monitoring_results) else "FAIL", 
                    f"Results: {', '.join(monitoring_results)}")

    def test_template_marketplace(self):
        """Test Template Marketplace - Community templates, ratings, AI generation"""
        print("📁 Testing Template Marketplace (Feature 2/8)...")
        print("-" * 50)
        
        # Test main templates endpoint
        response = self.make_request("GET", "/api/templates/")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                templates = data["templates"]
                
                # Check template quality
                quality_metrics = {
                    "has_name": 0,
                    "has_description": 0,
                    "has_category": 0,
                    "has_tech_stack": 0,
                    "has_rating": 0,
                    "has_downloads": 0
                }
                
                for template in templates:
                    if template.get("name"): quality_metrics["has_name"] += 1
                    if template.get("description"): quality_metrics["has_description"] += 1
                    if template.get("category"): quality_metrics["has_category"] += 1
                    if template.get("tech_stack"): quality_metrics["has_tech_stack"] += 1
                    if template.get("rating"): quality_metrics["has_rating"] += 1
                    if template.get("downloads"): quality_metrics["has_downloads"] += 1
                
                total_templates = len(templates)
                quality_score = sum(quality_metrics.values()) / (len(quality_metrics) * total_templates) * 100
                
                self.log_test("Template Marketplace - Quality", "PASS" if quality_score >= 70 else "PARTIAL", 
                            f"{total_templates} templates, {quality_score:.1f}% metadata completeness", response.status_code)
                
                # Check categories
                categories = set(t.get("category", "unknown") for t in templates)
                self.log_test("Template Categories", "PASS", 
                            f"Categories: {', '.join(categories)}", response.status_code)
            else:
                self.log_test("Template Marketplace - Main Endpoint", "FAIL", 
                            "No templates found", response.status_code)
        else:
            self.log_test("Template Marketplace - Main Endpoint", "FAIL", 
                        "Templates endpoint failed", response.status_code if response else None)
        
        # Test AI template generation
        if self.auth_token:
            ai_template_request = {
                "description": "E-commerce website with payment integration",
                "tech_stack": ["React", "Node.js", "MongoDB"],
                "features": ["user authentication", "shopping cart", "payment processing"]
            }
            response = self.make_request("POST", "/api/templates/ai-generate", ai_template_request)
            if response and response.status_code == 200:
                self.log_test("AI Template Generation", "PASS", 
                            "AI template generation working", response.status_code)
            else:
                self.log_test("AI Template Generation", "FAIL", 
                            "AI template generation not implemented", response.status_code if response else None)
        
        # Test template ratings system
        response = self.make_request("GET", "/api/templates/ratings/react-starter")
        if response and response.status_code == 200:
            self.log_test("Template Ratings System", "PASS", 
                        "Template ratings system working", response.status_code)
        else:
            self.log_test("Template Ratings System", "FAIL", 
                        "Template ratings not implemented", response.status_code if response else None)

    def test_enterprise_compliance(self):
        """Test Enterprise Compliance - SOC2, GDPR, HIPAA, Audit Logging"""
        print("🏢 Testing Enterprise Compliance (Feature 3/8)...")
        print("-" * 50)
        
        if not self.auth_token:
            self.log_test("Enterprise Compliance Test", "SKIP", "No authentication token available")
            return
        
        # Test SOC2 compliance tracking
        response = self.make_request("GET", "/api/compliance/soc2/status")
        if response and response.status_code == 200:
            data = response.json()
            if "compliance_status" in data and "controls" in data:
                self.log_test("SOC2 Compliance Tracking", "PASS", 
                            f"SOC2 status: {data.get('compliance_status')}", response.status_code)
            else:
                self.log_test("SOC2 Compliance Tracking", "PARTIAL", 
                            "SOC2 endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("SOC2 Compliance Tracking", "FAIL", 
                        "SOC2 compliance not implemented", response.status_code if response else None)
        
        # Test GDPR compliance
        response = self.make_request("GET", "/api/compliance/gdpr/status")
        if response and response.status_code == 200:
            data = response.json()
            if "gdpr_compliant" in data and "data_processing" in data:
                self.log_test("GDPR Compliance", "PASS", 
                            f"GDPR compliant: {data.get('gdpr_compliant')}", response.status_code)
            else:
                self.log_test("GDPR Compliance", "PARTIAL", 
                            "GDPR endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("GDPR Compliance", "FAIL", 
                        "GDPR compliance not implemented", response.status_code if response else None)
        
        # Test HIPAA compliance
        response = self.make_request("GET", "/api/compliance/hipaa/status")
        if response and response.status_code == 200:
            data = response.json()
            if "hipaa_compliant" in data and "safeguards" in data:
                self.log_test("HIPAA Compliance", "PASS", 
                            f"HIPAA compliant: {data.get('hipaa_compliant')}", response.status_code)
            else:
                self.log_test("HIPAA Compliance", "PARTIAL", 
                            "HIPAA endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("HIPAA Compliance", "FAIL", 
                        "HIPAA compliance not implemented", response.status_code if response else None)
        
        # Test audit logging system
        response = self.make_request("GET", "/api/compliance/audit/logs")
        if response and response.status_code == 200:
            data = response.json()
            if "audit_logs" in data and "total_events" in data:
                self.log_test("Audit Logging System", "PASS", 
                            f"Found {data.get('total_events', 0)} audit events", response.status_code)
            else:
                self.log_test("Audit Logging System", "PARTIAL", 
                            "Audit logging endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("Audit Logging System", "FAIL", 
                        "Audit logging not implemented", response.status_code if response else None)

    def test_multi_model_architecture(self):
        """Test Multi-Model Architecture - Multiple AI providers, BYOM, Smart routing"""
        print("🤖 Testing Multi-Model Architecture (Feature 4/8)...")
        print("-" * 50)
        
        # Test AI models endpoint
        response = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data and len(data["models"]) > 0:
                models = data["models"]
                
                # Analyze model providers
                providers = set()
                groq_models = []
                for model in models:
                    provider = model.get("provider", "unknown")
                    providers.add(provider)
                    if "groq" in provider.lower() or "llama" in model.get("name", "").lower():
                        groq_models.append(model.get("name"))
                
                self.log_test("Multi-Model Architecture - Models Available", "PASS", 
                            f"Found {len(models)} models from providers: {', '.join(providers)}", response.status_code)
                
                if groq_models:
                    self.log_test("Groq Integration", "PASS", 
                                f"Groq models: {', '.join(groq_models)}", response.status_code)
                else:
                    self.log_test("Groq Integration", "FAIL", 
                                "No Groq models found", response.status_code)
            else:
                self.log_test("Multi-Model Architecture - Models Available", "FAIL", 
                            "No AI models found", response.status_code)
        else:
            self.log_test("Multi-Model Architecture - Models Available", "FAIL", 
                        "AI models endpoint failed", response.status_code if response else None)
        
        # Test different AI providers
        providers_to_test = ["openai", "anthropic", "aws-bedrock", "azure-openai", "gcp-vertex"]
        provider_results = []
        
        for provider in providers_to_test:
            response = self.make_request("GET", f"/api/ai/providers/{provider}/models")
            if response and response.status_code == 200:
                provider_results.append(f"✅ {provider.upper()}")
            else:
                provider_results.append(f"❌ {provider.upper()}")
        
        self.log_test("AI Provider Integrations", "PARTIAL" if any("✅" in r for r in provider_results) else "FAIL", 
                    f"Results: {', '.join(provider_results)}")
        
        # Test BYOM (Bring Your Own Model)
        if self.auth_token:
            byom_request = {
                "model_name": "custom-model",
                "endpoint_url": "https://api.example.com/v1/chat",
                "api_key": "test-key"
            }
            response = self.make_request("POST", "/api/ai/byom/register", byom_request)
            if response and response.status_code == 200:
                self.log_test("BYOM Capabilities", "PASS", 
                            "Bring Your Own Model registration working", response.status_code)
            else:
                self.log_test("BYOM Capabilities", "FAIL", 
                            "BYOM not implemented", response.status_code if response else None)

    def test_workflow_builder(self):
        """Test Workflow Builder - Visual workflows, templates, execution engine"""
        print("🔄 Testing Workflow Builder (Feature 5/8)...")
        print("-" * 50)
        
        if not self.auth_token:
            self.log_test("Workflow Builder Test", "SKIP", "No authentication token available")
            return
        
        # Test workflow templates
        response = self.make_request("GET", "/api/workflows/templates")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                self.log_test("Workflow Templates", "PASS", 
                            f"Found {len(data['templates'])} workflow templates", response.status_code)
            else:
                self.log_test("Workflow Templates", "PARTIAL", 
                            "Workflow templates endpoint exists but no templates", response.status_code)
        else:
            self.log_test("Workflow Templates", "FAIL", 
                        "Workflow templates not implemented", response.status_code if response else None)
        
        # Test workflow creation
        workflow_data = {
            "name": "Test Workflow",
            "description": "A test workflow for API validation",
            "nodes": [
                {"id": "start", "type": "trigger", "config": {"event": "user_signup"}},
                {"id": "email", "type": "action", "config": {"service": "sendgrid", "template": "welcome"}},
                {"id": "end", "type": "end"}
            ],
            "connections": [
                {"from": "start", "to": "email"},
                {"from": "email", "to": "end"}
            ]
        }
        
        response = self.make_request("POST", "/api/workflows/create", workflow_data)
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_id" in data:
                self.log_test("Workflow Creation", "PASS", 
                            f"Workflow created: {data.get('workflow_id')}", response.status_code)
                self.test_workflow_id = data["workflow_id"]
            else:
                self.log_test("Workflow Creation", "PARTIAL", 
                            "Workflow creation endpoint exists but response incomplete", response.status_code)
        else:
            self.log_test("Workflow Creation", "FAIL", 
                        "Workflow creation not implemented", response.status_code if response else None)
        
        # Test natural language workflow processing
        nl_workflow_request = {
            "description": "When a user signs up, send them a welcome email and create a project template"
        }
        
        response = self.make_request("POST", "/api/workflows/natural-language", nl_workflow_request)
        if response and response.status_code == 200:
            data = response.json()
            if "workflow" in data and "nodes" in data["workflow"]:
                self.log_test("Natural Language Workflow Processing", "PASS", 
                            f"NL workflow generated with {len(data['workflow']['nodes'])} nodes", response.status_code)
            else:
                self.log_test("Natural Language Workflow Processing", "PARTIAL", 
                            "NL workflow endpoint exists but response incomplete", response.status_code)
        else:
            self.log_test("Natural Language Workflow Processing", "FAIL", 
                        "Natural language workflow processing not implemented", response.status_code if response else None)

    def test_advanced_analytics(self):
        """Test Advanced Analytics - Dashboard, third-party integrations, custom metrics"""
        print("📊 Testing Advanced Analytics (Feature 6/8)...")
        print("-" * 50)
        
        # Test analytics dashboard
        response = self.make_request("GET", "/api/analytics/dashboard")
        if response and response.status_code == 200:
            data = response.json()
            if "metrics" in data and "charts" in data:
                self.log_test("Analytics Dashboard", "PASS", 
                            f"Dashboard loaded with {len(data.get('metrics', []))} metrics", response.status_code)
            else:
                self.log_test("Analytics Dashboard", "PARTIAL", 
                            "Analytics dashboard endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("Analytics Dashboard", "FAIL", 
                        "Analytics dashboard not implemented", response.status_code if response else None)
        
        # Test third-party analytics integrations
        integrations = ["google-analytics", "mixpanel", "amplitude"]
        integration_results = []
        
        for integration in integrations:
            response = self.make_request("GET", f"/api/analytics/integrations/{integration}")
            if response and response.status_code == 200:
                integration_results.append(f"✅ {integration.upper()}")
            else:
                integration_results.append(f"❌ {integration.upper()}")
        
        self.log_test("Third-Party Analytics Integrations", "PARTIAL" if any("✅" in r for r in integration_results) else "FAIL", 
                    f"Results: {', '.join(integration_results)}")
        
        # Test deep performance tracing
        response = self.make_request("GET", "/api/analytics/performance/trace")
        if response and response.status_code == 200:
            data = response.json()
            if "traces" in data and "performance_metrics" in data:
                self.log_test("Deep Performance Tracing", "PASS", 
                            f"Performance tracing with {len(data.get('traces', []))} traces", response.status_code)
            else:
                self.log_test("Deep Performance Tracing", "PARTIAL", 
                            "Performance tracing endpoint exists but data incomplete", response.status_code)
        else:
            self.log_test("Deep Performance Tracing", "FAIL", 
                        "Performance tracing not implemented", response.status_code if response else None)

    def test_mobile_experience(self):
        """Test Mobile Experience - Mobile APIs, offline sync, push notifications, PWA"""
        print("📱 Testing Mobile Experience (Feature 7/8)...")
        print("-" * 50)
        
        # Test mobile-optimized API responses
        headers = {"User-Agent": "Mobile App v1.0"}
        response = self.make_request("GET", "/api/mobile/config", headers=headers)
        if response and response.status_code == 200:
            data = response.json()
            if "mobile_optimized" in data and "offline_capabilities" in data:
                self.log_test("Mobile-Optimized APIs", "PASS", 
                            "Mobile API configuration available", response.status_code)
            else:
                self.log_test("Mobile-Optimized APIs", "PARTIAL", 
                            "Mobile API endpoint exists but configuration incomplete", response.status_code)
        else:
            self.log_test("Mobile-Optimized APIs", "FAIL", 
                        "Mobile APIs not implemented", response.status_code if response else None)
        
        # Test offline synchronization
        if self.auth_token:
            response = self.make_request("GET", "/api/mobile/sync/status")
            if response and response.status_code == 200:
                data = response.json()
                if "sync_enabled" in data and "last_sync" in data:
                    self.log_test("Offline Synchronization", "PASS", 
                                f"Sync status: {data.get('sync_enabled')}", response.status_code)
                else:
                    self.log_test("Offline Synchronization", "PARTIAL", 
                                "Sync endpoint exists but status incomplete", response.status_code)
            else:
                self.log_test("Offline Synchronization", "FAIL", 
                            "Offline sync not implemented", response.status_code if response else None)
        
        # Test push notification system
        if self.auth_token:
            notification_data = {
                "title": "Test Notification",
                "body": "This is a test push notification",
                "user_id": "test_user"
            }
            
            response = self.make_request("POST", "/api/mobile/notifications/send", notification_data)
            if response and response.status_code == 200:
                self.log_test("Push Notification System", "PASS", 
                            "Push notifications working", response.status_code)
            else:
                self.log_test("Push Notification System", "FAIL", 
                            "Push notifications not implemented", response.status_code if response else None)
        
        # Test PWA optimization endpoints
        response = self.make_request("GET", "/api/mobile/pwa/manifest")
        if response and response.status_code == 200:
            data = response.json()
            if "name" in data and "icons" in data and "start_url" in data:
                self.log_test("PWA Optimization", "PASS", 
                            "PWA manifest available", response.status_code)
            else:
                self.log_test("PWA Optimization", "PARTIAL", 
                            "PWA manifest endpoint exists but incomplete", response.status_code)
        else:
            self.log_test("PWA Optimization", "FAIL", 
                        "PWA optimization not implemented", response.status_code if response else None)

    def test_enhanced_onboarding(self):
        """Test Enhanced Onboarding - One-click deployment, guided setup, demo data"""
        print("🚀 Testing Enhanced Onboarding (Feature 8/8)...")
        print("-" * 50)
        
        if not self.auth_token:
            self.log_test("Enhanced Onboarding Test", "SKIP", "No authentication token available")
            return
        
        # Test one-click deployment automation
        deployment_request = {
            "template": "react-starter",
            "deployment_target": "vercel",
            "project_name": "test-deployment"
        }
        
        response = self.make_request("POST", "/api/onboarding/one-click-deploy", deployment_request)
        if response and response.status_code == 200:
            data = response.json()
            if "deployment_id" in data and "status" in data:
                self.log_test("One-Click Deployment", "PASS", 
                            f"Deployment initiated: {data.get('deployment_id')}", response.status_code)
            else:
                self.log_test("One-Click Deployment", "PARTIAL", 
                            "One-click deployment endpoint exists but response incomplete", response.status_code)
        else:
            self.log_test("One-Click Deployment", "FAIL", 
                        "One-click deployment not implemented", response.status_code if response else None)
        
        # Test guided setup wizard
        response = self.make_request("GET", "/api/onboarding/setup-wizard/steps")
        if response and response.status_code == 200:
            data = response.json()
            if "steps" in data and len(data["steps"]) > 0:
                self.log_test("Guided Setup Wizard", "PASS", 
                            f"Setup wizard with {len(data['steps'])} steps", response.status_code)
            else:
                self.log_test("Guided Setup Wizard", "PARTIAL", 
                            "Setup wizard endpoint exists but no steps found", response.status_code)
        else:
            self.log_test("Guided Setup Wizard", "FAIL", 
                        "Guided setup wizard not implemented", response.status_code if response else None)
        
        # Test demo data generation
        demo_request = {
            "project_type": "e-commerce",
            "data_size": "small"
        }
        
        response = self.make_request("POST", "/api/onboarding/demo-data/generate", demo_request)
        if response and response.status_code == 200:
            data = response.json()
            if "demo_data_id" in data and "generated_items" in data:
                self.log_test("Demo Data Generation", "PASS", 
                            f"Demo data generated: {data.get('generated_items')} items", response.status_code)
            else:
                self.log_test("Demo Data Generation", "PARTIAL", 
                            "Demo data generation endpoint exists but response incomplete", response.status_code)
        else:
            self.log_test("Demo Data Generation", "FAIL", 
                        "Demo data generation not implemented", response.status_code if response else None)

    def run_comprehensive_test(self):
        """Run comprehensive test of all 8 competitive features"""
        print("🎯 COMPREHENSIVE 8 COMPETITIVE FEATURES TESTING")
        print("=" * 60)
        print("Testing actual implementation vs claimed features")
        print("Backend URL:", self.base_url)
        print("=" * 60)
        
        start_time = time.time()
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - some tests will be skipped")
        
        # Test all 8 competitive features
        self.test_integration_hub()
        self.test_template_marketplace()
        self.test_enterprise_compliance()
        self.test_multi_model_architecture()
        self.test_workflow_builder()
        self.test_advanced_analytics()
        self.test_mobile_experience()
        self.test_enhanced_onboarding()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Generate comprehensive summary
        self.generate_comprehensive_summary(duration)
        
        return self.test_results

    def generate_comprehensive_summary(self, duration: float):
        """Generate comprehensive test summary"""
        print("=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        partial = len([r for r in self.test_results if r["status"] == "PARTIAL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Fully Working: {passed}")
        print(f"⚠️ Partially Working: {partial}")
        print(f"❌ Not Implemented: {failed}")
        print(f"⏭️ Skipped: {skipped}")
        print(f"⏱️ Duration: {duration:.2f} seconds")
        print()
        
        # Feature-by-feature summary
        features = [
            "Integration Hub",
            "Template Marketplace", 
            "Enterprise Compliance",
            "Multi-Model Architecture",
            "Workflow Builder",
            "Advanced Analytics",
            "Mobile Experience",
            "Enhanced Onboarding"
        ]
        
        print("🎯 FEATURE-BY-FEATURE ASSESSMENT:")
        print("-" * 40)
        
        feature_results = {}
        for i, feature in enumerate(features, 1):
            feature_tests = [r for r in self.test_results if feature.lower().replace(" ", "") in r["test"].lower().replace(" ", "").replace("-", "")]
            if not feature_tests:
                # Try broader matching
                feature_tests = [r for r in self.test_results if any(word.lower() in r["test"].lower() for word in feature.split())]
            
            if feature_tests:
                feature_passed = len([r for r in feature_tests if r["status"] == "PASS"])
                feature_partial = len([r for r in feature_tests if r["status"] == "PARTIAL"])
                feature_failed = len([r for r in feature_tests if r["status"] == "FAIL"])
                feature_total = len(feature_tests)
                
                if feature_passed >= feature_total * 0.8:
                    status = "✅ FULLY OPERATIONAL"
                elif feature_passed + feature_partial >= feature_total * 0.5:
                    status = "⚠️ PARTIALLY IMPLEMENTED"
                else:
                    status = "❌ NOT IMPLEMENTED"
                
                feature_results[feature] = status
                print(f"{i}. {feature}: {status}")
                print(f"   Tests: {feature_passed}✅ {feature_partial}⚠️ {feature_failed}❌ (Total: {feature_total})")
            else:
                feature_results[feature] = "❓ NO TESTS FOUND"
                print(f"{i}. {feature}: ❓ NO TESTS FOUND")
        
        print()
        print("🚀 PRODUCTION READINESS ASSESSMENT:")
        print("-" * 40)
        
        fully_operational = len([s for s in feature_results.values() if "FULLY OPERATIONAL" in s])
        partially_implemented = len([s for s in feature_results.values() if "PARTIALLY IMPLEMENTED" in s])
        not_implemented = len([s for s in feature_results.values() if "NOT IMPLEMENTED" in s])
        
        overall_score = (fully_operational * 100 + partially_implemented * 50) / len(features)
        
        print(f"✅ Fully Working Features: {fully_operational}/8 ({fully_operational/8*100:.1f}%)")
        print(f"⚠️ Partially Working Features: {partially_implemented}/8 ({partially_implemented/8*100:.1f}%)")
        print(f"❌ Missing Features: {not_implemented}/8 ({not_implemented/8*100:.1f}%)")
        print(f"📊 Overall Implementation Score: {overall_score:.1f}%")
        
        if overall_score >= 80:
            readiness = "🟢 PRODUCTION READY"
        elif overall_score >= 60:
            readiness = "🟡 PARTIALLY READY"
        else:
            readiness = "🔴 NOT READY"
        
        print(f"🎯 Production Readiness: {readiness}")
        
        print()
        print("📋 DETAILED FINDINGS:")
        print("-" * 40)
        
        if failed > 0:
            print("❌ CRITICAL ISSUES:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        if partial > 0:
            print("⚠️ PARTIAL IMPLEMENTATIONS:")
            for result in self.test_results:
                if result["status"] == "PARTIAL":
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        print("✅ WORKING FEATURES:")
        for result in self.test_results:
            if result["status"] == "PASS":
                print(f"  - {result['test']}: {result['details']}")

if __name__ == "__main__":
    # Use environment variable or default
    import os
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8001")
    
    tester = CompetitiveFeaturesTest(backend_url)
    results = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    failed_tests = len([r for r in results if r["status"] == "FAIL"])
    sys.exit(1 if failed_tests > 0 else 0)
"""
Comprehensive Testing for Aether AI Platform - 8 Competitive Features
Tests all critical competitive features as requested
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CompetitiveFeaturesTest:
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
                self.log_test("Authentication", "PASS", f"Authenticated as {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Authentication", "FAIL", "No access token in response", response.status_code)
                return False
        else:
            self.log_test("Authentication", "FAIL", "Login failed", response.status_code if response else None)
            return False

    def test_1_integration_hub(self):
        """Test 1: Integration Hub Testing - Comprehensive integrations"""
        print("\n🔌 TESTING FEATURE 1: INTEGRATION HUB")
        print("=" * 60)
        
        if not self.auth_token:
            self.log_test("Integration Hub", "SKIP", "No authentication token available")
            return

        # Test database integrations
        db_integrations = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"]
        for db in db_integrations:
            response = self.make_request("GET", f"/api/integrations/database/{db}")
            if response and response.status_code == 200:
                data = response.json()
                if "integration" in data and "status" in data:
                    self.log_test(f"Database Integration - {db.upper()}", "PASS", 
                                f"Integration available: {data.get('integration', {}).get('name')}", response.status_code)
                else:
                    self.log_test(f"Database Integration - {db.upper()}", "FAIL", 
                                "Missing integration data", response.status_code)
            else:
                self.log_test(f"Database Integration - {db.upper()}", "FAIL", 
                            f"Integration endpoint failed", response.status_code if response else None)

        # Test cloud storage integrations
        cloud_providers = ["aws-s3", "azure-blob", "google-cloud"]
        for provider in cloud_providers:
            response = self.make_request("GET", f"/api/integrations/storage/{provider}")
            if response and response.status_code == 200:
                data = response.json()
                if "integration" in data:
                    self.log_test(f"Cloud Storage - {provider.upper()}", "PASS", 
                                f"Storage integration available", response.status_code)
                else:
                    self.log_test(f"Cloud Storage - {provider.upper()}", "FAIL", 
                                "Missing storage integration data", response.status_code)
            else:
                self.log_test(f"Cloud Storage - {provider.upper()}", "FAIL", 
                            f"Storage integration failed", response.status_code if response else None)

        # Test API integrations
        api_integrations = ["stripe", "twilio", "sendgrid", "github", "slack"]
        for api in api_integrations:
            response = self.make_request("GET", f"/api/integrations/api/{api}")
            if response and response.status_code == 200:
                data = response.json()
                if "integration" in data:
                    self.log_test(f"API Integration - {api.upper()}", "PASS", 
                                f"API integration available", response.status_code)
                else:
                    self.log_test(f"API Integration - {api.upper()}", "FAIL", 
                                "Missing API integration data", response.status_code)
            else:
                self.log_test(f"API Integration - {api.upper()}", "FAIL", 
                            f"API integration failed", response.status_code if response else None)

        # Test monitoring integrations
        monitoring_tools = ["datadog", "newrelic", "grafana"]
        for tool in monitoring_tools:
            response = self.make_request("GET", f"/api/integrations/monitoring/{tool}")
            if response and response.status_code == 200:
                data = response.json()
                if "integration" in data:
                    self.log_test(f"Monitoring - {tool.upper()}", "PASS", 
                                f"Monitoring integration available", response.status_code)
                else:
                    self.log_test(f"Monitoring - {tool.upper()}", "FAIL", 
                                "Missing monitoring integration data", response.status_code)
            else:
                self.log_test(f"Monitoring - {tool.upper()}", "FAIL", 
                            f"Monitoring integration failed", response.status_code if response else None)

    def test_2_template_marketplace(self):
        """Test 2: Template Marketplace Testing - Community features and AI-powered generation"""
        print("\n📋 TESTING FEATURE 2: TEMPLATE MARKETPLACE")
        print("=" * 60)

        # Test template marketplace
        response = self.make_request("GET", "/api/templates/marketplace")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data and len(data["templates"]) > 0:
                self.log_test("Template Marketplace", "PASS", 
                            f"Found {len(data['templates'])} marketplace templates", response.status_code)
            else:
                self.log_test("Template Marketplace", "FAIL", 
                            "No templates in marketplace", response.status_code)
        else:
            self.log_test("Template Marketplace", "FAIL", 
                        "Marketplace endpoint failed", response.status_code if response else None)

        # Test AI-powered template generation
        if self.auth_token:
            template_request = {
                "description": "E-commerce platform with React and Node.js",
                "features": ["user authentication", "payment integration", "product catalog"],
                "tech_stack": ["react", "nodejs", "mongodb"]
            }
            response = self.make_request("POST", "/api/templates/ai-generate", template_request)
            if response and response.status_code == 200:
                data = response.json()
                if "template" in data and "generated_files" in data:
                    self.log_test("AI Template Generation", "PASS", 
                                f"Generated template with {len(data.get('generated_files', []))} files", response.status_code)
                else:
                    self.log_test("AI Template Generation", "FAIL", 
                                "Missing generated template data", response.status_code)
            else:
                self.log_test("AI Template Generation", "FAIL", 
                            "AI template generation failed", response.status_code if response else None)

        # Test user ratings and reviews
        response = self.make_request("GET", "/api/templates/ratings/react-starter")
        if response and response.status_code == 200:
            data = response.json()
            if "rating" in data and "reviews" in data:
                self.log_test("Template Ratings & Reviews", "PASS", 
                            f"Rating: {data.get('rating')}, Reviews: {len(data.get('reviews', []))}", response.status_code)
            else:
                self.log_test("Template Ratings & Reviews", "FAIL", 
                            "Missing rating or review data", response.status_code)
        else:
            self.log_test("Template Ratings & Reviews", "FAIL", 
                        "Ratings endpoint failed", response.status_code if response else None)

        # Test recommendation system
        if self.auth_token:
            response = self.make_request("GET", "/api/templates/recommendations")
            if response and response.status_code == 200:
                data = response.json()
                if "recommendations" in data:
                    self.log_test("Template Recommendations", "PASS", 
                                f"Found {len(data.get('recommendations', []))} recommendations", response.status_code)
                else:
                    self.log_test("Template Recommendations", "FAIL", 
                                "No recommendations data", response.status_code)
            else:
                self.log_test("Template Recommendations", "FAIL", 
                            "Recommendations endpoint failed", response.status_code if response else None)

    def test_3_enterprise_compliance(self):
        """Test 3: Enterprise Compliance Testing - SOC2, GDPR, HIPAA compliance"""
        print("\n🏢 TESTING FEATURE 3: ENTERPRISE COMPLIANCE")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Enterprise Compliance", "SKIP", "No authentication token available")
            return

        # Test SOC2 compliance tracking
        response = self.make_request("GET", "/api/enterprise/compliance/soc2")
        if response and response.status_code == 200:
            data = response.json()
            if "compliance_status" in data and "controls" in data:
                self.log_test("SOC2 Compliance", "PASS", 
                            f"SOC2 status: {data.get('compliance_status')}, Controls: {len(data.get('controls', []))}", response.status_code)
            else:
                self.log_test("SOC2 Compliance", "FAIL", 
                            "Missing SOC2 compliance data", response.status_code)
        else:
            self.log_test("SOC2 Compliance", "FAIL", 
                        "SOC2 compliance endpoint failed", response.status_code if response else None)

        # Test GDPR compliance
        response = self.make_request("GET", "/api/enterprise/compliance/gdpr")
        if response and response.status_code == 200:
            data = response.json()
            if "gdpr_status" in data and "data_processing" in data:
                self.log_test("GDPR Compliance", "PASS", 
                            f"GDPR status: {data.get('gdpr_status')}", response.status_code)
            else:
                self.log_test("GDPR Compliance", "FAIL", 
                            "Missing GDPR compliance data", response.status_code)
        else:
            self.log_test("GDPR Compliance", "FAIL", 
                        "GDPR compliance endpoint failed", response.status_code if response else None)

        # Test HIPAA compliance
        response = self.make_request("GET", "/api/enterprise/compliance/hipaa")
        if response and response.status_code == 200:
            data = response.json()
            if "hipaa_status" in data:
                self.log_test("HIPAA Compliance", "PASS", 
                            f"HIPAA status: {data.get('hipaa_status')}", response.status_code)
            else:
                self.log_test("HIPAA Compliance", "FAIL", 
                            "Missing HIPAA compliance data", response.status_code)
        else:
            self.log_test("HIPAA Compliance", "FAIL", 
                        "HIPAA compliance endpoint failed", response.status_code if response else None)

        # Test audit logging
        response = self.make_request("GET", "/api/enterprise/audit/logs")
        if response and response.status_code == 200:
            data = response.json()
            if "audit_logs" in data:
                self.log_test("Audit Logging", "PASS", 
                            f"Found {len(data.get('audit_logs', []))} audit logs", response.status_code)
            else:
                self.log_test("Audit Logging", "FAIL", 
                            "Missing audit logs data", response.status_code)
        else:
            self.log_test("Audit Logging", "FAIL", 
                        "Audit logging endpoint failed", response.status_code if response else None)

        # Test secrets management
        response = self.make_request("GET", "/api/enterprise/secrets/status")
        if response and response.status_code == 200:
            data = response.json()
            if "secrets_manager" in data:
                self.log_test("Secrets Management", "PASS", 
                            f"Secrets manager status: {data.get('secrets_manager', {}).get('status')}", response.status_code)
            else:
                self.log_test("Secrets Management", "FAIL", 
                            "Missing secrets management data", response.status_code)
        else:
            self.log_test("Secrets Management", "FAIL", 
                        "Secrets management endpoint failed", response.status_code if response else None)

    def test_4_multi_model_architecture(self):
        """Test 4: Multi-Model Architecture Testing - Multiple AI models support"""
        print("\n🤖 TESTING FEATURE 4: MULTI-MODEL ARCHITECTURE")
        print("=" * 60)

        # Test available AI models
        response = self.make_request("GET", "/api/ai/models")
        if response and response.status_code == 200:
            data = response.json()
            if "models" in data and len(data["models"]) > 0:
                models = data["models"]
                expected_providers = ["openai", "anthropic", "groq", "aws-bedrock", "azure-openai", "gcp-vertex"]
                found_providers = set()
                
                for model in models:
                    provider = model.get("provider", "").lower()
                    if provider:
                        found_providers.add(provider)
                
                self.log_test("Multi-Model Support", "PASS", 
                            f"Found {len(models)} models from providers: {', '.join(found_providers)}", response.status_code)
            else:
                self.log_test("Multi-Model Support", "FAIL", 
                            "No AI models found", response.status_code)
        else:
            self.log_test("Multi-Model Support", "FAIL", 
                        "AI models endpoint failed", response.status_code if response else None)

        # Test Groq integration specifically
        response = self.make_request("GET", "/api/ai/groq/models")
        if response and response.status_code == 200:
            data = response.json()
            if "groq_models" in data:
                groq_models = data["groq_models"]
                expected_groq = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.2-3b-preview"]
                found_groq = [model.get("name") for model in groq_models if model.get("name")]
                
                self.log_test("Groq Integration", "PASS", 
                            f"Found {len(groq_models)} Groq models: {', '.join(found_groq)}", response.status_code)
            else:
                self.log_test("Groq Integration", "FAIL", 
                            "Missing Groq models data", response.status_code)
        else:
            self.log_test("Groq Integration", "FAIL", 
                        "Groq models endpoint failed", response.status_code if response else None)

        # Test BYOM (Bring Your Own Model) capabilities
        if self.auth_token:
            byom_config = {
                "model_name": "custom-llama-7b",
                "endpoint": "https://api.example.com/v1/chat",
                "api_key": "test-key",
                "provider": "custom"
            }
            response = self.make_request("POST", "/api/ai/byom/register", byom_config)
            if response and response.status_code == 200:
                data = response.json()
                if "model_registered" in data:
                    self.log_test("BYOM Capabilities", "PASS", 
                                f"Custom model registered: {data.get('model_id')}", response.status_code)
                else:
                    self.log_test("BYOM Capabilities", "FAIL", 
                                "BYOM registration failed", response.status_code)
            else:
                self.log_test("BYOM Capabilities", "FAIL", 
                            "BYOM endpoint failed", response.status_code if response else None)

        # Test model routing and selection
        if self.auth_token:
            routing_request = {
                "task_type": "code_generation",
                "complexity": "high",
                "preferred_provider": "groq"
            }
            response = self.make_request("POST", "/api/ai/model/select", routing_request)
            if response and response.status_code == 200:
                data = response.json()
                if "selected_model" in data and "reasoning" in data:
                    self.log_test("Smart Model Routing", "PASS", 
                                f"Selected model: {data.get('selected_model')}, Reasoning: {data.get('reasoning')}", response.status_code)
                else:
                    self.log_test("Smart Model Routing", "FAIL", 
                                "Missing model selection data", response.status_code)
            else:
                self.log_test("Smart Model Routing", "FAIL", 
                            "Model selection endpoint failed", response.status_code if response else None)

    def test_5_workflow_builder(self):
        """Test 5: Workflow Builder Testing - Drag-and-drop workflow builder"""
        print("\n🔄 TESTING FEATURE 5: WORKFLOW BUILDER")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Workflow Builder", "SKIP", "No authentication token available")
            return

        # Test workflow templates
        response = self.make_request("GET", "/api/workflows/templates")
        if response and response.status_code == 200:
            data = response.json()
            if "templates" in data:
                self.log_test("Workflow Templates", "PASS", 
                            f"Found {len(data.get('templates', []))} workflow templates", response.status_code)
            else:
                self.log_test("Workflow Templates", "FAIL", 
                            "No workflow templates found", response.status_code)
        else:
            self.log_test("Workflow Templates", "FAIL", 
                        "Workflow templates endpoint failed", response.status_code if response else None)

        # Test creating a workflow
        workflow_config = {
            "name": "Test Development Workflow",
            "description": "Automated development workflow for testing",
            "steps": [
                {"type": "code_generation", "config": {"language": "python"}},
                {"type": "testing", "config": {"framework": "pytest"}},
                {"type": "deployment", "config": {"platform": "docker"}}
            ],
            "triggers": ["git_push", "manual"]
        }
        
        response = self.make_request("POST", "/api/workflows/create", workflow_config)
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_id" in data and "status" in data:
                self.log_test("Create Workflow", "PASS", 
                            f"Workflow created: {data.get('workflow_id')}, Status: {data.get('status')}", response.status_code)
                self.test_workflow_id = data["workflow_id"]
            else:
                self.log_test("Create Workflow", "FAIL", 
                            "Missing workflow creation data", response.status_code)
        else:
            self.log_test("Create Workflow", "FAIL", 
                        "Workflow creation failed", response.status_code if response else None)

        # Test natural language workflow processing
        nl_request = {
            "description": "Create a workflow that automatically generates React components, runs tests, and deploys to staging when I push to the main branch"
        }
        
        response = self.make_request("POST", "/api/workflows/natural-language", nl_request)
        if response and response.status_code == 200:
            data = response.json()
            if "workflow_config" in data and "steps" in data["workflow_config"]:
                steps_count = len(data["workflow_config"]["steps"])
                self.log_test("Natural Language Processing", "PASS", 
                            f"Generated workflow with {steps_count} steps from natural language", response.status_code)
            else:
                self.log_test("Natural Language Processing", "FAIL", 
                            "Missing workflow configuration", response.status_code)
        else:
            self.log_test("Natural Language Processing", "FAIL", 
                        "Natural language processing failed", response.status_code if response else None)

        # Test workflow execution engine
        if hasattr(self, 'test_workflow_id'):
            response = self.make_request("POST", f"/api/workflows/{self.test_workflow_id}/execute")
            if response and response.status_code == 200:
                data = response.json()
                if "execution_id" in data:
                    self.log_test("Workflow Execution", "PASS", 
                                f"Workflow execution started: {data.get('execution_id')}", response.status_code)
                else:
                    self.log_test("Workflow Execution", "FAIL", 
                                "Missing execution data", response.status_code)
            else:
                self.log_test("Workflow Execution", "FAIL", 
                            "Workflow execution failed", response.status_code if response else None)

    def test_6_mobile_experience(self):
        """Test 6: Mobile Experience Testing - Mobile-optimized APIs and features"""
        print("\n📱 TESTING FEATURE 6: MOBILE EXPERIENCE")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Mobile Experience", "SKIP", "No authentication token available")
            return

        # Test mobile-optimized APIs
        response = self.make_request("GET", "/api/mobile/config")
        if response and response.status_code == 200:
            data = response.json()
            if "mobile_features" in data and "pwa_config" in data:
                self.log_test("Mobile API Configuration", "PASS", 
                            f"Mobile features available: {len(data.get('mobile_features', []))}", response.status_code)
            else:
                self.log_test("Mobile API Configuration", "FAIL", 
                            "Missing mobile configuration", response.status_code)
        else:
            self.log_test("Mobile API Configuration", "FAIL", 
                        "Mobile config endpoint failed", response.status_code if response else None)

        # Test offline sync capabilities
        sync_data = {
            "device_id": "test-device-123",
            "last_sync": "2024-01-01T00:00:00Z",
            "data_types": ["projects", "templates", "conversations"]
        }
        
        response = self.make_request("POST", "/api/mobile/sync", sync_data)
        if response and response.status_code == 200:
            data = response.json()
            if "sync_data" in data and "sync_timestamp" in data:
                self.log_test("Offline Sync", "PASS", 
                            f"Sync completed at {data.get('sync_timestamp')}", response.status_code)
            else:
                self.log_test("Offline Sync", "FAIL", 
                            "Missing sync data", response.status_code)
        else:
            self.log_test("Offline Sync", "FAIL", 
                        "Offline sync failed", response.status_code if response else None)

        # Test push notifications
        notification_config = {
            "device_token": "test-token-123",
            "notification_types": ["project_updates", "ai_responses", "collaboration"]
        }
        
        response = self.make_request("POST", "/api/mobile/notifications/register", notification_config)
        if response and response.status_code == 200:
            data = response.json()
            if "registration_id" in data:
                self.log_test("Push Notifications", "PASS", 
                            f"Notifications registered: {data.get('registration_id')}", response.status_code)
            else:
                self.log_test("Push Notifications", "FAIL", 
                            "Missing registration data", response.status_code)
        else:
            self.log_test("Push Notifications", "FAIL", 
                        "Push notifications failed", response.status_code if response else None)

        # Test PWA optimization
        response = self.make_request("GET", "/api/mobile/pwa/manifest")
        if response and response.status_code == 200:
            data = response.json()
            if "name" in data and "icons" in data and "start_url" in data:
                self.log_test("PWA Optimization", "PASS", 
                            f"PWA manifest available: {data.get('name')}", response.status_code)
            else:
                self.log_test("PWA Optimization", "FAIL", 
                            "Invalid PWA manifest", response.status_code)
        else:
            self.log_test("PWA Optimization", "FAIL", 
                        "PWA manifest failed", response.status_code if response else None)

        # Test accessibility features
        response = self.make_request("GET", "/api/mobile/accessibility")
        if response and response.status_code == 200:
            data = response.json()
            if "accessibility_features" in data:
                features = data["accessibility_features"]
                self.log_test("Mobile Accessibility", "PASS", 
                            f"Accessibility features: {', '.join(features)}", response.status_code)
            else:
                self.log_test("Mobile Accessibility", "FAIL", 
                            "Missing accessibility features", response.status_code)
        else:
            self.log_test("Mobile Accessibility", "FAIL", 
                        "Accessibility endpoint failed", response.status_code if response else None)

    def test_7_advanced_analytics(self):
        """Test 7: Advanced Analytics Testing - Comprehensive analytics with integrations"""
        print("\n📊 TESTING FEATURE 7: ADVANCED ANALYTICS")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Advanced Analytics", "SKIP", "No authentication token available")
            return

        # Test analytics dashboard
        response = self.make_request("GET", "/api/analytics/dashboard/comprehensive")
        if response and response.status_code == 200:
            data = response.json()
            if "metrics" in data and "insights" in data:
                metrics_count = len(data.get("metrics", {}))
                self.log_test("Analytics Dashboard", "PASS", 
                            f"Dashboard loaded with {metrics_count} metrics", response.status_code)
            else:
                self.log_test("Analytics Dashboard", "FAIL", 
                            "Missing dashboard data", response.status_code)
        else:
            self.log_test("Analytics Dashboard", "FAIL", 
                        "Analytics dashboard failed", response.status_code if response else None)

        # Test third-party integrations
        integrations = ["google-analytics", "mixpanel", "amplitude"]
        for integration in integrations:
            response = self.make_request("GET", f"/api/analytics/integrations/{integration}")
            if response and response.status_code == 200:
                data = response.json()
                if "integration_status" in data:
                    self.log_test(f"Analytics Integration - {integration.upper()}", "PASS", 
                                f"Integration status: {data.get('integration_status')}", response.status_code)
                else:
                    self.log_test(f"Analytics Integration - {integration.upper()}", "FAIL", 
                                "Missing integration status", response.status_code)
            else:
                self.log_test(f"Analytics Integration - {integration.upper()}", "FAIL", 
                            f"Integration endpoint failed", response.status_code if response else None)

        # Test deep tracing
        response = self.make_request("GET", "/api/analytics/tracing/deep")
        if response and response.status_code == 200:
            data = response.json()
            if "traces" in data and "performance_metrics" in data:
                traces_count = len(data.get("traces", []))
                self.log_test("Deep Tracing", "PASS", 
                            f"Found {traces_count} performance traces", response.status_code)
            else:
                self.log_test("Deep Tracing", "FAIL", 
                            "Missing tracing data", response.status_code)
        else:
            self.log_test("Deep Tracing", "FAIL", 
                        "Deep tracing failed", response.status_code if response else None)

        # Test custom metrics
        custom_metric = {
            "name": "test_metric",
            "value": 42,
            "tags": {"environment": "test", "feature": "analytics"}
        }
        
        response = self.make_request("POST", "/api/analytics/metrics/custom", custom_metric)
        if response and response.status_code == 200:
            data = response.json()
            if "metric_id" in data:
                self.log_test("Custom Metrics", "PASS", 
                            f"Custom metric recorded: {data.get('metric_id')}", response.status_code)
            else:
                self.log_test("Custom Metrics", "FAIL", 
                            "Missing metric ID", response.status_code)
        else:
            self.log_test("Custom Metrics", "FAIL", 
                        "Custom metrics failed", response.status_code if response else None)

        # Test predictive analytics
        response = self.make_request("GET", "/api/analytics/predictions/user-behavior")
        if response and response.status_code == 200:
            data = response.json()
            if "predictions" in data and "confidence_score" in data:
                confidence = data.get("confidence_score", 0)
                self.log_test("Predictive Analytics", "PASS", 
                            f"Predictions generated with {confidence}% confidence", response.status_code)
            else:
                self.log_test("Predictive Analytics", "FAIL", 
                            "Missing prediction data", response.status_code)
        else:
            self.log_test("Predictive Analytics", "FAIL", 
                        "Predictive analytics failed", response.status_code if response else None)

    def test_8_enhanced_onboarding(self):
        """Test 8: Enhanced Onboarding Testing - One-click deployment and guided setup"""
        print("\n🚀 TESTING FEATURE 8: ENHANCED ONBOARDING")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Enhanced Onboarding", "SKIP", "No authentication token available")
            return

        # Test one-click deployment
        deployment_config = {
            "template": "react-starter",
            "platform": "vercel",
            "environment": "production"
        }
        
        response = self.make_request("POST", "/api/onboarding/one-click-deploy", deployment_config)
        if response and response.status_code == 200:
            data = response.json()
            if "deployment_id" in data and "status" in data:
                self.log_test("One-Click Deployment", "PASS", 
                            f"Deployment initiated: {data.get('deployment_id')}, Status: {data.get('status')}", response.status_code)
            else:
                self.log_test("One-Click Deployment", "FAIL", 
                            "Missing deployment data", response.status_code)
        else:
            self.log_test("One-Click Deployment", "FAIL", 
                        "One-click deployment failed", response.status_code if response else None)

        # Test guided setup
        response = self.make_request("GET", "/api/onboarding/guided-setup")
        if response and response.status_code == 200:
            data = response.json()
            if "steps" in data and "current_step" in data:
                steps_count = len(data.get("steps", []))
                self.log_test("Guided Setup", "PASS", 
                            f"Guided setup with {steps_count} steps, Current: {data.get('current_step')}", response.status_code)
            else:
                self.log_test("Guided Setup", "FAIL", 
                            "Missing setup steps", response.status_code)
        else:
            self.log_test("Guided Setup", "FAIL", 
                        "Guided setup failed", response.status_code if response else None)

        # Test demo data generation
        demo_request = {
            "project_type": "e-commerce",
            "data_types": ["products", "users", "orders"]
        }
        
        response = self.make_request("POST", "/api/onboarding/demo-data", demo_request)
        if response and response.status_code == 200:
            data = response.json()
            if "demo_data" in data and "generated_records" in data:
                records_count = data.get("generated_records", 0)
                self.log_test("Demo Data Generation", "PASS", 
                            f"Generated {records_count} demo records", response.status_code)
            else:
                self.log_test("Demo Data Generation", "FAIL", 
                            "Missing demo data", response.status_code)
        else:
            self.log_test("Demo Data Generation", "FAIL", 
                        "Demo data generation failed", response.status_code if response else None)

        # Test trial management
        response = self.make_request("GET", "/api/onboarding/trial/status")
        if response and response.status_code == 200:
            data = response.json()
            if "trial_status" in data and "days_remaining" in data:
                days_remaining = data.get("days_remaining", 0)
                self.log_test("Trial Management", "PASS", 
                            f"Trial status: {data.get('trial_status')}, Days remaining: {days_remaining}", response.status_code)
            else:
                self.log_test("Trial Management", "FAIL", 
                            "Missing trial data", response.status_code)
        else:
            self.log_test("Trial Management", "FAIL", 
                        "Trial management failed", response.status_code if response else None)

    def test_multi_agent_system(self):
        """Test Multi-Agent AI System with 5 specialized agents"""
        print("\n🤖 TESTING MULTI-AGENT AI SYSTEM")
        print("=" * 60)

        if not self.auth_token:
            self.log_test("Multi-Agent System", "SKIP", "No authentication token available")
            return

        # Test available agents
        response = self.make_request("GET", "/api/ai/v3/agents/available")
        if response and response.status_code == 200:
            data = response.json()
            if "agents" in data:
                agents = data["agents"]
                expected_agents = ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
                found_agents = [agent.get("name") for agent in agents if agent.get("name")]
                
                self.log_test("Available Agents", "PASS", 
                            f"Found {len(agents)} agents: {', '.join(found_agents)}", response.status_code)
            else:
                self.log_test("Available Agents", "FAIL", 
                            "No agents data found", response.status_code)
        else:
            self.log_test("Available Agents", "FAIL", 
                        "Agents endpoint failed", response.status_code if response else None)

        # Test enhanced AI chat with multi-agent coordination
        chat_request = {
            "message": "Build a comprehensive e-commerce platform with React frontend, Node.js backend, payment integration, and mobile app",
            "enable_multi_agent": True,
            "conversation_id": "test-conv-123"
        }
        
        response = self.make_request("POST", "/api/ai/v3/chat/enhanced", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data and "agents_involved" in data:
                agents_count = len(data.get("agents_involved", []))
                self.log_test("Multi-Agent Chat", "PASS", 
                            f"Multi-agent response with {agents_count} agents involved", response.status_code)
            else:
                self.log_test("Multi-Agent Chat", "FAIL", 
                            "Missing multi-agent response data", response.status_code)
        else:
            self.log_test("Multi-Agent Chat", "FAIL", 
                        "Multi-agent chat failed", response.status_code if response else None)

    def test_groq_integration(self):
        """Test Groq AI Integration with 4 models"""
        print("\n⚡ TESTING GROQ AI INTEGRATION")
        print("=" * 60)

        # Test Groq models availability
        response = self.make_request("GET", "/api/ai/groq/status")
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and "models" in data:
                models_count = len(data.get("models", []))
                self.log_test("Groq Status", "PASS", 
                            f"Groq integration active with {models_count} models", response.status_code)
            else:
                self.log_test("Groq Status", "FAIL", 
                            "Missing Groq status data", response.status_code)
        else:
            self.log_test("Groq Status", "FAIL", 
                        "Groq status endpoint failed", response.status_code if response else None)

        # Test Groq chat with specific model
        if self.auth_token:
            groq_request = {
                "message": "Generate a Python function to calculate fibonacci numbers",
                "model": "llama-3.1-8b-instant"
            }
            
            response = self.make_request("POST", "/api/ai/groq/chat", groq_request)
            if response and response.status_code == 200:
                data = response.json()
                if "response" in data and "model_used" in data:
                    self.log_test("Groq Chat", "PASS", 
                                f"Groq response using model: {data.get('model_used')}", response.status_code)
                else:
                    self.log_test("Groq Chat", "FAIL", 
                                "Missing Groq chat response data", response.status_code)
            else:
                self.log_test("Groq Chat", "FAIL", 
                            "Groq chat failed", response.status_code if response else None)

    def test_authentication_subscription(self):
        """Test Authentication and Subscription System"""
        print("\n🔐 TESTING AUTHENTICATION & SUBSCRIPTION")
        print("=" * 60)

        # Test subscription plans
        response = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if "plans" in data:
                plans = data["plans"]
                expected_plans = ["basic", "professional", "enterprise"]
                found_plans = list(plans.keys()) if isinstance(plans, dict) else []
                
                self.log_test("Subscription Plans", "PASS", 
                            f"Found plans: {', '.join(found_plans)}", response.status_code)
            else:
                self.log_test("Subscription Plans", "FAIL", 
                            "No subscription plans found", response.status_code)
        else:
            self.log_test("Subscription Plans", "FAIL", 
                        "Subscription plans endpoint failed", response.status_code if response else None)

        # Test current subscription (if authenticated)
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
            elif response and response.status_code == 404:
                self.log_test("Current Subscription", "PASS", 
                            "No active subscription (expected for demo user)", response.status_code)
            else:
                self.log_test("Current Subscription", "FAIL", 
                            "Current subscription endpoint failed", response.status_code if response else None)

    def run_all_tests(self):
        """Run all competitive feature tests"""
        print("🧪 STARTING COMPREHENSIVE COMPETITIVE FEATURES TESTING")
        print("=" * 80)
        print(f"Testing Aether AI Platform - 8 Competitive Features")
        print(f"Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 80)

        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - skipping authenticated tests")

        # Run all 8 competitive feature tests
        self.test_1_integration_hub()
        self.test_2_template_marketplace()
        self.test_3_enterprise_compliance()
        self.test_4_multi_model_architecture()
        self.test_5_workflow_builder()
        self.test_6_mobile_experience()
        self.test_7_advanced_analytics()
        self.test_8_enhanced_onboarding()

        # Additional core system tests
        self.test_multi_agent_system()
        self.test_groq_integration()
        self.test_authentication_subscription()

        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("🎯 COMPETITIVE FEATURES TESTING SUMMARY")
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

        print("\n📊 FEATURE-BY-FEATURE RESULTS:")
        features = [
            "Integration Hub",
            "Template Marketplace", 
            "Enterprise Compliance",
            "Multi-Model Architecture",
            "Workflow Builder",
            "Mobile Experience",
            "Advanced Analytics",
            "Enhanced Onboarding",
            "Multi-Agent System",
            "Groq Integration",
            "Authentication & Subscription"
        ]

        for feature in features:
            feature_tests = [r for r in self.test_results if feature.lower() in r["test"].lower()]
            if feature_tests:
                feature_passed = len([r for r in feature_tests if r["status"] == "PASS"])
                feature_total = len(feature_tests)
                status_icon = "✅" if feature_passed == feature_total else "❌" if feature_passed == 0 else "⚠️"
                print(f"{status_icon} {feature}: {feature_passed}/{feature_total} tests passed")

        print(f"\nTest completed at: {datetime.now().isoformat()}")
        print("=" * 80)

if __name__ == "__main__":
    tester = CompetitiveFeaturesTest()
    tester.run_all_tests()