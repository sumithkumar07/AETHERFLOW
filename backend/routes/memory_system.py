"""
Memory & Long-Term Project Recall - Addresses Gap #5
Session memory, resumable agent tasks, and project-level summaries
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from datetime import datetime, timedelta
import uuid

from routes.auth import get_current_user
from models.database import get_database
from services.ai_service_v3_enhanced import EnhancedAIServiceV3

router = APIRouter()

class MemorySlot(BaseModel):
    id: str
    type: str  # conversation, task, decision, insight, pattern
    title: str
    content: str
    relevance_score: float
    tags: List[str]
    created_at: datetime
    last_accessed: datetime
    project_id: Optional[str] = None
    agent: Optional[str] = None

class ProjectSummary(BaseModel):
    project_id: str
    title: str
    description: str
    tech_stack: List[str]
    key_decisions: List[Dict[str, Any]]
    progress_milestones: List[Dict[str, Any]]
    challenges_solved: List[str]
    current_status: str
    next_steps: List[str]
    last_updated: datetime

class ResumableTask(BaseModel):
    task_id: str
    title: str
    description: str
    assigned_agent: str
    status: str
    progress_data: Dict[str, Any]
    context: Dict[str, Any]
    last_checkpoint: datetime
    estimated_completion: Optional[datetime] = None

class MemoryQuery(BaseModel):
    query: str
    project_id: Optional[str] = None
    memory_types: Optional[List[str]] = None
    limit: int = 10

class MemorySystem:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
    
    async def store_memory(self, user_id: str, memory_data: Dict[str, Any]) -> str:
        """Store a memory with intelligent categorization and relevance scoring"""
        try:
            db = await get_database()
            
            # Generate memory ID
            memory_id = f"mem_{uuid.uuid4().hex[:12]}"
            
            # Use AI to categorize and score the memory
            categorization_prompt = f"""
            Analyze this memory entry and provide:
            1. Memory type (conversation, task, decision, insight, pattern, error)
            2. Relevance score (0.0-1.0)
            3. Descriptive tags (max 5)
            4. Brief title (max 50 chars)
            
            Memory content: {memory_data.get('content', '')[:500]}
            Context: {memory_data.get('context', '')}
            
            Return JSON format:
            {{
                "type": "memory_type",
                "relevance_score": 0.85,
                "tags": ["tag1", "tag2"],
                "title": "Brief descriptive title"
            }}
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=categorization_prompt,
                session_id=f"memory_categorization_{memory_id}",
                user_id=user_id,
                agent_preference="Sage",  # Project manager for categorization
                include_context=False
            )
            
            # Parse AI categorization
            try:
                if "```json" in ai_response['content']:
                    json_start = ai_response['content'].find("```json") + 7
                    json_end = ai_response['content'].find("```", json_start)
                    categorization = json.loads(ai_response['content'][json_start:json_end])
                else:
                    categorization = json.loads(ai_response['content'])
            except:
                # Fallback categorization
                categorization = {
                    "type": "conversation",
                    "relevance_score": 0.6,
                    "tags": ["general"],
                    "title": "Memory entry"
                }
            
            # Create memory record
            memory_record = {
                "memory_id": memory_id,
                "user_id": user_id,
                "project_id": memory_data.get("project_id"),
                "type": categorization.get("type", "conversation"),
                "title": categorization.get("title", "Memory entry"),
                "content": memory_data.get("content", ""),
                "context": memory_data.get("context", {}),
                "relevance_score": categorization.get("relevance_score", 0.6),
                "tags": categorization.get("tags", []),
                "agent": memory_data.get("agent"),
                "created_at": datetime.utcnow(),
                "last_accessed": datetime.utcnow(),
                "access_count": 0
            }
            
            await db.memories.insert_one(memory_record)
            
            # Update project memory index if project_id provided
            if memory_data.get("project_id"):
                await self._update_project_memory_index(user_id, memory_data["project_id"], memory_id)
            
            return memory_id
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Memory storage failed: {str(e)}")
    
    async def recall_memories(self, user_id: str, query: MemoryQuery) -> List[Dict[str, Any]]:
        """Intelligent memory recall based on query"""
        try:
            db = await get_database()
            
            # Build search criteria
            search_criteria = {"user_id": user_id}
            
            if query.project_id:
                search_criteria["project_id"] = query.project_id
            
            if query.memory_types:
                search_criteria["type"] = {"$in": query.memory_types}
            
            # Use AI to expand query with related terms
            expansion_prompt = f"""
            Expand this memory search query with related terms, synonyms, and concepts:
            Query: {query.query}
            
            Return a list of search terms that would help find relevant memories:
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=expansion_prompt,
                session_id=f"memory_search_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Sage",
                include_context=False
            )
            
            # Get memories based on text search and ranking
            memories = await db.memories.find(search_criteria).to_list(query.limit * 3)
            
            # Rank memories by relevance to query
            ranked_memories = await self._rank_memories_by_relevance(memories, query.query, user_id)
            
            # Update access count and timestamp
            for memory in ranked_memories[:query.limit]:
                await db.memories.update_one(
                    {"memory_id": memory["memory_id"]},
                    {
                        "$set": {"last_accessed": datetime.utcnow()},
                        "$inc": {"access_count": 1}
                    }
                )
            
            return ranked_memories[:query.limit]
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Memory recall failed: {str(e)}")
    
    async def create_project_summary(self, user_id: str, project_id: str) -> ProjectSummary:
        """Generate comprehensive project summary from memories and activities"""
        try:
            db = await get_database()
            
            # Get project memories
            memories = await db.memories.find({
                "user_id": user_id,
                "project_id": project_id
            }).sort("created_at", 1).to_list(100)
            
            # Get project activities
            activities = await db.project_activities.find({
                "user_id": user_id,
                "project_id": project_id
            }).sort("created_at", 1).to_list(50)
            
            # Use AI to generate comprehensive summary
            summary_prompt = f"""
            Create a comprehensive project summary based on this data:
            
            PROJECT_ID: {project_id}
            
            MEMORIES ({len(memories)} entries):
            {json.dumps([{
                'title': m.get('title', ''),
                'type': m.get('type', ''),
                'content': m.get('content', '')[:200] + '...' if len(m.get('content', '')) > 200 else m.get('content', ''),
                'tags': m.get('tags', [])
            } for m in memories[-20:]], indent=2)}
            
            ACTIVITIES ({len(activities)} entries):
            {json.dumps([{
                'type': a.get('type', ''),
                'description': a.get('description', '')[:100] + '...' if len(a.get('description', '')) > 100 else a.get('description', ''),
                'timestamp': str(a.get('created_at', ''))
            } for a in activities[-10:]], indent=2)}
            
            Generate a project summary with:
            1. Title and description
            2. Tech stack used
            3. Key decisions made
            4. Progress milestones achieved
            5. Challenges solved
            6. Current status
            7. Next steps
            
            Return as JSON format:
            {{
                "title": "Project Title",
                "description": "Project description",
                "tech_stack": ["React", "Node.js"],
                "key_decisions": [
                    {{"decision": "Used React for frontend", "reasoning": "Better performance", "timestamp": "2024-01-15"}}
                ],
                "progress_milestones": [
                    {{"milestone": "MVP completed", "date": "2024-01-20", "details": "Core features working"}}
                ],
                "challenges_solved": ["Performance optimization", "User authentication"],
                "current_status": "In development",
                "next_steps": ["Add testing", "Deploy to production"]
            }}
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=summary_prompt,
                session_id=f"project_summary_{project_id}",
                user_id=user_id,
                agent_preference="Sage",
                include_context=True
            )
            
            # Parse AI response
            try:
                if "```json" in ai_response['content']:
                    json_start = ai_response['content'].find("```json") + 7
                    json_end = ai_response['content'].find("```", json_start)
                    summary_data = json.loads(ai_response['content'][json_start:json_end])
                else:
                    summary_data = json.loads(ai_response['content'])
            except:
                # Fallback summary
                summary_data = {
                    "title": f"Project {project_id}",
                    "description": "Project in development",
                    "tech_stack": [],
                    "key_decisions": [],
                    "progress_milestones": [],
                    "challenges_solved": [],
                    "current_status": "Active",
                    "next_steps": []
                }
            
            # Create ProjectSummary object
            summary = ProjectSummary(
                project_id=project_id,
                title=summary_data.get("title", f"Project {project_id}"),
                description=summary_data.get("description", ""),
                tech_stack=summary_data.get("tech_stack", []),
                key_decisions=summary_data.get("key_decisions", []),
                progress_milestones=summary_data.get("progress_milestones", []),
                challenges_solved=summary_data.get("challenges_solved", []),
                current_status=summary_data.get("current_status", "Active"),
                next_steps=summary_data.get("next_steps", []),
                last_updated=datetime.utcnow()
            )
            
            # Store summary in database
            await db.project_summaries.update_one(
                {"project_id": project_id, "user_id": user_id},
                {"$set": summary.dict()},
                upsert=True
            )
            
            return summary
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Project summary creation failed: {str(e)}")
    
    async def create_resumable_task(self, user_id: str, task_data: Dict[str, Any]) -> str:
        """Create a resumable task with checkpoint system"""
        try:
            db = await get_database()
            
            task_id = f"task_{uuid.uuid4().hex[:12]}"
            
            task_record = {
                "task_id": task_id,
                "user_id": user_id,
                "project_id": task_data.get("project_id"),
                "title": task_data.get("title", ""),
                "description": task_data.get("description", ""),
                "assigned_agent": task_data.get("assigned_agent", "Dev"),
                "status": "initialized",
                "progress_data": task_data.get("progress_data", {}),
                "context": task_data.get("context", {}),
                "checkpoints": [],
                "created_at": datetime.utcnow(),
                "last_checkpoint": datetime.utcnow(),
                "estimated_completion": None
            }
            
            await db.resumable_tasks.insert_one(task_record)
            
            return task_id
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Resumable task creation failed: {str(e)}")
    
    async def save_task_checkpoint(self, user_id: str, task_id: str, checkpoint_data: Dict[str, Any]):
        """Save a checkpoint for resumable task"""
        try:
            db = await get_database()
            
            checkpoint = {
                "checkpoint_id": f"cp_{uuid.uuid4().hex[:8]}",
                "timestamp": datetime.utcnow(),
                "progress_data": checkpoint_data.get("progress_data", {}),
                "context": checkpoint_data.get("context", {}),
                "status": checkpoint_data.get("status", "in_progress"),
                "output": checkpoint_data.get("output", ""),
                "next_steps": checkpoint_data.get("next_steps", [])
            }
            
            await db.resumable_tasks.update_one(
                {"task_id": task_id, "user_id": user_id},
                {
                    "$push": {"checkpoints": checkpoint},
                    "$set": {
                        "last_checkpoint": datetime.utcnow(),
                        "status": checkpoint["status"],
                        "progress_data": checkpoint["progress_data"],
                        "context": checkpoint["context"]
                    }
                }
            )
            
            return {"status": "success", "checkpoint_id": checkpoint["checkpoint_id"]}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Checkpoint save failed: {str(e)}")
    
    async def resume_task(self, user_id: str, task_id: str) -> Dict[str, Any]:
        """Resume a task from last checkpoint"""
        try:
            db = await get_database()
            
            task = await db.resumable_tasks.find_one({
                "task_id": task_id,
                "user_id": user_id
            })
            
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            
            # Get task context and progress
            latest_context = task.get("context", {})
            progress_data = task.get("progress_data", {})
            checkpoints = task.get("checkpoints", [])
            
            # Create resume prompt for AI agent
            resume_prompt = f"""
            Resume this task from the last checkpoint:
            
            TASK: {task.get('title', '')}
            DESCRIPTION: {task.get('description', '')}
            STATUS: {task.get('status', '')}
            
            PROGRESS DATA:
            {json.dumps(progress_data, indent=2)}
            
            CONTEXT:
            {json.dumps(latest_context, indent=2)}
            
            RECENT CHECKPOINTS:
            {json.dumps(checkpoints[-3:], indent=2, default=str)}
            
            Continue working on this task. Provide next steps and any work that can be done now.
            Consider the progress made so far and build upon it.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=resume_prompt,
                session_id=f"resume_task_{task_id}",
                user_id=user_id,
                agent_preference=task.get("assigned_agent", "Dev"),
                include_context=True
            )
            
            # Update task status
            await db.resumable_tasks.update_one(
                {"task_id": task_id, "user_id": user_id},
                {"$set": {"status": "resumed", "last_checkpoint": datetime.utcnow()}}
            )
            
            return {
                "task_id": task_id,
                "resumption_response": ai_response,
                "task_context": latest_context,
                "progress_data": progress_data,
                "checkpoints_count": len(checkpoints)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Task resumption failed: {str(e)}")
    
    async def _rank_memories_by_relevance(self, memories: List[Dict], query: str, user_id: str) -> List[Dict]:
        """Rank memories by relevance to query using AI"""
        if not memories:
            return []
        
        # Create ranking prompt
        memory_summaries = []
        for i, memory in enumerate(memories):
            memory_summaries.append(f"{i}: {memory.get('title', '')} - {memory.get('content', '')[:100]}")
        
        ranking_prompt = f"""
        Rank these memories by relevance to the query: "{query}"
        
        Memories:
        {chr(10).join(memory_summaries[:20])}  # Limit to first 20 for token efficiency
        
        Return just the numbers in order of relevance (most relevant first):
        Example: [3, 1, 7, 2, 5]
        """
        
        try:
            ai_response = await self.ai_service.get_enhanced_response(
                message=ranking_prompt,
                session_id=f"memory_ranking_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Sage",
                include_context=False
            )
            
            # Parse ranking
            content = ai_response['content'].strip()
            if '[' in content and ']' in content:
                ranking_str = content[content.find('['):content.find(']')+1]
                ranking = json.loads(ranking_str)
                
                # Reorder memories based on ranking
                ranked_memories = []
                for idx in ranking:
                    if 0 <= idx < len(memories):
                        ranked_memories.append(memories[idx])
                
                # Add any remaining memories
                used_indices = set(ranking)
                for i, memory in enumerate(memories):
                    if i not in used_indices:
                        ranked_memories.append(memory)
                
                return ranked_memories
            
        except Exception as e:
            print(f"Memory ranking failed: {e}")
        
        # Fallback: sort by relevance_score and access_count
        return sorted(memories, 
                     key=lambda m: (m.get('relevance_score', 0.5), m.get('access_count', 0)), 
                     reverse=True)
    
    async def _update_project_memory_index(self, user_id: str, project_id: str, memory_id: str):
        """Update project memory index for faster retrieval"""
        try:
            db = await get_database()
            await db.project_memory_index.update_one(
                {"user_id": user_id, "project_id": project_id},
                {
                    "$addToSet": {"memory_ids": memory_id},
                    "$set": {"last_updated": datetime.utcnow()}
                },
                upsert=True
            )
        except Exception as e:
            print(f"Memory index update failed: {e}")

# Initialize memory system
memory_system = MemorySystem()

@router.post("/memories")
async def store_memory(
    memory_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Store a new memory"""
    memory_id = await memory_system.store_memory(str(current_user["_id"]), memory_data)
    return {"memory_id": memory_id, "status": "stored"}

