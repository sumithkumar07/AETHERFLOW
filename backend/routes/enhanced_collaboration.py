"""
Enhanced Multi-Agent Collaboration Routes
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging
import asyncio

from models.user import User
from models.database import get_database
from routes.auth import get_current_user
from services.enhanced_ai_service import EnhancedAIService
from services.intelligent_context_manager import IntelligentContextManager
from middleware.usage_tracking import get_chat_usage_dependency

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
enhanced_ai_service = EnhancedAIService()
context_manager = IntelligentContextManager()

class MultiAgentRequest(BaseModel):
    task: str
    agents: List[str]
    project_id: Optional[str] = None
    collaboration_mode: str = "parallel"  # "sequential", "parallel", "voting"
    priority: str = "medium"
    context: Optional[Dict] = {}

class AgentHandoffRequest(BaseModel):
    conversation_id: str
    from_agent: str
    to_agent: str
    handoff_reason: Optional[str] = None
    context_summary: Optional[str] = None

class CollaborationSessionRequest(BaseModel):
    project_id: str
    participants: List[str]  # List of agent IDs
    objective: str
    duration_minutes: Optional[int] = 60

@router.post("/multi-agent/collaborate")
async def initiate_multi_agent_collaboration(
    request: MultiAgentRequest,
    background_tasks: BackgroundTasks,
    usage_info = Depends(get_chat_usage_dependency)
):
    """Initiate intelligent multi-agent collaboration"""
    try:
        current_user = usage_info["user"]
        user_id = usage_info["user_id"]
        
        logger.info(f"Starting multi-agent collaboration with agents: {request.agents}")
        
        # Generate collaboration session ID
        session_id = f"collab_{uuid.uuid4().hex[:12]}"
        
        # Get enhanced context for collaboration
        enhanced_context = await context_manager.get_enhanced_context(
            conversation_id=session_id,
            user_id=user_id,
            message=request.task,
            project_id=request.project_id
        )
        
        # Initialize collaboration results
        collaboration_results = {
            "session_id": session_id,
            "task": request.task,
            "agents": request.agents,
            "mode": request.collaboration_mode,
            "status": "in_progress",
            "results": {},
            "synthesis": {},
            "consensus": {},
            "started_at": datetime.utcnow().isoformat()
        }
        
        # Execute collaboration based on mode
        if request.collaboration_mode == "parallel":
            results = await _execute_parallel_collaboration(
                request, enhanced_context, user_id
            )
        elif request.collaboration_mode == "sequential":
            results = await _execute_sequential_collaboration(
                request, enhanced_context, user_id
            )
        elif request.collaboration_mode == "voting":
            results = await _execute_voting_collaboration(
                request, enhanced_context, user_id
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid collaboration mode")
        
        collaboration_results.update(results)
        collaboration_results["status"] = "completed"
        collaboration_results["completed_at"] = datetime.utcnow().isoformat()
        
        # Save collaboration session to database
        db = await get_database()
        await db.collaboration_sessions.insert_one({
            "_id": session_id,
            "user_id": user_id,
            "project_id": request.project_id,
            **collaboration_results
        })
        
        # Generate follow-up recommendations
        recommendations = await _generate_collaboration_recommendations(
            collaboration_results, request.agents
        )
        collaboration_results["recommendations"] = recommendations
        
        return collaboration_results
        
    except Exception as e:
        logger.error(f"Multi-agent collaboration error: {e}")
        raise HTTPException(status_code=500, detail="Multi-agent collaboration failed")

async def _execute_parallel_collaboration(
    request: MultiAgentRequest, 
    context: Dict, 
    user_id: str
) -> Dict:
    """Execute parallel multi-agent collaboration"""
    
    # Run all agents simultaneously
    agent_tasks = []
    for agent in request.agents:
        task = enhanced_ai_service.process_enhanced_message(
            message=f"[COLLABORATIVE TASK] {request.task}\n\nContext: Working with {', '.join([a for a in request.agents if a != agent])} agents. Focus on your area of expertise.",
            agent=agent,
            user_id=user_id,
            project_id=request.project_id,
            context=context.get("relevant_messages", [])
        )
        agent_tasks.append(task)
    
    # Wait for all agents to complete
    agent_responses = await asyncio.gather(*agent_tasks, return_exceptions=True)
    
    # Process results
    results = {}
    for i, response in enumerate(agent_responses):
        agent = request.agents[i]
        if isinstance(response, Exception):
            results[agent] = {
                "status": "error",
                "error": str(response),
                "response": "Agent processing failed"
            }
        else:
            results[agent] = {
                "status": "success",
                **response
            }
    
    # Synthesize results
    synthesis = await _synthesize_parallel_results(results, request.task)
    
    return {
        "results": results,
        "synthesis": synthesis,
        "collaboration_quality": await _assess_collaboration_quality(results),
        "execution_time": "parallel"
    }

async def _execute_sequential_collaboration(
    request: MultiAgentRequest, 
    context: Dict, 
    user_id: str
) -> Dict:
    """Execute sequential multi-agent collaboration"""
    
    results = {}
    accumulated_context = context.get("relevant_messages", [])
    
    for i, agent in enumerate(request.agents):
        # Build context from previous agents
        previous_outputs = []
        for prev_agent, result in results.items():
            if result.get("status") == "success":
                previous_outputs.append({
                    "agent": prev_agent,
                    "output": result.get("response", "")
                })
        
        # Create contextual message for current agent
        if previous_outputs:
            context_msg = f"[SEQUENTIAL COLLABORATION - Step {i+1}]\n"
            context_msg += f"Task: {request.task}\n\n"
            context_msg += "Previous agents' contributions:\n"
            for output in previous_outputs:
                context_msg += f"- {output['agent']}: {output['output'][:200]}...\n"
            context_msg += f"\nYour turn as {agent} agent - build upon previous work:"
        else:
            context_msg = f"[SEQUENTIAL COLLABORATION - Step 1]\nTask: {request.task}\nYou're the first agent. Provide foundation for subsequent agents:"
        
        # Get agent response
        try:
            response = await enhanced_ai_service.process_enhanced_message(
                message=context_msg,
                agent=agent,
                user_id=user_id,
                project_id=request.project_id,
                context=accumulated_context
            )
            
            results[agent] = {
                "status": "success",
                "step": i + 1,
                **response
            }
            
            # Add to accumulated context
            accumulated_context.append({
                "role": "assistant",
                "content": response.get("response", ""),
                "agent": agent
            })
            
        except Exception as e:
            results[agent] = {
                "status": "error",
                "error": str(e),
                "step": i + 1
            }
    
    # Create final synthesis
    synthesis = await _synthesize_sequential_results(results, request.task, request.agents)
    
    return {
        "results": results,
        "synthesis": synthesis,
        "collaboration_quality": await _assess_collaboration_quality(results),
        "execution_time": "sequential"
    }

async def _execute_voting_collaboration(
    request: MultiAgentRequest, 
    context: Dict, 
    user_id: str
) -> Dict:
    """Execute voting-based multi-agent collaboration"""
    
    # Phase 1: All agents provide initial solutions
    initial_responses = await _execute_parallel_collaboration(request, context, user_id)
    
    # Phase 2: Each agent reviews others' solutions and votes
    voting_results = {}
    
    for voter_agent in request.agents:
        # Prepare voting context
        vote_context = f"[VOTING PHASE] Review these solutions for: {request.task}\n\n"
        for agent, result in initial_responses["results"].items():
            if agent != voter_agent and result.get("status") == "success":
                vote_context += f"{agent} Solution:\n{result.get('response', '')[:300]}...\n\n"
        
        vote_context += f"As {voter_agent} agent, rank these solutions and provide your consolidated recommendation:"
        
        try:
            vote_response = await enhanced_ai_service.process_enhanced_message(
                message=vote_context,
                agent=voter_agent,
                user_id=user_id,
                project_id=request.project_id,
                context=context.get("relevant_messages", [])
            )
            
            voting_results[voter_agent] = {
                "status": "success",
                **vote_response
            }
            
        except Exception as e:
            voting_results[voter_agent] = {
                "status": "error",
                "error": str(e)
            }
    
    # Phase 3: Synthesize votes into consensus
    consensus = await _synthesize_voting_results(
        initial_responses["results"], 
        voting_results, 
        request.task
    )
    
    return {
        "initial_results": initial_responses["results"],
        "voting_results": voting_results,
        "consensus": consensus,
        "collaboration_quality": await _assess_collaboration_quality(voting_results),
        "execution_time": "voting"
    }

async def _synthesize_parallel_results(results: Dict, task: str) -> Dict:
    """Synthesize parallel collaboration results"""
    
    synthesis = {
        "approach": "parallel",
        "task": task,
        "successful_agents": [],
        "failed_agents": [],
        "key_insights": [],
        "complementary_strengths": [],
        "conflicts": [],
        "final_recommendation": ""
    }
    
    successful_results = {}
    for agent, result in results.items():
        if result.get("status") == "success":
            synthesis["successful_agents"].append(agent)
            successful_results[agent] = result
        else:
            synthesis["failed_agents"].append(agent)
    
    if successful_results:
        # Extract key insights from each agent
        for agent, result in successful_results.items():
            response = result.get("response", "")
            if len(response) > 50:
                synthesis["key_insights"].append(f"{agent}: {response[:100]}...")
        
        # Identify complementary strengths
        if "developer" in successful_results and "designer" in successful_results:
            synthesis["complementary_strengths"].append("Technical implementation + UI/UX design")
        
        if "developer" in successful_results and "tester" in successful_results:
            synthesis["complementary_strengths"].append("Development + Quality assurance")
        
        # Generate final recommendation
        synthesis["final_recommendation"] = f"Parallel collaboration with {len(successful_results)} agents provided diverse perspectives. Combine insights for comprehensive solution."
    
    return synthesis

async def _synthesize_sequential_results(results: Dict, task: str, agents: List[str]) -> Dict:
    """Synthesize sequential collaboration results"""
    
    synthesis = {
        "approach": "sequential",
        "task": task,
        "workflow": [],
        "evolution": [],
        "final_solution": "",
        "quality_progression": []
    }
    
    # Track workflow progression
    for i, agent in enumerate(agents):
        result = results.get(agent, {})
        synthesis["workflow"].append({
            "step": i + 1,
            "agent": agent,
            "status": result.get("status", "unknown"),
            "contribution": result.get("response", "")[:150] if result.get("response") else "No contribution"
        })
    
    # Analyze evolution of solution
    successful_steps = [step for step in synthesis["workflow"] if step["status"] == "success"]
    if successful_steps:
        synthesis["evolution"] = [
            f"Step {step['step']}: {step['agent']} - {step['contribution'][:100]}..."
            for step in successful_steps
        ]
        
        # Final solution is the last successful contribution
        last_step = successful_steps[-1]
        synthesis["final_solution"] = last_step["contribution"]
    
    return synthesis

async def _synthesize_voting_results(
    initial_results: Dict, 
    voting_results: Dict, 
    task: str
) -> Dict:
    """Synthesize voting collaboration results into consensus"""
    
    consensus = {
        "approach": "voting",
        "task": task,
        "voting_summary": {},
        "winning_solution": {},
        "confidence_level": 0.0,
        "agreement_level": 0.0,
        "final_consensus": ""
    }
    
    # Analyze voting patterns (simplified)
    vote_scores = {}
    for agent in initial_results.keys():
        if initial_results[agent].get("status") == "success":
            vote_scores[agent] = 0
    
    # Count positive mentions in voting results
    for voter, vote_result in voting_results.items():
        if vote_result.get("status") == "success":
            vote_content = vote_result.get("response", "").lower()
            for candidate in vote_scores.keys():
                if candidate.lower() in vote_content:
                    vote_scores[candidate] += 1
    
    # Determine winning solution
    if vote_scores:
        winning_agent = max(vote_scores.keys(), key=lambda k: vote_scores[k])
        consensus["winning_solution"] = {
            "agent": winning_agent,
            "score": vote_scores[winning_agent],
            "solution": initial_results[winning_agent].get("response", "")
        }
        
        # Calculate confidence and agreement levels
        total_votes = sum(vote_scores.values())
        if total_votes > 0:
            consensus["confidence_level"] = vote_scores[winning_agent] / total_votes
            consensus["agreement_level"] = len([s for s in vote_scores.values() if s > 0]) / len(vote_scores)
    
    consensus["final_consensus"] = f"Voting consensus reached with {consensus['confidence_level']:.1%} confidence"
    
    return consensus

async def _assess_collaboration_quality(results: Dict) -> Dict:
    """Assess quality of multi-agent collaboration"""
    
    quality_metrics = {
        "success_rate": 0.0,
        "response_coherence": 0.0,
        "collaboration_effectiveness": 0.0,
        "diversity_score": 0.0,
        "overall_quality": 0.0
    }
    
    if not results:
        return quality_metrics
    
    # Success rate
    successful = sum(1 for r in results.values() if r.get("status") == "success")
    quality_metrics["success_rate"] = successful / len(results)
    
    # Response coherence (simplified - based on response length and content)
    successful_responses = [r for r in results.values() if r.get("status") == "success"]
    if successful_responses:
        avg_response_length = sum(len(r.get("response", "")) for r in successful_responses) / len(successful_responses)
        quality_metrics["response_coherence"] = min(avg_response_length / 500, 1.0)  # Normalize to 500 chars
        
        # Diversity score - different agents should provide different perspectives
        unique_content = set()
        for response in successful_responses:
            # Simple content hash for diversity
            content = response.get("response", "")[:100]  # First 100 chars
            unique_content.add(content)
        
        quality_metrics["diversity_score"] = len(unique_content) / len(successful_responses) if successful_responses else 0
    
    # Collaboration effectiveness (average of other metrics)
    quality_metrics["collaboration_effectiveness"] = (
        quality_metrics["success_rate"] + 
        quality_metrics["response_coherence"] + 
        quality_metrics["diversity_score"]
    ) / 3
    
    quality_metrics["overall_quality"] = quality_metrics["collaboration_effectiveness"]
    
    return quality_metrics

async def _generate_collaboration_recommendations(
    collaboration_results: Dict, 
    agents: List[str]
) -> List[str]:
    """Generate recommendations based on collaboration results"""
    
    recommendations = []
    
    # Based on success rate
    if collaboration_results.get("collaboration_quality", {}).get("success_rate", 0) < 0.8:
        recommendations.append("💡 Consider reducing task complexity or providing more context")
    
    # Based on agent combination
    if "developer" in agents and "tester" not in agents:
        recommendations.append("🧪 Add QA/Testing agent for more comprehensive solution")
    
    if "designer" in agents and "developer" not in agents:
        recommendations.append("💻 Include Developer agent for implementation feasibility")
    
    # Based on collaboration mode
    mode = collaboration_results.get("mode", "")
    if mode == "parallel" and len(agents) > 3:
        recommendations.append("🔄 Consider sequential mode for complex tasks with many agents")
    
    # Quality-based recommendations
    quality = collaboration_results.get("collaboration_quality", {})
    if quality.get("diversity_score", 0) < 0.5:
        recommendations.append("🎯 Ensure agents focus on their specialized areas")
    
    # General improvements
    recommendations.extend([
        "📋 Document collaboration outcomes for future reference",
        "🚀 Implement the synthesized solution",
        "🔍 Monitor results and iterate if needed"
    ])
    
    return recommendations[:5]  # Return top 5 recommendations

@router.post("/agent-handoff")
async def intelligent_agent_handoff(
    request: AgentHandoffRequest,
    current_user: User = Depends(get_current_user)
):
    """Perform intelligent agent handoff with context preservation"""
    try:
        # Get current conversation context
        context = await context_manager.get_enhanced_context(
            conversation_id=request.conversation_id,
            user_id=str(current_user.id),
            message=f"Handoff from {request.from_agent} to {request.to_agent}"
        )
        
        # Generate handoff message with context
        handoff_message = f"""
