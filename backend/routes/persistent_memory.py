"""
Enhanced Memory & Context System
Persistent project memory across sessions with intelligent context management
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
from services.groq_ai_service import GroqAIService
from routes.auth import get_current_user
from models.database import get_database
import uuid
from collections import defaultdict

router = APIRouter()

class ContextItem(BaseModel):
    id: str
    type: str  # conversation, decision, code_snippet, preference, insight
    content: str
    metadata: Dict[str, Any]
    relevance_score: float
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0

class ProjectMemory(BaseModel):
    project_id: str
    context_items: List[ContextItem]
    preferences: Dict[str, Any]
    learning_patterns: Dict[str, Any]
    conversation_history: List[Dict[str, Any]]
    decision_history: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

class ConversationContext(BaseModel):
    session_id: str
    conversation_id: str
    context_summary: str
    key_topics: List[str]
    user_preferences: Dict[str, Any]
    continuation_context: str

class MemoryQuery(BaseModel):
    query: str
    context_types: Optional[List[str]] = ["conversation", "decision", "preference", "insight"]
    limit: Optional[int] = 10
    relevance_threshold: Optional[float] = 0.5

class PersistentMemoryService:
    def __init__(self):
        self.ai_service = GroqAIService()
    
    async def store_context(self, user_id: str, project_id: str, context_data: Dict[str, Any]) -> str:
        """Store context with intelligent classification and relevance scoring"""
        
        # AI-powered context analysis
        analysis_prompt = f"""
        Analyze this context data and provide intelligent classification:
        
        CONTEXT DATA: {json.dumps(context_data, indent=2)}
        
        Classify and score this context:
        1. Type: conversation|decision|code_snippet|preference|insight|pattern
        2. Relevance Score: 0.0-1.0 (how valuable for future sessions)
        3. Key Topics: Extract 3-5 main topics
        4. Summary: One-sentence summary
        5. Metadata: Additional structured data
        
        Return JSON:
        {{
            "type": "classified_type",
            "relevance_score": 0.8,
            "key_topics": ["topic1", "topic2", "topic3"],
            "summary": "Context summary",
            "metadata": {{
                "agents_involved": ["Dev", "Luna"],
                "tech_stack": ["React", "Python"],
                "complexity": "medium",
                "patterns": ["architectural_decision", "user_preference"]
            }}
        }}
        """
        
        try:
            analysis_response = await self.ai_service.generate_response(
                analysis_prompt,
                model="llama-3.1-70b-versatile",
                max_tokens=500,
                temperature=0.1
            )
            
            analysis = json.loads(analysis_response)
            
            # Create context item
            context_id = str(uuid.uuid4())
            context_item = ContextItem(
                id=context_id,
                type=analysis["type"],
                content=json.dumps(context_data),
                metadata=analysis["metadata"],
                relevance_score=analysis["relevance_score"],
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow()
            )
            
            # Store in database
            db = await get_database()
            await db.project_memory.update_one(
                {"project_id": project_id, "user_id": user_id},
                {
                    "$push": {"context_items": context_item.dict()},
                    "$set": {"updated_at": datetime.utcnow()}
                },
                upsert=True
            )
            
            return context_id
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Context storage error: {str(e)}")
    
    async def retrieve_relevant_context(self, user_id: str, project_id: str, query: MemoryQuery) -> List[ContextItem]:
        """Retrieve contextually relevant information using AI-powered similarity matching"""
        
        try:
            db = await get_database()
            memory = await db.project_memory.find_one({
                "project_id": project_id,
                "user_id": user_id
            })
            
            if not memory or not memory.get("context_items"):
                return []
            
            # AI-powered context matching
            matching_prompt = f"""
            Find the most relevant context items for this query:
            
            QUERY: {query.query}
            CONTEXT_TYPES_FILTER: {query.context_types}
            
            AVAILABLE CONTEXT ITEMS:
            {json.dumps([{
                "id": item["id"],
                "type": item["type"],
                "content": item["content"][:200] + "...",
                "metadata": item["metadata"],
                "relevance_score": item["relevance_score"]
            } for item in memory["context_items"]], indent=2)}
            
            Score each context item (0.0-1.0) based on relevance to the query.
            Return JSON array of relevant item IDs with scores:
            {{
                "relevant_items": [
                    {{"id": "context_id_1", "relevance": 0.9}},
                    {{"id": "context_id_2", "relevance": 0.7}}
                ]
            }}
            """
            
            matching_response = await self.ai_service.generate_response(
                matching_prompt,
                model="llama-3.1-8b-instant",  # Fast model for matching
                max_tokens=800,
                temperature=0.1
            )
            
            matching_results = json.loads(matching_response)
            
            # Filter and sort context items
            relevant_items = []
            context_dict = {item["id"]: item for item in memory["context_items"]}
            
            for match in matching_results["relevant_items"]:
                item_id = match["id"]
                relevance = match["relevance"]
                
                if (item_id in context_dict and 
                    relevance >= query.relevance_threshold and
                    context_dict[item_id]["type"] in query.context_types):
                    
                    context_item = ContextItem(**context_dict[item_id])
                    # Update access tracking
                    context_item.last_accessed = datetime.utcnow()
                    context_item.access_count += 1
                    
                    relevant_items.append(context_item)
            
            # Sort by relevance and limit results
            relevant_items.sort(key=lambda x: x.relevance_score, reverse=True)
            return relevant_items[:query.limit]
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Context retrieval error: {str(e)}")
    
    async def generate_conversation_context(self, user_id: str, project_id: str, current_conversation: List[Dict]) -> ConversationContext:
        """Generate intelligent context for continuing conversations"""
        
        # Retrieve relevant historical context
        memory_query = MemoryQuery(
            query=" ".join([msg.get("content", "") for msg in current_conversation[-3:]]),
            limit=5
        )
        
        relevant_context = await self.retrieve_relevant_context(user_id, project_id, memory_query)
        
        # Generate continuation context
        context_prompt = f"""
        Create intelligent continuation context for this conversation:
        
        CURRENT CONVERSATION (last few messages):
        {json.dumps(current_conversation[-5:], indent=2)}
        
        RELEVANT HISTORICAL CONTEXT:
        {json.dumps([{
            "type": ctx.type,
            "content": ctx.content[:300] + "...",
            "metadata": ctx.metadata
        } for ctx in relevant_context], indent=2)}
        
        Generate continuation context:
        1. Key topics from current conversation
        2. User preferences detected
        3. Context summary for agents
        4. Continuation strategy
        
        Return JSON:
        {{
            "context_summary": "Comprehensive context summary",
            "key_topics": ["topic1", "topic2", "topic3"],
            "user_preferences": {{
                "preferred_agents": ["Dev", "Luna"],
                "communication_style": "detailed",
                "technical_level": "advanced"
            }},
            "continuation_context": "How agents should continue this conversation"
        }}
        """
        
        try:
            context_response = await self.ai_service.generate_response(
                context_prompt,
                model="llama-3.1-70b-versatile",
                max_tokens=800,
                temperature=0.2
            )
            
            context_data = json.loads(context_response)
            
            return ConversationContext(
                session_id=str(uuid.uuid4()),
                conversation_id=current_conversation[0].get("conversation_id", str(uuid.uuid4())),
                context_summary=context_data["context_summary"],
                key_topics=context_data["key_topics"],
                user_preferences=context_data["user_preferences"],
                continuation_context=context_data["continuation_context"]
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Context generation error: {str(e)}")

    async def learn_user_patterns(self, user_id: str, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Learn and adapt to user patterns over time"""
        
        learning_prompt = f"""
        Analyze user interaction patterns and extract learning insights:
        
        INTERACTION DATA: {json.dumps(interaction_data, indent=2)}
        
        Extract patterns:
        1. Communication preferences
        2. Technical expertise level  
        3. Preferred agent interactions
        4. Project complexity preferences
        5. Common workflows
        
        Return JSON with learning insights:
        {{
            "communication_patterns": {{
                "preferred_style": "detailed|concise|visual",
                "response_length_preference": "short|medium|long",
                "technical_depth": "basic|intermediate|advanced"
            }},
            "agent_preferences": {{
                "most_used_agents": ["Dev", "Luna"],
                "agent_interaction_style": "collaborative|sequential|specialized"
            }},
            "project_patterns": {{
                "typical_complexity": "simple|medium|complex",
                "common_tech_stacks": ["React", "Python", "FastAPI"],
                "workflow_preferences": ["feature_first", "architecture_first"]
            }},
            "learning_confidence": 0.8
        }}
        """
        
        try:
            learning_response = await self.ai_service.generate_response(
                learning_prompt,
                model="llama-3.1-70b-versatile",
                max_tokens=600,
                temperature=0.1
            )
            
            learning_data = json.loads(learning_response)
            
            # Store learning insights
            db = await get_database()
            await db.user_learning.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "learning_patterns": learning_data,
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return learning_data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pattern learning error: {str(e)}")

