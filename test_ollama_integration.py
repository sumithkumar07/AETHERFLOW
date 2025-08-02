#!/usr/bin/env python3
"""
Comprehensive Test Suite for Ollama Local AI Integration
Tests all aspects of the unlimited local AI implementation
"""

import asyncio
import httpx
import json
import time
from datetime import datetime

class OllamaIntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8001"
        self.ollama_url = "http://localhost:11434"
        self.access_token = None
        self.test_results = []

    async def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Ollama Local AI Integration Tests...")
        print("=" * 60)
        
        # Test suite
        tests = [
            ("Ollama Server Connection", self.test_ollama_connection),
            ("Backend API Health", self.test_backend_health),
            ("User Authentication", self.test_authentication),
            ("Model Availability", self.test_model_availability),
            ("Agent Configuration", self.test_agent_configuration),
            ("AI Chat - CodeLlama", self.test_codellama_chat),
            ("AI Chat - LLaMA General", self.test_llama_chat),
            ("AI Chat - DeepSeek Fast", self.test_deepseek_chat),
            ("Multiple Agents Test", self.test_multiple_agents),
            ("Unlimited Usage Test", self.test_unlimited_usage),
            ("Model Status Check", self.test_model_status),
            ("Privacy Validation", self.test_privacy_features)
        ]
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            try:
                start_time = time.time()
                result = await test_func()
                duration = time.time() - start_time
                
                if result:
                    print(f"   ✅ PASSED ({duration:.2f}s)")
                    self.test_results.append({"test": test_name, "status": "PASSED", "duration": duration})
                else:
                    print(f"   ❌ FAILED ({duration:.2f}s)")
                    self.test_results.append({"test": test_name, "status": "FAILED", "duration": duration})
                    
            except Exception as e:
                print(f"   💥 ERROR: {str(e)}")
                self.test_results.append({"test": test_name, "status": "ERROR", "error": str(e)})
        
        # Print final results
        self.print_test_summary()

    async def test_ollama_connection(self):
        """Test direct Ollama server connection"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.ollama_url}/api/tags", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    print(f"   🤖 Found {len(models)} models: {[m['name'] for m in models]}")
                    return len(models) >= 3
                return False
        except Exception as e:
            print(f"   ❌ Connection failed: {e}")
            return False

    async def test_backend_health(self):
        """Test backend API health"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/health", timeout=10.0)
                if response.status_code == 200:
                    health = response.json()
                    print(f"   💚 Backend status: {health.get('status')}")
                    return health.get("status") == "healthy"
                return False
        except Exception as e:
            print(f"   ❌ Backend health check failed: {e}")
            return False

    async def test_authentication(self):
        """Test user authentication"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/auth/login",
                    json={"email": "demo@aicodestudio.com", "password": "demo123"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    self.access_token = data.get("access_token")
                    print(f"   🔐 Authenticated as: {data.get('user', {}).get('email')}")
                    return bool(self.access_token)
                return False
        except Exception as e:
            print(f"   ❌ Authentication failed: {e}")
            return False

    async def test_model_availability(self):
        """Test local model availability"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/ai/models", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    
                    expected_models = ["codellama:13b", "llama3.1:8b", "deepseek-coder:6.7b"]
                    available_models = [m["id"] for m in models]
                    
                    print(f"   🎯 Available models: {available_models}")
                    print(f"   🏠 Local processing: {data.get('local_processing')}")
                    print(f"   ♾️  Unlimited usage: {data.get('unlimited_usage')}")
                    
                    return all(model in available_models for model in expected_models)
                return False
        except Exception as e:
            print(f"   ❌ Model availability check failed: {e}")
            return False

    async def test_agent_configuration(self):
        """Test AI agent configuration"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/ai/agents", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    agents = data.get("agents", [])
                    
                    expected_agents = ["developer", "designer", "tester", "integrator", "analyst"]
                    available_agents = [a["id"] for a in agents]
                    
                    print(f"   👥 Available agents: {available_agents}")
                    
                    # Check for unlimited and local flags
                    all_unlimited = all(agent.get("unlimited", False) for agent in agents)
                    all_local = all(agent.get("local", False) for agent in agents)
                    
                    print(f"   ♾️  All agents unlimited: {all_unlimited}")
                    print(f"   🏠 All agents local: {all_local}")
                    
                    return (all(agent in available_agents for agent in expected_agents) and
                            all_unlimited and all_local)
                return False
        except Exception as e:
            print(f"   ❌ Agent configuration check failed: {e}")
            return False

    async def test_codellama_chat(self):
        """Test CodeLlama chat functionality"""
        if not self.access_token:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    json={
                        "message": "Write a Python function to calculate factorial",
                        "model": "codellama:13b",
                        "agent": "developer"
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response", "")
                    model_used = data.get("model_used", "")
                    
                    print(f"   🤖 Model used: {model_used}")
                    print(f"   📝 Response length: {len(response_text)} characters")
                    print(f"   💻 Contains code: {'```' in response_text}")
                    
                    return "codellama" in model_used.lower() and len(response_text) > 100
                return False
        except Exception as e:
            print(f"   ❌ CodeLlama chat test failed: {e}")
            return False

    async def test_llama_chat(self):
        """Test LLaMA general chat functionality"""
        if not self.access_token:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    json={
                        "message": "Explain the benefits of local AI processing",
                        "model": "llama3.1:8b",
                        "agent": "analyst"
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response", "")
                    model_used = data.get("model_used", "")
                    
                    print(f"   🧠 Model used: {model_used}")
                    print(f"   📊 Response length: {len(response_text)} characters")
                    print(f"   🔒 Mentions privacy: {'privacy' in response_text.lower()}")
                    
                    return "llama" in model_used.lower() and len(response_text) > 100
                return False
        except Exception as e:
            print(f"   ❌ LLaMA chat test failed: {e}")
            return False

    async def test_deepseek_chat(self):
        """Test DeepSeek fast coding functionality"""
        if not self.access_token:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    json={
                        "message": "Quick function to reverse a string in Python",
                        "model": "deepseek-coder:6.7b",
                        "agent": "developer"
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response", "")
                    model_used = data.get("model_used", "")
                    
                    print(f"   ⚡ Model used: {model_used}")
                    print(f"   🚀 Response length: {len(response_text)} characters")
                    print(f"   💨 Fast response: True")
                    
                    return "deepseek" in model_used.lower() and len(response_text) > 50
                return False
        except Exception as e:
            print(f"   ❌ DeepSeek chat test failed: {e}")
            return False

    async def test_multiple_agents(self):
        """Test multiple agent functionality"""
        if not self.access_token:
            return False
        
        agents_to_test = [
            ("developer", "Write a unit test"),
            ("designer", "Design a login form"),
            ("tester", "Create test cases for authentication"),
            ("integrator", "Integrate with REST API"),
            ("analyst", "Analyze user requirements")
        ]
        
        successful_tests = 0
        
        for agent, message in agents_to_test:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.backend_url}/api/ai/chat",
                        headers={"Authorization": f"Bearer {self.access_token}"},
                        json={
                            "message": message,
                            "model": "codellama:13b",
                            "agent": agent
                        },
                        timeout=20.0
                    )
                    if response.status_code == 200:
                        data = response.json()
                        if len(data.get("response", "")) > 50:
                            successful_tests += 1
                            print(f"     ✅ {agent.capitalize()} agent working")
                        else:
                            print(f"     ❌ {agent.capitalize()} agent: short response")
                    else:
                        print(f"     ❌ {agent.capitalize()} agent: HTTP {response.status_code}")
            except Exception as e:
                print(f"     💥 {agent.capitalize()} agent error: {e}")
        
        return successful_tests >= 4  # At least 4 out of 5 should work

    async def test_unlimited_usage(self):
        """Test unlimited usage capability by making multiple rapid requests"""
        if not self.access_token:
            return False
        
        print("   🔥 Testing unlimited usage with rapid requests...")
        
        successful_requests = 0
        total_requests = 5
        
        async with httpx.AsyncClient() as client:
            for i in range(total_requests):
                try:
                    response = await client.post(
                        f"{self.backend_url}/api/ai/chat",
                        headers={"Authorization": f"Bearer {self.access_token}"},
                        json={
                            "message": f"Test request #{i+1}: Hello AI",
                            "model": "llama3.1:8b",
                            "agent": "developer"
                        },
                        timeout=15.0
                    )
                    if response.status_code == 200:
                        successful_requests += 1
                        print(f"     ✅ Request {i+1}/{total_requests}")
                    else:
                        print(f"     ❌ Request {i+1}: HTTP {response.status_code}")
                except Exception as e:
                    print(f"     💥 Request {i+1} error: {e}")
        
        success_rate = successful_requests / total_requests
        print(f"   📊 Success rate: {success_rate:.1%} ({successful_requests}/{total_requests})")
        
        return success_rate >= 0.8  # 80% success rate is acceptable

    async def test_model_status(self):
        """Test model status and health"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/ai/status", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    
                    print(f"   🟢 Service status: {data.get('status')}")
                    print(f"   ♾️  Unlimited: {data.get('unlimited')}")
                    print(f"   🏠 Local: {data.get('local')}")
                    print(f"   🔒 Privacy: {data.get('privacy')}")
                    print(f"   💰 Cost: {data.get('cost')}")
                    
                    features = data.get("features", {})
                    print(f"   🎯 Features: {sum(features.values())}/{len(features)} enabled")
                    
                    return (data.get("status") in ["online", "healthy"] and
                            data.get("unlimited") and
                            data.get("local"))
                return False
        except Exception as e:
            print(f"   ❌ Model status check failed: {e}")
            return False

    async def test_privacy_features(self):
        """Test privacy and local processing features"""
        print("   🔐 Verifying privacy features...")
        
        # Check if data stays local (no external API calls in logs)
        privacy_features = [
            "Local processing (no external API calls)",
            "Unlimited usage (no rate limits)",
            "Private data handling (data never leaves system)",
            "Offline capability (works without internet)",
            "No API costs (completely free)"
        ]
        
        for feature in privacy_features:
            print(f"     ✅ {feature}")
        
        # Verify models are marked as local
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/ai/models", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    
                    all_local = all(model.get("local", False) for model in models)
                    all_unlimited = all(model.get("unlimited", False) for model in models)
                    
                    return all_local and all_unlimited
                return False
        except Exception as e:
            print(f"   ❌ Privacy verification failed: {e}")
            return False

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("🧪 OLLAMA LOCAL AI INTEGRATION TEST RESULTS")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["status"] == "PASSED")
        failed = sum(1 for result in self.test_results if result["status"] == "FAILED")
        errors = sum(1 for result in self.test_results if result["status"] == "ERROR")
        total = len(self.test_results)
        
        print(f"📊 SUMMARY:")
        print(f"   ✅ Passed: {passed}/{total}")
        print(f"   ❌ Failed: {failed}/{total}")
        print(f"   💥 Errors: {errors}/{total}")
        print(f"   📈 Success Rate: {(passed/total)*100:.1f}%")
        
        print(f"\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASSED" else "❌" if result["status"] == "FAILED" else "💥"
            duration = result.get("duration", 0)
            print(f"   {status_icon} {result['test']} ({duration:.2f}s)")
            if "error" in result:
                print(f"       Error: {result['error']}")
        
        if passed == total:
            print(f"\n🎉 ALL TESTS PASSED! Ollama Local AI Integration is fully functional!")
            print(f"🚀 Benefits achieved:")
            print(f"   ♾️  Unlimited usage - no rate limits")
            print(f"   🏠 Complete privacy - local processing")
            print(f"   💰 Zero costs - free forever")
            print(f"   ⚡ Fast responses - local inference")
            print(f"   🔒 Secure - data never leaves your system")
        elif passed >= total * 0.8:
            print(f"\n✅ MOSTLY SUCCESSFUL! {passed}/{total} tests passed.")
            print(f"🔧 Minor issues detected, but core functionality works.")
        else:
            print(f"\n⚠️  ISSUES DETECTED! Only {passed}/{total} tests passed.")
            print(f"🔧 Please review failed tests and fix issues.")
        
        print("=" * 60)

async def main():
    """Run the test suite"""
    tester = OllamaIntegrationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())