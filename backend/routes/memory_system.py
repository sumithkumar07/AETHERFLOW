from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import asyncio
import uuid
import json
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3Upgraded
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class MemoryItem(BaseModel):
    id: str
    type: str  # conversation, project, insight, pattern, preference
    content: Dict[str, Any]
    tags: List[str]
    importance: float  # 0.0 to 1.0
    created_at: datetime
    last_accessed: datetime
    access_count: int
    user_id: str

class ConversationMemory(BaseModel):
    id: str
    conversation_id: str
    summary: str
    key_decisions: List[str]
    technical_insights: List[str]
    user_preferences: Dict[str, Any]
    project_context: Optional[str]
    agents_involved: List[str]
    sentiment: str
    importance_score: float

class ProjectMemory(BaseModel):
    id: str
    project_id: str
    name: str
    technology_stack: List[str]
    architecture_patterns: List[str]
    lessons_learned: List[str]
    performance_metrics: Dict[str, Any]
    user_feedback: List[str]
    success_factors: List[str]
    challenges_faced: List[str]

class UserProfile(BaseModel):
    id: str
    user_id: str
    preferences: Dict[str, Any]
    expertise_level: Dict[str, str]  # domain -> level
    preferred_patterns: List[str]
    communication_style: str
    learning_velocity: float
    project_history: List[str]
    success_patterns: List[str]
    updated_at: datetime