memory_service = PersistentMemoryService()

@router.post("/context/store")
async def store_context(
    context_data: Dict[str, Any],
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Store context with intelligent classification"""
    try:
        context_id = await memory_service.store_context(
            current_user["user_id"], 
            project_id, 
            context_data
        )
        return {"message": "Context stored successfully", "context_id": context_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/context/retrieve")
async def retrieve_context(
    query: MemoryQuery,
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve relevant context using AI-powered matching"""
    try:
        relevant_context = await memory_service.retrieve_relevant_context(
            current_user["user_id"],
            project_id,
            query
        )
        return {
            "relevant_context": [ctx.dict() for ctx in relevant_context],
            "count": len(relevant_context)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversation/context")
async def generate_conversation_context(
    conversation_data: Dict[str, Any],
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate intelligent context for conversation continuation"""
    try:
        context = await memory_service.generate_conversation_context(
            current_user["user_id"],
            project_id,
            conversation_data.get("messages", [])
        )
        return context.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/memory/{project_id}")
async def get_project_memory(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get complete project memory overview"""
    try:
        db = await get_database()
        memory = await db.project_memory.find_one({
            "project_id": project_id,
            "user_id": current_user["user_id"]
        })
        
        if not memory:
            return {"message": "No memory found for this project"}
        
        # Summarize memory for overview
        context_summary = defaultdict(int)
        for item in memory.get("context_items", []):
            context_summary[item["type"]] += 1
        
        return {
            "project_id": project_id,
            "context_summary": dict(context_summary),
            "total_items": len(memory.get("context_items", [])),
            "last_updated": memory.get("updated_at"),
            "memory_health": "good"  # Could add more sophisticated health metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/learn/patterns")
async def learn_user_patterns(
    interaction_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Learn and adapt to user interaction patterns"""
    try:
        learning_insights = await memory_service.learn_user_patterns(
            current_user["user_id"],
            interaction_data
        )
        return {
            "message": "User patterns analyzed and learned",
            "insights": learning_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patterns")
async def get_user_patterns(
    current_user: dict = Depends(get_current_user)
):
    """Get learned user patterns and preferences"""
    try:
        db = await get_database()
        patterns = await db.user_learning.find_one({
            "user_id": current_user["user_id"]
        })
        
        if not patterns:
            return {"message": "No patterns learned yet", "learning_patterns": {}}
        
        return {
            "learning_patterns": patterns.get("learning_patterns", {}),
            "last_updated": patterns.get("updated_at"),
            "learning_status": "active"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))