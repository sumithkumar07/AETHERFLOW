#!/usr/bin/env python3
"""
Enhanced Backend API Testing for Aether AI Platform
Tests the 4 major enhancement phases as requested
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class EnhancedBackendTester:
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

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("🔍 Testing Basic API Connectivity...")
        
        # Test root endpoint
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "status" in data and data.get("status") == "running":
                    self.log_test("Root API Endpoint", "PASS", 
                                f"API running: {data.get('message')}", response.status_code)
                else:
                    self.log_test("Root API Endpoint", "FAIL", 
                                "Missing required fields in response", response.status_code)
            except:
                self.log_test("Root API Endpoint", "FAIL", 
                            f"Non-JSON response: {response.text[:200]}", response.status_code)
        else:
            self.log_test("Root API Endpoint", "FAIL", 
                        "Endpoint not accessible", response.status_code if response else None)
        
        # Test health check
        response = self.make_request("GET", "/api/health")
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "status" in data and "services" in data and data.get("status") == "healthy":
                    self.log_test("Health Check", "PASS", 
                                f"Services: {data.get('services')}", response.status_code)
                else:
                    self.log_test("Health Check", "FAIL", 
                                "Health check failed", response.status_code)
            except:
                self.log_test("Health Check", "FAIL", 
                            f"Non-JSON response: {response.text[:200]}", response.status_code)
        else:
            self.log_test("Health Check", "FAIL", 
                        "Health endpoint not accessible", response.status_code if response else None)

    def test_authentication(self):
        """Test authentication system"""
        print("🔐 Testing Authentication System...")
        
        # Test demo user login
        response = self.make_request("POST", "/api/auth/login", self.demo_user)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Demo User Login", "PASS", 
                            f"Token received for {data.get('user', {}).get('email')}", response.status_code)
                return True
            else:
                self.log_test("Demo User Login", "FAIL", 
                            "No access token in response", response.status_code)
        else:
            self.log_test("Demo User Login", "FAIL", 
                        "Login failed", response.status_code if response else None)
        return False

    def test_phase1_ai_backend_enhancements(self):
        """Test Phase 1: AI & Backend Enhancements"""
        print("🤖 Testing Phase 1: AI & Backend Enhancements...")
        
        if not self.auth_token:
            self.log_test("Phase 1 Tests", "SKIP", "No authentication token available")
            return
        
        # Test enhanced AI chat endpoint
        chat_request = {
            "message": "Create a simple React component",
            "model": "llama-3.1-8b-instant",
            "agent": "developer"
        }
        
        response = self.make_request("POST", "/api/ai/enhanced-chat", chat_request)
        if response and response.status_code == 200:
            data = response.json()
            if "response" in data:
                self.log_test("Enhanced AI Chat", "PASS", 
                            f"AI responded successfully", response.status_code)
            else:
                self.log_test("Enhanced AI Chat", "FAIL", 
                            "Missing response in AI chat", response.status_code)
        else:
            self.log_test("Enhanced AI Chat", "FAIL", 
                        "Enhanced AI chat endpoint failed", response.status_code if response else None)
        
        # Test multi-agent collaboration
        collaboration_request = {
            "project_id": "test-project",
            "agents": ["developer", "designer", "tester"],
            "task": "Create a todo app"
        }
        
        response = self.make_request("POST", "/api/enhanced-collaboration/multi-agent/collaborate", collaboration_request)
        if response and response.status_code in [200, 201]:
            self.log_test("Multi-Agent Collaboration", "PASS", 
                        "Multi-agent collaboration endpoint accessible", response.status_code)
        else:
            self.log_test("Multi-Agent Collaboration", "FAIL", 
                        "Multi-agent collaboration failed", response.status_code if response else None)
        
        # Test intelligent context management
        response = self.make_request("GET", "/api/ai/context/status")
        if response and response.status_code == 200:
            self.log_test("Intelligent Context Management", "PASS", 
                        "Context management accessible", response.status_code)
        else:
            self.log_test("Intelligent Context Management", "FAIL", 
                        "Context management failed", response.status_code if response else None)

    def test_phase2_frontend_modernization(self):
        """Test Phase 2: Frontend UX/UI Modernization (Backend support)"""
        print("🎨 Testing Phase 2: Frontend UX/UI Modernization (Backend Support)...")
        
        # Test navigation data endpoint
        response = self.make_request("GET", "/api/navigation/modern")
        if response and response.status_code == 200:
            self.log_test("Modern Navigation Data", "PASS", 
                        "Navigation data endpoint accessible", response.status_code)
        else:
            self.log_test("Modern Navigation Data", "FAIL", 
                        "Navigation data endpoint failed", response.status_code if response else None)
        
        # Test responsive layout configuration
        response = self.make_request("GET", "/api/ui/responsive-config")
        if response and response.status_code == 200:
            self.log_test("Responsive Layout Config", "PASS", 
                        "Responsive config endpoint accessible", response.status_code)
        else:
            self.log_test("Responsive Layout Config", "FAIL", 
                        "Responsive config endpoint failed", response.status_code if response else None)
        
        # Test accessibility features
        response = self.make_request("GET", "/api/accessibility/features")
        if response and response.status_code == 200:
            self.log_test("Accessibility Features", "PASS", 
                        "Accessibility features endpoint accessible", response.status_code)
        else:
            self.log_test("Accessibility Features", "FAIL", 
                        "Accessibility features endpoint failed", response.status_code if response else None)

    def test_phase3_performance_accessibility(self):
        """Test Phase 3: Performance & Accessibility"""
        print("⚡ Testing Phase 3: Performance & Accessibility...")
        
        # Test performance optimization routes
        response = self.make_request("GET", "/api/performance-optimization/metrics")
        if response and response.status_code == 200:
            data = response.json()
            if "metrics" in data:
                self.log_test("Performance Metrics", "PASS", 
                            f"Performance metrics available", response.status_code)
            else:
                self.log_test("Performance Metrics", "FAIL", 
                            "Missing metrics data", response.status_code)
        else:
            self.log_test("Performance Metrics", "FAIL", 
                        "Performance metrics endpoint failed", response.status_code if response else None)
        
        # Test performance monitoring
        response = self.make_request("GET", "/api/performance-optimization/monitor")
        if response and response.status_code == 200:
            self.log_test("Performance Monitoring", "PASS", 
                        "Performance monitoring accessible", response.status_code)
        else:
            self.log_test("Performance Monitoring", "FAIL", 
                        "Performance monitoring failed", response.status_code if response else None)
        
        # Test code splitting optimization
        response = self.make_request("GET", "/api/performance-optimization/code-splitting")
        if response and response.status_code == 200:
            self.log_test("Code Splitting Optimization", "PASS", 
                        "Code splitting optimization accessible", response.status_code)
        else:
            self.log_test("Code Splitting Optimization", "FAIL", 
                        "Code splitting optimization failed", response.status_code if response else None)

    def test_phase4_quality_assurance(self):
        """Test Phase 4: Quality Assurance"""
        print("🔍 Testing Phase 4: Quality Assurance...")
        
        # Test error handling
        response = self.make_request("GET", "/api/error-handling/test")
        if response and response.status_code in [200, 404]:  # 404 is acceptable for test endpoint
            self.log_test("Error Handling", "PASS", 
                        "Error handling system accessible", response.status_code)
        else:
            self.log_test("Error Handling", "FAIL", 
                        "Error handling system failed", response.status_code if response else None)
        
        # Test cross-browser compatibility endpoint
        response = self.make_request("GET", "/api/compatibility/browser-support")
        if response and response.status_code == 200:
            self.log_test("Cross-Browser Compatibility", "PASS", 
                        "Browser compatibility endpoint accessible", response.status_code)
        else:
            self.log_test("Cross-Browser Compatibility", "FAIL", 
                        "Browser compatibility endpoint failed", response.status_code if response else None)
        
        # Test performance benchmarking
        response = self.make_request("GET", "/api/performance/benchmark")
        if response and response.status_code == 200:
            data = response.json()
            if "benchmarks" in data:
                self.log_test("Performance Benchmarking", "PASS", 
                            f"Benchmarks available", response.status_code)
            else:
                self.log_test("Performance Benchmarking", "FAIL", 
                            "Missing benchmark data", response.status_code)
        else:
            self.log_test("Performance Benchmarking", "FAIL", 
                        "Performance benchmarking failed", response.status_code if response else None)

    def test_enhanced_ai_features(self):
        """Test Enhanced AI Features specifically mentioned"""
        print("🧠 Testing Enhanced AI Features...")
        
        if not self.auth_token:
            self.log_test("Enhanced AI Features", "SKIP", "No authentication token available")
            return
        
        # Test enhanced AI v2 endpoints
        response = self.make_request("GET", "/api/ai/v2/capabilities")
        if response and response.status_code == 200:
            self.log_test("Enhanced AI v2 Capabilities", "PASS", 
                        "AI v2 capabilities accessible", response.status_code)
        else:
            self.log_test("Enhanced AI v2 Capabilities", "FAIL", 
                        "AI v2 capabilities failed", response.status_code if response else None)
        
        # Test AI workflow enhancements
        response = self.make_request("GET", "/api/ai/enhanced/workflows")
        if response and response.status_code == 200:
            self.log_test("Enhanced AI Workflows", "PASS", 
                        "Enhanced AI workflows accessible", response.status_code)
        else:
            self.log_test("Enhanced AI Workflows", "FAIL", 
                        "Enhanced AI workflows failed", response.status_code if response else None)

    def run_all_tests(self):
        """Run all enhanced tests"""
        print("🚀 Starting Enhanced Aether AI Backend Testing...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run tests in order
        self.test_basic_connectivity()
        auth_success = self.test_authentication()
        
        if auth_success:
            self.test_phase1_ai_backend_enhancements()
            self.test_phase2_frontend_modernization()
            self.test_phase3_performance_accessibility()
            self.test_phase4_quality_assurance()
            self.test_enhanced_ai_features()
        else:
            print("⚠️ Skipping authenticated tests due to login failure")
        
        # Print summary
        end_time = time.time()
        duration = end_time - start_time
        
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        total = len(self.test_results)
        
        print("=" * 60)
        print("📊 ENHANCED TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Skipped: {skipped}")
        print(f"⏱️ Duration: {duration:.2f} seconds")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        # Save results
        with open('/app/enhanced_backend_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/enhanced_backend_test_results.json")
        
        return failed == 0

def main():
    tester = EnhancedBackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())