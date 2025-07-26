"""
Enhanced File Management Service
Provides advanced file operations, upload handling, version control, and binary file support
"""

import asyncio
import base64
import hashlib
import mimetypes
import os
import shutil
import tempfile
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, BinaryIO, Tuple
from pathlib import Path
import magic
from PIL import Image
import io

logger = logging.getLogger(__name__)

class FileManagementService:
    """
    Advanced file management service with upload, versioning, and binary file support
    """
    
    def __init__(self, db_manager, upload_dir: str = "/tmp/aetherflow_uploads"):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # File type configurations
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.max_image_size = 10 * 1024 * 1024   # 10MB
        self.chunk_size = 1024 * 1024  # 1MB chunks
        
        # Allowed file types
        self.allowed_text_extensions = {
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
            '.css', '.scss', '.sass', '.html', '.htm', '.xml', '.json', '.yaml',
            '.yml', '.md', '.txt', '.sql', '.sh', '.bat', '.ps1', '.php', '.rb',
            '.go', '.rs', '.swift', '.kt', '.dart', '.vue', '.svelte', '.r', '.m'
        }
        
        self.allowed_binary_extensions = {
            '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.tar', '.gz', '.rar', '.7z',
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
            '.mp3', '.wav', '.ogg', '.flac', '.aac'
        }
        
        # File type categories
        self.file_categories = {
            'text': self.allowed_text_extensions,
            'image': {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'},
            'document': {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'},
            'archive': {'.zip', '.tar', '.gz', '.rar', '.7z'},
            'video': {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'},
            'audio': {'.mp3', '.wav', '.ogg', '.flac', '.aac'}
        }
        
        logger.info(f"📁 File Management Service initialized with upload dir: {upload_dir}")

    async def upload_file(self, project_id: str, file_data: bytes, filename: str, parent_id: str = None, user_id: str = None) -> Dict[str, Any]:
        """Upload a file with advanced handling for different file types"""
        try:
            # Validate file size
            file_size = len(file_data)
            if file_size > self.max_file_size:
                return {
                    'success': False,
                    'error': f'File size ({file_size} bytes) exceeds maximum allowed size ({self.max_file_size} bytes)'
                }
            
            # Get file extension and validate
            file_path = Path(filename)
            file_extension = file_path.suffix.lower()
            
            if not self._is_allowed_file_type(file_extension):
                return {
                    'success': False,
                    'error': f'File type {file_extension} is not allowed'
                }
            
            # Determine file category
            file_category = self._get_file_category(file_extension)
            
            # Generate file ID and hash
            file_id = str(uuid.uuid4())
            file_hash = hashlib.sha256(file_data).hexdigest()
            
            # Check for duplicate files
            existing_file = await self.db.files.find_one({
                'project_id': project_id,
                'file_hash': file_hash,
                'name': filename
            })
            
            if existing_file:
                return {
                    'success': False,
                    'error': 'File with identical content already exists',
                    'existing_file_id': existing_file['id']
                }
            
            # Detect MIME type
            mime_type = magic.from_buffer(file_data, mime=True)
            if not mime_type:
                mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            
            # Process file based on type
            processed_data = await self._process_file_by_type(file_data, file_category, file_extension)
            
            # Create file document
            file_doc = {
                'id': file_id,
                'name': filename,
                'type': 'file',
                'category': file_category,
                'project_id': project_id,
                'parent_id': parent_id,
                'size': file_size,
                'file_hash': file_hash,
                'mime_type': mime_type,
                'extension': file_extension,
                'uploaded_by': user_id,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'version': 1,
                'is_binary': file_category != 'text',
                'metadata': processed_data.get('metadata', {}),
                'preview_available': processed_data.get('preview_available', False)
            }
            
            # Store file content appropriately
            if file_category == 'text':
                # Store text content directly
                try:
                    file_doc['content'] = file_data.decode('utf-8')
                except UnicodeDecodeError:
                    # Try other encodings
                    for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                        try:
                            file_doc['content'] = file_data.decode(encoding)
                            break
                        except UnicodeDecodeError:
                            continue
                    else:
                        # Store as base64 if all text decoding fails
                        file_doc['content'] = base64.b64encode(file_data).decode('ascii')
                        file_doc['encoding'] = 'base64'
            else:
                # Store binary files as base64
                file_doc['content'] = base64.b64encode(file_data).decode('ascii')
                file_doc['encoding'] = 'base64'
                
                # Store physical file for large binary files
                if file_size > 1024 * 1024:  # 1MB threshold
                    file_path = await self._store_physical_file(file_id, file_data)
                    file_doc['file_path'] = str(file_path)
                    file_doc['content'] = None  # Don't store in DB
            
            # Add processed data
            if processed_data.get('thumbnail'):
                file_doc['thumbnail'] = processed_data['thumbnail']
            
            if processed_data.get('preview'):
                file_doc['preview'] = processed_data['preview']
            
            # Insert file document
            await self.db.files.insert_one(file_doc)
            
            # Update project statistics
            await self.db.projects.update_one(
                {'id': project_id},
                {
                    '$inc': {'file_count': 1, 'total_size': file_size},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            # Create version history entry
            await self._create_version_entry(file_id, 1, user_id, 'File uploaded')
            
            logger.info(f"File uploaded successfully: {filename} ({file_category}, {file_size} bytes)")
            
            return {
                'success': True,
                'file': file_doc,
                'message': f'File {filename} uploaded successfully'
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_file_content(self, file_id: str, include_binary: bool = True) -> Dict[str, Any]:
        """Get file content with proper handling for different file types"""
        try:
            file_doc = await self.db.files.find_one({'id': file_id})
            if not file_doc:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            file_content = None
            
            # Check if file is stored physically
            if file_doc.get('file_path') and os.path.exists(file_doc['file_path']):
                # Read from physical file
                with open(file_doc['file_path'], 'rb') as f:
                    file_data = f.read()
                
                if file_doc.get('category') == 'text':
                    file_content = file_data.decode('utf-8')
                elif include_binary:
                    file_content = base64.b64encode(file_data).decode('ascii')
            else:
                # Get from database
                file_content = file_doc.get('content')
            
            # Prepare response
            response = {
                'success': True,
                'file': {
                    'id': file_doc['id'],
                    'name': file_doc['name'],
                    'type': file_doc['type'],
                    'category': file_doc['category'],
                    'size': file_doc['size'],
                    'mime_type': file_doc['mime_type'],
                    'extension': file_doc['extension'],
                    'is_binary': file_doc.get('is_binary', False),
                    'encoding': file_doc.get('encoding', 'utf-8'),
                    'created_at': file_doc['created_at'],
                    'updated_at': file_doc['updated_at'],
                    'version': file_doc.get('version', 1),
                    'metadata': file_doc.get('metadata', {}),
                    'preview_available': file_doc.get('preview_available', False)
                }
            }
            
            if file_content is not None:
                response['file']['content'] = file_content
            
            # Add preview/thumbnail if available
            if file_doc.get('thumbnail'):
                response['file']['thumbnail'] = file_doc['thumbnail']
            
            if file_doc.get('preview'):
                response['file']['preview'] = file_doc['preview']
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to get file content: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def update_file_content(self, file_id: str, new_content: str, user_id: str = None) -> Dict[str, Any]:
        """Update file content with version control"""
        try:
            # Get existing file
            file_doc = await self.db.files.find_one({'id': file_id})
            if not file_doc:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Only allow content updates for text files
            if file_doc.get('category') != 'text':
                return {
                    'success': False,
                    'error': 'Cannot update content of binary files'
                }
            
            # Calculate new size and hash
            new_content_bytes = new_content.encode('utf-8')
            new_size = len(new_content_bytes)
            new_hash = hashlib.sha256(new_content_bytes).hexdigest()
            
            # Check if content actually changed
            if new_hash == file_doc.get('file_hash'):
                return {
                    'success': True,
                    'message': 'No changes detected',
                    'file': file_doc
                }
            
            # Create backup of current version
            await self._backup_file_version(file_doc)
            
            # Update file document
            old_size = file_doc.get('size', 0)
            new_version = file_doc.get('version', 1) + 1
            
            update_data = {
                'content': new_content,
                'size': new_size,
                'file_hash': new_hash,
                'updated_at': datetime.utcnow(),
                'version': new_version,
                'last_modified_by': user_id
            }
            
            result = await self.db.files.update_one(
                {'id': file_id},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {
                    'success': False,
                    'error': 'Failed to update file'
                }
            
            # Update project size
            size_diff = new_size - old_size
            await self.db.projects.update_one(
                {'id': file_doc['project_id']},
                {
                    '$inc': {'total_size': size_diff},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            # Create version history entry
            await self._create_version_entry(file_id, new_version, user_id, 'Content updated')
            
            # Get updated file
            updated_file = await self.db.files.find_one({'id': file_id})
            
            return {
                'success': True,
                'file': updated_file,
                'message': 'File updated successfully',
                'size_change': size_diff,
                'new_version': new_version
            }
            
        except Exception as e:
            logger.error(f"Failed to update file content: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_file_versions(self, file_id: str) -> Dict[str, Any]:
        """Get version history for a file"""
        try:
            versions = await self.db.file_versions.find(
                {'file_id': file_id}
            ).sort('version', -1).to_list(50)  # Last 50 versions
            
            return {
                'success': True,
                'versions': versions,
                'count': len(versions)
            }
            
        except Exception as e:
            logger.error(f"Failed to get file versions: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def restore_file_version(self, file_id: str, version: int, user_id: str = None) -> Dict[str, Any]:
        """Restore file to a previous version"""
        try:
            # Get version data
            version_doc = await self.db.file_versions.find_one({
                'file_id': file_id,
                'version': version
            })
            
            if not version_doc:
                return {
                    'success': False,
                    'error': f'Version {version} not found'
                }
            
            # Get current file
            current_file = await self.db.files.find_one({'id': file_id})
            if not current_file:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Backup current version before restore
            await self._backup_file_version(current_file)
            
            # Restore version content
            new_version = current_file.get('version', 1) + 1
            restore_data = {
                'content': version_doc['content'],
                'size': version_doc['size'],
                'file_hash': version_doc['file_hash'],
                'updated_at': datetime.utcnow(),
                'version': new_version,
                'last_modified_by': user_id,
                'restored_from_version': version
            }
            
            await self.db.files.update_one(
                {'id': file_id},
                {'$set': restore_data}
            )
            
            # Create version entry for restore
            await self._create_version_entry(
                file_id, 
                new_version, 
                user_id, 
                f'Restored from version {version}'
            )
            
            return {
                'success': True,
                'message': f'File restored to version {version}',
                'new_version': new_version
            }
            
        except Exception as e:
            logger.error(f"Failed to restore file version: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def generate_file_preview(self, file_id: str) -> Dict[str, Any]:
        """Generate preview for supported file types"""
        try:
            file_doc = await self.db.files.find_one({'id': file_id})
            if not file_doc:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            file_category = file_doc.get('category')
            preview_data = None
            
            if file_category == 'image':
                preview_data = await self._generate_image_preview(file_doc)
            elif file_category == 'text':
                preview_data = await self._generate_text_preview(file_doc)
            elif file_category == 'document':
                preview_data = await self._generate_document_preview(file_doc)
            
            if preview_data:
                # Update file document with preview
                await self.db.files.update_one(
                    {'id': file_id},
                    {
                        '$set': {
                            'preview': preview_data,
                            'preview_available': True,
                            'preview_generated_at': datetime.utcnow()
                        }
                    }
                )
                
                return {
                    'success': True,
                    'preview': preview_data,
                    'message': 'Preview generated successfully'
                }
            else:
                return {
                    'success': False,
                    'error': f'Preview not supported for {file_category} files'
                }
                
        except Exception as e:
            logger.error(f"Failed to generate file preview: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _process_file_by_type(self, file_data: bytes, file_category: str, file_extension: str) -> Dict[str, Any]:
        """Process file based on its type and generate metadata"""
        processed_data = {
            'metadata': {},
            'preview_available': False
        }
        
        try:
            if file_category == 'image':
                # Generate image metadata and thumbnail
                image_data = await self._process_image_file(file_data)
                processed_data.update(image_data)
            
            elif file_category == 'text':
                # Analyze text file
                text_data = await self._process_text_file(file_data, file_extension)
                processed_data.update(text_data)
            
            elif file_category == 'document':
                # Process document file
                doc_data = await self._process_document_file(file_data, file_extension)
                processed_data.update(doc_data)
            
        except Exception as e:
            logger.warning(f"File processing failed: {e}")
        
        return processed_data

    async def _process_image_file(self, file_data: bytes) -> Dict[str, Any]:
        """Process image file and generate thumbnail"""
        try:
            image = Image.open(io.BytesIO(file_data))
            width, height = image.size
            
            # Generate thumbnail
            thumbnail_size = (150, 150)
            image.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
            
            # Convert thumbnail to base64
            thumbnail_buffer = io.BytesIO()
            image.save(thumbnail_buffer, format='PNG')
            thumbnail_base64 = base64.b64encode(thumbnail_buffer.getvalue()).decode('ascii')
            
            return {
                'metadata': {
                    'width': width,
                    'height': height,
                    'format': image.format,
                    'mode': image.mode
                },
                'thumbnail': thumbnail_base64,
                'preview_available': True
            }
            
        except Exception as e:
            logger.warning(f"Image processing failed: {e}")
            return {'metadata': {}, 'preview_available': False}

    async def _process_text_file(self, file_data: bytes, file_extension: str) -> Dict[str, Any]:
        """Process text file and generate metadata"""
        try:
            # Decode text content
            try:
                content = file_data.decode('utf-8')
            except UnicodeDecodeError:
                content = file_data.decode('latin-1', errors='ignore')
            
            lines = content.split('\n')
            line_count = len(lines)
            char_count = len(content)
            word_count = len(content.split())
            
            # Language-specific analysis
            language = self._detect_programming_language(file_extension, content)
            
            return {
                'metadata': {
                    'line_count': line_count,
                    'character_count': char_count,
                    'word_count': word_count,
                    'programming_language': language,
                    'encoding': 'utf-8'
                },
                'preview_available': True
            }
            
        except Exception as e:
            logger.warning(f"Text file processing failed: {e}")
            return {'metadata': {}, 'preview_available': False}

    async def _process_document_file(self, file_data: bytes, file_extension: str) -> Dict[str, Any]:
        """Process document file and extract metadata"""
        try:
            metadata = {
                'file_type': file_extension,
                'size_bytes': len(file_data)
            }
            
            # Basic document type detection
            if file_extension == '.pdf':
                metadata['document_type'] = 'PDF Document'
            elif file_extension in ['.doc', '.docx']:
                metadata['document_type'] = 'Word Document'
            elif file_extension in ['.xls', '.xlsx']:
                metadata['document_type'] = 'Excel Spreadsheet'
            elif file_extension in ['.ppt', '.pptx']:
                metadata['document_type'] = 'PowerPoint Presentation'
            
            return {
                'metadata': metadata,
                'preview_available': False  # Would need additional libraries for document preview
            }
            
        except Exception as e:
            logger.warning(f"Document processing failed: {e}")
            return {'metadata': {}, 'preview_available': False}

    def _detect_programming_language(self, extension: str, content: str) -> str:
        """Detect programming language from extension and content"""
        language_map = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.jsx': 'React JSX',
            '.tsx': 'React TSX',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.h': 'C Header',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.sass': 'Sass',
            '.html': 'HTML',
            '.htm': 'HTML',
            '.xml': 'XML',
            '.json': 'JSON',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.md': 'Markdown',
            '.sql': 'SQL',
            '.sh': 'Shell Script',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.go': 'Go',
            '.rs': 'Rust',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.dart': 'Dart'
        }
        
        return language_map.get(extension, 'Plain Text')

    async def _store_physical_file(self, file_id: str, file_data: bytes) -> Path:
        """Store large binary file physically"""
        file_dir = self.upload_dir / file_id[:2]  # Use first 2 chars for directory
        file_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = file_dir / file_id
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return file_path

    async def _backup_file_version(self, file_doc: Dict):
        """Create backup of current file version"""
        version_doc = {
            'file_id': file_doc['id'],
            'version': file_doc.get('version', 1),
            'content': file_doc.get('content'),
            'size': file_doc.get('size'),
            'file_hash': file_doc.get('file_hash'),
            'created_at': datetime.utcnow(),
            'metadata': file_doc.get('metadata', {})
        }
        
        await self.db.file_versions.insert_one(version_doc)

    async def _create_version_entry(self, file_id: str, version: int, user_id: str, description: str):
        """Create version history entry"""
        version_entry = {
            'file_id': file_id,
            'version': version,
            'user_id': user_id,
            'description': description,
            'created_at': datetime.utcnow()
        }
        
        await self.db.file_history.insert_one(version_entry)

    async def _generate_image_preview(self, file_doc: Dict) -> Optional[str]:
        """Generate preview for image files"""
        # For images, the thumbnail serves as preview
        return file_doc.get('thumbnail')

    async def _generate_text_preview(self, file_doc: Dict) -> Optional[str]:
        """Generate preview for text files"""
        content = file_doc.get('content', '')
        if content:
            # Return first 500 characters
            return content[:500] + ('...' if len(content) > 500 else '')
        return None

    async def _generate_document_preview(self, file_doc: Dict) -> Optional[str]:
        """Generate preview for document files (placeholder)"""
        # This would require additional libraries like PyPDF2, python-docx, etc.
        return f"Document preview for {file_doc.get('name')} (implementation needed)"

    def _is_allowed_file_type(self, extension: str) -> bool:
        """Check if file type is allowed"""
        return extension in self.allowed_text_extensions or extension in self.allowed_binary_extensions

    def _get_file_category(self, extension: str) -> str:
        """Get file category based on extension"""
        for category, extensions in self.file_categories.items():
            if extension in extensions:
                return category
        return 'unknown'

# Global file management service instance
_file_management_service = None

def init_file_management_service(db_manager, upload_dir: str = "/tmp/aetherflow_uploads"):
    """Initialize the file management service"""
    global _file_management_service
    _file_management_service = FileManagementService(db_manager, upload_dir)
    logger.info("📁 File Management Service initialized!")

def get_file_management_service() -> Optional[FileManagementService]:
    """Get the file management service instance"""
    return _file_management_service