#!/usr/bin/env python3
"""
Performance Testing for Aether AI Platform - August 2025
Tests AI response times and system performance
"""

import requests
import time
import json
import statistics
from datetime import datetime

class PerformanceTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.auth_token = None
        self.demo_user = {
            "email": "demo@aicodestudio.com",
            "password": "demo123"
        }
        
    def authenticate(self):
        """Get auth token"""
        response = requests.post(f"{self.base_url}/api/auth/login", json=self.demo_user)
        if response.status_code == 200:
            self.auth_token = response.json()["access_token"]
            return True
        return False
    
    def test_ai_response_times(self):
        """Test AI response times for <2 second target"""
        print("🚀 TESTING AI RESPONSE TIMES - TARGET: <2 SECONDS")
        print("=" * 60)
        
        headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"}
        
        test_messages = [
            "Create a simple React component",
            "Design a REST API for user management", 
            "Build a database schema for e-commerce",
            "Implement authentication with JWT",
            "Create a responsive navigation menu"
        ]
        
        # Test Enhanced AI v3 endpoints
        print("\n🤖 Testing Enhanced AI v3 Endpoints:")
        print("-" * 40)
        
        enhanced_times = []
        for i, message in enumerate(test_messages, 1):
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/ai/v3/chat/enhanced",
                headers=headers,
                json={"message": message, "agent": "Dev"},
                timeout=30
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            enhanced_times.append(response_time)
            
            status = "✅ FAST" if response_time < 2.0 else "⚠️ SLOW"
            print(f"Test {i}: {response_time:.2f}s {status}")
        
        # Test Quick Response endpoint
        print("\n⚡ Testing Quick Response Endpoint:")
        print("-" * 40)
        
        quick_times = []
        for i, message in enumerate(test_messages, 1):
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/ai/v3/chat/quick-response",
                headers=headers,
                json={"message": message},
                timeout=30
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            quick_times.append(response_time)
            
            status = "✅ FAST" if response_time < 2.0 else "⚠️ SLOW"
            print(f"Test {i}: {response_time:.2f}s {status}")
        
        # Performance Summary
        print("\n📊 PERFORMANCE SUMMARY:")
        print("=" * 40)
        
        enhanced_avg = statistics.mean(enhanced_times)
        enhanced_fast = len([t for t in enhanced_times if t < 2.0])
        
        quick_avg = statistics.mean(quick_times)
        quick_fast = len([t for t in quick_times if t < 2.0])
        
        print(f"Enhanced AI v3:")
        print(f"  Average: {enhanced_avg:.2f}s")
        print(f"  Fast responses (<2s): {enhanced_fast}/{len(enhanced_times)} ({enhanced_fast/len(enhanced_times)*100:.1f}%)")
        print(f"  Target Met: {'✅ YES' if enhanced_avg < 2.0 else '❌ NO'}")
        
        print(f"\nQuick Response:")
        print(f"  Average: {quick_avg:.2f}s")
        print(f"  Fast responses (<2s): {quick_fast}/{len(quick_times)} ({quick_fast/len(quick_times)*100:.1f}%)")
        print(f"  Target Met: {'✅ YES' if quick_avg < 2.0 else '❌ NO'}")
        
        overall_avg = statistics.mean(enhanced_times + quick_times)
        overall_fast = enhanced_fast + quick_fast
        overall_total = len(enhanced_times) + len(quick_times)
        
        print(f"\nOverall Performance:")
        print(f"  Average: {overall_avg:.2f}s")
        print(f"  Fast responses: {overall_fast}/{overall_total} ({overall_fast/overall_total*100:.1f}%)")
        print(f"  Performance Grade: {'🏆 EXCELLENT' if overall_avg < 1.5 else '✅ GOOD' if overall_avg < 2.0 else '⚠️ NEEDS IMPROVEMENT'}")
        
        return {
            "enhanced_avg": enhanced_avg,
            "quick_avg": quick_avg,
            "overall_avg": overall_avg,
            "target_met": overall_avg < 2.0
        }

    def test_groq_models(self):
        """Test all 4 Groq models availability"""
        print("\n🤖 TESTING GROQ MODELS AVAILABILITY:")
        print("=" * 50)
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get available agents (which use different Groq models)
        response = requests.get(f"{self.base_url}/api/ai/v3/agents/available", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get("agents", [])
            
            models_used = set()
            for agent in agents:
                model = agent.get("model", "unknown")
                models_used.add(model)
                print(f"✅ {agent.get('name')}: {model}")
            
            expected_models = {
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant", 
                "mixtral-8x7b-32768",
                "llama-3.2-3b-preview"
            }
            
            print(f"\nModels Found: {len(models_used)}")
            print(f"Expected Models: {len(expected_models)}")
            
            missing_models = expected_models - models_used
            if missing_models:
                print(f"❌ Missing Models: {missing_models}")
            else:
                print("✅ All expected Groq models available")
                
            return len(missing_models) == 0
        else:
            print("❌ Failed to get agents information")
            return False

    def run_performance_test(self):
        """Run comprehensive performance test"""
        print("🎯 AETHER AI PLATFORM - PERFORMANCE TESTING")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 60)
        
        if not self.authenticate():
            print("❌ Authentication failed")
            return
        
        print("✅ Authentication successful")
        
        # Test AI response times
        perf_results = self.test_ai_response_times()
        
        # Test Groq models
        models_ok = self.test_groq_models()
        
        # Final assessment
        print("\n🏆 FINAL PERFORMANCE ASSESSMENT:")
        print("=" * 50)
        
        if perf_results["target_met"] and models_ok:
            grade = "🎉 EXCELLENT - Production Ready"
        elif perf_results["target_met"]:
            grade = "✅ GOOD - Minor Model Issues"
        elif models_ok:
            grade = "⚠️ NEEDS WORK - Performance Issues"
        else:
            grade = "❌ CRITICAL - Multiple Issues"
        
        print(f"Performance Grade: {grade}")
        print(f"Average Response Time: {perf_results['overall_avg']:.2f}s")
        print(f"Target (<2s): {'✅ MET' if perf_results['target_met'] else '❌ MISSED'}")
        print(f"Groq Models: {'✅ ALL AVAILABLE' if models_ok else '❌ ISSUES FOUND'}")
        
        print(f"\nTest Completed: {datetime.now().isoformat()}")

if __name__ == "__main__":
    tester = PerformanceTester()
    tester.run_performance_test()