class LongTermMemoryService:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3Upgraded()
        
    async def store_conversation_memory(self, conversation_id: str, messages: List[Dict], user_id: str) -> ConversationMemory:
        """Store and analyze conversation for long-term memory"""
        try:
            # Generate conversation summary and insights
            summary_prompt = f"""
            Analyze this conversation and extract:
            1. Key decisions made
            2. Technical insights discovered
            3. User preferences revealed
            4. Important patterns or learnings
            5. Overall sentiment and context
            
            Conversation: {json.dumps(messages[-10:], indent=2)}  # Last 10 messages
            
            Provide structured analysis focusing on actionable insights.
            """
            
            analysis = await self.ai_service.process_enhanced_chat(
                message=summary_prompt,
                conversation_id=f"analysis_{uuid.uuid4()}",
                user_id=user_id,
                agent_coordination="single"
            )
            
            # Extract key information
            memory_id = str(uuid.uuid4())
            
            # Determine agents involved
            agents_involved = self._extract_agents_from_messages(messages)
            
            # Calculate importance score
            importance_score = await self._calculate_conversation_importance(messages, analysis)
            
            conversation_memory = ConversationMemory(
                id=memory_id,
                conversation_id=conversation_id,
                summary=analysis.get("response", "")[:500],  # First 500 chars
                key_decisions=self._extract_decisions(analysis.get("response", "")),
                technical_insights=self._extract_technical_insights(analysis.get("response", "")),
                user_preferences=self._extract_preferences(messages),
                project_context=self._extract_project_context(messages),
                agents_involved=agents_involved,
                sentiment=self._analyze_sentiment(messages),
                importance_score=importance_score
            )
            
            # Store in database
            db = await get_database()
            
            # Store as memory item
            memory_item = MemoryItem(
                id=memory_id,
                type="conversation",
                content=conversation_memory.dict(),
                tags=["conversation", "analysis"] + agents_involved,
                importance=importance_score,
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                access_count=1,
                user_id=user_id
            )
            
            await db.memory_items.insert_one(memory_item.dict())
            
            # Update user profile
            await self._update_user_profile(user_id, conversation_memory)
            
            return conversation_memory
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Memory storage failed: {str(e)}")
    
    async def store_project_memory(self, project_data: Dict[str, Any], user_id: str) -> ProjectMemory:
        """Store project completion insights for future reference"""
        try:
            # Generate project insights
            insights_prompt = f"""
            Analyze this completed project and extract:
            1. Technology stack effectiveness
            2. Architecture patterns used
            3. Key lessons learned
            4. Performance insights
            5. Success factors
            6. Challenges and solutions
            
            Project Data: {json.dumps(project_data, indent=2)}
            
            Focus on actionable insights for future projects.
            """
            
            analysis = await self.ai_service.process_enhanced_chat(
                message=insights_prompt,
                conversation_id=f"project_analysis_{uuid.uuid4()}",
                user_id=user_id,
                agent_coordination="collaborative"
            )
            
            memory_id = str(uuid.uuid4())
            
            project_memory = ProjectMemory(
                id=memory_id,
                project_id=project_data.get("id", "unknown"),
                name=project_data.get("name", "Unnamed Project"),
                technology_stack=project_data.get("technologies", []),
                architecture_patterns=self._extract_patterns(analysis.get("response", "")),
                lessons_learned=self._extract_lessons(analysis.get("response", "")),
                performance_metrics=project_data.get("metrics", {}),
                user_feedback=project_data.get("feedback", []),
                success_factors=self._extract_success_factors(analysis.get("response", "")),
                challenges_faced=self._extract_challenges(analysis.get("response", ""))
            )
            
            # Store in database
            db = await get_database()
            
            memory_item = MemoryItem(
                id=memory_id,
                type="project",
                content=project_memory.dict(),
                tags=["project", "completion"] + project_memory.technology_stack,
                importance=0.8,  # Projects are generally important
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                access_count=1,
                user_id=user_id
            )
            
            await db.memory_items.insert_one(memory_item.dict())
            
            return project_memory
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Project memory storage failed: {str(e)}")
    
    async def get_contextual_memories(self, query: str, context: Dict[str, Any], user_id: str, limit: int = 10) -> List[MemoryItem]:
        """Retrieve relevant memories based on current context"""
        try:
            db = await get_database()
            
            # Generate search terms from query and context
            search_terms = await self._generate_search_terms(query, context, user_id)
            
            # Build search query
            search_conditions = []
            
            # Text search in content
            if search_terms:
                search_conditions.append({
                    "$or": [
                        {"content.summary": {"$regex": term, "$options": "i"}} 
                        for term in search_terms
                    ]
                })
            
            # Tag-based search
            if context.get("tags"):
                search_conditions.append({"tags": {"$in": context["tags"]}})
            
            # Type-based search
            if context.get("type"):
                search_conditions.append({"type": context["type"]})
            
            # User-specific memories
            search_conditions.append({"user_id": user_id})
            
            # Combine conditions
            query_filter = {"$and": search_conditions} if search_conditions else {"user_id": user_id}
            
            # Execute search with importance-based sorting
            memories = await db.memory_items.find(query_filter).sort([
                ("importance", -1),
                ("last_accessed", -1)
            ]).limit(limit).to_list(length=limit)
            
            # Update access statistics
            memory_ids = [mem["id"] for mem in memories]
            await db.memory_items.update_many(
                {"id": {"$in": memory_ids}},
                {
                    "$inc": {"access_count": 1},
                    "$set": {"last_accessed": datetime.utcnow()}
                }
            )
            
            return [MemoryItem(**mem) for mem in memories]
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Memory retrieval failed: {str(e)}")
    
    async def get_user_profile(self, user_id: str) -> UserProfile:
        """Get or create user profile with learned preferences"""
        try:
            db = await get_database()
            
            # Try to get existing profile
            profile_data = await db.user_profiles.find_one({"user_id": user_id})
            
            if profile_data:
                return UserProfile(**profile_data)
            
            # Create new profile
            profile_id = str(uuid.uuid4())
            
            # Analyze user's conversation and project history
            memories = await db.memory_items.find(
                {"user_id": user_id, "type": {"$in": ["conversation", "project"]}}
            ).sort("created_at", -1).limit(50).to_list(length=50)
            
            # Generate profile insights
            preferences = await self._analyze_user_preferences(memories, user_id)
            
            new_profile = UserProfile(
                id=profile_id,
                user_id=user_id,
                preferences=preferences.get("preferences", {}),
                expertise_level=preferences.get("expertise", {}),
                preferred_patterns=preferences.get("patterns", []),
                communication_style=preferences.get("communication_style", "collaborative"),
                learning_velocity=preferences.get("learning_velocity", 0.7),
                project_history=[mem["id"] for mem in memories if mem["type"] == "project"],
                success_patterns=preferences.get("success_patterns", []),
                updated_at=datetime.utcnow()
            )
            
            # Store profile
            await db.user_profiles.insert_one(new_profile.dict())
            
            return new_profile
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Profile retrieval failed: {str(e)}")
    
    async def enhance_response_with_memory(self, current_message: str, conversation_id: str, user_id: str) -> Dict[str, Any]:
        """Enhance AI response with relevant memories and context"""
        try:
            # Get user profile
            profile = await self.get_user_profile(user_id)
            
            # Get relevant memories
            context = {
                "tags": ["conversation", "technical", "preferences"],
                "type": "conversation"
            }
            relevant_memories = await self.get_contextual_memories(
                current_message, context, user_id, limit=5
            )
            
            # Build enhanced context
            memory_context = {
                "user_preferences": profile.preferences,
                "expertise_level": profile.expertise_level,
                "communication_style": profile.communication_style,
                "relevant_experiences": [
                    {
                        "summary": mem.content.get("summary", ""),
                        "insights": mem.content.get("technical_insights", []),
                        "decisions": mem.content.get("key_decisions", [])
                    }
                    for mem in relevant_memories
                ],
                "preferred_patterns": profile.preferred_patterns,
                "learning_velocity": profile.learning_velocity
            }
            
            return {
                "enhanced_context": memory_context,
                "relevant_memories": len(relevant_memories),
                "profile_completeness": self._calculate_profile_completeness(profile)
            }
            
        except Exception as e:
            return {"error": f"Memory enhancement failed: {str(e)}"}
    
    # Helper methods
    def _extract_agents_from_messages(self, messages: List[Dict]) -> List[str]:
        """Extract which agents were involved in conversation"""
        agents = set()
        for msg in messages:
            if msg.get("agent"):
                agents.add(msg["agent"])
        return list(agents)
    
    async def _calculate_conversation_importance(self, messages: List[Dict], analysis: Dict) -> float:
        """Calculate importance score for conversation"""
        base_score = 0.5
        
        # Longer conversations are more important
        if len(messages) > 10:
            base_score += 0.2
        
        # Technical discussions are important
        technical_keywords = ["architecture", "database", "performance", "security", "scaling"]
        content = " ".join([msg.get("content", "") for msg in messages]).lower()
        technical_score = sum(1 for keyword in technical_keywords if keyword in content) * 0.05
        
        # Decision-making conversations are important
        if any("decision" in msg.get("content", "").lower() for msg in messages):
            base_score += 0.15
        
        return min(1.0, base_score + technical_score)
    
    def _extract_decisions(self, text: str) -> List[str]:
        """Extract decisions from analysis text"""
        # Simple keyword-based extraction
        decisions = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["decided", "chosen", "selected", "agreed"]):
                decisions.append(line.strip())
        return decisions[:5]  # Limit to 5 decisions
    
    def _extract_technical_insights(self, text: str) -> List[str]:
        """Extract technical insights from analysis"""
        insights = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["pattern", "architecture", "performance", "optimization"]):
                insights.append(line.strip())
        return insights[:5]
    
    def _extract_preferences(self, messages: List[Dict]) -> Dict[str, Any]:
        """Extract user preferences from messages"""
        preferences = {}
        
        # Analyze communication patterns
        user_messages = [msg for msg in messages if msg.get("role") == "user"]
        
        if user_messages:
            avg_length = sum(len(msg.get("content", "")) for msg in user_messages) / len(user_messages)
            preferences["message_length_preference"] = "detailed" if avg_length > 100 else "concise"
            
            # Check for technical depth preference
            technical_terms = sum(1 for msg in user_messages 
                                if any(term in msg.get("content", "").lower() 
                                      for term in ["api", "database", "algorithm", "performance"]))
            preferences["technical_depth"] = "high" if technical_terms > len(user_messages) * 0.3 else "medium"
        
        return preferences
    
    def _extract_project_context(self, messages: List[Dict]) -> Optional[str]:
        """Extract project context from messages"""
        for msg in messages:
            content = msg.get("content", "").lower()
            if "project" in content:
                return msg.get("content", "")[:200]  # First 200 chars
        return None
    
    def _analyze_sentiment(self, messages: List[Dict]) -> str:
        """Analyze conversation sentiment"""
        positive_words = ["great", "excellent", "perfect", "amazing", "love", "awesome"]
        negative_words = ["problem", "issue", "error", "failed", "wrong", "bad"]
        
        user_messages = [msg for msg in messages if msg.get("role") == "user"]
        content = " ".join([msg.get("content", "") for msg in user_messages]).lower()
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    async def _update_user_profile(self, user_id: str, conversation_memory: ConversationMemory):
        """Update user profile based on new conversation"""
        db = await get_database()
        
        # Update preferences and patterns
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {
                    "preferred_patterns": {"$each": conversation_memory.technical_insights[:3]}
                },
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=False
        )
    
    async def _generate_search_terms(self, query: str, context: Dict[str, Any], user_id: str) -> List[str]:
        """Generate search terms for memory retrieval"""
        # Extract keywords from query
        terms = query.lower().split()
        
        # Add context-based terms
        if context.get("project_type"):
            terms.append(context["project_type"])
        
        if context.get("technology"):
            terms.append(context["technology"])
        
        # Remove common words
        stop_words = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]
        terms = [term for term in terms if term not in stop_words and len(term) > 2]
        
        return terms[:10]  # Limit to 10 terms
    
    async def _analyze_user_preferences(self, memories: List[Dict], user_id: str) -> Dict[str, Any]:
        """Analyze user preferences from memory history"""
        if not memories:
            return {
                "preferences": {},
                "expertise": {},
                "patterns": [],
                "communication_style": "collaborative",
                "learning_velocity": 0.7,
                "success_patterns": []
            }
        
        # Analyze patterns in memories
        tech_stack_freq = {}
        pattern_freq = {}
        
        for memory in memories:
            if memory["type"] == "project":
                content = memory.get("content", {})
                for tech in content.get("technology_stack", []):
                    tech_stack_freq[tech] = tech_stack_freq.get(tech, 0) + 1
                
                for pattern in content.get("architecture_patterns", []):
                    pattern_freq[pattern] = pattern_freq.get(pattern, 0) + 1
        
        # Determine expertise levels
        expertise = {}
        for tech, freq in tech_stack_freq.items():
            if freq >= 3:
                expertise[tech] = "advanced"
            elif freq >= 2:
                expertise[tech] = "intermediate"
            else:
                expertise[tech] = "beginner"
        
        return {
            "preferences": {
                "preferred_technologies": list(tech_stack_freq.keys())[:5],
                "project_complexity": "medium"  # Default
            },
            "expertise": expertise,
            "patterns": list(pattern_freq.keys())[:5],
            "communication_style": "collaborative",
            "learning_velocity": min(1.0, len(memories) * 0.05),  # Based on activity
            "success_patterns": self._extract_success_patterns(memories)
        }
    
    def _extract_success_patterns(self, memories: List[Dict]) -> List[str]:
        """Extract patterns that led to successful projects"""
        patterns = []
        for memory in memories:
            if memory["type"] == "project":
                content = memory.get("content", {})
                patterns.extend(content.get("success_factors", []))
        return list(set(patterns))[:5]  # Unique patterns, max 5
    
    def _calculate_profile_completeness(self, profile: UserProfile) -> float:
        """Calculate how complete the user profile is"""
        completeness = 0.0
        
        if profile.preferences:
            completeness += 0.3
        if profile.expertise_level:
            completeness += 0.3
        if profile.preferred_patterns:
            completeness += 0.2
        if profile.project_history:
            completeness += 0.2
        
        return completeness

    # Add missing helper methods
    def _extract_patterns(self, text: str) -> List[str]:
        """Extract architecture patterns from text"""
        patterns = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["pattern", "architecture", "design"]):
                patterns.append(line.strip())
        return patterns[:5]
    
    def _extract_lessons(self, text: str) -> List[str]:
        """Extract lessons learned from text"""
        lessons = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["lesson", "learned", "insight", "discovery"]):
                lessons.append(line.strip())
        return lessons[:5]
    
    def _extract_success_factors(self, text: str) -> List[str]:
        """Extract success factors from text"""
        factors = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["success", "effective", "worked", "good"]):
                factors.append(line.strip())
        return factors[:5]
    
    def _extract_challenges(self, text: str) -> List[str]:
        """Extract challenges from text"""
        challenges = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ["challenge", "problem", "issue", "difficult"]):
                challenges.append(line.strip())
        return challenges[:5]

