from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    xp: int
    unlocked: bool = False
    rarity: str = "common"  # common, uncommon, rare, epic, legendary
    unlocked_at: Optional[datetime] = None
    progress: Optional[int] = None
    target: Optional[int] = None
    tags: List[str] = []

class UserStats(BaseModel):
    level: int
    xp: int
    xp_to_next: int
    streak: int
    total_projects: int
    completed_projects: int
    code_lines: int
    collaborations: int
    ai_interactions: int
    achievements_unlocked: int
    badges_earned: int

class StreakInfo(BaseModel):
    current: int
    best: int
    is_active: bool
    multiplier: float
    next_reward: str
    last_activity: Optional[datetime] = None

class GamificationService:
    def __init__(self):
        pass
        
    async def get_user_stats(
        self,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> UserStats:
        """
        Get comprehensive user statistics
        """
        try:
            if not db:
                return self._get_default_stats()
                
            stats_collection = db.user_stats
            stats_doc = await stats_collection.find_one({"user_id": user_id})
            
            if not stats_doc:
                # Initialize stats for new user
                stats = self._get_default_stats()
                await self._initialize_user_stats(user_id, db)
                return stats
            
            return UserStats(**stats_doc)
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return self._get_default_stats()
    
    async def get_user_achievements(
        self,
        user_id: str,
        category: Optional[str] = None,
        unlocked_only: bool = False,
        db: AsyncIOMotorDatabase = None
    ) -> List[Achievement]:
        """
        Get user's achievements with filtering options
        """
        try:
            # Get all available achievements
            all_achievements = self._get_all_achievements()
            
            # Get user's unlocked achievements
            user_achievements = {}
            if db:
                achievements_collection = db.user_achievements
                cursor = achievements_collection.find({"user_id": user_id})
                async for doc in cursor:
                    user_achievements[doc["achievement_id"]] = {
                        "unlocked": True,
                        "unlocked_at": doc["unlocked_at"],
                        "progress": doc.get("progress")
                    }
            
            # Get user's progress on locked achievements
            user_progress = await self._get_user_progress(user_id, db)
            
            # Combine data
            result = []
            for achievement_data in all_achievements:
                achievement = Achievement(**achievement_data)
                
                if achievement.id in user_achievements:
                    achievement.unlocked = True
                    achievement.unlocked_at = user_achievements[achievement.id]["unlocked_at"]
                elif achievement.id in user_progress:
                    achievement.progress = user_progress[achievement.id]["progress"]
                    achievement.target = user_progress[achievement.id]["target"]
                
                # Apply filters
                if category and achievement.category != category:
                    continue
                if unlocked_only and not achievement.unlocked:
                    continue
                
                result.append(achievement)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get user achievements: {e}")
            return []
    
    async def check_and_unlock_achievements(
        self,
        user_id: str,
        action_type: str,
        action_data: Dict[str, Any],
        db: AsyncIOMotorDatabase = None
    ) -> List[Achievement]:
        """
        Check if user actions unlock new achievements
        """
        try:
            new_achievements = []
            
            # Get user's current progress
            user_stats = await self.get_user_stats(user_id, db)
            user_progress = await self._get_user_progress(user_id, db)
            
            # Check each achievement
            for achievement_data in self._get_all_achievements():
                achievement_id = achievement_data["id"]
                
                # Skip if already unlocked
                if db:
                    achievements_collection = db.user_achievements
                    existing = await achievements_collection.find_one({
                        "user_id": user_id,
                        "achievement_id": achievement_id
                    })
                    if existing:
                        continue
                
                # Check if achievement should be unlocked
                should_unlock = await self._check_achievement_criteria(
                    achievement_data, user_stats, action_type, action_data, user_progress
                )
                
                if should_unlock:
                    # Unlock achievement
                    achievement = Achievement(**achievement_data)
                    achievement.unlocked = True
                    achievement.unlocked_at = datetime.utcnow()
                    
                    if db:
                        await achievements_collection.insert_one({
                            "user_id": user_id,
                            "achievement_id": achievement_id,
                            "unlocked_at": datetime.utcnow(),
                            "xp_awarded": achievement.xp
                        })
                        
                        # Award XP
                        await self._award_xp_internal(user_id, achievement.xp, f"Achievement: {achievement.title}", db)
                    
                    new_achievements.append(achievement)
                    logger.info(f"Achievement unlocked: {achievement.title} for user {user_id}")
            
            return new_achievements
            
        except Exception as e:
            logger.error(f"Failed to check achievements: {e}")
            return []
    
    async def get_streak_info(
        self,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> StreakInfo:
        """
        Get user's current streak information
        """
        try:
            if not db:
                return self._get_default_streak()
                
            streaks_collection = db.user_streaks
            streak_doc = await streaks_collection.find_one({"user_id": user_id})
            
            if not streak_doc:
                return self._get_default_streak()
            
            # Check if streak is still active
            last_activity = streak_doc.get("last_activity")
            is_active = True
            current_streak = streak_doc.get("current", 0)
            
            if last_activity:
                hours_since = (datetime.utcnow() - last_activity).total_seconds() / 3600
                if hours_since > 48:  # 48 hour grace period
                    is_active = False
                    current_streak = 0
            
            return StreakInfo(
                current=current_streak,
                best=streak_doc.get("best", 0),
                is_active=is_active,
                multiplier=self._calculate_streak_multiplier(current_streak),
                next_reward=self._get_next_streak_reward(current_streak),
                last_activity=last_activity
            )
            
        except Exception as e:
            logger.error(f"Failed to get streak info: {e}")
            return self._get_default_streak()
    
    async def update_streak(
        self,
        user_id: str,
        activity_type: str = "coding",
        db: AsyncIOMotorDatabase = None
    ) -> StreakInfo:
        """
        Update user's streak based on activity
        """
        try:
            if not db:
                return self._get_default_streak()
                
            streaks_collection = db.user_streaks
            now = datetime.utcnow()
            today = now.date()
            
            # Get current streak data
            streak_doc = await streaks_collection.find_one({"user_id": user_id})
            
            if not streak_doc:
                # Initialize new streak
                new_streak = {
                    "user_id": user_id,
                    "current": 1,
                    "best": 1,
                    "last_activity": now,
                    "last_activity_date": today,
                    "created_at": now
                }
                await streaks_collection.insert_one(new_streak)
                return StreakInfo(
                    current=1,
                    best=1,
                    is_active=True,
                    multiplier=1.0,
                    next_reward=self._get_next_streak_reward(1)
                )
            
            last_activity_date = streak_doc.get("last_activity_date", today)
            current_streak = streak_doc.get("current", 0)
            best_streak = streak_doc.get("best", 0)
            
            # Calculate new streak
            if last_activity_date == today:
                # Already active today, no change
                pass
            elif last_activity_date == today - timedelta(days=1):
                # Consecutive day, increment streak
                current_streak += 1
                best_streak = max(best_streak, current_streak)
            else:
                # Streak broken, reset
                current_streak = 1
            
            # Update database
            await streaks_collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "current": current_streak,
                        "best": best_streak,
                        "last_activity": now,
                        "last_activity_date": today,
                        "activity_type": activity_type
                    }
                }
            )
            
            return StreakInfo(
                current=current_streak,
                best=best_streak,
                is_active=True,
                multiplier=self._calculate_streak_multiplier(current_streak),
                next_reward=self._get_next_streak_reward(current_streak),
                last_activity=now
            )
            
        except Exception as e:
            logger.error(f"Failed to update streak: {e}")
            return self._get_default_streak()
    
    async def award_xp(
        self,
        user_id: str,
        xp_amount: int,
        reason: str = "Action completed",
        category: str = "general",
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Award XP to user and check for level ups
        """
        try:
            return await self._award_xp_internal(user_id, xp_amount, reason, db, category)
            
        except Exception as e:
            logger.error(f"Failed to award XP: {e}")
            raise
    
    async def get_leaderboard(
        self,
        timeframe: str = "all_time",
        category: str = "xp",
        limit: int = 50,
        current_user_id: str = None,
        db: AsyncIOMotorDatabase = None
    ) -> List[Dict[str, Any]]:
        """
        Get leaderboard rankings
        """
        try:
            if not db:
                return []
                
            # Calculate time filter
            time_filter = {}
            if timeframe == "weekly":
                time_filter = {"created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}}
            elif timeframe == "monthly":
                time_filter = {"created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}}
            
            # Build aggregation pipeline based on category
            if category == "xp":
                pipeline = [
                    {"$match": time_filter},
                    {"$group": {
                        "_id": "$user_id",
                        "total_xp": {"$sum": "$xp"},
                        "level": {"$max": "$level"}
                    }},
                    {"$sort": {"total_xp": -1}},
                    {"$limit": limit}
                ]
                collection = db.user_stats
            elif category == "projects":
                pipeline = [
                    {"$match": time_filter},
                    {"$group": {
                        "_id": "$user_id",
                        "total_projects": {"$sum": "$completed_projects"}
                    }},
                    {"$sort": {"total_projects": -1}},
                    {"$limit": limit}
                ]
                collection = db.user_stats
            else:  # streak
                pipeline = [
                    {"$sort": {"current": -1}},
                    {"$limit": limit}
                ]
                collection = db.user_streaks
            
            cursor = collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)
            
            # Get user details and format results
            leaderboard = []
            for i, result in enumerate(results):
                user_id = result["_id"] if "_id" in result else result["user_id"]
                
                # Get user info (in real implementation, you'd fetch from users collection)
                user_info = await self._get_user_info(user_id, db)
                
                entry = {
                    "rank": i + 1,
                    "user_id": user_id,
                    "name": user_info.get("name", "Anonymous"),
                    "avatar": user_info.get("avatar", "👤"),
                    "is_current_user": user_id == current_user_id
                }
                
                if category == "xp":
                    entry.update({
                        "xp": result.get("total_xp", 0),
                        "level": result.get("level", 1)
                    })
                elif category == "projects":
                    entry["projects"] = result.get("total_projects", 0)
                else:  # streak
                    entry["streak"] = result.get("current", 0)
                
                leaderboard.append(entry)
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {e}")
            return []
    
    async def get_progress_tracking(
        self,
        user_id: str,
        timeframe: str = "30d",
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Get detailed progress tracking and analytics
        """
        try:
            # Calculate time range
            if timeframe == "7d":
                since = datetime.utcnow() - timedelta(days=7)
            elif timeframe == "30d":
                since = datetime.utcnow() - timedelta(days=30)
            elif timeframe == "90d":
                since = datetime.utcnow() - timedelta(days=90)
            else:  # all
                since = datetime.min
            
            progress = {
                "timeframe": timeframe,
                "xp_history": await self._get_xp_history(user_id, since, db),
                "achievement_progress": await self._get_achievement_progress(user_id, db),
                "streak_history": await self._get_streak_history(user_id, since, db),
                "activity_breakdown": await self._get_activity_breakdown(user_id, since, db),
                "goals": await self._get_user_goals(user_id, db),
                "insights": await self._generate_insights(user_id, since, db)
            }
            
            return progress
            
        except Exception as e:
            logger.error(f"Failed to get progress tracking: {e}")
            return {}
    
    async def create_custom_badge(
        self,
        user_id: str,
        badge_name: str,
        badge_description: str,
        badge_criteria: Dict[str, Any],
        badge_icon: Optional[str] = None,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Create custom badge for user
        """
        try:
            badge = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": badge_name,
                "description": badge_description,
                "icon": badge_icon or "🏆",
                "criteria": badge_criteria,
                "created_at": datetime.utcnow(),
                "is_custom": True
            }
            
            if db:
                badges_collection = db.custom_badges
                await badges_collection.insert_one(badge)
            
            return badge
            
        except Exception as e:
            logger.error(f"Failed to create custom badge: {e}")
            raise
    
    async def get_active_challenges(
        self,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> List[Dict[str, Any]]:
        """
        Get active challenges and competitions
        """
        try:
            challenges = [
                {
                    "id": "weekly_coder",
                    "title": "Weekly Coder Challenge",
                    "description": "Complete 5 projects this week",
                    "type": "weekly",
                    "progress": 2,
                    "target": 5,
                    "reward": "500 XP + Special Badge",
                    "ends_at": (datetime.utcnow() + timedelta(days=5)).isoformat(),
                    "participants": 124
                },
                {
                    "id": "ai_master",
                    "title": "AI Master Challenge",
                    "description": "Use AI assistance 50 times",
                    "type": "monthly",
                    "progress": 28,
                    "target": 50,
                    "reward": "1000 XP + AI Master Badge",
                    "ends_at": (datetime.utcnow() + timedelta(days=18)).isoformat(),
                    "participants": 89
                }
            ]
            
            return challenges
            
        except Exception as e:
            logger.error(f"Failed to get active challenges: {e}")
            return []
    
    async def join_challenge(
        self,
        user_id: str,
        challenge_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> bool:
        """
        Join a challenge
        """
        try:
            if not db:
                return True  # Mock success
                
            challenges_collection = db.challenge_participants
            
            # Check if already joined
            existing = await challenges_collection.find_one({
                "user_id": user_id,
                "challenge_id": challenge_id
            })
            
            if existing:
                return False  # Already joined
            
            # Join challenge
            await challenges_collection.insert_one({
                "user_id": user_id,
                "challenge_id": challenge_id,
                "joined_at": datetime.utcnow(),
                "progress": 0
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to join challenge: {e}")
            return False
    
    async def get_user_settings(
        self,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Get user's gamification preferences
        """
        try:
            if not db:
                return self._get_default_gamification_settings()
                
            settings_collection = db.gamification_settings
            settings = await settings_collection.find_one({"user_id": user_id})
            
            return settings or self._get_default_gamification_settings()
            
        except Exception as e:
            logger.error(f"Failed to get gamification settings: {e}")
            return self._get_default_gamification_settings()
    
    async def update_user_settings(
        self,
        user_id: str,
        settings: Dict[str, Any],
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Update user's gamification preferences
        """
        try:
            settings["user_id"] = user_id
            settings["updated_at"] = datetime.utcnow()
            
            if db:
                settings_collection = db.gamification_settings
                await settings_collection.replace_one(
                    {"user_id": user_id},
                    settings,
                    upsert=True
                )
            
            return settings
            
        except Exception as e:
            logger.error(f"Failed to update gamification settings: {e}")
            raise
    
    # Helper methods
    
    def _get_default_stats(self) -> UserStats:
        """Get default user stats"""
        return UserStats(
            level=1,
            xp=0,
            xp_to_next=1000,
            streak=0,
            total_projects=0,
            completed_projects=0,
            code_lines=0,
            collaborations=0,
            ai_interactions=0,
            achievements_unlocked=0,
            badges_earned=0
        )
    
    def _get_default_streak(self) -> StreakInfo:
        """Get default streak info"""
        return StreakInfo(
            current=0,
            best=0,
            is_active=False,
            multiplier=1.0,
            next_reward="Start coding to begin your streak!"
        )
    
    def _get_all_achievements(self) -> List[Dict[str, Any]]:
        """Get all available achievements"""
        return [
            {
                "id": "first-project",
                "title": "First Steps",
                "description": "Created your first AI-powered project",
                "icon": "RocketLaunchIcon",
                "category": "milestone",
                "xp": 100,
                "rarity": "common",
                "tags": ["beginner", "project"]
            },
            {
                "id": "code-master",
                "title": "Code Master",
                "description": "Written over 10,000 lines of code",
                "icon": "CodeBracketIcon",
                "category": "skill",
                "xp": 500,
                "rarity": "rare",
                "tags": ["coding", "milestone"]
            },
            {
                "id": "ai-whisperer",
                "title": "AI Whisperer",
                "description": "Had 100+ successful AI conversations",
                "icon": "SparklesIcon",
                "category": "ai",
                "xp": 300,
                "rarity": "uncommon",
                "tags": ["ai", "communication"]
            },
            {
                "id": "streak-champion",
                "title": "Streak Champion",
                "description": "Maintained a 30-day coding streak",
                "icon": "FireIcon",
                "category": "consistency",
                "xp": 1000,
                "rarity": "legendary",
                "tags": ["streak", "dedication"]
            },
            {
                "id": "collaboration-hero",
                "title": "Collaboration Hero",
                "description": "Collaborated on 10+ projects",
                "icon": "UserGroupIcon",
                "category": "social",
                "xp": 400,
                "rarity": "rare",
                "tags": ["collaboration", "teamwork"]
            }
        ]
    
    async def _get_user_progress(self, user_id: str, db: AsyncIOMotorDatabase) -> Dict[str, Dict[str, Any]]:
        """Get user's progress on locked achievements"""
        if not db:
            return {}
            
        try:
            progress_collection = db.achievement_progress
            cursor = progress_collection.find({"user_id": user_id})
            
            progress = {}
            async for doc in cursor:
                progress[doc["achievement_id"]] = {
                    "progress": doc["progress"],
                    "target": doc["target"]
                }
            
            return progress
            
        except Exception as e:
            logger.error(f"Failed to get user progress: {e}")
            return {}
    
    async def _check_achievement_criteria(
        self,
        achievement: Dict[str, Any],
        user_stats: UserStats,
        action_type: str,
        action_data: Dict[str, Any],
        user_progress: Dict[str, Dict[str, Any]]
    ) -> bool:
        """Check if achievement criteria are met"""
        achievement_id = achievement["id"]
        
        # Simple criteria checking based on achievement ID
        if achievement_id == "first-project" and action_type == "project_created":
            return True
        elif achievement_id == "code-master" and user_stats.code_lines >= 10000:
            return True
        elif achievement_id == "ai-whisperer" and user_stats.ai_interactions >= 100:
            return True
        elif achievement_id == "streak-champion" and user_stats.streak >= 30:
            return True
        elif achievement_id == "collaboration-hero" and user_stats.collaborations >= 10:
            return True
        
        return False
    
    def _calculate_streak_multiplier(self, streak: int) -> float:
        """Calculate XP multiplier based on streak"""
        if streak >= 30:
            return 3.0
        elif streak >= 14:
            return 2.0
        elif streak >= 7:
            return 1.5
        return 1.0
    
    def _get_next_streak_reward(self, current_streak: int) -> str:
        """Get description of next streak reward"""
        if current_streak < 7:
            return "XP Boost at 7 days"
        elif current_streak < 14:
            return "Double XP at 14 days"
        elif current_streak < 30:
            return "Triple XP at 30 days"
        else:
            return "Legendary Badge at 50 days"
    
    async def _award_xp_internal(
        self,
        user_id: str,
        xp_amount: int,
        reason: str,
        db: AsyncIOMotorDatabase = None,
        category: str = "general"
    ) -> Dict[str, Any]:
        """Internal XP awarding with level up logic"""
        try:
            if not db:
                return {"xp_awarded": xp_amount, "total_xp": xp_amount}
                
            stats_collection = db.user_stats
            
            # Get current stats
            current_stats = await stats_collection.find_one({"user_id": user_id})
            if not current_stats:
                current_stats = {
                    "user_id": user_id,
                    "level": 1,
                    "xp": 0,
                    "xp_to_next": 1000
                }
            
            # Calculate new XP and level
            new_xp = current_stats["xp"] + xp_amount
            new_level = self._calculate_level(new_xp)
            level_up = new_level > current_stats["level"]
            xp_to_next = self._calculate_xp_to_next_level(new_level, new_xp)
            
            # Update stats
            await stats_collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "xp": new_xp,
                        "level": new_level,
                        "xp_to_next": xp_to_next,
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            # Log XP transaction
            xp_log_collection = db.xp_transactions
            await xp_log_collection.insert_one({
                "user_id": user_id,
                "xp_amount": xp_amount,
                "reason": reason,
                "category": category,
                "timestamp": datetime.utcnow()
            })
            
            result = {
                "xp_awarded": xp_amount,
                "total_xp": new_xp,
                "level_up": level_up
            }
            
            if level_up:
                result.update({
                    "new_level": new_level,
                    "message": f"Congratulations! You've reached level {new_level}!"
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to award XP internally: {e}")
            raise
    
    def _calculate_level(self, total_xp: int) -> int:
        """Calculate level based on total XP"""
        # Simple linear progression: 1000 XP per level
        return max(1, total_xp // 1000 + 1)
    
    def _calculate_xp_to_next_level(self, current_level: int, current_xp: int) -> int:
        """Calculate XP needed for next level"""
        next_level_xp = current_level * 1000
        return max(0, next_level_xp - current_xp)
    
    async def _initialize_user_stats(self, user_id: str, db: AsyncIOMotorDatabase):
        """Initialize stats for new user"""
        try:
            stats_collection = db.user_stats
            await stats_collection.insert_one({
                "user_id": user_id,
                "level": 1,
                "xp": 0,
                "xp_to_next": 1000,
                "streak": 0,
                "total_projects": 0,
                "completed_projects": 0,
                "code_lines": 0,
                "collaborations": 0,
                "ai_interactions": 0,
                "achievements_unlocked": 0,
                "badges_earned": 0,
                "created_at": datetime.utcnow()
            })
        except Exception as e:
            logger.error(f"Failed to initialize user stats: {e}")
    
    async def _get_user_info(self, user_id: str, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Get basic user information"""
        # In real implementation, fetch from users collection
        return {
            "name": f"User {user_id[:8]}",
            "avatar": "👤"
        }
    
    async def _get_xp_history(self, user_id: str, since: datetime, db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
        """Get XP history for user"""
        if not db:
            return []
            
        try:
            xp_log_collection = db.xp_transactions
            cursor = xp_log_collection.find({
                "user_id": user_id,
                "timestamp": {"$gte": since}
            }).sort("timestamp", 1)
            
            history = await cursor.to_list(length=None)
            return [{
                "date": doc["timestamp"].isoformat(),
                "xp": doc["xp_amount"],
                "reason": doc["reason"]
            } for doc in history]
            
        except Exception as e:
            logger.error(f"Failed to get XP history: {e}")
            return []
    
    async def _get_achievement_progress(self, user_id: str, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Get achievement progress summary"""
        achievements = await self.get_user_achievements(user_id, db=db)
        
        unlocked = len([a for a in achievements if a.unlocked])
        total = len(achievements)
        
        return {
            "unlocked": unlocked,
            "total": total,
            "percentage": (unlocked / total * 100) if total > 0 else 0,
            "recent": [a.dict() for a in achievements if a.unlocked][-3:]  # Last 3 unlocked
        }
    
    async def _get_streak_history(self, user_id: str, since: datetime, db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
        """Get streak history"""
        # Mock data for now
        return [
            {"date": "2024-03-20", "streak": 5},
            {"date": "2024-03-21", "streak": 6},
            {"date": "2024-03-22", "streak": 7}
        ]
    
    async def _get_activity_breakdown(self, user_id: str, since: datetime, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Get activity breakdown by category"""
        return {
            "coding": 60,
            "collaboration": 25,
            "learning": 15
        }
    
    async def _get_user_goals(self, user_id: str, db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
        """Get user's current goals"""
        return [
            {
                "id": "weekly_projects",
                "title": "Complete 3 projects this week",
                "progress": 2,
                "target": 3,
                "deadline": (datetime.utcnow() + timedelta(days=3)).isoformat()
            }
        ]
    
    async def _generate_insights(self, user_id: str, since: datetime, db: AsyncIOMotorDatabase) -> List[str]:
        """Generate AI insights about user progress"""
        return [
            "You're 40% more active this month compared to last month!",
            "Your coding streak is in the top 20% of all users",
            "Consider collaborating more to unlock social achievements"
        ]
    
    def _get_default_gamification_settings(self) -> Dict[str, Any]:
        """Get default gamification settings"""
        return {
            "show_xp_notifications": True,
            "show_achievement_popups": True,
            "show_streak_reminders": True,
            "show_leaderboard": True,
            "privacy_mode": False,
            "challenge_notifications": True,
            "weekly_reports": True
        }