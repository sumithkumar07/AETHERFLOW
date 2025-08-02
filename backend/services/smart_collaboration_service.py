import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from models.database import get_database
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class SmartCollaborationService:
    def __init__(self):
        self.ai_service = AIService()
        self.active_sessions: Dict[str, Dict] = {}
        
    async def initialize_session(self, session_id: str, project_id: str):
        """Initialize collaboration session with AI capabilities"""
        try:
            db = await get_database()
            
            # Initialize session state
            session_state = {
                "session_id": session_id,
                "project_id": project_id,
                "ai_context": {
                    "shared_memory": [],
                    "collaborative_suggestions": [],
                    "active_agents": []
                },
                "real_time_features": {
                    "code_sync": True,
                    "cursor_tracking": True,
                    "ai_assistance": True,
                    "voice_chat": True
                },
                "collaboration_history": [],
                "performance_metrics": {
                    "sync_latency": 0,
                    "ai_response_time": 0,
                    "active_participants": 0
                },
                "created_at": datetime.utcnow(),
                "last_activity": datetime.utcnow()
            }
            
            # Store in memory for quick access
            self.active_sessions[session_id] = session_state
            
            # Store in database for persistence
            await db.collaboration_states.insert_one(session_state)
            
            logger.info(f"Collaboration session {session_id} initialized for project {project_id}")
            
        except Exception as e:
            logger.error(f"Failed to initialize session {session_id}: {e}")
            raise
    
    async def get_session_state(self, session_id: str) -> Dict[str, Any]:
        """Get current session state"""
        try:
            # Check memory first
            if session_id in self.active_sessions:
                return self.active_sessions[session_id]
            
            # Fall back to database
            db = await get_database()
            session_state = await db.collaboration_states.find_one({"session_id": session_id})
            
            if session_state:
                # Load into memory
                self.active_sessions[session_id] = session_state
                return session_state
            
            return {}
            
        except Exception as e:
            logger.error(f"Failed to get session state {session_id}: {e}")
            return {}
    
    async def update_session_state(self, session_id: str, updates: Dict[str, Any]):
        """Update session state"""
        try:
            # Update memory
            if session_id in self.active_sessions:
                self.active_sessions[session_id].update(updates)
                self.active_sessions[session_id]["last_activity"] = datetime.utcnow()
            
            # Update database
            db = await get_database()
            await db.collaboration_states.update_one(
                {"session_id": session_id},
                {"$set": {**updates, "last_activity": datetime.utcnow()}}
            )
            
        except Exception as e:
            logger.error(f"Failed to update session state {session_id}: {e}")
    
    async def get_collaborative_ai_response(self, session_id: str, request: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Get AI response in collaborative context"""
        try:
            session_state = await self.get_session_state(session_id)
            
            # Build collaborative context
            collaborative_context = []
            
            # Add shared memory from session
            shared_memory = session_state.get("ai_context", {}).get("shared_memory", [])
            collaborative_context.extend(shared_memory[-5:])  # Last 5 interactions
            
            # Add current collaboration history
            collab_history = session_state.get("collaboration_history", [])
            if collab_history:
                collaborative_context.append({
                    "role": "system",
                    "content": f"Collaboration context: {collab_history[-3:]}"
                })
            
            # Process with AI service
            ai_response = await self.ai_service.process_message(
                message=f"[COLLABORATIVE SESSION] {request.get('message', '')}",
                model=request.get('model', 'codellama:13b'),
                agent=request.get('agent', 'developer'),
                context=collaborative_context,
                user_id=user_id,
                project_id=session_state.get("project_id")
            )
            
            # Update shared AI context
            shared_memory.append({
                "role": "user",
                "content": request.get('message', ''),
                "user_id": user_id,
                "timestamp": datetime.utcnow()
            })
            
            shared_memory.append({
                "role": "assistant", 
                "content": ai_response.get("response", ""),
                "model": ai_response.get("model_used", ""),
                "timestamp": datetime.utcnow()
            })
            
            # Update session state
            await self.update_session_state(session_id, {
                "ai_context.shared_memory": shared_memory[-10:],  # Keep last 10 interactions
                "ai_context.last_ai_response": ai_response
            })
            
            # Add collaboration metadata
            ai_response["collaboration_metadata"] = {
                "session_id": session_id,
                "shared_context": True,
                "participants_count": len(session_state.get("participants", [])),
                "collaborative_suggestions": await self._generate_collaborative_suggestions(session_state, ai_response)
            }
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Collaborative AI response error: {e}")
            return {
                "response": "I apologize, but I encountered an error in collaborative mode.",
                "error": str(e),
                "collaborative": True
            }
    
    async def process_collaborative_ai_request(self, session_id: str, request_data: Dict, user_id: str):
        """Process AI request in collaborative session"""
        try:
            # Add request to collaboration history
            await self.add_collaboration_event(session_id, {
                "type": "ai_request",
                "user_id": user_id,
                "data": request_data,
                "timestamp": datetime.utcnow()
            })
            
            # Get AI response
            ai_response = await self.get_collaborative_ai_response(
                session_id, request_data, user_id
            )
            
            # Add response to collaboration history
            await self.add_collaboration_event(session_id, {
                "type": "ai_response",
                "user_id": "ai_assistant",
                "data": ai_response,
                "timestamp": datetime.utcnow()
            })
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Collaborative AI request processing error: {e}")
            return {"error": str(e)}
    
    async def add_collaboration_event(self, session_id: str, event: Dict[str, Any]):
        """Add event to collaboration history"""
        try:
            session_state = await self.get_session_state(session_id)
            
            history = session_state.get("collaboration_history", [])
            history.append(event)
            
            # Keep last 50 events
            history = history[-50:]
            
            await self.update_session_state(session_id, {
                "collaboration_history": history
            })
            
        except Exception as e:
            logger.error(f"Failed to add collaboration event: {e}")
    
    async def sync_code_changes(self, session_id: str, changes: Dict[str, Any], user_id: str):
        """Sync code changes across session participants"""
        try:
            # Add to collaboration history
            await self.add_collaboration_event(session_id, {
                "type": "code_change",
                "user_id": user_id,
                "data": changes,
                "timestamp": datetime.utcnow()
            })
            
            # Generate AI suggestions for the code change
            ai_suggestions = await self._get_ai_code_suggestions(session_id, changes)
            
            return {
                "sync_status": "success",
                "ai_suggestions": ai_suggestions,
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Code sync error: {e}")
            return {"sync_status": "error", "error": str(e)}
    
    async def get_session_analytics(self, session_id: str) -> Dict[str, Any]:
        """Get analytics for collaboration session"""
        try:
            session_state = await self.get_session_state(session_id)
            history = session_state.get("collaboration_history", [])
            
            # Calculate analytics
            analytics = {
                "session_duration": (datetime.utcnow() - session_state.get("created_at", datetime.utcnow())).total_seconds(),
                "total_events": len(history),
                "event_breakdown": {},
                "user_activity": {},
                "ai_interactions": 0,
                "code_changes": 0
            }
            
            # Analyze events
            for event in history:
                event_type = event.get("type", "unknown")
                user_id = event.get("user_id", "unknown")
                
                # Event breakdown
                analytics["event_breakdown"][event_type] = analytics["event_breakdown"].get(event_type, 0) + 1
                
                # User activity
                if user_id != "ai_assistant":
                    analytics["user_activity"][user_id] = analytics["user_activity"].get(user_id, 0) + 1
                
                # Specific counters
                if event_type == "ai_request":
                    analytics["ai_interactions"] += 1
                elif event_type == "code_change":
                    analytics["code_changes"] += 1
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get session analytics: {e}")
            return {}
    
    async def _generate_collaborative_suggestions(self, session_state: Dict, ai_response: Dict) -> List[str]:
        """Generate suggestions for collaborative work"""
        suggestions = []
        
        participants_count = len(session_state.get("participants", []))
        
        if participants_count > 1:
            suggestions.extend([
                "Share this solution with your team members using live collaboration",
                "Use voice chat to discuss implementation details",
                "Consider creating a collaborative coding session"
            ])
        
        if "code" in ai_response.get("response", "").lower():
            suggestions.append("Enable real-time code sharing for better collaboration")
        
        return suggestions
    
    async def _get_ai_code_suggestions(self, session_id: str, code_changes: Dict) -> List[str]:
        """Get AI suggestions for code changes"""
        try:
            # Simple AI-powered code suggestions
            suggestions = await self.ai_service.process_message(
                message=f"Provide collaborative suggestions for code changes: {code_changes}",
                model="deepseek-coder:6.7b",
                agent="developer"
            )
            
            return suggestions.get("suggestions", [
                "Consider adding error handling",
                "Add tests for this functionality",
                "Document the new code changes"
            ])
            
        except Exception as e:
            logger.error(f"AI code suggestions error: {e}")
            return ["Enable AI assistance for better code suggestions"]