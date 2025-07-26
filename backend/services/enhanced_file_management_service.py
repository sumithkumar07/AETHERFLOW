"""
Enhanced File Management Service - Advanced File Operations
Upload, preview, version control, and intelligent file management
"""

import asyncio
import json
import logging
import os
import shutil
import hashlib
import mimetypes
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import uuid
import aiofiles
import base64
from PIL import Image
import io

logger = logging.getLogger(__name__)

class EnhancedFileManagementService:
    """
    Enhanced file management with upload, preview, version control,
    drag-and-drop support, and intelligent file operations
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # File storage configuration
        self.storage_root = "/app/storage"
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.chunk_size = 1024 * 1024  # 1MB chunks
        
        # Supported file types
        self.supported_types = {
            'code': ['.js', '.py', '.java', '.cpp', '.c', '.h', '.css', '.html', '.json', '.xml', '.yaml', '.yml', '.md', '.txt'],
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
            'document': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
            'archive': ['.zip', '.tar', '.gz', '.rar', '.7z'],
            'video': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
            'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg']
        }
        
        # Preview generators
        self.preview_generators = {
            'image': self._generate_image_preview,
            'code': self._generate_code_preview,
            'document': self._generate_document_preview,
            'video': self._generate_video_preview
        }
        
        # Version control
        self.version_control = {
            'enabled': True,
            'max_versions': 20,
            'auto_commit': True,
            'commit_message_template': "Auto-commit: {timestamp}"
        }
        
        # Ensure storage directory exists
        os.makedirs(self.storage_root, exist_ok=True)
        
        logger.info("📁 Enhanced File Management Service initialized")

    async def upload_file(self, file_data: Dict, user_id: str, project_id: str = None) -> Dict[str, Any]:
        """Upload file with chunked upload support"""
        try:
            file_name = file_data.get('name', '')
            file_content = file_data.get('content', '')
            file_size = file_data.get('size', 0)
            chunk_index = file_data.get('chunk_index', 0)
            total_chunks = file_data.get('total_chunks', 1)
            upload_id = file_data.get('upload_id', str(uuid.uuid4()))
            
            # Validate file
            if not file_name or not file_content:
                return {
                    'success': False,
                    'error': 'File name and content are required'
                }
            
            if file_size > self.max_file_size:
                return {
                    'success': False,
                    'error': f'File size exceeds limit of {self.max_file_size} bytes'
                }
            
            # Get file type
            file_type = self._get_file_type(file_name)
            
            # Create file record if first chunk
            if chunk_index == 0:
                file_id = str(uuid.uuid4())
                file_record = {
                    'file_id': file_id,
                    'upload_id': upload_id,
                    'name': file_name,
                    'size': file_size,
                    'type': file_type,
                    'mime_type': mimetypes.guess_type(file_name)[0] or 'application/octet-stream',
                    'user_id': user_id,
                    'project_id': project_id,
                    'status': 'uploading',
                    'chunks_received': 0,
                    'total_chunks': total_chunks,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'version': 1,
                    'checksum': None,
                    'path': f"{self.storage_root}/{file_id}",
                    'preview_url': None,
                    'metadata': {
                        'original_name': file_name,
                        'upload_source': 'web',
                        'compressed': False
                    }
                }
                
                await self.db.files.insert_one(file_record)
            else:
                # Get existing file record
                file_record = await self.db.files.find_one({'upload_id': upload_id})
                if not file_record:
                    return {
                        'success': False,
                        'error': 'Upload session not found'
                    }
                
                file_id = file_record['file_id']
            
            # Save chunk
            chunk_path = f"{self.storage_root}/{file_id}_chunk_{chunk_index}"
            
            # Decode base64 content
            try:
                chunk_data = base64.b64decode(file_content)
            except Exception as e:
                return {
                    'success': False,
                    'error': f'Invalid file content encoding: {e}'
                }
            
            # Write chunk to disk
            async with aiofiles.open(chunk_path, 'wb') as f:
                await f.write(chunk_data)
            
            # Update chunks received
            await self.db.files.update_one(
                {'upload_id': upload_id},
                {
                    '$inc': {'chunks_received': 1},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            # If all chunks received, assemble file
            if chunk_index + 1 == total_chunks:
                assembled_file = await self._assemble_chunks(file_id, total_chunks)
                
                if assembled_file['success']:
                    # Generate checksum
                    checksum = await self._generate_checksum(assembled_file['file_path'])
                    
                    # Generate preview
                    preview_result = await self._generate_preview(file_id, assembled_file['file_path'], file_type)
                    
                    # Update file record
                    await self.db.files.update_one(
                        {'file_id': file_id},
                        {
                            '$set': {
                                'status': 'completed',
                                'checksum': checksum,
                                'preview_url': preview_result.get('preview_url'),
                                'completed_at': datetime.utcnow()
                            }
                        }
                    )
                    
                    # Create version control entry
                    if self.version_control['enabled']:
                        await self._create_version_entry(file_id, user_id, 'Initial upload')
                    
                    return {
                        'success': True,
                        'file_id': file_id,
                        'upload_id': upload_id,
                        'status': 'completed',
                        'checksum': checksum,
                        'preview_url': preview_result.get('preview_url'),
                        'message': 'File uploaded successfully'
                    }
                else:
                    return {
                        'success': False,
                        'error': assembled_file['error']
                    }
            
            return {
                'success': True,
                'file_id': file_id,
                'upload_id': upload_id,
                'status': 'uploading',
                'chunks_received': chunk_index + 1,
                'total_chunks': total_chunks,
                'message': f'Chunk {chunk_index + 1}/{total_chunks} uploaded'
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_file_preview(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Get file preview"""
        try:
            file_record = await self.db.files.find_one({'file_id': file_id})
            
            if not file_record:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Check permissions
            if file_record['user_id'] != user_id:
                # Check if user has access to project
                if file_record.get('project_id'):
                    project = await self.db.projects.find_one({'project_id': file_record['project_id']})
                    if not project or user_id not in project.get('collaborators', []):
                        return {
                            'success': False,
                            'error': 'Access denied'
                        }
            
            # Generate preview if not exists
            if not file_record.get('preview_url'):
                preview_result = await self._generate_preview(file_id, file_record['path'], file_record['type'])
                if preview_result['success']:
                    await self.db.files.update_one(
                        {'file_id': file_id},
                        {'$set': {'preview_url': preview_result['preview_url']}}
                    )
                    file_record['preview_url'] = preview_result['preview_url']
            
            return {
                'success': True,
                'file_id': file_id,
                'preview_url': file_record.get('preview_url'),
                'file_info': {
                    'name': file_record['name'],
                    'size': file_record['size'],
                    'type': file_record['type'],
                    'mime_type': file_record['mime_type'],
                    'created_at': file_record['created_at'],
                    'version': file_record.get('version', 1)
                }
            }
            
        except Exception as e:
            logger.error(f"Get file preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def create_file_version(self, file_id: str, user_id: str, content: str = None, message: str = None) -> Dict[str, Any]:
        """Create new version of file"""
        try:
            file_record = await self.db.files.find_one({'file_id': file_id})
            
            if not file_record:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Check permissions
            if file_record['user_id'] != user_id:
                return {
                    'success': False,
                    'error': 'Access denied'
                }
            
            # Get current version
            current_version = file_record.get('version', 1)
            new_version = current_version + 1
            
            # Create version entry
            version_id = str(uuid.uuid4())
            version_record = {
                'version_id': version_id,
                'file_id': file_id,
                'version_number': new_version,
                'user_id': user_id,
                'message': message or f'Version {new_version}',
                'created_at': datetime.utcnow(),
                'size': len(content) if content else file_record['size'],
                'checksum': hashlib.sha256(content.encode()).hexdigest() if content else file_record['checksum'],
                'changes': {
                    'lines_added': 0,
                    'lines_removed': 0,
                    'lines_modified': 0
                }
            }
            
            # Save new version content if provided
            if content:
                version_path = f"{self.storage_root}/{file_id}_v{new_version}"
                async with aiofiles.open(version_path, 'w') as f:
                    await f.write(content)
                
                version_record['path'] = version_path
                
                # Update main file
                await self.db.files.update_one(
                    {'file_id': file_id},
                    {
                        '$set': {
                            'version': new_version,
                            'updated_at': datetime.utcnow(),
                            'size': len(content),
                            'checksum': version_record['checksum']
                        }
                    }
                )
            
            # Store version
            await self.db.file_versions.insert_one(version_record)
            
            # Clean up old versions if needed
            await self._cleanup_old_versions(file_id)
            
            return {
                'success': True,
                'version_id': version_id,
                'version_number': new_version,
                'message': f'Version {new_version} created successfully'
            }
            
        except Exception as e:
            logger.error(f"Create file version failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_file_versions(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Get file version history"""
        try:
            file_record = await self.db.files.find_one({'file_id': file_id})
            
            if not file_record:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Check permissions
            if file_record['user_id'] != user_id:
                return {
                    'success': False,
                    'error': 'Access denied'
                }
            
            # Get versions
            versions = await self.db.file_versions.find(
                {'file_id': file_id}
            ).sort('version_number', -1).to_list(None)
            
            return {
                'success': True,
                'file_id': file_id,
                'current_version': file_record.get('version', 1),
                'versions': versions,
                'total_versions': len(versions)
            }
            
        except Exception as e:
            logger.error(f"Get file versions failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def search_files(self, query: str, user_id: str, project_id: str = None, file_type: str = None) -> Dict[str, Any]:
        """Search files with advanced filters"""
        try:
            # Build search query
            search_filter = {
                '$or': [
                    {'name': {'$regex': query, '$options': 'i'}},
                    {'metadata.tags': {'$regex': query, '$options': 'i'}}
                ]
            }
            
            # Add user filter
            if project_id:
                search_filter['project_id'] = project_id
            else:
                search_filter['user_id'] = user_id
            
            # Add file type filter
            if file_type:
                search_filter['type'] = file_type
            
            # Execute search
            files = await self.db.files.find(search_filter).sort('updated_at', -1).to_list(None)
            
            # Format results
            results = []
            for file_record in files:
                results.append({
                    'file_id': file_record['file_id'],
                    'name': file_record['name'],
                    'type': file_record['type'],
                    'size': file_record['size'],
                    'created_at': file_record['created_at'],
                    'updated_at': file_record['updated_at'],
                    'preview_url': file_record.get('preview_url'),
                    'version': file_record.get('version', 1)
                })
            
            return {
                'success': True,
                'query': query,
                'results': results,
                'total_results': len(results)
            }
            
        except Exception as e:
            logger.error(f"File search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_file_analytics(self, user_id: str, project_id: str = None) -> Dict[str, Any]:
        """Get file analytics and insights"""
        try:
            # Build filter
            filter_query = {'user_id': user_id}
            if project_id:
                filter_query['project_id'] = project_id
            
            # Get file statistics
            total_files = await self.db.files.count_documents(filter_query)
            
            # Get file type distribution
            type_pipeline = [
                {'$match': filter_query},
                {'$group': {'_id': '$type', 'count': {'$sum': 1}, 'total_size': {'$sum': '$size'}}},
                {'$sort': {'count': -1}}
            ]
            
            type_distribution = await self.db.files.aggregate(type_pipeline).to_list(None)
            
            # Get recent activity
            recent_files = await self.db.files.find(filter_query).sort('updated_at', -1).limit(10).to_list(None)
            
            # Get version statistics
            version_stats = await self.db.file_versions.aggregate([
                {'$group': {'_id': '$file_id', 'version_count': {'$sum': 1}}},
                {'$group': {'_id': None, 'avg_versions': {'$avg': '$version_count'}, 'total_versions': {'$sum': '$version_count'}}}
            ]).to_list(None)
            
            return {
                'success': True,
                'analytics': {
                    'total_files': total_files,
                    'type_distribution': type_distribution,
                    'recent_files': recent_files,
                    'version_stats': version_stats[0] if version_stats else {'avg_versions': 0, 'total_versions': 0}
                }
            }
            
        except Exception as e:
            logger.error(f"Get file analytics failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_file_type(self, filename: str) -> str:
        """Determine file type from filename"""
        ext = os.path.splitext(filename.lower())[1]
        
        for file_type, extensions in self.supported_types.items():
            if ext in extensions:
                return file_type
        
        return 'unknown'

    async def _assemble_chunks(self, file_id: str, total_chunks: int) -> Dict[str, Any]:
        """Assemble file chunks into complete file"""
        try:
            final_path = f"{self.storage_root}/{file_id}"
            
            async with aiofiles.open(final_path, 'wb') as final_file:
                for i in range(total_chunks):
                    chunk_path = f"{self.storage_root}/{file_id}_chunk_{i}"
                    
                    if not os.path.exists(chunk_path):
                        return {
                            'success': False,
                            'error': f'Chunk {i} not found'
                        }
                    
                    async with aiofiles.open(chunk_path, 'rb') as chunk_file:
                        chunk_data = await chunk_file.read()
                        await final_file.write(chunk_data)
                    
                    # Remove chunk file
                    os.remove(chunk_path)
            
            return {
                'success': True,
                'file_path': final_path
            }
            
        except Exception as e:
            logger.error(f"Assemble chunks failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_checksum(self, file_path: str) -> str:
        """Generate file checksum"""
        try:
            hash_sha256 = hashlib.sha256()
            async with aiofiles.open(file_path, 'rb') as f:
                while chunk := await f.read(8192):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logger.error(f"Generate checksum failed: {e}")
            return ""

    async def _generate_preview(self, file_id: str, file_path: str, file_type: str) -> Dict[str, Any]:
        """Generate file preview"""
        try:
            if file_type in self.preview_generators:
                preview_result = await self.preview_generators[file_type](file_id, file_path)
                return preview_result
            else:
                return {
                    'success': True,
                    'preview_url': None,
                    'message': 'Preview not available for this file type'
                }
        except Exception as e:
            logger.error(f"Generate preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_image_preview(self, file_id: str, file_path: str) -> Dict[str, Any]:
        """Generate image preview"""
        try:
            with Image.open(file_path) as img:
                # Create thumbnail
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
                # Convert to base64
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                img_str = base64.b64encode(buffer.getvalue()).decode()
                
                preview_url = f"data:image/png;base64,{img_str}"
                
                return {
                    'success': True,
                    'preview_url': preview_url
                }
        except Exception as e:
            logger.error(f"Generate image preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_code_preview(self, file_id: str, file_path: str) -> Dict[str, Any]:
        """Generate code preview"""
        try:
            async with aiofiles.open(file_path, 'r') as f:
                content = await f.read()
            
            # Get first 500 characters for preview
            preview_content = content[:500]
            if len(content) > 500:
                preview_content += "..."
            
            return {
                'success': True,
                'preview_url': f"data:text/plain;base64,{base64.b64encode(preview_content.encode()).decode()}"
            }
        except Exception as e:
            logger.error(f"Generate code preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_document_preview(self, file_id: str, file_path: str) -> Dict[str, Any]:
        """Generate document preview"""
        try:
            # For now, return placeholder
            return {
                'success': True,
                'preview_url': None,
                'message': 'Document preview not yet implemented'
            }
        except Exception as e:
            logger.error(f"Generate document preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_video_preview(self, file_id: str, file_path: str) -> Dict[str, Any]:
        """Generate video preview"""
        try:
            # For now, return placeholder
            return {
                'success': True,
                'preview_url': None,
                'message': 'Video preview not yet implemented'
            }
        except Exception as e:
            logger.error(f"Generate video preview failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _create_version_entry(self, file_id: str, user_id: str, message: str):
        """Create version control entry"""
        try:
            version_record = {
                'version_id': str(uuid.uuid4()),
                'file_id': file_id,
                'version_number': 1,
                'user_id': user_id,
                'message': message,
                'created_at': datetime.utcnow(),
                'changes': {
                    'lines_added': 0,
                    'lines_removed': 0,
                    'lines_modified': 0
                }
            }
            
            await self.db.file_versions.insert_one(version_record)
        except Exception as e:
            logger.error(f"Create version entry failed: {e}")

    async def _cleanup_old_versions(self, file_id: str):
        """Clean up old versions if exceeding limit"""
        try:
            versions = await self.db.file_versions.find(
                {'file_id': file_id}
            ).sort('version_number', -1).to_list(None)
            
            if len(versions) > self.version_control['max_versions']:
                # Remove excess versions
                excess_versions = versions[self.version_control['max_versions']:]
                
                for version in excess_versions:
                    await self.db.file_versions.delete_one({'version_id': version['version_id']})
                    
                    # Remove version file if exists
                    if 'path' in version and os.path.exists(version['path']):
                        os.remove(version['path'])
                        
        except Exception as e:
            logger.error(f"Cleanup old versions failed: {e}")

# Global service instance
_enhanced_file_management_service = None

def init_enhanced_file_management_service(db_manager):
    """Initialize Enhanced File Management Service"""
    global _enhanced_file_management_service
    _enhanced_file_management_service = EnhancedFileManagementService(db_manager)
    logger.info("📁 Enhanced File Management Service initialized!")

def get_enhanced_file_management_service() -> Optional[EnhancedFileManagementService]:
    """Get Enhanced File Management Service instance"""
    return _enhanced_file_management_service