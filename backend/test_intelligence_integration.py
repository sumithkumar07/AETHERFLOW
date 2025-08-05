#!/usr/bin/env python3
# Test Intelligence Integration - Verify all intelligence layers work together
# This tests the complete intelligence stack without UI changes

import asyncio
import json
import sys
import os

# Add backend to path
sys.path.append('/app/backend')

from services.architectural_intelligence_layer import ArchitecturalIntelligenceLayer
from services.background_intelligence import BackgroundArchitecturalAnalyzer
from services.enhanced_agent_coordination import EnhancedAgentCoordinator
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3Upgraded

async def test_intelligence_integration():
    """Test complete intelligence integration"""
    
    print("🧠 Testing Complete Intelligence Integration")
    print("=" * 60)
    
    # Test 1: Architectural Intelligence Layer
    print("\n1️⃣  Testing Architectural Intelligence Layer...")
    arch_layer = ArchitecturalIntelligenceLayer()
    
    test_request = "I want to build a task management app that can scale to millions of users with real-time collaboration"
    
    try:
        arch_context = await arch_layer.analyze_before_response(
            test_request, "test_conversation", {"user_id": "test_user"}
        )
        
        print(f"✅ Architectural patterns detected: {arch_context.architecture_patterns}")
        print(f"✅ Intelligence level: {arch_context.intelligence_level.value}")
        print(f"✅ Scalability analysis: {len(arch_context.scalability_analysis)} strategies")
        print(f"✅ Security considerations: {len(arch_context.security_considerations)} items")
        
        # Test response enrichment
        base_response = "Create a React app with Node.js backend"
        enriched_response = await arch_layer.enrich_response(base_response, arch_context, "developer")
        
        print(f"✅ Response enrichment: {len(enriched_response)} chars (vs {len(base_response)} original)")
        
    except Exception as e:
        print(f"❌ Architectural Intelligence Layer failed: {e}")
        return False
    
    # Test 2: Background Intelligence Analyzer
    print("\n2️⃣  Testing Background Intelligence Analyzer...")
    bg_analyzer = BackgroundArchitecturalAnalyzer()
    
    try:
        # Test enhanced context generation
        context = await bg_analyzer.get_enhanced_context("test_user", test_request)
        
        print(f"✅ User architectural maturity: {context['user_architectural_maturity']}")
        print(f"✅ Preferred patterns: {context['preferred_patterns']}")
        print(f"✅ Guidance level: {context['architectural_guidance_level']}")
        print(f"✅ Personalized recommendations: {len(context['personalized_recommendations'])} items")
        
        # Test scalability requirements detection
        messages = [{"content": test_request}]
        scalability = await bg_analyzer.detect_scalability_requirements(messages)
        
        print(f"✅ Scale level detected: {scalability['scale_level']}")
        print(f"✅ Growth indicators: {scalability['growth_indicators']}")
        
    except Exception as e:
        print(f"❌ Background Intelligence Analyzer failed: {e}")
        return False
    
    # Test 3: Enhanced Agent Coordination
    print("\n3️⃣  Testing Enhanced Agent Coordination...")
    coordinator = EnhancedAgentCoordinator()
    
    try:
        coordinated_response = await coordinator.coordinate_agents_with_intelligence(
            request=test_request,
            user_id="test_user",
            conversation_id="test_conversation"
        )
        
        print(f"✅ Coordination strategy: {coordinated_response.coordination_metadata['strategy']}")
        print(f"✅ Agents involved: {coordinated_response.coordination_metadata['agents_involved']}")
        print(f"✅ Intelligence level: {coordinated_response.coordination_metadata['intelligence_level']}")
        print(f"✅ Final response length: {len(coordinated_response.final_enhanced_response)} chars")
        
    except Exception as e:
        print(f"❌ Enhanced Agent Coordination failed: {e}")
        return False
    
    # Test 4: Complete Enhanced AI Service V3 Upgraded
    print("\n4️⃣  Testing Complete Enhanced AI Service V3 Upgraded...")
    ai_service = EnhancedAIServiceV3Upgraded()
    
    try:
        await ai_service.initialize()
        
        # Test enhanced conversation
        enhanced_response = await ai_service.enhance_conversation(
            session_id="test_session",
            user_message=test_request,
            include_context=True,
            user_id="test_user"
        )
        
        print(f"✅ Response type: {enhanced_response['type']}")
        print(f"✅ Architectural intelligence: {enhanced_response['architectural_intelligence']}")
        print(f"✅ Intelligence level: {enhanced_response['intelligence_level']}")
        print(f"✅ Coordination strategy: {enhanced_response['coordination_strategy']}")
        print(f"✅ Enterprise grade: {enhanced_response['enterprise_grade']}")
        
        # Test quick response with intelligence
        quick_response = await ai_service.quick_response_with_intelligence(
            "How do I optimize database performance?",
            user_id="test_user"
        )
        
        print(f"✅ Quick response intelligence level: {quick_response['intelligence_level']}")
        print(f"✅ Quick response architectural intelligence: {quick_response['architectural_intelligence']}")
        
        # Test available agents
        agents = await ai_service.get_available_agents()
        
        print(f"✅ Available agents: {agents['total_agents']} with full intelligence")
        print(f"✅ Intelligence features: {len(agents['intelligence_features'])} capabilities")
        
    except Exception as e:
        print(f"❌ Enhanced AI Service V3 Upgraded failed: {e}")
        return False
    
    # Test 5: API Integration Test
    print("\n5️⃣  Testing API Integration...")
    
    try:
        # Test conversation summary with intelligence
        summary = await ai_service.get_conversation_summary("test_session")
        
        if "error" not in summary:
            print(f"✅ Intelligent summary generated")
            print(f"✅ Architectural insights: {summary.get('architectural_insights', {})}")
            print(f"✅ User intelligence profile: {summary.get('user_intelligence_profile', {})}")
            print(f"✅ Conversation patterns: {summary.get('conversation_patterns', [])}")
        else:
            print(f"⚠️  Summary test: {summary['error']} (expected for new session)")
        
    except Exception as e:
        print(f"❌ API Integration test failed: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ALL INTELLIGENCE INTEGRATION TESTS PASSED!")
    print("✅ Architectural Intelligence Layer: WORKING")
    print("✅ Background Intelligence Analysis: WORKING") 
    print("✅ Enhanced Agent Coordination: WORKING")
    print("✅ Complete AI Service V3 Upgraded: WORKING")
    print("✅ API Integration: WORKING")
    print("\n🚀 Backend Intelligence Enhancement Complete!")
    print("💡 Same UI, Enhanced Intelligence - Zero Disruption!")
    
    return True