[INTELLIGENT AGENT HANDOFF]

From: {request.from_agent} Agent
To: {request.to_agent} Agent
Reason: {request.handoff_reason or 'Specialized expertise needed'}

Context Summary: {context.get('context_summary', 'No context available')}

Previous Conversation Topics: {', '.join(context.get('topics', []))}

{request.context_summary or 'Please continue the conversation with your specialized knowledge.'}
"""
        
        # Process handoff with target agent
        response = await enhanced_ai_service.process_enhanced_message(
            message=handoff_message,
            agent=request.to_agent,
            user_id=str(current_user.id),
            conversation_id=request.conversation_id,
            context=context.get("relevant_messages", [])
        )
        
        # Update conversation in database
        db = await get_database()
        await db.conversations.update_one(
            {"_id": request.conversation_id, "user_id": str(current_user.id)},
            {
                "$push": {
                    "messages": {
                        "id": f"handoff_{uuid.uuid4().hex[:12]}",
                        "content": response["response"],
                        "sender": "assistant",
                        "timestamp": datetime.utcnow(),
                        "agent": request.to_agent,
                        "handoff": True,
                        "from_agent": request.from_agent,
                        "to_agent": request.to_agent,
                        "metadata": response.get("metadata", {})
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {
            "success": True,
            "message": "Intelligent agent handoff completed successfully",
            "new_agent": request.to_agent,
            "response": response["response"],
            "context_preserved": True,
            "handoff_quality": await _assess_handoff_quality(context, response),
            "next_actions": response.get("next_actions", [])
        }
        
    except Exception as e:
        logger.error(f"Agent handoff error: {e}")
        raise HTTPException(status_code=500, detail="Intelligent agent handoff failed")

async def _assess_handoff_quality(context: Dict, response: Dict) -> Dict:
    """Assess quality of agent handoff"""
    
    quality = {
        "context_preservation": 0.8,  # Default score
        "response_relevance": 0.9,    # Default score  
        "handoff_smoothness": 0.85,   # Default score
        "overall_quality": 0.85
    }
    
    # Check if context was used effectively
    if context.get("topics") and response.get("response"):
        response_lower = response["response"].lower()
        topics_mentioned = sum(1 for topic in context["topics"] if topic.lower() in response_lower)
        if context["topics"]:
            quality["context_preservation"] = topics_mentioned / len(context["topics"])
    
    # Check response quality
    if response.get("confidence", 0) > 0.9:
        quality["response_relevance"] = 0.95
    
    # Overall quality
    quality["overall_quality"] = (
        quality["context_preservation"] + 
        quality["response_relevance"] + 
        quality["handoff_smoothness"]
    ) / 3
    
    return quality

@router.get("/collaboration/sessions")
async def get_collaboration_sessions(
    current_user: User = Depends(get_current_user),
    project_id: Optional[str] = None,
    limit: int = 10
):
    """Get user's collaboration sessions"""
    try:
        db = await get_database()
        
        query = {"user_id": str(current_user.id)}
        if project_id:
            query["project_id"] = project_id
        
        sessions = await db.collaboration_sessions.find(query).sort("started_at", -1).limit(limit).to_list(length=limit)
        
        return {
            "sessions": sessions,
            "total": len(sessions),
            "collaboration_stats": await _get_collaboration_stats(str(current_user.id))
        }
        
    except Exception as e:
        logger.error(f"Failed to get collaboration sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve collaboration sessions")

async def _get_collaboration_stats(user_id: str) -> Dict:
    """Get collaboration statistics for user"""
    
    # This would typically query the database for real stats
    return {
        "total_sessions": 12,
        "successful_collaborations": 10,
        "favorite_combination": ["developer", "tester"],
        "avg_session_quality": 0.87,
        "most_used_mode": "parallel",
        "collaboration_improvement": "+15% this month"
    }