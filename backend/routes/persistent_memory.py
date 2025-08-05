from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel
import json

logger = logging.getLogger(__name__)
router = APIRouter()

# Models for Persistent Memory System
class MemoryEntry(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    memory_type: str  # conversation, preference, skill, project_context, learning
    content: Dict[str, Any]
    importance_score: float  # 0.0 to 1.0
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    tags: List[str] = []

class UserPreference(BaseModel):
    preference_type: str
    value: Any
    context: Optional[str] = None
    confidence: float = 1.0

class ConversationMemory(BaseModel):
    conversation_id: str
    key_topics: List[str]
    decisions_made: List[Dict]
    user_preferences_detected: List[UserPreference]
    technical_stack_used: List[str]
    problems_solved: List[str]
    success_patterns: List[str]

class ProjectMemory(BaseModel):
    project_id: str
    project_name: str
    tech_stack: List[str]
    architecture_patterns: List[str]
    challenges_faced: List[str]
    solutions_implemented: List[str]
    performance_metrics: Dict[str, Any]
    team_preferences: List[str]
    lessons_learned: List[str]

# Advanced Memory Intelligence System
class PersistentMemoryEngine:
    def __init__(self):
        self.memory_types = {
            "conversation": {"retention_days": 90, "importance_threshold": 0.3},
            "preference": {"retention_days": 365, "importance_threshold": 0.1},
            "skill": {"retention_days": 180, "importance_threshold": 0.4},
            "project_context": {"retention_days": 365, "importance_threshold": 0.5},
            "learning": {"retention_days": 730, "importance_threshold": 0.6}
        }
        
        # In-memory storage (in production, use Redis/MongoDB)
        self.memory_store: Dict[str, List[MemoryEntry]] = {}
        self.user_profiles: Dict[str, Dict] = {}
    
    async def store_memory(self, memory: MemoryEntry) -> str:
        """Store a memory entry with intelligent categorization"""
        try:
            # Calculate importance score if not provided
            if not hasattr(memory, 'importance_score') or memory.importance_score == 0:
                memory.importance_score = await self._calculate_importance(memory)
            
            # Set expiration based on memory type
            if not memory.expires_at:
                retention_config = self.memory_types.get(memory.memory_type)
                if retention_config:
                    memory.expires_at = memory.created_at + timedelta(
                        days=retention_config["retention_days"]
                    )
            
            # Store in memory
            user_memories = self.memory_store.get(memory.user_id, [])
            user_memories.append(memory)
            self.memory_store[memory.user_id] = user_memories
            
            # Update user profile
            await self._update_user_profile(memory)
            
            logger.info(f"Stored memory entry {memory.id} for user {memory.user_id}")
            return memory.id
            
        except Exception as e:
            logger.error(f"Error storing memory: {e}")
            raise
    
    async def retrieve_memories(
        self, 
        user_id: str, 
        memory_type: Optional[str] = None,
        project_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 50
    ) -> List[MemoryEntry]:
        """Retrieve relevant memories with intelligent filtering"""
        try:
            user_memories = self.memory_store.get(user_id, [])
            
            # Filter by criteria
            filtered_memories = []
            for memory in user_memories:
                # Check if expired
                if memory.expires_at and datetime.now() > memory.expires_at:
                    continue
                    
                # Filter by type
                if memory_type and memory.memory_type != memory_type:
                    continue
                    
                # Filter by project
                if project_id and memory.project_id != project_id:
                    continue
                    
                # Filter by tags
                if tags and not any(tag in memory.tags for tag in tags):
                    continue
                    
                filtered_memories.append(memory)
            
            # Sort by importance and recency
            filtered_memories.sort(
                key=lambda m: (m.importance_score, m.last_accessed or m.created_at),
                reverse=True
            )
            
            # Update access count and timestamp
            for memory in filtered_memories[:limit]:
                memory.access_count += 1
                memory.last_accessed = datetime.now()
            
            return filtered_memories[:limit]
            
        except Exception as e:
            logger.error(f"Error retrieving memories: {e}")
            raise
    
    async def _calculate_importance(self, memory: MemoryEntry) -> float:
        """Calculate importance score based on content and context"""
        try:
            importance = 0.5  # base score
            
            # Boost importance for certain types
            type_boosts = {
                "preference": 0.2,
                "project_context": 0.3,
                "learning": 0.4,
                "skill": 0.15
            }
            importance += type_boosts.get(memory.memory_type, 0)
            
            # Analyze content for importance signals
            content_str = json.dumps(memory.content).lower()
            
            important_keywords = [
                "error", "bug", "solution", "optimization", "performance",
                "architecture", "design pattern", "best practice", "lesson learned",
                "improvement", "innovation", "breakthrough", "critical", "important"
            ]
            
            keyword_matches = sum(1 for keyword in important_keywords if keyword in content_str)
            importance += min(keyword_matches * 0.05, 0.3)
            
            # Project-related memories are more important
            if memory.project_id:
                importance += 0.1
            
            return min(importance, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating importance: {e}")
            return 0.5
    
    async def _update_user_profile(self, memory: MemoryEntry):
        """Update user profile based on memory content"""
        try:
            user_id = memory.user_id
            profile = self.user_profiles.get(user_id, {
                "preferences": {},
                "skills": [],
                "common_patterns": [],
                "tech_stack_preferences": [],
                "project_types": [],
                "success_patterns": []
            })
            
            # Extract insights from memory content
            if memory.memory_type == "preference":
                profile["preferences"].update(memory.content)
            elif memory.memory_type == "skill":
                skill = memory.content.get("skill")
                if skill and skill not in profile["skills"]:
                    profile["skills"].append(skill)
            elif memory.memory_type == "project_context":
                tech_stack = memory.content.get("tech_stack", [])
                for tech in tech_stack:
                    if tech not in profile["tech_stack_preferences"]:
                        profile["tech_stack_preferences"].append(tech)
            
            self.user_profiles[user_id] = profile
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
    
    async def get_contextual_memories(
        self, 
        user_id: str, 
        current_context: str,
        limit: int = 10
    ) -> List[MemoryEntry]:
        """Get memories relevant to current context using AI similarity"""
        try:
            all_memories = await self.retrieve_memories(user_id)
            
            # Simple keyword-based relevance (in production, use embeddings)
            context_keywords = current_context.lower().split()
            relevant_memories = []
            
            for memory in all_memories:
                content_str = json.dumps(memory.content).lower()
                relevance_score = sum(1 for keyword in context_keywords if keyword in content_str)
                
                if relevance_score > 0:
                    memory.relevance_score = relevance_score
                    relevant_memories.append(memory)
            
            # Sort by relevance and importance
            relevant_memories.sort(
                key=lambda m: (getattr(m, 'relevance_score', 0), m.importance_score),
                reverse=True
            )
            
            return relevant_memories[:limit]
            
        except Exception as e:
            logger.error(f"Error getting contextual memories: {e}")
            return []
    
    async def learn_from_conversation(
        self, 
        user_id: str, 
        conversation_data: ConversationMemory
    ) -> str:
        """Learn patterns from conversation and store insights"""
        try:
            # Create memory entries for different aspects
            memories_created = []
            
            # Store key decisions made
            if conversation_data.decisions_made:
                decision_memory = MemoryEntry(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    memory_type="learning",
                    content={
                        "type": "decisions",
                        "conversation_id": conversation_data.conversation_id,
                        "decisions": conversation_data.decisions_made
                    },
                    importance_score=0.7,
                    created_at=datetime.now(),
                    tags=["decisions", "learning"]
                )
                await self.store_memory(decision_memory)
                memories_created.append(decision_memory.id)
            
            # Store user preferences detected
            for preference in conversation_data.user_preferences_detected:
                pref_memory = MemoryEntry(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    memory_type="preference",
                    content={
                        "preference_type": preference.preference_type,
                        "value": preference.value,
                        "context": preference.context,
                        "confidence": preference.confidence
                    },
                    importance_score=0.6,
                    created_at=datetime.now(),
                    tags=["preference", preference.preference_type]
                )
                await self.store_memory(pref_memory)
                memories_created.append(pref_memory.id)
            
            # Store technical patterns
            if conversation_data.technical_stack_used:
                tech_memory = MemoryEntry(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    memory_type="skill",
                    content={
                        "type": "tech_stack_usage",
                        "technologies": conversation_data.technical_stack_used,
                        "conversation_id": conversation_data.conversation_id
                    },
                    importance_score=0.5,
                    created_at=datetime.now(),
                    tags=["tech_stack", "skills"] + conversation_data.technical_stack_used
                )
                await self.store_memory(tech_memory)
                memories_created.append(tech_memory.id)
            
            logger.info(f"Created {len(memories_created)} memory entries from conversation")
            return f"Learned from conversation, created {len(memories_created)} memory entries"
            
        except Exception as e:
            logger.error(f"Error learning from conversation: {e}")
            raise

# Initialize memory engine
memory_engine = PersistentMemoryEngine()

@router.post("/store")
async def store_memory(memory_data: Dict[str, Any], user_id: str):
    """Store a memory entry"""
    try:
        memory = MemoryEntry(
            id=str(uuid.uuid4()),
            user_id=user_id,
            memory_type=memory_data.get("memory_type", "conversation"),
            content=memory_data.get("content", {}),
            importance_score=memory_data.get("importance_score", 0.5),
            created_at=datetime.now(),
            project_id=memory_data.get("project_id"),
            tags=memory_data.get("tags", [])
        )
        
        memory_id = await memory_engine.store_memory(memory)
        return {"memory_id": memory_id, "status": "stored"}
        
    except Exception as e:
        logger.error(f"Error storing memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/retrieve")
async def retrieve_memories(
    user_id: str,
    memory_type: Optional[str] = None,
    project_id: Optional[str] = None,
    limit: int = 20
):
    """Retrieve user memories with filtering"""
    try:
        memories = await memory_engine.retrieve_memories(
            user_id=user_id,
            memory_type=memory_type,
            project_id=project_id,
            limit=limit
        )
        
        return {
            "memories": [memory.dict() for memory in memories],
            "count": len(memories)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contextual")
async def get_contextual_memories(user_id: str, context: str, limit: int = 10):
    """Get memories relevant to current context"""
    try:
        memories = await memory_engine.get_contextual_memories(
            user_id=user_id,
            current_context=context,
            limit=limit
        )
        
        return {
            "relevant_memories": [memory.dict() for memory in memories],
            "context": context,
            "count": len(memories)
        }
        
    except Exception as e:
        logger.error(f"Error getting contextual memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/learn-conversation")
async def learn_from_conversation(user_id: str, conversation_data: ConversationMemory):
    """Learn insights from a conversation"""
    try:
        result = await memory_engine.learn_from_conversation(user_id, conversation_data)
        return {"result": result, "user_id": user_id}
        
    except Exception as e:
        logger.error(f"Error learning from conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
async def get_user_profile(user_id: str):
    """Get user profile built from memories"""
    try:
        profile = memory_engine.user_profiles.get(user_id, {})
        return {"user_id": user_id, "profile": profile}
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cleanup")
async def cleanup_expired_memories(user_id: Optional[str] = None):
    """Clean up expired memories"""
    try:
        cleaned_count = 0
        users_to_clean = [user_id] if user_id else list(memory_engine.memory_store.keys())
        
        for uid in users_to_clean:
            user_memories = memory_engine.memory_store.get(uid, [])
            current_time = datetime.now()
            
            # Filter out expired memories
            valid_memories = [
                m for m in user_memories 
                if not m.expires_at or m.expires_at > current_time
            ]
            
            cleaned_count += len(user_memories) - len(valid_memories)
            memory_engine.memory_store[uid] = valid_memories
        
        return {"cleaned_memories": cleaned_count}
        
    except Exception as e:
        logger.error(f"Error cleaning up memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))