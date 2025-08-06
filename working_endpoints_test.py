#!/usr/bin/env python3
"""
Test actual working endpoints in the Aether AI Platform
"""

import requests
import json
from datetime import datetime

class WorkingEndpointsTest:
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
        response = self.session.post(f"{self.base_url}/api/auth/login", json=self.demo_user)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                print(f"✅ Authenticated as {data.get('user', {}).get('email')}")
                return True
        print("❌ Authentication failed")
        return False

    def test_endpoint(self, method: str, endpoint: str, data: dict = None):
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            else:
                return None
                
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    print(f"✅ {method} {endpoint} - {response.status_code} - {len(str(data))} chars")
                    return True
                except:
                    print(f"✅ {method} {endpoint} - {response.status_code} - Non-JSON response")
                    return True
            else:
                print(f"❌ {method} {endpoint} - {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {method} {endpoint} - Error: {str(e)[:50]}")
            return False

    def test_core_endpoints(self):
        """Test core working endpoints"""
        print("🧪 Testing Core Working Endpoints")
        print("=" * 50)
        
        # Health checks
        self.test_endpoint("GET", "/")
        self.test_endpoint("GET", "/api/health")
        
        # Authentication
        print("\n🔐 Authentication Endpoints:")
        self.test_endpoint("GET", "/api/auth/me")
        
        # AI endpoints
        print("\n🤖 AI Endpoints:")
        self.test_endpoint("GET", "/api/ai/models")
        self.test_endpoint("GET", "/api/ai/agents")
        self.test_endpoint("GET", "/api/ai/status")
        self.test_endpoint("GET", "/api/ai/conversations")
        
        # Enhanced AI v3
        print("\n🚀 Enhanced AI v3 Endpoints:")
        self.test_endpoint("GET", "/api/ai/v3/agents/available")
        
        # Test AI chat
        chat_data = {
            "message": "Hello, test message",
            "model": "llama-3.1-8b-instant"
        }
        self.test_endpoint("POST", "/api/ai/chat", chat_data)
        self.test_endpoint("POST", "/api/ai/v3/chat/enhanced", chat_data)
        
        # Projects
        print("\n📁 Project Endpoints:")
        self.test_endpoint("GET", "/api/projects/")
        
        # Templates
        print("\n📋 Template Endpoints:")
        self.test_endpoint("GET", "/api/templates/")
        self.test_endpoint("GET", "/api/templates/featured")
        
        # Subscription
        print("\n💳 Subscription Endpoints:")
        self.test_endpoint("GET", "/api/subscription/plans")
        self.test_endpoint("GET", "/api/subscription/current")
        self.test_endpoint("GET", "/api/subscription/trial/status")
        
        # Integrations
        print("\n🔌 Integration Endpoints:")
        self.test_endpoint("GET", "/api/integrations/")
        self.test_endpoint("GET", "/api/integrations/categories")
        self.test_endpoint("GET", "/api/integrations/popular")
        
        # Enterprise
        print("\n🏢 Enterprise Endpoints:")
        self.test_endpoint("GET", "/api/enterprise/integrations")
        
        # Analytics
        print("\n📊 Analytics Endpoints:")
        self.test_endpoint("GET", "/api/analytics/dashboard")
        self.test_endpoint("GET", "/api/analytics/realtime")
        
        # Advanced AI
        print("\n🧠 Advanced AI Endpoints:")
        self.test_endpoint("GET", "/api/advanced-ai/features")
        
        # Agents
        print("\n🤖 Agent Endpoints:")
        self.test_endpoint("GET", "/api/agents/")
        self.test_endpoint("GET", "/api/agents/capabilities")
        
        # Collaboration
        print("\n🤝 Collaboration Endpoints:")
        self.test_endpoint("GET", "/api/collaboration/status/all")
        
        # Security
        print("\n🔒 Security Endpoints:")
        self.test_endpoint("GET", "/api/security/status")
        
        # Performance
        print("\n⚡ Performance Endpoints:")
        self.test_endpoint("GET", "/api/performance/metrics")

    def run_test(self):
        """Run the endpoint test"""
        print(f"🧪 TESTING WORKING ENDPOINTS - {datetime.now().isoformat()}")
        print("=" * 80)
        
        if self.authenticate():
            self.test_core_endpoints()
        else:
            print("❌ Cannot proceed without authentication")

if __name__ == "__main__":
    tester = WorkingEndpointsTest()
    tester.run_test()