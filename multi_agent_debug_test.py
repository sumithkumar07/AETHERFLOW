#!/usr/bin/env python3
"""
TARGETED MULTI-AGENT COORDINATION TEST
Testing specific multi-agent functionality and debugging issues
"""

import requests
import json
import time
from datetime import datetime

class MultiAgentTester:
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
            self.auth_token = data.get("access_token")
            print(f"✅ Authenticated as {data.get('user', {}).get('email')}")
            return True
        print(f"❌ Authentication failed: {response.status_code}")
        return False

    def test_multi_agent_triggers(self):
        """Test different message types to trigger multi-agent coordination"""
        
        test_cases = [
            {
                "name": "Complex E-commerce Request",
                "message": "I need to build a complete e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, user authentication, admin dashboard, comprehensive testing strategy, and project management plan. Please coordinate all necessary agents to provide a complete solution.",
                "expected_agents": ["developer", "designer", "architect", "tester", "project_manager"]
            },
            {
                "name": "Full-Stack Application",
                "message": "Create a comprehensive social media application with modern UI design, scalable architecture, automated testing, and project timeline. I need input from all relevant specialists.",
                "expected_agents": ["developer", "designer", "architect", "tester", "project_manager"]
            },
            {
                "name": "Design + Development",
                "message": "Design and develop a modern dashboard interface with responsive design and clean code implementation",
                "expected_agents": ["designer", "developer"]
            },
            {
                "name": "Architecture + Testing",
                "message": "Design a scalable microservices architecture with comprehensive testing strategy",
                "expected_agents": ["architect", "tester"]
            }
        ]
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        for i, test_case in enumerate(test_cases):
            print(f"\n🧪 Test {i+1}: {test_case['name']}")
            print(f"Message: {test_case['message'][:100]}...")
            
            session_id = f"multi_test_{i}_{int(time.time())}"
            
            request_data = {
                "message": test_case["message"],
                "session_id": session_id,
                "project_id": f"test_project_{i}",
                "user_id": "demo_user",
                "include_context": True
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/api/ai/v3/chat/enhanced", 
                json=request_data, 
                headers=headers
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"✅ Response received in {response_time:.2f}s")
                print(f"   Agent: {data.get('agent')}")
                print(f"   Agent Role: {data.get('agent_role')}")
                print(f"   Type: {data.get('type')}")
                print(f"   Agents: {data.get('agents', [])}")
                print(f"   Model: {data.get('model_used')}")
                
                # Check if multi-agent coordination was triggered
                response_type = data.get('type')
                agents_involved = data.get('agents', [])
                
                if response_type in ['multi_agent', 'collaborative'] or len(agents_involved) > 1:
                    print(f"   🎯 Multi-agent coordination: SUCCESS")
                else:
                    print(f"   ⚠️ Multi-agent coordination: NOT TRIGGERED")
                    print(f"   Expected: {test_case['expected_agents']}")
                    print(f"   Got: Single agent response")
                
                # Test getting active agents for this session
                agents_response = self.session.get(
                    f"{self.base_url}/api/ai/v3/chat/{session_id}/agents",
                    headers=headers
                )
                
                if agents_response.status_code == 200:
                    agents_data = agents_response.json()
                    print(f"   Active agents: {agents_data.get('active_agents', [])}")
                    print(f"   Total agents: {agents_data.get('total_agents', 0)}")
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
            
            # Small delay between tests
            time.sleep(1)

    def test_agent_availability(self):
        """Test available agents endpoint"""
        print(f"\n🤖 Testing Available Agents...")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = self.session.get(f"{self.base_url}/api/ai/v3/agents/available", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            print(f"✅ Found {len(agents)} available agents:")
            for agent in agents:
                print(f"   - {agent.get('name')} ({agent.get('role')})")
                print(f"     Capabilities: {len(agent.get('capabilities', []))} listed")
                print(f"     Model: {agent.get('model')}")
                print()
        else:
            print(f"❌ Failed to get available agents: {response.status_code}")

    def test_performance_metrics(self):
        """Test performance metrics endpoint"""
        print(f"\n📊 Testing Performance Metrics...")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Check if there's a performance metrics endpoint
        endpoints_to_try = [
            "/api/ai/performance/metrics",
            "/api/performance/metrics", 
            "/api/ai/v3/performance/metrics"
        ]
        
        for endpoint in endpoints_to_try:
            response = self.session.get(f"{self.base_url}{endpoint}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Performance metrics from {endpoint}:")
                print(json.dumps(data, indent=2))
                return
            elif response.status_code != 404:
                print(f"⚠️ {endpoint}: {response.status_code}")
        
        print("❌ No performance metrics endpoint found")

    def run_tests(self):
        """Run all multi-agent tests"""
        print("🚀 MULTI-AGENT COORDINATION TESTING")
        print("="*60)
        
        if not self.authenticate():
            return
        
        self.test_agent_availability()
        self.test_multi_agent_triggers()
        self.test_performance_metrics()
        
        print("\n" + "="*60)
        print("🎯 Multi-agent testing complete!")

if __name__ == "__main__":
    tester = MultiAgentTester()
    tester.run_tests()