from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from models.database import get_database
from models.user import get_current_user

router = APIRouter()

@router.get("/smart-suggestions/{project_id}")
async def get_smart_suggestions(
    project_id: str,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Generate smart suggestions based on project context and conversation history
    """
    try:
        # Get project and recent messages
        project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        messages = await db.messages.find(
            {"project_id": project_id}
        ).sort("timestamp", -1).limit(10).to_list(10)
        
        # Analyze context and generate suggestions
        suggestions = await analyze_and_generate_suggestions(project, messages)
        
        return {
            "suggestions": suggestions,
            "context": {
                "project_progress": project.get("progress", 0),
                "tech_stack": project.get("tech_stack", []),
                "recent_activity": len(messages)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flow-state/{project_id}")
async def update_flow_state(
    project_id: str,
    flow_data: Dict[str, Any],
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Update user's flow state and development patterns
    """
    try:
        # Store flow state data
        flow_record = {
            "project_id": project_id,
            "user_id": current_user["id"],
            "timestamp": datetime.utcnow(),
            "flow_state": flow_data.get("state", "neutral"),
            "focus_score": flow_data.get("focus_score", 50),
            "session_time": flow_data.get("session_time", 0),
            "messages_per_minute": flow_data.get("messages_per_minute", 0),
            "context_switches": flow_data.get("context_switches", 0)
        }
        
        await db.flow_states.insert_one(flow_record)
        
        # Update development patterns
        patterns = await get_development_patterns(project_id, current_user["id"], db)
        
        return {
            "status": "updated",
            "patterns": patterns,
            "recommendations": generate_flow_recommendations(flow_data, patterns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/development-patterns/{project_id}")
async def get_development_patterns(
    project_id: str,
    user_id: str,
    db,
    days: int = 7
):
    """
    Analyze user's development patterns over time
    """
    try:
        # Get flow states from last N days
        start_date = datetime.utcnow() - timedelta(days=days)
        
        flow_states = await db.flow_states.find({
            "project_id": project_id,
            "user_id": user_id,
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", 1).to_list(None)
        
        # Analyze patterns
        patterns = {
            "hourly_activity": analyze_hourly_patterns(flow_states),
            "daily_productivity": analyze_daily_patterns(flow_states),
            "peak_performance": find_peak_hours(flow_states),
            "flow_duration": calculate_average_flow_duration(flow_states),
            "productivity_trend": analyze_productivity_trend(flow_states)
        }
        
        return patterns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice-command")
async def process_voice_command(
    command_data: Dict[str, Any],
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Process voice commands and return appropriate actions
    """
    try:
        command = command_data.get("command", "").lower()
        project_id = command_data.get("project_id")
        confidence = command_data.get("confidence", 0.0)
        
        # Parse and execute command
        result = await parse_voice_command(command, project_id, current_user, db)
        
        # Log voice command usage
        await db.voice_commands.insert_one({
            "user_id": current_user["id"],
            "project_id": project_id,
            "command": command,
            "confidence": confidence,
            "result": result,
            "timestamp": datetime.utcnow()
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/context-memory/{project_id}")
async def get_context_memory(
    project_id: str,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Get conversation context memory and bookmarks
    """
    try:
        # Get bookmarked messages
        bookmarks = await db.bookmarks.find({
            "project_id": project_id,
            "user_id": current_user["id"]
        }).sort("timestamp", -1).to_list(None)
        
        # Get conversation threads
        threads = await generate_conversation_threads(project_id, current_user["id"], db)
        
        return {
            "bookmarks": bookmarks,
            "threads": threads,
            "context_switches": await count_context_switches(project_id, current_user["id"], db)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookmark-message")
async def bookmark_message(
    bookmark_data: Dict[str, Any],
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Bookmark a message for later reference
    """
    try:
        bookmark = {
            "user_id": current_user["id"],
            "project_id": bookmark_data["project_id"],
            "message_id": bookmark_data["message_id"],
            "content": bookmark_data["content"],
            "topic": bookmark_data.get("topic", ""),
            "timestamp": datetime.utcnow()
        }
        
        await db.bookmarks.insert_one(bookmark)
        
        return {"status": "bookmarked", "bookmark_id": str(bookmark["_id"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictive-commands/{project_id}")
async def get_predictive_commands(
    project_id: str,
    context: Optional[str] = None,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    """
    Get predictive command suggestions based on project state and user patterns
    """
    try:
        # Get project context
        project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]})
        
        # Get recent commands
        recent_commands = await db.voice_commands.find({
            "user_id": current_user["id"],
            "project_id": project_id
        }).sort("timestamp", -1).limit(10).to_list(10)
        
        # Get development patterns
        patterns = await get_development_patterns(project_id, current_user["id"], db)
        
        # Generate predictions
        predictions = generate_command_predictions(project, recent_commands, patterns, context)
        
        return {
            "predictions": predictions,
            "confidence_threshold": 0.7
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def analyze_and_generate_suggestions(project, messages):
    """Generate contextual suggestions based on project and conversation analysis"""
    suggestions = []
    
    # Analyze recent messages for context
    recent_content = " ".join([msg.get("content", "") for msg in messages[:5]])
    
    # Error-related suggestions
    if any(keyword in recent_content.lower() for keyword in ["error", "bug", "issue", "problem"]):
        suggestions.append({
            "id": "debug_help",
            "type": "debugging",
            "title": "Debug Assistant",
            "description": "Let me help you systematically debug this issue",
            "action": "Can you help me debug this issue step by step?",
            "priority": "high",
            "confidence": 0.9
        })
    
    # Performance suggestions
    if project.get("tech_stack") and "React" in project["tech_stack"]:
        suggestions.append({
            "id": "react_optimization",
            "type": "performance",
            "title": "React Performance",
            "description": "Optimize component rendering and state management",
            "action": "Show me React performance optimization opportunities",
            "priority": "medium",
            "confidence": 0.8
        })
    
    # Deployment suggestions
    if project.get("progress", 0) > 70:
        suggestions.append({
            "id": "deployment_ready",
            "type": "deployment",
            "title": "Ready to Deploy",
            "description": "Your project looks ready for deployment",
            "action": "Help me prepare this project for production deployment",
            "priority": "high",
            "confidence": 0.85
        })
    
    return suggestions

def analyze_hourly_patterns(flow_states):
    """Analyze hourly activity patterns"""
    hourly_counts = [0] * 24
    
    for state in flow_states:
        hour = state["timestamp"].hour
        hourly_counts[hour] += 1
    
    return [{"hour": i, "activity": count} for i, count in enumerate(hourly_counts)]

def analyze_daily_patterns(flow_states):
    """Analyze daily productivity patterns"""
    daily_scores = {}
    
    for state in flow_states:
        date = state["timestamp"].date()
        if date not in daily_scores:
            daily_scores[date] = []
        daily_scores[date].append(state.get("focus_score", 50))
    
    return {
        str(date): sum(scores) / len(scores) 
        for date, scores in daily_scores.items()
    }

def find_peak_hours(flow_states):
    """Find peak performance hours"""
    hourly_performance = {}
    
    for state in flow_states:
        hour = state["timestamp"].hour
        if hour not in hourly_performance:
            hourly_performance[hour] = []
        hourly_performance[hour].append(state.get("focus_score", 50))
    
    # Calculate average performance per hour
    avg_performance = {
        hour: sum(scores) / len(scores)
        for hour, scores in hourly_performance.items()
    }
    
    # Return top 3 hours
    sorted_hours = sorted(avg_performance.items(), key=lambda x: x[1], reverse=True)
    return sorted_hours[:3]

def calculate_average_flow_duration(flow_states):
    """Calculate average time spent in flow state"""
    flow_sessions = []
    current_session = None
    
    for state in flow_states:
        if state["flow_state"] == "flow":
            if current_session is None:
                current_session = state["timestamp"]
        else:
            if current_session is not None:
                duration = (state["timestamp"] - current_session).total_seconds() / 60
                flow_sessions.append(duration)
                current_session = None
    
    return sum(flow_sessions) / len(flow_sessions) if flow_sessions else 0

def analyze_productivity_trend(flow_states):
    """Analyze productivity trend over time"""
    if len(flow_states) < 2:
        return "insufficient_data"
    
    recent_scores = [state.get("focus_score", 50) for state in flow_states[-5:]]
    earlier_scores = [state.get("focus_score", 50) for state in flow_states[-10:-5]]
    
    if not earlier_scores:
        return "insufficient_data"
    
    recent_avg = sum(recent_scores) / len(recent_scores)
    earlier_avg = sum(earlier_scores) / len(earlier_scores)
    
    if recent_avg > earlier_avg + 5:
        return "improving"
    elif recent_avg < earlier_avg - 5:
        return "declining"
    else:
        return "stable"

async def parse_voice_command(command, project_id, user, db):
    """Parse and execute voice commands"""
    result = {"type": "unknown", "action": None, "message": "Command not recognized"}
    
    # Deployment commands
    if "deploy" in command:
        if "staging" in command:
            result = {
                "type": "deployment",
                "action": "deploy_staging",
                "message": "Initiating deployment to staging environment",
                "environment": "staging"
            }
        elif "production" in command:
            result = {
                "type": "deployment", 
                "action": "deploy_production",
                "message": "Initiating deployment to production environment",
                "environment": "production"
            }
    
    # Testing commands
    elif "test" in command:
        result = {
            "type": "testing",
            "action": "run_tests",
            "message": "Running test suite",
            "test_type": "all"
        }
    
    # Navigation commands
    elif "show" in command and "files" in command:
        result = {
            "type": "navigation",
            "action": "show_files",
            "message": "Opening file explorer"
        }
    
    # Status commands
    elif "status" in command:
        result = {
            "type": "status",
            "action": "project_status",
            "message": "Retrieving project status"
        }
    
    return result

async def generate_conversation_threads(project_id, user_id, db):
    """Generate conversation threads based on message analysis"""
    messages = await db.messages.find({
        "project_id": project_id,
        "user_id": user_id
    }).sort("timestamp", 1).to_list(None)
    
    threads = []
    current_thread = []
    last_timestamp = None
    
    for msg in messages:
        timestamp = msg["timestamp"]
        
        # Start new thread if gap > 30 minutes or topic change detected
        if (last_timestamp and 
            (timestamp - last_timestamp).total_seconds() > 1800) or \
           detect_topic_change(msg, current_thread):
            
            if current_thread:
                threads.append({
                    "id": len(threads),
                    "topic": extract_topic(current_thread[0]["content"]),
                    "messages": current_thread,
                    "start_time": current_thread[0]["timestamp"],
                    "message_count": len(current_thread)
                })
            
            current_thread = []
        
        current_thread.append(msg)
        last_timestamp = timestamp
    
    # Add final thread
    if current_thread:
        threads.append({
            "id": len(threads),
            "topic": extract_topic(current_thread[0]["content"]),
            "messages": current_thread,
            "start_time": current_thread[0]["timestamp"],
            "message_count": len(current_thread)
        })
    
    return threads

def detect_topic_change(message, current_thread):
    """Simple topic change detection"""
    if not current_thread:
        return False
    
    # Keywords that indicate new topics
    topic_keywords = ["help me", "how do i", "create", "build", "implement", "add", "setup", "configure"]
    
    current_content = message.get("content", "").lower()
    return any(keyword in current_content for keyword in topic_keywords)

def extract_topic(content):
    """Extract topic from message content"""
    first_sentence = content.split('.')[0].split('?')[0]
    return first_sentence[:50] + "..." if len(first_sentence) > 50 else first_sentence

async def count_context_switches(project_id, user_id, db):
    """Count context switches in conversation"""
    messages = await db.messages.find({
        "project_id": project_id,
        "user_id": user_id
    }).sort("timestamp", -1).limit(20).to_list(20)
    
    switches = 0
    context_keywords = ['help', 'create', 'build', 'fix', 'deploy', 'test']
    
    for i in range(1, len(messages)):
        current_context = None
        previous_context = None
        
        for keyword in context_keywords:
            if keyword in messages[i].get("content", "").lower():
                current_context = keyword
            if keyword in messages[i-1].get("content", "").lower():
                previous_context = keyword
        
        if current_context and previous_context and current_context != previous_context:
            switches += 1
    
    return switches

def generate_flow_recommendations(flow_data, patterns):
    """Generate recommendations based on flow state"""
    recommendations = []
    
    current_state = flow_data.get("state", "neutral")
    focus_score = flow_data.get("focus_score", 50)
    
    if current_state == "disrupted" or focus_score < 40:
        recommendations.append({
            "type": "break",
            "message": "Consider taking a short break to regain focus",
            "action": "take_break"
        })
    
    if current_state == "flow" and flow_data.get("session_time", 0) > 5400:  # 90 minutes
        recommendations.append({
            "type": "break",
            "message": "You've been in flow for 90+ minutes. A break might help maintain quality",
            "action": "suggest_break"
        })
    
    return recommendations

def generate_command_predictions(project, recent_commands, patterns, context):
    """Generate predictive command suggestions"""
    predictions = []
    
    # Based on project progress
    if project and project.get("progress", 0) > 80:
        predictions.append({
            "command": "Deploy to production",
            "confidence": 0.85,
            "category": "deployment",
            "reasoning": "Project is near completion"
        })
    
    # Based on recent patterns
    common_commands = {}
    for cmd in recent_commands:
        command = cmd.get("command", "")
        common_commands[command] = common_commands.get(command, 0) + 1
    
    for command, count in sorted(common_commands.items(), key=lambda x: x[1], reverse=True)[:3]:
        predictions.append({
            "command": command,
            "confidence": min(0.9, 0.5 + (count * 0.1)),
            "category": "recent",
            "reasoning": f"Used {count} times recently"
        })
    
    return predictions