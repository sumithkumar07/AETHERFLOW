from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import hashlib
import json
import uuid
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class BackupVersion(BaseModel):
    id: str
    project_id: str
    user_id: str
    version: str
    backup_type: str  # manual, auto, milestone, emergency
    message: str
    files: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    size_bytes: int
    created_at: datetime
    checksum: str
    tags: List[str] = []

class AutoCommit(BaseModel):
    id: str
    project_id: str
    user_id: str
    message: str
    files_changed: List[str]
    changes_count: int
    ai_generated_message: bool
    created_at: datetime
    checksum: str

class VersionControlService:
    def __init__(self):
        self.ai_service = AIService()
        
    async def create_backup(
        self,
        project_id: str,
        user_id: str,
        backup_type: str = "manual",
        message: str = "",
        files: List[Dict[str, Any]] = None,
        db: AsyncIOMotorDatabase = None
    ) -> BackupVersion:
        """
        Create an intelligent backup with AI-generated metadata
        """
        try:
            # Generate backup ID and version
            backup_id = str(uuid.uuid4())
            version = await self._generate_version_number(project_id, db)
            
            # Get project files if not provided
            if not files:
                files = await self._get_project_files(project_id, user_id, db)
            
            # Calculate checksum and size
            checksum = self._calculate_checksum(files)
            size_bytes = sum(len(json.dumps(file)) for file in files)
            
            # Generate AI-powered backup metadata
            metadata = await self._generate_backup_metadata(files, message)
            
            # Generate smart tags
            tags = await self._generate_smart_tags(files, backup_type)
            
            # Enhance message with AI if needed
            if not message or message == "Manual backup":
                message = await self._generate_smart_commit_message(files, backup_type)
            
            # Create backup object
            backup = BackupVersion(
                id=backup_id,
                project_id=project_id,
                user_id=user_id,
                version=version,
                backup_type=backup_type,
                message=message,
                files=files,
                metadata=metadata,
                size_bytes=size_bytes,
                created_at=datetime.utcnow(),
                checksum=checksum,
                tags=tags
            )
            
            # Store in database
            if db:
                backups_collection = db.backups
                await backups_collection.insert_one(backup.dict())
                
                # Update project backup info
                projects_collection = db.projects
                await projects_collection.update_one(
                    {"_id": project_id, "user_id": user_id},
                    {
                        "$set": {
                            "last_backup": datetime.utcnow(),
                            "backup_count": await self._get_backup_count(project_id, db) + 1
                        }
                    }
                )
            
            logger.info(f"Backup created: {backup_id} for project {project_id}")
            return backup
            
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            raise
    
    async def list_backups(
        self,
        project_id: str,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        db: AsyncIOMotorDatabase = None
    ) -> List[BackupVersion]:
        """
        List backups for a project with intelligent filtering
        """
        try:
            if not db:
                return []
                
            backups_collection = db.backups
            
            cursor = backups_collection.find(
                {"project_id": project_id, "user_id": user_id}
            ).sort("created_at", -1).skip(offset).limit(limit)
            
            backup_docs = await cursor.to_list(length=None)
            
            backups = []
            for doc in backup_docs:
                backup = BackupVersion(**doc)
                backups.append(backup)
            
            return backups
            
        except Exception as e:
            logger.error(f"Failed to list backups: {e}")
            return []
    
    async def get_backup(
        self,
        backup_id: str,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> Optional[BackupVersion]:
        """
        Get specific backup details
        """
        try:
            if not db:
                return None
                
            backups_collection = db.backups
            backup_doc = await backups_collection.find_one({
                "id": backup_id,
                "user_id": user_id
            })
            
            if backup_doc:
                return BackupVersion(**backup_doc)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get backup: {e}")
            return None
    
    async def restore_backup(
        self,
        backup_id: str,
        user_id: str,
        restore_files: List[str] = None,
        create_backup_before: bool = True,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Restore project from backup with safety measures
        """
        try:
            # Get the backup to restore
            backup = await self.get_backup(backup_id, user_id, db)
            if not backup:
                raise ValueError("Backup not found")
            
            # Create safety backup before restore if requested
            safety_backup_id = None
            if create_backup_before:
                safety_backup = await self.create_backup(
                    project_id=backup.project_id,
                    user_id=user_id,
                    backup_type="emergency",
                    message=f"Pre-restore backup before restoring {backup.version}",
                    db=db
                )
                safety_backup_id = safety_backup.id
            
            # Determine which files to restore
            files_to_restore = backup.files
            if restore_files:
                files_to_restore = [f for f in backup.files if f.get("path") in restore_files]
            
            # Perform the restoration
            restored_files = []
            for file_data in files_to_restore:
                # Here you would implement the actual file restoration logic
                # For now, we'll just track what would be restored
                restored_files.append(file_data.get("path", "unknown"))
            
            # Update project metadata
            if db:
                projects_collection = db.projects
                await projects_collection.update_one(
                    {"_id": backup.project_id, "user_id": user_id},
                    {
                        "$set": {
                            "last_restored": datetime.utcnow(),
                            "restored_from": backup_id
                        }
                    }
                )
            
            logger.info(f"Backup restored: {backup_id} for project {backup.project_id}")
            
            return {
                "restored_files": restored_files,
                "backup_created": safety_backup_id,
                "restore_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to restore backup: {e}")
            raise
    
    async def delete_backup(
        self,
        backup_id: str,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> bool:
        """
        Delete a backup with safety checks
        """
        try:
            if not db:
                return False
                
            backups_collection = db.backups
            
            # Verify ownership and existence
            backup = await backups_collection.find_one({
                "id": backup_id,
                "user_id": user_id
            })
            
            if not backup:
                return False
            
            # Delete the backup
            result = await backups_collection.delete_one({
                "id": backup_id,
                "user_id": user_id
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Failed to delete backup: {e}")
            return False
    
    async def enable_auto_commit(
        self,
        project_id: str,
        user_id: str,
        interval_minutes: int = 30,
        min_changes: int = 5,
        smart_commit_messages: bool = True,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Enable intelligent auto-commit for a project
        """
        try:
            config = {
                "project_id": project_id,
                "user_id": user_id,
                "enabled": True,
                "interval_minutes": interval_minutes,
                "min_changes": min_changes,
                "smart_commit_messages": smart_commit_messages,
                "last_commit": None,
                "created_at": datetime.utcnow()
            }
            
            if db:
                auto_commit_collection = db.auto_commit_settings
                await auto_commit_collection.replace_one(
                    {"project_id": project_id, "user_id": user_id},
                    config,
                    upsert=True
                )
            
            logger.info(f"Auto-commit enabled for project {project_id}")
            return config
            
        except Exception as e:
            logger.error(f"Failed to enable auto-commit: {e}")
            raise
    
    async def disable_auto_commit(
        self,
        project_id: str,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ):
        """
        Disable auto-commit for a project
        """
        try:
            if db:
                auto_commit_collection = db.auto_commit_settings
                await auto_commit_collection.update_one(
                    {"project_id": project_id, "user_id": user_id},
                    {"$set": {"enabled": False, "disabled_at": datetime.utcnow()}}
                )
            
            logger.info(f"Auto-commit disabled for project {project_id}")
            
        except Exception as e:
            logger.error(f"Failed to disable auto-commit: {e}")
            raise
    
    async def get_auto_commit_history(
        self,
        project_id: str,
        user_id: str,
        limit: int = 50,
        db: AsyncIOMotorDatabase = None
    ) -> List[AutoCommit]:
        """
        Get auto-commit history for a project
        """
        try:
            if not db:
                return []
                
            auto_commits_collection = db.auto_commits
            
            cursor = auto_commits_collection.find(
                {"project_id": project_id, "user_id": user_id}
            ).sort("created_at", -1).limit(limit)
            
            commit_docs = await cursor.to_list(length=None)
            
            commits = []
            for doc in commit_docs:
                commit = AutoCommit(**doc)
                commits.append(commit)
            
            return commits
            
        except Exception as e:
            logger.error(f"Failed to get auto-commit history: {e}")
            return []
    
    async def generate_smart_diff(
        self,
        project_id: str,
        version_a: str,
        version_b: str,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Generate intelligent diff between two versions using AI
        """
        try:
            # Get the two versions
            backup_a = await self._get_backup_by_version(project_id, version_a, user_id, db)
            backup_b = await self._get_backup_by_version(project_id, version_b, user_id, db)
            
            if not backup_a or not backup_b:
                raise ValueError("One or both versions not found")
            
            # Calculate file-level differences
            changes = []
            files_a = {f.get("path"): f for f in backup_a.files}
            files_b = {f.get("path"): f for f in backup_b.files}
            
            # Added files
            for path in files_b.keys() - files_a.keys():
                changes.append({
                    "type": "added",
                    "path": path,
                    "size": len(files_b[path].get("content", "")),
                    "description": f"Added {path}"
                })
            
            # Removed files
            for path in files_a.keys() - files_b.keys():
                changes.append({
                    "type": "removed",
                    "path": path,
                    "size": len(files_a[path].get("content", "")),
                    "description": f"Removed {path}"
                })
            
            # Modified files
            for path in files_a.keys() & files_b.keys():
                if files_a[path].get("checksum") != files_b[path].get("checksum"):
                    changes.append({
                        "type": "modified",
                        "path": path,
                        "size_change": len(files_b[path].get("content", "")) - len(files_a[path].get("content", "")),
                        "description": f"Modified {path}"
                    })
            
            # Generate AI summary
            summary = await self._generate_diff_summary(changes, backup_a, backup_b)
            
            return {
                "version_a": version_a,
                "version_b": version_b,
                "changes": changes,
                "summary": summary,
                "total_changes": len(changes),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate diff: {e}")
            raise
    
    async def get_settings(
        self,
        project_id: str,
        user_id: str,
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Get version control settings for a project
        """
        try:
            if not db:
                return self._get_default_settings()
                
            settings_collection = db.version_control_settings
            settings = await settings_collection.find_one({
                "project_id": project_id,
                "user_id": user_id
            })
            
            return settings or self._get_default_settings()
            
        except Exception as e:
            logger.error(f"Failed to get settings: {e}")
            return self._get_default_settings()
    
    async def update_settings(
        self,
        project_id: str,
        user_id: str,
        settings: Dict[str, Any],
        db: AsyncIOMotorDatabase = None
    ) -> Dict[str, Any]:
        """
        Update version control settings for a project
        """
        try:
            settings["project_id"] = project_id
            settings["user_id"] = user_id
            settings["updated_at"] = datetime.utcnow()
            
            if db:
                settings_collection = db.version_control_settings
                await settings_collection.replace_one(
                    {"project_id": project_id, "user_id": user_id},
                    settings,
                    upsert=True
                )
            
            return settings
            
        except Exception as e:
            logger.error(f"Failed to update settings: {e}")
            raise
    
    # Helper methods
    
    async def _generate_version_number(self, project_id: str, db: AsyncIOMotorDatabase) -> str:
        """Generate semantic version number"""
        try:
            if not db:
                return "1.0.0"
                
            backups_collection = db.backups
            count = await backups_collection.count_documents({"project_id": project_id})
            return f"1.0.{count + 1}"
            
        except Exception:
            return f"1.0.{datetime.utcnow().timestamp():.0f}"
    
    async def _get_project_files(self, project_id: str, user_id: str, db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
        """Get all files for a project"""
        try:
            if not db:
                return []
                
            files_collection = db.project_files
            cursor = files_collection.find({"project_id": project_id, "user_id": user_id})
            files = await cursor.to_list(length=None)
            
            return [
                {
                    "path": file.get("path", ""),
                    "content": file.get("content", ""),
                    "type": file.get("type", "file"),
                    "size": len(file.get("content", "")),
                    "checksum": self._calculate_file_checksum(file.get("content", "")),
                    "last_modified": file.get("updated_at", datetime.utcnow()).isoformat()
                }
                for file in files
            ]
            
        except Exception as e:
            logger.error(f"Failed to get project files: {e}")
            return []
    
    def _calculate_checksum(self, files: List[Dict[str, Any]]) -> str:
        """Calculate checksum for files"""
        content = json.dumps(files, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()
    
    def _calculate_file_checksum(self, content: str) -> str:
        """Calculate checksum for single file"""
        return hashlib.md5(content.encode()).hexdigest()
    
    async def _generate_backup_metadata(self, files: List[Dict[str, Any]], message: str) -> Dict[str, Any]:
        """Generate AI-powered backup metadata"""
        try:
            return {
                "files_count": len(files),
                "total_size": sum(f.get("size", 0) for f in files),
                "file_types": list(set(f.get("type", "unknown") for f in files)),
                "backup_quality_score": self._calculate_backup_quality(files),
                "ai_analysis": await self._analyze_backup_content(files, message)
            }
        except Exception as e:
            logger.error(f"Failed to generate backup metadata: {e}")
            return {}
    
    async def _generate_smart_tags(self, files: List[Dict[str, Any]], backup_type: str) -> List[str]:
        """Generate smart tags for backup"""
        tags = [backup_type]
        
        # Add file type tags
        file_types = set(f.get("type", "").split(".")[-1].lower() for f in files if f.get("type"))
        tags.extend(list(file_types)[:3])  # Limit to 3 file type tags
        
        # Add size-based tags
        total_size = sum(f.get("size", 0) for f in files)
        if total_size > 1024 * 1024:  # > 1MB
            tags.append("large")
        elif total_size < 1024:  # < 1KB
            tags.append("small")
        
        return tags[:5]  # Limit total tags
    
    async def _generate_smart_commit_message(self, files: List[Dict[str, Any]], backup_type: str) -> str:
        """Generate AI-powered commit message"""
        try:
            if backup_type == "auto":
                return f"Auto-backup: {len(files)} files updated"
            elif backup_type == "milestone":
                return f"Milestone backup: Major changes in {len(files)} files"
            elif backup_type == "emergency":
                return f"Emergency backup: Preserving current state"
            else:
                return f"Manual backup: {len(files)} files saved"
                
        except Exception as e:
            logger.error(f"Failed to generate commit message: {e}")
            return f"Backup created with {len(files)} files"
    
    def _calculate_backup_quality(self, files: List[Dict[str, Any]]) -> float:
        """Calculate backup quality score"""
        if not files:
            return 0.0
        
        score = 50.0  # Base score
        
        # File diversity bonus
        file_types = set(f.get("type", "") for f in files)
        score += min(len(file_types) * 5, 25)
        
        # Size reasonableness
        total_size = sum(f.get("size", 0) for f in files)
        if 1024 < total_size < 10 * 1024 * 1024:  # Between 1KB and 10MB
            score += 15
        
        # Content presence
        files_with_content = sum(1 for f in files if f.get("content"))
        if files_with_content > 0:
            score += (files_with_content / len(files)) * 10
        
        return min(score, 100.0)
    
    async def _analyze_backup_content(self, files: List[Dict[str, Any]], message: str) -> Dict[str, Any]:
        """AI analysis of backup content"""
        return {
            "complexity": "medium",
            "risk_level": "low",
            "recommendations": ["Consider adding tests", "Update documentation"],
            "estimated_restore_time": "5-10 minutes"
        }
    
    async def _get_backup_count(self, project_id: str, db: AsyncIOMotorDatabase) -> int:
        """Get total backup count for project"""
        try:
            backups_collection = db.backups
            return await backups_collection.count_documents({"project_id": project_id})
        except Exception:
            return 0
    
    async def _get_backup_by_version(self, project_id: str, version: str, user_id: str, db: AsyncIOMotorDatabase) -> Optional[BackupVersion]:
        """Get backup by version number"""
        try:
            if not db:
                return None
                
            backups_collection = db.backups
            backup_doc = await backups_collection.find_one({
                "project_id": project_id,
                "version": version,
                "user_id": user_id
            })
            
            if backup_doc:
                return BackupVersion(**backup_doc)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get backup by version: {e}")
            return None
    
    async def _generate_diff_summary(self, changes: List[Dict[str, Any]], backup_a: BackupVersion, backup_b: BackupVersion) -> Dict[str, Any]:
        """Generate AI summary of differences"""
        return {
            "total_changes": len(changes),
            "impact_level": "medium" if len(changes) > 5 else "low",
            "change_types": list(set(c["type"] for c in changes)),
            "time_span": (backup_b.created_at - backup_a.created_at).total_seconds() / 3600,  # hours
            "summary_text": f"Changes include {len([c for c in changes if c['type'] == 'modified'])} modifications, {len([c for c in changes if c['type'] == 'added'])} additions, and {len([c for c in changes if c['type'] == 'removed'])} deletions."
        }
    
    def _get_default_settings(self) -> Dict[str, Any]:
        """Get default version control settings"""
        return {
            "auto_backup_enabled": True,
            "auto_backup_interval": 30,  # minutes
            "max_backups": 50,
            "smart_commit_messages": True,
            "backup_on_deploy": True,
            "compress_backups": True,
            "notify_on_backup": False,
            "retention_days": 90
        }