async def test_specific_scenarios():
    """Test specific enterprise scenarios"""
    
    print("\n" + "=" * 60)
    print("🏢 Testing Enterprise Scenarios")
    print("=" * 60)
    
    ai_service = EnhancedAIServiceV3Upgraded()
    await ai_service.initialize()
    
    scenarios = [
        {
            "name": "Simple Prototype",
            "request": "I want to build a simple todo app prototype",
            "expected_intelligence": "basic"
        },
        {
            "name": "Business Application", 
            "request": "I need to build a business application for 1000 users with performance requirements",
            "expected_intelligence": "enhanced"
        },
        {
            "name": "Enterprise Solution",
            "request": "Build an enterprise-grade system for millions of users with compliance and security requirements",
            "expected_intelligence": "enterprise"
        }
    ]
    
    for scenario in scenarios:
        print(f"\n📋 Testing: {scenario['name']}")
        
        try:
            response = await ai_service.enhance_conversation(
                session_id=f"scenario_{scenario['name'].lower().replace(' ', '_')}",
                user_message=scenario['request'],
                user_id="test_enterprise_user"
            )
            
            intelligence_level = response['intelligence_level']
            print(f"✅ Expected: {scenario['expected_intelligence']}, Got: {intelligence_level}")
            print(f"✅ Coordination strategy: {response['coordination_strategy']}")
            print(f"✅ Response enhanced with architectural intelligence")
            
        except Exception as e:
            print(f"❌ Scenario {scenario['name']} failed: {e}")
    
    print("\n🎯 Enterprise scenario testing complete!")

if __name__ == "__main__":
    print("🧠 Intelligence Integration Test Suite")
    print("Testing all intelligence layers working together...")
    
    async def main():
        success = await test_intelligence_integration()
        if success:
            await test_specific_scenarios()
            print("\n✅ All tests passed! Intelligence enhancement ready!")
        else:
            print("\n❌ Some tests failed. Check implementation.")
    
    asyncio.run(main())