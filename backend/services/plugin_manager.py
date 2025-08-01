import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import importlib
import inspect

logger = logging.getLogger(__name__)

class PluginType(Enum):
    INTEGRATION = "integration"
    WORKFLOW = "workflow"
    UI_COMPONENT = "ui_component"
    DATA_PROCESSOR = "data_processor"
    NOTIFICATION = "notification"
    ANALYTICS = "analytics"

class PluginStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    LOADING = "loading"

@dataclass
class PluginHook:
    event: str
    handler: Callable
    priority: int = 10
    conditions: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PluginManifest:
    name: str
    version: str
    description: str
    author: str
    plugin_type: PluginType
    locations: List[str]
    dependencies: List[str] = field(default_factory=list)
    permissions: List[str] = field(default_factory=list)
    config_schema: Dict[str, Any] = field(default_factory=dict)
    hooks: List[str] = field(default_factory=list)

@dataclass
class PluginInstance:
    manifest: PluginManifest
    module: Any
    status: PluginStatus
    config: Dict[str, Any]
    hooks: List[PluginHook] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_error: Optional[str] = None

class EventBus:
    """Event bus for plugin communication"""
    
    def __init__(self):
        self.listeners = {}
        self.middleware = []
    
    def on(self, event: str, handler: Callable, priority: int = 10):
        """Register event listener"""
        if event not in self.listeners:
            self.listeners[event] = []
        
        self.listeners[event].append({
            "handler": handler,
            "priority": priority
        })
        
        # Sort by priority
        self.listeners[event].sort(key=lambda x: x["priority"], reverse=True)
    
    def off(self, event: str, handler: Callable):
        """Remove event listener"""
        if event in self.listeners:
            self.listeners[event] = [
                listener for listener in self.listeners[event]
                if listener["handler"] != handler
            ]
    
    async def emit(self, event: str, data: Any = None, context: Dict[str, Any] = None):
        """Emit event to all listeners"""
        try:
            if event not in self.listeners:
                return
            
            # Apply middleware
            for middleware in self.middleware:
                data = await self._apply_middleware(middleware, event, data, context)
            
            # Call all listeners
            results = []
            for listener in self.listeners[event]:
                try:
                    if inspect.iscoroutinefunction(listener["handler"]):
                        result = await listener["handler"](data, context)
                    else:
                        result = listener["handler"](data, context)
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error in event listener for {event}: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error emitting event {event}: {e}")
            return []
    
    async def _apply_middleware(self, middleware: Callable, event: str, data: Any, context: Dict[str, Any]):
        """Apply middleware to event"""
        try:
            if inspect.iscoroutinefunction(middleware):
                return await middleware(event, data, context)
            else:
                return middleware(event, data, context)
        except Exception as e:
            logger.error(f"Error in middleware: {e}")
            return data

