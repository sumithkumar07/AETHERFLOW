#!/usr/bin/env python3
"""
Focused 7-Day Trial System Testing
Tests the specific trial system implementation as requested
"""

import requests
import json
import random
from datetime import datetime

class TrialSystemTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
        
    def log_result(self, test_name: str, status: str, details: str = "", response_code: int = None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_code": response_code,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_code:
            print(f"   Response Code: {response_code}")
        print()

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None):
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def test_trial_system(self):
        """Test the complete 7-day trial system"""
        print("🎯 Testing 7-Day Free Trial System")
        print("=" * 50)
        
        # Test 1: Registration with Auto-Trial Creation
        print("1️⃣ Testing Auto-Trial Creation on Registration...")
        trial_user = {
            "email": f"trialtest{random.randint(10000,99999)}@example.com",
            "name": "Trial Test User",
            "password": "testpassword123"
        }
        
        response = self.make_request("POST", "/api/auth/register", trial_user)
        if response and response.status_code == 200:
            data = response.json()
            if ("access_token" in data and "trial_created" in data and 
                data.get("trial_created") == True):
                self.log_result("Auto-Trial Creation", "PASS", 
                              f"Trial created for {trial_user['email']}", response.status_code)
                self.auth_token = data["access_token"]
                self.user_email = trial_user["email"]
            else:
                self.log_result("Auto-Trial Creation", "FAIL", 
                              "Trial not created properly", response.status_code)
                return
        else:
            self.log_result("Auto-Trial Creation", "FAIL", 
                          "Registration failed", response.status_code if response else None)
            return
        
        # Test 2: Trial Status API
        print("2️⃣ Testing Trial Status API...")
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = self.make_request("GET", "/api/subscription/trial/status", headers=headers)
        if response and response.status_code == 200:
            data = response.json()
            if data.get("is_trial_active") == True and data.get("trial_days_remaining", 0) > 0:
                self.log_result("Trial Status API", "PASS", 
                              f"Active trial with {data.get('trial_days_remaining')} days remaining", response.status_code)
            else:
                self.log_result("Trial Status API", "FAIL", 
                              f"Trial not active: {data}", response.status_code)
        else:
            self.log_result("Trial Status API", "FAIL", 
                          "Trial status endpoint failed", response.status_code if response else None)
        
        # Test 3: Subscription Plans with Trial Config
        print("3️⃣ Testing Subscription Plans API...")
        response = self.make_request("GET", "/api/subscription/plans")
        if response and response.status_code == 200:
            data = response.json()
            if ("plans" in data and "basic" in data["plans"] and 
                "trial" in data["plans"]["basic"]):
                trial_config = data["plans"]["basic"]["trial"]
                if (trial_config.get("tokens_per_week") == 50000 and 
                    trial_config.get("duration_days") == 7):
                    self.log_result("Plans with Trial Config", "PASS", 
                                  "Basic plan has correct trial: 50K tokens/week for 7 days", response.status_code)
                else:
                    self.log_result("Plans with Trial Config", "FAIL", 
                                  f"Incorrect trial config: {trial_config}", response.status_code)
            else:
                self.log_result("Plans with Trial Config", "FAIL", 
                              "Trial config missing from plans", response.status_code)
        else:
            self.log_result("Plans with Trial Config", "FAIL", 
                          "Plans endpoint failed", response.status_code if response else None)
        
        # Test 4: Current Subscription (Trial)
        print("4️⃣ Testing Current Subscription...")
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = self.make_request("GET", "/api/subscription/current", headers=headers)
        if response and response.status_code == 200:
            data = response.json()
            if (data.get("status") == "trialing" and 
                data.get("is_trial") == True):
                self.log_result("Current Subscription", "PASS", 
                              f"Trial subscription active: {data.get('plan')} plan", response.status_code)
            else:
                self.log_result("Current Subscription", "FAIL", 
                              f"Subscription not in trial: {data}", response.status_code)
        else:
            self.log_result("Current Subscription", "FAIL", 
                          "Current subscription endpoint failed", response.status_code if response else None)
        
        # Test 5: Trial Conversion
        print("5️⃣ Testing Trial Conversion...")
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        conversion_data = {
            "plan": "professional",
            "billing_interval": "monthly"
        }
        response = self.make_request("POST", "/api/subscription/trial/convert", conversion_data, headers=headers)
        if response and response.status_code == 200:
            data = response.json()
            if "professional" in data.get("message", "").lower():
                self.log_result("Trial Conversion", "PASS", 
                              f"Trial converted: {data.get('message')}", response.status_code)
            else:
                self.log_result("Trial Conversion", "FAIL", 
                              f"Conversion response invalid: {data}", response.status_code)
        else:
            self.log_result("Trial Conversion", "FAIL", 
                          "Trial conversion failed", response.status_code if response else None)
        
        # Generate Summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("=" * 50)
        print("📊 TRIAL SYSTEM TEST SUMMARY")
        print("=" * 50)
        
        total = len(self.results)
        passed = len([r for r in self.results if r["status"] == "PASS"])
        failed = len([r for r in self.results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if failed > 0:
            print("❌ FAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        else:
            print("🎉 ALL TRIAL SYSTEM TESTS PASSED!")
        
        print("=" * 50)

if __name__ == "__main__":
    tester = TrialSystemTester()
    tester.test_trial_system()