# Initialize service
memory_service = LongTermMemoryService()

@router.post("/store-conversation")
async def store_conversation_memory(
    conversation_id: str,
    messages: List[Dict],
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Store conversation in long-term memory"""
    background_tasks.add_task(
        memory_service.store_conversation_memory,
        conversation_id,
        messages,
        current_user["id"]
    )
    return {"message": "Conversation storage initiated", "conversation_id": conversation_id}

@router.post("/store-project")
async def store_project_memory(
    project_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Store project completion insights"""
    return await memory_service.store_project_memory(project_data, current_user["id"])

@router.get("/relevant-memories")
async def get_relevant_memories(
    query: str,
    context: Optional[str] = None,
    limit: int = 10,
    current_user = Depends(get_current_user)
):
    """Get contextually relevant memories"""
    context_dict = json.loads(context) if context else {}
    return await memory_service.get_contextual_memories(query, context_dict, current_user["id"], limit)

@router.get("/profile")
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get user profile with learned preferences"""
    return await memory_service.get_user_profile(current_user["id"])

@router.post("/enhance-response")
async def enhance_response_with_memory(
    message: str,
    conversation_id: str,
    current_user = Depends(get_current_user)
):
    """Enhance AI response with memory context"""
    return await memory_service.enhance_response_with_memory(message, conversation_id, current_user["id"])

@router.get("/memories")
async def get_user_memories(
    memory_type: Optional[str] = None,
    limit: int = 20,
    current_user = Depends(get_current_user)
):
    """Get user's memory items"""
    db = await get_database()
    
    query_filter = {"user_id": current_user["id"]}
    if memory_type:
        query_filter["type"] = memory_type
    
    memories = await db.memory_items.find(query_filter).sort([
        ("importance", -1),
        ("created_at", -1)
    ]).limit(limit).to_list(length=limit)
    
    return memories