class PluginManager:
    """Hot-pluggable integration system and plugin manager"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.plugins = {}
        self.event_bus = EventBus()
        self.workflow_engine = WorkflowEngine(self.event_bus)
        self.plugin_store = PluginStore(db_client)
        self.initialized = False
    
    async def initialize(self):
        """Initialize plugin manager"""
        try:
            await self.plugin_store.initialize()
            await self._load_installed_plugins()
            self.initialized = True
            logger.info("Plugin manager initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize plugin manager: {e}")
            raise
    
    async def register_plugin(self, plugin_manifest: PluginManifest, plugin_module: Any, config: Dict[str, Any] = None) -> bool:
        """Register a new plugin"""
        try:
            # Validate plugin
            if not self._validate_plugin(plugin_manifest, plugin_module):
                return False
            
            # Check dependencies
            if not await self._check_dependencies(plugin_manifest.dependencies):
                logger.error(f"Plugin {plugin_manifest.name} has unmet dependencies")
                return False
            
            # Create plugin instance
            plugin_instance = PluginInstance(
                manifest=plugin_manifest,
                module=plugin_module,
                status=PluginStatus.LOADING,
                config=config or {}
            )
            
            # Initialize plugin
            if hasattr(plugin_module, 'initialize'):
                await plugin_module.initialize(config or {})
            
            # Register hooks
            await self._register_plugin_hooks(plugin_instance)
            
            # Store plugin
            self.plugins[plugin_manifest.name] = plugin_instance
            plugin_instance.status = PluginStatus.ACTIVE
            
            # Save to database
            await self.plugin_store.save_plugin(plugin_instance)
            
            # Emit event
            await self.event_bus.emit('plugin.registered', {
                'plugin': plugin_manifest.name,
                'type': plugin_manifest.plugin_type.value
            })
            
            logger.info(f"Plugin {plugin_manifest.name} registered successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error registering plugin {plugin_manifest.name}: {e}")
            if plugin_manifest.name in self.plugins:
                self.plugins[plugin_manifest.name].status = PluginStatus.ERROR
                self.plugins[plugin_manifest.name].last_error = str(e)
            return False
    
    async def unregister_plugin(self, plugin_name: str) -> bool:
        """Unregister a plugin"""
        try:
            if plugin_name not in self.plugins:
                return False
            
            plugin_instance = self.plugins[plugin_name]
            
            # Unregister hooks
            await self._unregister_plugin_hooks(plugin_instance)
            
            # Cleanup plugin
            if hasattr(plugin_instance.module, 'cleanup'):
                await plugin_instance.module.cleanup()
            
            # Remove from memory
            del self.plugins[plugin_name]
            
            # Remove from database
            await self.plugin_store.remove_plugin(plugin_name)
            
            # Emit event
            await self.event_bus.emit('plugin.unregistered', {
                'plugin': plugin_name
            })
            
            logger.info(f"Plugin {plugin_name} unregistered successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error unregistering plugin {plugin_name}: {e}")
            return False
    
    async def get_plugin_ui(self, location: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get UI components for a specific location"""
        ui_components = []
        
        for plugin_name, plugin_instance in self.plugins.items():
            if plugin_instance.status != PluginStatus.ACTIVE:
                continue
            
            if location in plugin_instance.manifest.locations:
                try:
                    if hasattr(plugin_instance.module, 'render'):
                        component = await plugin_instance.module.render(location, context)
                        if component:
                            ui_components.append({
                                'plugin': plugin_name,
                                'component': component,
                                'priority': getattr(plugin_instance.module, 'priority', 10)
                            })
                except Exception as e:
                    logger.error(f"Error rendering UI for plugin {plugin_name}: {e}")
        
        # Sort by priority
        ui_components.sort(key=lambda x: x['priority'], reverse=True)
        return ui_components
    
    async def trigger_workflow(self, workflow_name: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Trigger a workflow"""
        return await self.workflow_engine.execute_workflow(workflow_name, data)
    
    async def _load_installed_plugins(self):
        """Load plugins from database"""
        try:
            plugins = await self.plugin_store.get_all_plugins()
            for plugin_data in plugins:
                # TODO: Load plugin module from stored configuration
                pass
        except Exception as e:
            logger.error(f"Error loading installed plugins: {e}")
    
    def _validate_plugin(self, manifest: PluginManifest, module: Any) -> bool:
        """Validate plugin structure"""
        try:
            # Check required attributes
            required_methods = ['initialize'] if hasattr(module, 'initialize') else []
            
            if manifest.plugin_type == PluginType.INTEGRATION:
                required_methods.extend(['connect', 'disconnect'])
            elif manifest.plugin_type == PluginType.UI_COMPONENT:
                required_methods.append('render')
            
            for method in required_methods:
                if not hasattr(module, method):
                    logger.error(f"Plugin {manifest.name} missing required method: {method}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating plugin {manifest.name}: {e}")
            return False
    
    async def _check_dependencies(self, dependencies: List[str]) -> bool:
        """Check if plugin dependencies are satisfied"""
        for dependency in dependencies:
            if dependency not in self.plugins:
                return False
            if self.plugins[dependency].status != PluginStatus.ACTIVE:
                return False
        return True
    
    async def _register_plugin_hooks(self, plugin_instance: PluginInstance):
        """Register hooks for a plugin"""
        try:
            if hasattr(plugin_instance.module, 'hooks'):
                hooks = plugin_instance.module.hooks
                for hook_name, handler in hooks.items():
                    self.event_bus.on(hook_name, handler)
                    plugin_instance.hooks.append(PluginHook(
                        event=hook_name,
                        handler=handler
                    ))
        except Exception as e:
            logger.error(f"Error registering hooks for plugin {plugin_instance.manifest.name}: {e}")
    
    async def _unregister_plugin_hooks(self, plugin_instance: PluginInstance):
        """Unregister hooks for a plugin"""
        try:
            for hook in plugin_instance.hooks:
                self.event_bus.off(hook.event, hook.handler)
        except Exception as e:
            logger.error(f"Error unregistering hooks for plugin {plugin_instance.manifest.name}: {e}")

class WorkflowEngine:
    """Visual workflow designer and automation engine"""
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.workflows = {}
        self.action_registry = {}
        self._register_default_actions()
    
    def _register_default_actions(self):
        """Register default workflow actions"""
        self.action_registry.update({
            'webhook': self._webhook_action,
            'email': self._email_action,
            'ai_enhance': self._ai_enhance_action,
            'database_insert': self._database_insert_action,
            'notification': self._notification_action
        })
    
    def register_workflow(self, name: str, triggers: List[str], actions: List[Dict[str, Any]]):
        """Register a new workflow"""
        workflow = {
            'name': name,
            'triggers': triggers,
            'actions': actions,
            'created_at': datetime.now(),
            'active': True
        }
        
        self.workflows[name] = workflow
        
        # Register triggers
        for trigger in triggers:
            self.event_bus.on(trigger, lambda data, ctx: self.execute_workflow(name, data))
        
        logger.info(f"Workflow {name} registered successfully")
    
    async def execute_workflow(self, workflow_name: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a workflow"""
        try:
            if workflow_name not in self.workflows:
                return {'error': f'Workflow {workflow_name} not found'}
            
            workflow = self.workflows[workflow_name]
            if not workflow['active']:
                return {'error': f'Workflow {workflow_name} is disabled'}
            
            results = []
            
            for action in workflow['actions']:
                action_type = action.get('type')
                if action_type not in self.action_registry:
                    logger.error(f"Unknown action type: {action_type}")
                    continue
                
                try:
                    action_handler = self.action_registry[action_type]
                    result = await action_handler(action, data)
                    results.append({
                        'action': action_type,
                        'result': result,
                        'success': True
                    })
                except Exception as e:
                    logger.error(f"Error executing action {action_type}: {e}")
                    results.append({
                        'action': action_type,
                        'error': str(e),
                        'success': False
                    })
            
            return {
                'workflow': workflow_name,
                'executed_at': datetime.now().isoformat(),
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_name}: {e}")
            return {'error': str(e)}
    
    async def _webhook_action(self, action: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute webhook action"""
        import aiohttp
        
        url = action.get('url')
        method = action.get('method', 'POST')
        headers = action.get('headers', {})
        payload = action.get('payload', data)
        
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, json=payload, headers=headers) as response:
                return {
                    'status': response.status,
                    'response': await response.text()
                }
    
    async def _email_action(self, action: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute email action"""
        # TODO: Implement email sending
        return {'status': 'Email sent (simulated)'}
    
    async def _ai_enhance_action(self, action: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AI enhancement action"""
        prompt = action.get('prompt', 'Enhance this data')
        # TODO: Call AI service
        return {'status': 'AI enhancement completed (simulated)'}
    
    async def _database_insert_action(self, action: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute database insert action"""
        # TODO: Implement database operations
        return {'status': 'Database insert completed (simulated)'}
    
    async def _notification_action(self, action: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute notification action"""
        # TODO: Implement notification system
        return {'status': 'Notification sent (simulated)'}

class PluginStore:
    """Plugin storage and management"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.collection = None
    
    async def initialize(self):
        """Initialize plugin store"""
        try:
            db = await self.db_client.get_database()
            self.collection = db.plugins
            logger.info("Plugin store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize plugin store: {e}")
            raise
    
    async def save_plugin(self, plugin_instance: PluginInstance):
        """Save plugin to database"""
        try:
            plugin_data = {
                'name': plugin_instance.manifest.name,
                'version': plugin_instance.manifest.version,
                'type': plugin_instance.manifest.plugin_type.value,
                'status': plugin_instance.status.value,
                'config': plugin_instance.config,
                'created_at': plugin_instance.created_at,
                'updated_at': datetime.now()
            }
            
            await self.collection.update_one(
                {'name': plugin_instance.manifest.name},
                {'$set': plugin_data},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error saving plugin {plugin_instance.manifest.name}: {e}")
    
    async def get_all_plugins(self) -> List[Dict[str, Any]]:
        """Get all plugins from database"""
        try:
            cursor = self.collection.find({})
            plugins = await cursor.to_list(length=None)
            return plugins
        except Exception as e:
            logger.error(f"Error getting plugins: {e}")
            return []
    
    async def remove_plugin(self, plugin_name: str):
        """Remove plugin from database"""
        try:
            await self.collection.delete_one({'name': plugin_name})
        except Exception as e:
            logger.error(f"Error removing plugin {plugin_name}: {e}")

# Example Plugin: Slack Integration
class SlackIntegrationPlugin:
    """Example Slack integration plugin"""
    
    def __init__(self):
        self.webhook_url = None
        self.channel = None
    
    async def initialize(self, config: Dict[str, Any]):
        """Initialize Slack plugin"""
        self.webhook_url = config.get('webhook_url')
        self.channel = config.get('channel', '#general')
    
    async def render(self, location: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Render Slack UI component"""
        if location == 'sidebar':
            return {
                'type': 'button',
                'label': 'Share to Slack',
                'action': 'share_to_slack',
                'context': context
            }
        return None
    
    async def share_to_slack(self, data: Dict[str, Any]):
        """Share content to Slack"""
        # TODO: Implement Slack API call
        pass
    
    @property
    def hooks(self):
        """Plugin hooks"""
        return {
            'project.created': self._notify_project_created,
            'deployment.completed': self._notify_deployment
        }
    
    async def _notify_project_created(self, data: Dict[str, Any], context: Dict[str, Any]):
        """Notify Slack when project is created"""
        # TODO: Send Slack notification
        pass
    
    async def _notify_deployment(self, data: Dict[str, Any], context: Dict[str, Any]):
        """Notify Slack when deployment completes"""
        # TODO: Send Slack notification
        pass

# Plugin manifest for Slack integration
SLACK_PLUGIN_MANIFEST = PluginManifest(
    name="slack",
    version="1.0.0",
    description="Slack integration for notifications and sharing",
    author="AI Tempo Team",
    plugin_type=PluginType.INTEGRATION,
    locations=["sidebar", "share-menu"],
    dependencies=[],
    permissions=["webhooks"],
    config_schema={
        "webhook_url": {"type": "string", "required": True},
        "channel": {"type": "string", "default": "#general"}
    },
    hooks=["project.created", "deployment.completed"]
)