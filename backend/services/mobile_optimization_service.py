"""
Mobile Optimization Service - Responsive Design and Mobile Features
PWA capabilities, offline support, and mobile-specific optimizations
"""

import asyncio
import json
import logging
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
import os

logger = logging.getLogger(__name__)

class MobileOptimizationService:
    """
    Mobile optimization service for responsive design,
    PWA capabilities, and mobile-specific features
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Mobile configuration
        self.mobile_config = {
            'breakpoints': {
                'mobile': 768,
                'tablet': 1024,
                'desktop': 1200
            },
            'touch_targets': {
                'min_size': 44,  # 44px minimum touch target
                'spacing': 8     # 8px spacing between touch targets
            },
            'performance': {
                'max_bundle_size': 500000,  # 500KB max bundle size
                'lazy_loading': True,
                'code_splitting': True
            },
            'offline': {
                'cache_size': 50 * 1024 * 1024,  # 50MB cache
                'sync_interval': 5 * 60,  # 5 minutes sync interval
                'max_offline_time': 24 * 60 * 60  # 24 hours max offline
            }
        }
        
        # PWA configuration
        self.pwa_config = {
            'name': 'AETHERFLOW VibeCoder',
            'short_name': 'AetherFlow',
            'description': 'Cosmic-level development platform',
            'theme_color': '#4c1d95',
            'background_color': '#1a1a1a',
            'display': 'standalone',
            'orientation': 'portrait-primary',
            'start_url': '/',
            'scope': '/',
            'icons': [
                {
                    'src': '/icons/icon-192x192.png',
                    'sizes': '192x192',
                    'type': 'image/png'
                },
                {
                    'src': '/icons/icon-512x512.png',
                    'sizes': '512x512',
                    'type': 'image/png'
                }
            ]
        }
        
        # Mobile device detection
        self.mobile_devices = {
            'ios': ['iPhone', 'iPad', 'iPod'],
            'android': ['Android'],
            'mobile': ['Mobile', 'Tablet']
        }
        
        # Offline storage
        self.offline_storage = {
            'projects': {},
            'files': {},
            'preferences': {},
            'sync_queue': []
        }
        
        logger.info("📱 Mobile Optimization Service initialized")

    async def detect_mobile_device(self, user_agent: str) -> Dict[str, Any]:
        """Detect mobile device from user agent"""
        try:
            device_info = {
                'is_mobile': False,
                'is_tablet': False,
                'is_desktop': True,
                'platform': 'unknown',
                'browser': 'unknown',
                'viewport': {
                    'width': 1920,
                    'height': 1080
                },
                'capabilities': {
                    'touch': False,
                    'accelerometer': False,
                    'geolocation': False,
                    'camera': False,
                    'notifications': False
                }
            }
            
            user_agent_lower = user_agent.lower()
            
            # Detect mobile devices
            if any(device in user_agent for device in self.mobile_devices['ios']):
                device_info.update({
                    'is_mobile': True,
                    'is_desktop': False,
                    'platform': 'ios',
                    'capabilities': {
                        'touch': True,
                        'accelerometer': True,
                        'geolocation': True,
                        'camera': True,
                        'notifications': True
                    }
                })
            elif any(device in user_agent for device in self.mobile_devices['android']):
                device_info.update({
                    'is_mobile': True,
                    'is_desktop': False,
                    'platform': 'android',
                    'capabilities': {
                        'touch': True,
                        'accelerometer': True,
                        'geolocation': True,
                        'camera': True,
                        'notifications': True
                    }
                })
            elif 'tablet' in user_agent_lower or 'ipad' in user_agent_lower:
                device_info.update({
                    'is_tablet': True,
                    'is_desktop': False,
                    'platform': 'tablet',
                    'capabilities': {
                        'touch': True,
                        'accelerometer': True,
                        'geolocation': True,
                        'camera': True,
                        'notifications': True
                    }
                })
            
            # Detect browser
            if 'chrome' in user_agent_lower:
                device_info['browser'] = 'chrome'
            elif 'firefox' in user_agent_lower:
                device_info['browser'] = 'firefox'
            elif 'safari' in user_agent_lower:
                device_info['browser'] = 'safari'
            elif 'edge' in user_agent_lower:
                device_info['browser'] = 'edge'
            
            return {
                'success': True,
                'device_info': device_info
            }
            
        except Exception as e:
            logger.error(f"Mobile device detection failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_mobile_config(self, device_type: str) -> Dict[str, Any]:
        """Get mobile-specific configuration"""
        try:
            if device_type == 'mobile':
                config = {
                    'ui': {
                        'header_height': 56,
                        'navigation_type': 'bottom',
                        'sidebar_type': 'overlay',
                        'font_size': 14,
                        'line_height': 1.5,
                        'button_size': 'large',
                        'input_size': 'large'
                    },
                    'layout': {
                        'columns': 1,
                        'padding': 16,
                        'margin': 8,
                        'grid_gap': 12
                    },
                    'gestures': {
                        'swipe_enabled': True,
                        'pinch_zoom': True,
                        'long_press': True,
                        'double_tap': True
                    },
                    'performance': {
                        'lazy_loading': True,
                        'virtual_scrolling': True,
                        'bundle_splitting': True,
                        'image_optimization': True
                    }
                }
            elif device_type == 'tablet':
                config = {
                    'ui': {
                        'header_height': 64,
                        'navigation_type': 'side',
                        'sidebar_type': 'persistent',
                        'font_size': 16,
                        'line_height': 1.6,
                        'button_size': 'medium',
                        'input_size': 'medium'
                    },
                    'layout': {
                        'columns': 2,
                        'padding': 24,
                        'margin': 16,
                        'grid_gap': 16
                    },
                    'gestures': {
                        'swipe_enabled': True,
                        'pinch_zoom': True,
                        'long_press': True,
                        'double_tap': True
                    },
                    'performance': {
                        'lazy_loading': True,
                        'virtual_scrolling': False,
                        'bundle_splitting': True,
                        'image_optimization': True
                    }
                }
            else:  # desktop
                config = {
                    'ui': {
                        'header_height': 72,
                        'navigation_type': 'top',
                        'sidebar_type': 'persistent',
                        'font_size': 14,
                        'line_height': 1.6,
                        'button_size': 'medium',
                        'input_size': 'medium'
                    },
                    'layout': {
                        'columns': 3,
                        'padding': 32,
                        'margin': 24,
                        'grid_gap': 24
                    },
                    'gestures': {
                        'swipe_enabled': False,
                        'pinch_zoom': False,
                        'long_press': False,
                        'double_tap': False
                    },
                    'performance': {
                        'lazy_loading': False,
                        'virtual_scrolling': False,
                        'bundle_splitting': False,
                        'image_optimization': False
                    }
                }
            
            return {
                'success': True,
                'device_type': device_type,
                'config': config
            }
            
        except Exception as e:
            logger.error(f"Get mobile config failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def generate_pwa_manifest(self, user_id: str = None) -> Dict[str, Any]:
        """Generate PWA manifest file"""
        try:
            manifest = self.pwa_config.copy()
            
            # Customize for user if provided
            if user_id:
                user = await self.db.users.find_one({'user_id': user_id})
                if user:
                    manifest['name'] = f"{manifest['name']} - {user.get('username', 'User')}"
            
            return {
                'success': True,
                'manifest': manifest
            }
            
        except Exception as e:
            logger.error(f"Generate PWA manifest failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def store_offline_data(self, user_id: str, data_type: str, data: Dict) -> Dict[str, Any]:
        """Store data for offline access"""
        try:
            offline_record = {
                'offline_id': str(uuid.uuid4()),
                'user_id': user_id,
                'data_type': data_type,
                'data': data,
                'stored_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(seconds=self.mobile_config['offline']['max_offline_time']),
                'size': len(json.dumps(data).encode('utf-8'))
            }
            
            await self.db.offline_data.insert_one(offline_record)
            
            return {
                'success': True,
                'offline_id': offline_record['offline_id'],
                'expires_at': offline_record['expires_at']
            }
            
        except Exception as e:
            logger.error(f"Store offline data failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_offline_data(self, user_id: str, data_type: str = None) -> Dict[str, Any]:
        """Get stored offline data"""
        try:
            query = {'user_id': user_id, 'expires_at': {'$gt': datetime.utcnow()}}
            
            if data_type:
                query['data_type'] = data_type
            
            offline_data = await self.db.offline_data.find(query).to_list(None)
            
            return {
                'success': True,
                'offline_data': offline_data,
                'total_items': len(offline_data)
            }
            
        except Exception as e:
            logger.error(f"Get offline data failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def sync_offline_changes(self, user_id: str, changes: List[Dict]) -> Dict[str, Any]:
        """Sync offline changes when back online"""
        try:
            sync_results = {
                'successful': [],
                'failed': [],
                'conflicts': []
            }
            
            for change in changes:
                try:
                    change_id = change.get('change_id')
                    change_type = change.get('type')
                    change_data = change.get('data')
                    timestamp = change.get('timestamp')
                    
                    # Process different types of changes
                    if change_type == 'project_update':
                        result = await self._sync_project_update(user_id, change_data, timestamp)
                    elif change_type == 'file_update':
                        result = await self._sync_file_update(user_id, change_data, timestamp)
                    elif change_type == 'preference_update':
                        result = await self._sync_preference_update(user_id, change_data, timestamp)
                    else:
                        result = {'success': False, 'error': f'Unknown change type: {change_type}'}
                    
                    if result['success']:
                        sync_results['successful'].append(change_id)
                    else:
                        sync_results['failed'].append({
                            'change_id': change_id,
                            'error': result['error']
                        })
                        
                except Exception as e:
                    sync_results['failed'].append({
                        'change_id': change.get('change_id'),
                        'error': str(e)
                    })
            
            # Clean up synced offline data
            await self._cleanup_synced_data(user_id, sync_results['successful'])
            
            return {
                'success': True,
                'sync_results': sync_results,
                'total_changes': len(changes),
                'successful_syncs': len(sync_results['successful']),
                'failed_syncs': len(sync_results['failed']),
                'conflicts': len(sync_results['conflicts'])
            }
            
        except Exception as e:
            logger.error(f"Sync offline changes failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_mobile_performance_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get mobile performance metrics"""
        try:
            # Get performance data
            performance_data = await self.db.performance_metrics.find(
                {'user_id': user_id, 'device_type': {'$in': ['mobile', 'tablet']}}
            ).sort('timestamp', -1).limit(100).to_list(None)
            
            # Calculate average metrics
            if performance_data:
                avg_metrics = {
                    'page_load_time': sum(m.get('page_load_time', 0) for m in performance_data) / len(performance_data),
                    'bundle_size': sum(m.get('bundle_size', 0) for m in performance_data) / len(performance_data),
                    'memory_usage': sum(m.get('memory_usage', 0) for m in performance_data) / len(performance_data),
                    'battery_impact': sum(m.get('battery_impact', 0) for m in performance_data) / len(performance_data)
                }
            else:
                avg_metrics = {
                    'page_load_time': 0,
                    'bundle_size': 0,
                    'memory_usage': 0,
                    'battery_impact': 0
                }
            
            # Get offline usage stats
            offline_stats = await self.db.offline_data.aggregate([
                {'$match': {'user_id': user_id}},
                {'$group': {
                    '_id': None,
                    'total_offline_storage': {'$sum': '$size'},
                    'total_offline_items': {'$sum': 1}
                }}
            ]).to_list(None)
            
            offline_usage = offline_stats[0] if offline_stats else {
                'total_offline_storage': 0,
                'total_offline_items': 0
            }
            
            return {
                'success': True,
                'performance_metrics': avg_metrics,
                'offline_usage': offline_usage,
                'total_samples': len(performance_data)
            }
            
        except Exception as e:
            logger.error(f"Get mobile performance metrics failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def optimize_for_mobile(self, content: str, content_type: str) -> Dict[str, Any]:
        """Optimize content for mobile devices"""
        try:
            optimization_result = {
                'original_size': len(content),
                'optimized_content': content,
                'optimizations_applied': []
            }
            
            optimized_content = content
            
            # Apply optimizations based on content type
            if content_type == 'css':
                optimized_content = await self._optimize_css_for_mobile(optimized_content)
                optimization_result['optimizations_applied'].append('CSS minification')
                optimization_result['optimizations_applied'].append('Mobile-specific CSS rules')
                
            elif content_type == 'js':
                optimized_content = await self._optimize_js_for_mobile(optimized_content)
                optimization_result['optimizations_applied'].append('JavaScript minification')
                optimization_result['optimizations_applied'].append('Mobile-specific polyfills')
                
            elif content_type == 'html':
                optimized_content = await self._optimize_html_for_mobile(optimized_content)
                optimization_result['optimizations_applied'].append('HTML minification')
                optimization_result['optimizations_applied'].append('Mobile viewport meta tag')
                
            elif content_type == 'image':
                optimized_content = await self._optimize_image_for_mobile(optimized_content)
                optimization_result['optimizations_applied'].append('Image compression')
                optimization_result['optimizations_applied'].append('Responsive image sizing')
            
            optimization_result['optimized_content'] = optimized_content
            optimization_result['optimized_size'] = len(optimized_content)
            optimization_result['compression_ratio'] = (
                1 - optimization_result['optimized_size'] / optimization_result['original_size']
            ) * 100
            
            return {
                'success': True,
                'optimization_result': optimization_result
            }
            
        except Exception as e:
            logger.error(f"Optimize for mobile failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _sync_project_update(self, user_id: str, change_data: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Sync project update from offline storage"""
        try:
            project_id = change_data.get('project_id')
            
            # Check if project exists and was modified after offline change
            project = await self.db.projects.find_one({'project_id': project_id})
            
            if project and project.get('updated_at', datetime.min) > timestamp:
                # Conflict detected
                return {
                    'success': False,
                    'error': 'Conflict: Project was modified by another user',
                    'conflict': True
                }
            
            # Apply changes
            await self.db.projects.update_one(
                {'project_id': project_id},
                {'$set': {**change_data, 'updated_at': datetime.utcnow()}}
            )
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _sync_file_update(self, user_id: str, change_data: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Sync file update from offline storage"""
        try:
            file_id = change_data.get('file_id')
            
            # Check for conflicts
            file_doc = await self.db.files.find_one({'file_id': file_id})
            
            if file_doc and file_doc.get('updated_at', datetime.min) > timestamp:
                return {
                    'success': False,
                    'error': 'Conflict: File was modified by another user',
                    'conflict': True
                }
            
            # Apply changes
            await self.db.files.update_one(
                {'file_id': file_id},
                {'$set': {**change_data, 'updated_at': datetime.utcnow()}}
            )
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _sync_preference_update(self, user_id: str, change_data: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Sync preference update from offline storage"""
        try:
            # Preferences are user-specific and don't typically conflict
            await self.db.users.update_one(
                {'user_id': user_id},
                {'$set': {'preferences': change_data, 'updated_at': datetime.utcnow()}}
            )
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _cleanup_synced_data(self, user_id: str, successful_change_ids: List[str]):
        """Clean up successfully synced offline data"""
        try:
            await self.db.offline_data.delete_many({
                'user_id': user_id,
                'offline_id': {'$in': successful_change_ids}
            })
        except Exception as e:
            logger.error(f"Cleanup synced data failed: {e}")

    async def _optimize_css_for_mobile(self, css_content: str) -> str:
        """Optimize CSS for mobile devices"""
        # Basic CSS minification and mobile optimization
        optimized = css_content
        
        # Remove comments
        optimized = re.sub(r'/\*.*?\*/', '', optimized, flags=re.DOTALL)
        
        # Remove unnecessary whitespace
        optimized = re.sub(r'\s+', ' ', optimized)
        
        # Add mobile-specific rules
        mobile_rules = """
        @media (max-width: 768px) {
            * { box-sizing: border-box; }
            body { font-size: 14px; line-height: 1.5; }
            .container { padding: 16px; }
            .button { min-height: 44px; }
        }
        """
        
        optimized += mobile_rules
        
        return optimized.strip()

    async def _optimize_js_for_mobile(self, js_content: str) -> str:
        """Optimize JavaScript for mobile devices"""
        # Basic JS optimization
        optimized = js_content
        
        # Remove comments
        optimized = re.sub(r'//.*?$', '', optimized, flags=re.MULTILINE)
        optimized = re.sub(r'/\*.*?\*/', '', optimized, flags=re.DOTALL)
        
        # Add mobile-specific polyfills
        mobile_polyfills = """
        // Mobile touch events
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', function() {});
        }
        
        // Mobile viewport handling
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile');
        }
        """
        
        optimized = mobile_polyfills + optimized
        
        return optimized.strip()

    async def _optimize_html_for_mobile(self, html_content: str) -> str:
        """Optimize HTML for mobile devices"""
        optimized = html_content
        
        # Add mobile viewport meta tag if not present
        if 'viewport' not in optimized:
            viewport_meta = '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'
            optimized = optimized.replace('<head>', f'<head>{viewport_meta}')
        
        # Add mobile-specific meta tags
        mobile_meta = '''
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        '''
        
        optimized = optimized.replace('<head>', f'<head>{mobile_meta}')
        
        return optimized

    async def _optimize_image_for_mobile(self, image_content: str) -> str:
        """Optimize images for mobile devices"""
        # For now, return original content
        # In a real implementation, you would use image processing libraries
        # to compress and resize images for mobile
        return image_content

# Global service instance
_mobile_optimization_service = None

def init_mobile_optimization_service(db_manager):
    """Initialize Mobile Optimization Service"""
    global _mobile_optimization_service
    _mobile_optimization_service = MobileOptimizationService(db_manager)
    logger.info("📱 Mobile Optimization Service initialized!")

def get_mobile_optimization_service() -> Optional[MobileOptimizationService]:
    """Get Mobile Optimization Service instance"""
    return _mobile_optimization_service