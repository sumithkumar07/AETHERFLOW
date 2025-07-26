"""
Interactive Features Service - Gamification and Social Coding
Achievement system, leaderboards, challenges, and social coding features
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
from collections import defaultdict
import random

logger = logging.getLogger(__name__)

class InteractiveFeaturesService:
    """
    Interactive features service with gamification elements,
    achievement system, leaderboards, challenges, and social coding
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Gamification configuration
        self.gamification_config = {
            'achievement_categories': [
                'coding_milestone',
                'collaboration',
                'quality',
                'innovation',
                'learning',
                'community'
            ],
            'experience_levels': [
                {'level': 1, 'name': 'Novice', 'min_xp': 0, 'max_xp': 100},
                {'level': 2, 'name': 'Apprentice', 'min_xp': 100, 'max_xp': 300},
                {'level': 3, 'name': 'Developer', 'min_xp': 300, 'max_xp': 600},
                {'level': 4, 'name': 'Expert', 'min_xp': 600, 'max_xp': 1000},
                {'level': 5, 'name': 'Master', 'min_xp': 1000, 'max_xp': 1500},
                {'level': 6, 'name': 'Guru', 'min_xp': 1500, 'max_xp': 2500},
                {'level': 7, 'name': 'Legend', 'min_xp': 2500, 'max_xp': 5000},
                {'level': 8, 'name': 'Cosmic', 'min_xp': 5000, 'max_xp': 10000}
            ],
            'badge_types': [
                'bronze', 'silver', 'gold', 'platinum', 'diamond', 'cosmic'
            ],
            'challenge_types': [
                'daily', 'weekly', 'monthly', 'special_event', 'community'
            ]
        }
        
        # Achievement definitions
        self.achievements = {
            'first_commit': {
                'id': 'first_commit',
                'name': 'First Steps',
                'description': 'Made your first commit',
                'category': 'coding_milestone',
                'badge': 'bronze',
                'xp_reward': 50,
                'vibe_tokens': 100,
                'rarity': 'common'
            },
            'century_commits': {
                'id': 'century_commits',
                'name': 'Century Maker',
                'description': 'Made 100 commits',
                'category': 'coding_milestone',
                'badge': 'gold',
                'xp_reward': 500,
                'vibe_tokens': 1000,
                'rarity': 'rare'
            },
            'collaboration_master': {
                'id': 'collaboration_master',
                'name': 'Collaboration Master',
                'description': 'Participated in 50 collaboration sessions',
                'category': 'collaboration',
                'badge': 'platinum',
                'xp_reward': 750,
                'vibe_tokens': 1500,
                'rarity': 'epic'
            },
            'quality_champion': {
                'id': 'quality_champion',
                'name': 'Quality Champion',
                'description': 'Maintained 95% code quality score for 30 days',
                'category': 'quality',
                'badge': 'diamond',
                'xp_reward': 1000,
                'vibe_tokens': 2000,
                'rarity': 'legendary'
            },
            'innovation_pioneer': {
                'id': 'innovation_pioneer',
                'name': 'Innovation Pioneer',
                'description': 'Created 10 unique projects',
                'category': 'innovation',
                'badge': 'cosmic',
                'xp_reward': 2000,
                'vibe_tokens': 5000,
                'rarity': 'cosmic'
            }
        }
        
        # Challenge templates
        self.challenge_templates = {
            'daily_coder': {
                'id': 'daily_coder',
                'name': 'Daily Coder',
                'description': 'Write code for 7 consecutive days',
                'type': 'daily',
                'duration_days': 7,
                'target_value': 7,
                'reward_xp': 200,
                'reward_tokens': 500,
                'difficulty': 'easy'
            },
            'collaboration_streak': {
                'id': 'collaboration_streak',
                'name': 'Collaboration Streak',
                'description': 'Collaborate with team members for 5 days',
                'type': 'weekly',
                'duration_days': 7,
                'target_value': 5,
                'reward_xp': 400,
                'reward_tokens': 800,
                'difficulty': 'medium'
            },
            'quality_focus': {
                'id': 'quality_focus',
                'name': 'Quality Focus',
                'description': 'Maintain 90% code quality for a month',
                'type': 'monthly',
                'duration_days': 30,
                'target_value': 90,
                'reward_xp': 1000,
                'reward_tokens': 2000,
                'difficulty': 'hard'
            }
        }
        
        # Social features
        self.social_features = {
            'following_enabled': True,
            'public_profiles': True,
            'activity_feed': True,
            'code_sharing': True,
            'community_challenges': True,
            'mentorship_program': True
        }
        
        # Leaderboard categories
        self.leaderboard_categories = [
            'overall_xp',
            'monthly_commits',
            'collaboration_score',
            'code_quality',
            'innovation_points',
            'community_contributions',
            'vibe_tokens'
        ]
        
        logger.info("🎮 Interactive Features Service initialized")

    async def award_achievement(self, user_id: str, achievement_id: str, context: Dict = None) -> Dict[str, Any]:
        """Award achievement to user"""
        try:
            # Check if achievement exists
            if achievement_id not in self.achievements:
                return {
                    'success': False,
                    'error': f'Achievement {achievement_id} not found'
                }
            
            # Check if user already has this achievement
            existing_achievement = await self.db.user_achievements.find_one({
                'user_id': user_id,
                'achievement_id': achievement_id
            })
            
            if existing_achievement:
                return {
                    'success': False,
                    'error': 'Achievement already earned'
                }
            
            achievement = self.achievements[achievement_id]
            
            # Award achievement
            achievement_record = {
                'user_achievement_id': str(uuid.uuid4()),
                'user_id': user_id,
                'achievement_id': achievement_id,
                'achievement_data': achievement,
                'earned_at': datetime.utcnow(),
                'context': context or {},
                'shared': False
            }
            
            await self.db.user_achievements.insert_one(achievement_record)
            
            # Award XP and VIBE tokens
            await self._award_xp(user_id, achievement['xp_reward'])
            await self._award_vibe_tokens(user_id, achievement['vibe_tokens'])
            
            # Update user level
            await self._update_user_level(user_id)
            
            # Create notification
            await self._create_achievement_notification(user_id, achievement)
            
            return {
                'success': True,
                'achievement_id': achievement_id,
                'achievement': achievement,
                'xp_awarded': achievement['xp_reward'],
                'tokens_awarded': achievement['vibe_tokens'],
                'message': f'Achievement "{achievement["name"]}" earned!'
            }
            
        except Exception as e:
            logger.error(f"Award achievement failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def check_achievement_progress(self, user_id: str, activity_type: str, activity_data: Dict) -> Dict[str, Any]:
        """Check if user should earn any achievements based on activity"""
        try:
            earned_achievements = []
            
            # Get user stats
            user_stats = await self.db.user_stats.find_one({'user_id': user_id})
            if not user_stats:
                user_stats = {'user_id': user_id}
            
            # Check each achievement
            for achievement_id, achievement in self.achievements.items():
                if await self._should_award_achievement(user_id, achievement_id, activity_type, activity_data, user_stats):
                    result = await self.award_achievement(user_id, achievement_id, {
                        'trigger_activity': activity_type,
                        'activity_data': activity_data
                    })
                    
                    if result['success']:
                        earned_achievements.append(result)
            
            return {
                'success': True,
                'earned_achievements': earned_achievements,
                'total_earned': len(earned_achievements)
            }
            
        except Exception as e:
            logger.error(f"Check achievement progress failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def create_challenge(self, user_id: str, challenge_template_id: str, custom_params: Dict = None) -> Dict[str, Any]:
        """Create a new challenge for user"""
        try:
            if challenge_template_id not in self.challenge_templates:
                return {
                    'success': False,
                    'error': f'Challenge template {challenge_template_id} not found'
                }
            
            template = self.challenge_templates[challenge_template_id]
            
            # Create challenge
            challenge = {
                'challenge_id': str(uuid.uuid4()),
                'user_id': user_id,
                'template_id': challenge_template_id,
                'name': template['name'],
                'description': template['description'],
                'type': template['type'],
                'difficulty': template['difficulty'],
                'target_value': custom_params.get('target_value', template['target_value']),
                'current_value': 0,
                'start_date': datetime.utcnow(),
                'end_date': datetime.utcnow() + timedelta(days=template['duration_days']),
                'status': 'active',
                'reward_xp': template['reward_xp'],
                'reward_tokens': template['reward_tokens'],
                'progress_percentage': 0,
                'created_at': datetime.utcnow()
            }
            
            await self.db.user_challenges.insert_one(challenge)
            
            return {
                'success': True,
                'challenge_id': challenge['challenge_id'],
                'challenge': challenge,
                'message': f'Challenge "{challenge["name"]}" created!'
            }
            
        except Exception as e:
            logger.error(f"Create challenge failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def update_challenge_progress(self, user_id: str, activity_type: str, activity_data: Dict) -> Dict[str, Any]:
        """Update challenge progress based on user activity"""
        try:
            # Get active challenges
            active_challenges = await self.db.user_challenges.find({
                'user_id': user_id,
                'status': 'active',
                'end_date': {'$gt': datetime.utcnow()}
            }).to_list(None)
            
            updated_challenges = []
            
            for challenge in active_challenges:
                # Check if activity contributes to this challenge
                progress_update = await self._calculate_challenge_progress(challenge, activity_type, activity_data)
                
                if progress_update['contributes']:
                    new_value = challenge['current_value'] + progress_update['increment']
                    progress_percentage = min(100, (new_value / challenge['target_value']) * 100)
                    
                    # Update challenge
                    await self.db.user_challenges.update_one(
                        {'challenge_id': challenge['challenge_id']},
                        {
                            '$set': {
                                'current_value': new_value,
                                'progress_percentage': progress_percentage,
                                'updated_at': datetime.utcnow()
                            }
                        }
                    )
                    
                    challenge['current_value'] = new_value
                    challenge['progress_percentage'] = progress_percentage
                    
                    # Check if challenge is completed
                    if new_value >= challenge['target_value']:
                        await self._complete_challenge(challenge)
                    
                    updated_challenges.append(challenge)
            
            return {
                'success': True,
                'updated_challenges': updated_challenges,
                'total_updated': len(updated_challenges)
            }
            
        except Exception as e:
            logger.error(f"Update challenge progress failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_user_profile(self, user_id: str, viewer_id: str = None) -> Dict[str, Any]:
        """Get user's gamified profile"""
        try:
            # Get user basic info
            user = await self.db.users.find_one({'user_id': user_id})
            if not user:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Get user level and XP
            user_level = await self._get_user_level(user_id)
            
            # Get achievements
            achievements = await self.db.user_achievements.find({
                'user_id': user_id
            }).sort('earned_at', -1).to_list(None)
            
            # Get recent activity
            recent_activity = await self.db.user_activities.find({
                'user_id': user_id
            }).sort('timestamp', -1).limit(10).to_list(None)
            
            # Get statistics
            stats = await self._calculate_user_stats(user_id)
            
            # Get active challenges
            active_challenges = await self.db.user_challenges.find({
                'user_id': user_id,
                'status': 'active'
            }).to_list(None)
            
            # Get social info
            social_info = await self._get_social_info(user_id, viewer_id)
            
            profile = {
                'user_id': user_id,
                'username': user.get('username', ''),
                'full_name': user.get('full_name', ''),
                'avatar_url': user.get('avatar_url', ''),
                'level': user_level,
                'achievements': achievements,
                'recent_activity': recent_activity,
                'stats': stats,
                'active_challenges': active_challenges,
                'social_info': social_info,
                'badges': await self._get_user_badges(user_id),
                'rank': await self._get_user_rank(user_id),
                'created_at': user.get('created_at'),
                'is_public': user.get('profile', {}).get('public', True)
            }
            
            return {
                'success': True,
                'profile': profile
            }
            
        except Exception as e:
            logger.error(f"Get user profile failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_leaderboard(self, category: str = 'overall_xp', time_range: str = 'all_time', limit: int = 100) -> Dict[str, Any]:
        """Get leaderboard for specified category"""
        try:
            if category not in self.leaderboard_categories:
                return {
                    'success': False,
                    'error': f'Invalid leaderboard category: {category}',
                    'available_categories': self.leaderboard_categories
                }
            
            # Calculate time range
            if time_range == 'daily':
                start_date = datetime.utcnow() - timedelta(days=1)
            elif time_range == 'weekly':
                start_date = datetime.utcnow() - timedelta(days=7)
            elif time_range == 'monthly':
                start_date = datetime.utcnow() - timedelta(days=30)
            else:
                start_date = datetime.min
            
            # Get leaderboard data
            leaderboard_data = await self._calculate_leaderboard_data(category, start_date, limit)
            
            return {
                'success': True,
                'category': category,
                'time_range': time_range,
                'leaderboard': leaderboard_data,
                'total_entries': len(leaderboard_data),
                'updated_at': datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Get leaderboard failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def follow_user(self, follower_id: str, following_id: str) -> Dict[str, Any]:
        """Follow another user"""
        try:
            if follower_id == following_id:
                return {
                    'success': False,
                    'error': 'Cannot follow yourself'
                }
            
            # Check if already following
            existing_follow = await self.db.user_follows.find_one({
                'follower_id': follower_id,
                'following_id': following_id
            })
            
            if existing_follow:
                return {
                    'success': False,
                    'error': 'Already following this user'
                }
            
            # Create follow relationship
            follow_record = {
                'follow_id': str(uuid.uuid4()),
                'follower_id': follower_id,
                'following_id': following_id,
                'created_at': datetime.utcnow()
            }
            
            await self.db.user_follows.insert_one(follow_record)
            
            # Update follower/following counts
            await self._update_follow_counts(follower_id, following_id)
            
            return {
                'success': True,
                'follow_id': follow_record['follow_id'],
                'message': 'User followed successfully'
            }
            
        except Exception as e:
            logger.error(f"Follow user failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_activity_feed(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get activity feed for user"""
        try:
            # Get users that the user follows
            following = await self.db.user_follows.find({
                'follower_id': user_id
            }).to_list(None)
            
            following_ids = [f['following_id'] for f in following]
            following_ids.append(user_id)  # Include own activities
            
            # Get activities from followed users
            activities = await self.db.user_activities.find({
                'user_id': {'$in': following_ids},
                'activity_type': {'$in': ['project_create', 'achievement_earned', 'challenge_completed', 'code_share']}
            }).sort('timestamp', -1).limit(limit).to_list(None)
            
            # Enhance activities with user info
            enhanced_activities = []
            for activity in activities:
                user = await self.db.users.find_one({'user_id': activity['user_id']})
                
                enhanced_activity = {
                    'activity_id': activity.get('activity_id'),
                    'user_id': activity['user_id'],
                    'username': user.get('username', '') if user else '',
                    'avatar_url': user.get('avatar_url', '') if user else '',
                    'activity_type': activity['activity_type'],
                    'activity_data': activity['activity_data'],
                    'timestamp': activity['timestamp'],
                    'formatted_message': self._format_activity_message(activity)
                }
                
                enhanced_activities.append(enhanced_activity)
            
            return {
                'success': True,
                'activities': enhanced_activities,
                'total_activities': len(enhanced_activities)
            }
            
        except Exception as e:
            logger.error(f"Get activity feed failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def share_code(self, user_id: str, code_data: Dict) -> Dict[str, Any]:
        """Share code snippet with community"""
        try:
            code_share = {
                'share_id': str(uuid.uuid4()),
                'user_id': user_id,
                'title': code_data.get('title', 'Code Share'),
                'description': code_data.get('description', ''),
                'code': code_data.get('code', ''),
                'language': code_data.get('language', 'javascript'),
                'tags': code_data.get('tags', []),
                'visibility': code_data.get('visibility', 'public'),
                'likes': 0,
                'comments': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            await self.db.code_shares.insert_one(code_share)
            
            # Create activity
            await self.db.user_activities.insert_one({
                'activity_id': str(uuid.uuid4()),
                'user_id': user_id,
                'activity_type': 'code_share',
                'activity_data': {
                    'share_id': code_share['share_id'],
                    'title': code_share['title'],
                    'language': code_share['language']
                },
                'timestamp': datetime.utcnow()
            })
            
            return {
                'success': True,
                'share_id': code_share['share_id'],
                'code_share': code_share,
                'message': 'Code shared successfully'
            }
            
        except Exception as e:
            logger.error(f"Share code failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_community_feed(self, limit: int = 50, language: str = None) -> Dict[str, Any]:
        """Get community feed of shared code and activities"""
        try:
            # Build query
            query = {'visibility': 'public'}
            if language:
                query['language'] = language
            
            # Get code shares
            code_shares = await self.db.code_shares.find(query).sort('created_at', -1).limit(limit).to_list(None)
            
            # Enhance with user info
            enhanced_shares = []
            for share in code_shares:
                user = await self.db.users.find_one({'user_id': share['user_id']})
                
                enhanced_share = {
                    **share,
                    'username': user.get('username', '') if user else '',
                    'avatar_url': user.get('avatar_url', '') if user else ''
                }
                
                enhanced_shares.append(enhanced_share)
            
            return {
                'success': True,
                'community_feed': enhanced_shares,
                'total_shares': len(enhanced_shares)
            }
            
        except Exception as e:
            logger.error(f"Get community feed failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _award_xp(self, user_id: str, xp_amount: int):
        """Award XP to user"""
        try:
            await self.db.users.update_one(
                {'user_id': user_id},
                {
                    '$inc': {'stats.experience_points': xp_amount},
                    '$set': {'stats.last_xp_update': datetime.utcnow()}
                }
            )
        except Exception as e:
            logger.error(f"Award XP failed: {e}")

    async def _award_vibe_tokens(self, user_id: str, token_amount: int):
        """Award VIBE tokens to user"""
        try:
            await self.db.users.update_one(
                {'user_id': user_id},
                {
                    '$inc': {'stats.vibe_tokens': token_amount},
                    '$set': {'stats.last_token_update': datetime.utcnow()}
                }
            )
        except Exception as e:
            logger.error(f"Award VIBE tokens failed: {e}")

    async def _update_user_level(self, user_id: str):
        """Update user level based on XP"""
        try:
            user = await self.db.users.find_one({'user_id': user_id})
            if not user:
                return
            
            current_xp = user.get('stats', {}).get('experience_points', 0)
            
            # Find appropriate level
            new_level = None
            for level_info in self.gamification_config['experience_levels']:
                if current_xp >= level_info['min_xp'] and current_xp < level_info['max_xp']:
                    new_level = level_info
                    break
            
            if new_level:
                await self.db.users.update_one(
                    {'user_id': user_id},
                    {'$set': {'stats.level': new_level['level'], 'stats.level_name': new_level['name']}}
                )
        except Exception as e:
            logger.error(f"Update user level failed: {e}")

    async def _create_achievement_notification(self, user_id: str, achievement: Dict):
        """Create notification for achievement"""
        try:
            notification = {
                'notification_id': str(uuid.uuid4()),
                'user_id': user_id,
                'type': 'achievement_earned',
                'title': f'Achievement Unlocked: {achievement["name"]}',
                'message': achievement['description'],
                'data': achievement,
                'read': False,
                'created_at': datetime.utcnow()
            }
            
            await self.db.user_notifications.insert_one(notification)
        except Exception as e:
            logger.error(f"Create achievement notification failed: {e}")

    async def _should_award_achievement(self, user_id: str, achievement_id: str, activity_type: str, activity_data: Dict, user_stats: Dict) -> bool:
        """Check if achievement should be awarded"""
        try:
            # Check if user already has this achievement
            existing = await self.db.user_achievements.find_one({
                'user_id': user_id,
                'achievement_id': achievement_id
            })
            
            if existing:
                return False
            
            # Check specific achievement conditions
            if achievement_id == 'first_commit' and activity_type == 'commit':
                return True
            
            elif achievement_id == 'century_commits':
                commit_count = user_stats.get('commits_count', 0)
                return commit_count >= 100
            
            elif achievement_id == 'collaboration_master':
                collab_count = user_stats.get('collaboration_sessions', 0)
                return collab_count >= 50
            
            elif achievement_id == 'quality_champion':
                quality_score = user_stats.get('average_quality_score', 0)
                return quality_score >= 0.95
            
            elif achievement_id == 'innovation_pioneer':
                project_count = user_stats.get('projects_created', 0)
                return project_count >= 10
            
            return False
            
        except Exception as e:
            logger.error(f"Should award achievement check failed: {e}")
            return False

    async def _calculate_challenge_progress(self, challenge: Dict, activity_type: str, activity_data: Dict) -> Dict[str, Any]:
        """Calculate challenge progress based on activity"""
        try:
            template_id = challenge['template_id']
            
            if template_id == 'daily_coder':
                # Check if user coded today
                if activity_type in ['code_edit', 'commit', 'file_create']:
                    return {'contributes': True, 'increment': 1}
            
            elif template_id == 'collaboration_streak':
                # Check if user collaborated today
                if activity_type == 'collaboration_start':
                    return {'contributes': True, 'increment': 1}
            
            elif template_id == 'quality_focus':
                # Check code quality
                if activity_type == 'code_review':
                    quality_score = activity_data.get('quality_score', 0)
                    if quality_score >= 0.9:
                        return {'contributes': True, 'increment': 1}
            
            return {'contributes': False, 'increment': 0}
            
        except Exception as e:
            logger.error(f"Calculate challenge progress failed: {e}")
            return {'contributes': False, 'increment': 0}

    async def _complete_challenge(self, challenge: Dict):
        """Complete a challenge and award rewards"""
        try:
            # Update challenge status
            await self.db.user_challenges.update_one(
                {'challenge_id': challenge['challenge_id']},
                {
                    '$set': {
                        'status': 'completed',
                        'completed_at': datetime.utcnow()
                    }
                }
            )
            
            # Award rewards
            await self._award_xp(challenge['user_id'], challenge['reward_xp'])
            await self._award_vibe_tokens(challenge['user_id'], challenge['reward_tokens'])
            
            # Create activity
            await self.db.user_activities.insert_one({
                'activity_id': str(uuid.uuid4()),
                'user_id': challenge['user_id'],
                'activity_type': 'challenge_completed',
                'activity_data': {
                    'challenge_id': challenge['challenge_id'],
                    'challenge_name': challenge['name'],
                    'reward_xp': challenge['reward_xp'],
                    'reward_tokens': challenge['reward_tokens']
                },
                'timestamp': datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Complete challenge failed: {e}")

    async def _get_user_level(self, user_id: str) -> Dict[str, Any]:
        """Get user level information"""
        try:
            user = await self.db.users.find_one({'user_id': user_id})
            if not user:
                return {'level': 1, 'name': 'Novice', 'xp': 0, 'next_level_xp': 100}
            
            current_xp = user.get('stats', {}).get('experience_points', 0)
            current_level = user.get('stats', {}).get('level', 1)
            
            # Find next level
            next_level = None
            for level_info in self.gamification_config['experience_levels']:
                if level_info['level'] > current_level:
                    next_level = level_info
                    break
            
            return {
                'level': current_level,
                'name': user.get('stats', {}).get('level_name', 'Novice'),
                'xp': current_xp,
                'next_level_xp': next_level['min_xp'] if next_level else current_xp
            }
            
        except Exception as e:
            logger.error(f"Get user level failed: {e}")
            return {'level': 1, 'name': 'Novice', 'xp': 0, 'next_level_xp': 100}

    async def _calculate_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Calculate comprehensive user statistics"""
        try:
            # Get user stats from database
            user_stats = await self.db.user_stats.find_one({'user_id': user_id})
            
            if not user_stats:
                # Create default stats
                user_stats = {
                    'user_id': user_id,
                    'commits_count': 0,
                    'projects_created': 0,
                    'collaboration_sessions': 0,
                    'lines_of_code': 0,
                    'average_quality_score': 0.0,
                    'achievements_earned': 0,
                    'challenges_completed': 0,
                    'streak_days': 0,
                    'total_xp': 0,
                    'vibe_tokens': 1000
                }
            
            # Get real-time calculations
            achievements_count = await self.db.user_achievements.count_documents({'user_id': user_id})
            challenges_completed = await self.db.user_challenges.count_documents({
                'user_id': user_id,
                'status': 'completed'
            })
            
            user_stats['achievements_earned'] = achievements_count
            user_stats['challenges_completed'] = challenges_completed
            
            return user_stats
            
        except Exception as e:
            logger.error(f"Calculate user stats failed: {e}")
            return {}

    async def _get_social_info(self, user_id: str, viewer_id: str = None) -> Dict[str, Any]:
        """Get social information for user"""
        try:
            # Get follower/following counts
            followers_count = await self.db.user_follows.count_documents({'following_id': user_id})
            following_count = await self.db.user_follows.count_documents({'follower_id': user_id})
            
            social_info = {
                'followers_count': followers_count,
                'following_count': following_count,
                'is_following': False,
                'is_follower': False
            }
            
            # Check relationship with viewer
            if viewer_id and viewer_id != user_id:
                is_following = await self.db.user_follows.find_one({
                    'follower_id': viewer_id,
                    'following_id': user_id
                })
                
                is_follower = await self.db.user_follows.find_one({
                    'follower_id': user_id,
                    'following_id': viewer_id
                })
                
                social_info['is_following'] = bool(is_following)
                social_info['is_follower'] = bool(is_follower)
            
            return social_info
            
        except Exception as e:
            logger.error(f"Get social info failed: {e}")
            return {}

    async def _get_user_badges(self, user_id: str) -> List[Dict]:
        """Get user badges"""
        try:
            achievements = await self.db.user_achievements.find({'user_id': user_id}).to_list(None)
            
            badges = []
            for achievement in achievements:
                badge = {
                    'badge_id': achievement['achievement_id'],
                    'name': achievement['achievement_data']['name'],
                    'type': achievement['achievement_data']['badge'],
                    'rarity': achievement['achievement_data']['rarity'],
                    'earned_at': achievement['earned_at']
                }
                badges.append(badge)
            
            return badges
            
        except Exception as e:
            logger.error(f"Get user badges failed: {e}")
            return []

    async def _get_user_rank(self, user_id: str) -> Dict[str, Any]:
        """Get user rank in leaderboard"""
        try:
            # Get user's XP
            user = await self.db.users.find_one({'user_id': user_id})
            if not user:
                return {'rank': 0, 'total_users': 0}
            
            user_xp = user.get('stats', {}).get('experience_points', 0)
            
            # Count users with higher XP
            higher_rank_count = await self.db.users.count_documents({
                'stats.experience_points': {'$gt': user_xp}
            })
            
            # Total users
            total_users = await self.db.users.count_documents({})
            
            return {
                'rank': higher_rank_count + 1,
                'total_users': total_users,
                'percentile': ((total_users - higher_rank_count) / total_users * 100) if total_users > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Get user rank failed: {e}")
            return {'rank': 0, 'total_users': 0}

    async def _calculate_leaderboard_data(self, category: str, start_date: datetime, limit: int) -> List[Dict]:
        """Calculate leaderboard data"""
        try:
            # Build aggregation pipeline based on category
            if category == 'overall_xp':
                pipeline = [
                    {'$match': {'stats.experience_points': {'$exists': True}}},
                    {'$sort': {'stats.experience_points': -1}},
                    {'$limit': limit}
                ]
            elif category == 'vibe_tokens':
                pipeline = [
                    {'$match': {'stats.vibe_tokens': {'$exists': True}}},
                    {'$sort': {'stats.vibe_tokens': -1}},
                    {'$limit': limit}
                ]
            else:
                # Default to XP
                pipeline = [
                    {'$match': {'stats.experience_points': {'$exists': True}}},
                    {'$sort': {'stats.experience_points': -1}},
                    {'$limit': limit}
                ]
            
            # Execute aggregation
            users = await self.db.users.aggregate(pipeline).to_list(None)
            
            # Format leaderboard
            leaderboard = []
            for i, user in enumerate(users, 1):
                entry = {
                    'rank': i,
                    'user_id': user['user_id'],
                    'username': user.get('username', ''),
                    'avatar_url': user.get('avatar_url', ''),
                    'level': user.get('stats', {}).get('level', 1),
                    'score': user.get('stats', {}).get('experience_points', 0) if category == 'overall_xp' else user.get('stats', {}).get('vibe_tokens', 0)
                }
                leaderboard.append(entry)
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Calculate leaderboard data failed: {e}")
            return []

    async def _update_follow_counts(self, follower_id: str, following_id: str):
        """Update follower/following counts"""
        try:
            # Update follower count for following user
            await self.db.users.update_one(
                {'user_id': following_id},
                {'$inc': {'stats.followers_count': 1}}
            )
            
            # Update following count for follower user
            await self.db.users.update_one(
                {'user_id': follower_id},
                {'$inc': {'stats.following_count': 1}}
            )
            
        except Exception as e:
            logger.error(f"Update follow counts failed: {e}")

    def _format_activity_message(self, activity: Dict) -> str:
        """Format activity message for feed"""
        activity_type = activity['activity_type']
        activity_data = activity['activity_data']
        
        if activity_type == 'project_create':
            return f"created a new project: {activity_data.get('project_name', 'Unknown')}"
        elif activity_type == 'achievement_earned':
            return f"earned achievement: {activity_data.get('achievement_name', 'Unknown')}"
        elif activity_type == 'challenge_completed':
            return f"completed challenge: {activity_data.get('challenge_name', 'Unknown')}"
        elif activity_type == 'code_share':
            return f"shared code: {activity_data.get('title', 'Code snippet')}"
        else:
            return f"performed activity: {activity_type}"

# Global service instance
_interactive_features_service = None

def init_interactive_features_service(db_manager):
    """Initialize Interactive Features Service"""
    global _interactive_features_service
    _interactive_features_service = InteractiveFeaturesService(db_manager)
    logger.info("🎮 Interactive Features Service initialized!")

def get_interactive_features_service() -> Optional[InteractiveFeaturesService]:
    """Get Interactive Features Service instance"""
    return _interactive_features_service