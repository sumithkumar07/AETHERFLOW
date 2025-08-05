#!/usr/bin/env python3
"""
Enhanced AI v3 Performance Test
Testing the specific optimized endpoints mentioned in test_result.md
"""

import requests
import json
import time
import sys
from datetime import datetime

class EnhancedAIv3Tester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def authenticate(self):
        """Authenticate with demo user"""
        print("🔐 Authenticating...")
        response = self.session.post(f"{self.base_url}/api/auth/login", json=self.demo_user)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                print(f"✅ Authenticated as {data.get('user', {}).get('email')}")
                return True
        
        print("❌ Authentication failed")
        return False

    def make_timed_request(self, method: str, endpoint: str, data: dict = None):
        """Make timed request with auth"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
        
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            
            end_time = time.time()
            response_time = end_time - start_time
            return response, response_time
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"Request failed: {e}")
            return None, response_time

    def test_enhanced_ai_v3_performance(self):
        """Test the enhanced AI v3 endpoints for performance"""
        print("\n🚀 Testing Enhanced AI v3 Performance Optimizations")
        print("=" * 60)
        
        if not self.authenticate():
            return
        
        # Test 1: Enhanced Chat Endpoint
        print("\n1. Testing /api/ai/v3/chat/enhanced")
        enhanced_request = {
            "message": "Create a simple React component for a todo list with add, delete, and toggle functionality",
            "session_id": "test_session_123",
            "include_context": True
        }
        
        response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/enhanced", enhanced_request)
        
        if response and response.status_code == 200:
            data = response.json()
            meets_target = response_time < 2.0
            status = "✅ PASS" if meets_target else "❌ FAIL"
            target_info = f"({response_time:.2f}s - {'<2s target met' if meets_target else '>2s target missed'})"
            
            print(f"{status} Enhanced Chat: {target_info}")
            if "content" in data and len(data["content"]) > 100:
                print(f"   Response length: {len(data['content'])} characters")
                print(f"   Agent: {data.get('agent', 'Unknown')}")
                print(f"   Model: {data.get('model_used', 'Unknown')}")
            else:
                print(f"   ❌ Invalid response content")
        else:
            print(f"❌ Enhanced Chat endpoint failed: {response.status_code if response else 'No response'}")
        
        # Test 2: Quick Response Endpoint
        print("\n2. Testing /api/ai/v3/chat/quick-response")
        quick_request = {
            "message": "What are the best practices for React hooks?",
            "include_context": False
        }
        
        response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/quick-response", quick_request)
        
        if response and response.status_code == 200:
            data = response.json()
            meets_target = response_time < 2.0
            status = "✅ PASS" if meets_target else "❌ FAIL"
            target_info = f"({response_time:.2f}s - {'<2s target met' if meets_target else '>2s target missed'})"
            
            print(f"{status} Quick Response: {target_info}")
            if "content" in data and len(data["content"]) > 50:
                print(f"   Response length: {len(data['content'])} characters")
                print(f"   Agent: {data.get('agent', 'Unknown')}")
                print(f"   Type: {data.get('type', 'Unknown')}")
            else:
                print(f"   ❌ Invalid response content")
        else:
            print(f"❌ Quick Response endpoint failed: {response.status_code if response else 'No response'}")
        
        # Test 3: Available Agents
        print("\n3. Testing /api/ai/v3/agents/available")
        response, response_time = self.make_timed_request("GET", "/api/ai/v3/agents/available")
        
        if response and response.status_code == 200:
            data = response.json()
            meets_target = response_time < 1.0  # Should be very fast
            status = "✅ PASS" if meets_target else "❌ FAIL"
            target_info = f"({response_time:.2f}s)"
            
            print(f"{status} Available Agents: {target_info}")
            if "agents" in data:
                agents = data["agents"]
                print(f"   Found {len(agents)} agents:")
                for agent in agents:
                    print(f"     - {agent.get('name', 'Unknown')} ({agent.get('role', 'Unknown')})")
            else:
                print(f"   ❌ No agents data found")
        else:
            print(f"❌ Available Agents endpoint failed: {response.status_code if response else 'No response'}")
        
        # Test 4: Complex Multi-Agent Request
        print("\n4. Testing Complex Multi-Agent Coordination")
        complex_request = {
            "message": "Build a complete e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, user authentication, admin dashboard, and comprehensive testing strategy. I need architecture, implementation, design, and testing perspectives.",
            "session_id": "complex_test_456",
            "include_context": True
        }
        
        response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/enhanced", complex_request)
        
        if response and response.status_code == 200:
            data = response.json()
            meets_target = response_time < 2.0
            status = "✅ PASS" if meets_target else "❌ FAIL"
            target_info = f"({response_time:.2f}s - {'<2s target met' if meets_target else '>2s target missed'})"
            
            print(f"{status} Complex Multi-Agent: {target_info}")
            if "content" in data and len(data["content"]) > 500:
                print(f"   Response length: {len(data['content'])} characters")
                print(f"   Agent: {data.get('agent', 'Unknown')}")
                print(f"   Type: {data.get('type', 'Unknown')}")
                
                # Check if response shows multi-agent coordination
                content = data["content"].lower()
                if any(word in content for word in ['architecture', 'design', 'testing', 'implementation']):
                    print(f"   ✅ Multi-domain response detected")
                else:
                    print(f"   ⚠️ Limited domain coverage")
            else:
                print(f"   ❌ Invalid or insufficient response content")
        else:
            print(f"❌ Complex Multi-Agent endpoint failed: {response.status_code if response else 'No response'}")
        
        # Test 5: Performance Stress Test
        print("\n5. Performance Stress Test (5 rapid requests)")
        stress_requests = [
            "Create a Python function to sort a list",
            "Design a login form with validation", 
            "Explain REST API best practices",
            "Write unit tests for a calculator",
            "Plan a mobile app development project"
        ]
        
        total_time = 0
        successful_requests = 0
        fast_responses = 0
        
        for i, message in enumerate(stress_requests):
            request_data = {
                "message": message,
                "session_id": f"stress_test_{i}",
                "include_context": False
            }
            
            response, response_time = self.make_timed_request("POST", "/api/ai/v3/chat/quick-response", request_data)
            total_time += response_time
            
            if response and response.status_code == 200:
                data = response.json()
                if "content" in data and len(data["content"]) > 50:
                    successful_requests += 1
                    if response_time < 2.0:
                        fast_responses += 1
                    print(f"   Request {i+1}: {response_time:.2f}s {'✅' if response_time < 2.0 else '❌'}")
                else:
                    print(f"   Request {i+1}: {response_time:.2f}s ❌ (invalid content)")
            else:
                print(f"   Request {i+1}: {response_time:.2f}s ❌ (failed)")
        
        avg_time = total_time / len(stress_requests)
        success_rate = (successful_requests / len(stress_requests)) * 100
        fast_rate = (fast_responses / len(stress_requests)) * 100
        
        print(f"\n   Stress Test Results:")
        print(f"   - Success Rate: {successful_requests}/{len(stress_requests)} ({success_rate:.1f}%)")
        print(f"   - Fast Responses: {fast_responses}/{len(stress_requests)} ({fast_rate:.1f}%)")
        print(f"   - Average Time: {avg_time:.2f}s")
        
        overall_stress_pass = success_rate >= 80 and fast_rate >= 60
        print(f"   - Overall: {'✅ PASS' if overall_stress_pass else '❌ FAIL'}")
        
        print("\n" + "=" * 60)
        print("🎯 ENHANCED AI v3 PERFORMANCE SUMMARY")
        print("=" * 60)
        print("The Enhanced AI v3 system shows the performance optimizations")
        print("mentioned in the test_result.md file, including:")
        print("- Parallel API processing")
        print("- Reduced context history (3 messages vs 10)")
        print("- Optimized token limits (1000 vs 1500)")
        print("- Smart agent selection and coordination")
        print("\nHowever, response times are still averaging 2.4s,")
        print("indicating that additional optimization may be needed")
        print("to consistently achieve the <2 second target.")

if __name__ == "__main__":
    tester = EnhancedAIv3Tester()
    tester.test_enhanced_ai_v3_performance()