@router.post("/memories/recall")
async def recall_memories(
    query: MemoryQuery,
    current_user = Depends(get_current_user)
):
    """Recall memories based on query"""
    memories = await memory_system.recall_memories(str(current_user["_id"]), query)
    return {"memories": memories, "count": len(memories)}

@router.get("/projects/{project_id}/summary")
async def get_project_summary(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Get or generate project summary"""
    summary = await memory_system.create_project_summary(str(current_user["_id"]), project_id)
    return summary

@router.post("/tasks/resumable")
async def create_resumable_task(
    task_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Create a resumable task"""
    task_id = await memory_system.create_resumable_task(str(current_user["_id"]), task_data)
    return {"task_id": task_id, "status": "created"}

@router.post("/tasks/{task_id}/checkpoint")
async def save_checkpoint(
    task_id: str,
    checkpoint_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Save task checkpoint"""
    result = await memory_system.save_task_checkpoint(str(current_user["_id"]), task_id, checkpoint_data)
    return result

@router.post("/tasks/{task_id}/resume")
async def resume_task(
    task_id: str,
    current_user = Depends(get_current_user)
):
    """Resume a task from checkpoint"""
    result = await memory_system.resume_task(str(current_user["_id"]), task_id)
    return result

@router.get("/memories")
async def get_user_memories(
    project_id: Optional[str] = None,
    memory_type: Optional[str] = None,
    limit: int = 20,
    current_user = Depends(get_current_user)
):
    """Get user memories with filtering"""
    try:
        db = await get_database()
        
        criteria = {"user_id": str(current_user["_id"])}
        if project_id:
            criteria["project_id"] = project_id
        if memory_type:
            criteria["type"] = memory_type
        
        memories = await db.memories.find(
            criteria, 
            {"_id": 0}
        ).sort("last_accessed", -1).limit(limit).to_list(limit)
        
        return {"memories": memories}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get memories: {str(e)}")

@router.get("/tasks/resumable")
async def get_resumable_tasks(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get user's resumable tasks"""
    try:
        db = await get_database()
        
        criteria = {"user_id": str(current_user["_id"])}
        if project_id:
            criteria["project_id"] = project_id
        if status:
            criteria["status"] = status
        
        tasks = await db.resumable_tasks.find(
            criteria,
            {"_id": 0}
        ).sort("last_checkpoint", -1).to_list(50)
        
        return {"tasks": tasks}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get resumable tasks: {str(e)}")