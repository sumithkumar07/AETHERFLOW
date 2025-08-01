from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from models.user import get_current_user
from services.plugin_manager import PluginManager, PluginManifest, PluginType

router = APIRouter()
logger = logging.getLogger(__name__)

# Global plugin manager instance
plugin_manager: Optional[PluginManager] = None

def set_plugin_manager(manager_instance: PluginManager):
    global plugin_manager
    plugin_manager = manager_instance

@router.get("/")
async def get_installed_plugins(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get list of installed plugins"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        plugins_info = []
        for plugin_name, plugin_instance in plugin_manager.plugins.items():
            plugins_info.append({
                "name": plugin_instance.manifest.name,
                "version": plugin_instance.manifest.version,
                "description": plugin_instance.manifest.description,
                "author": plugin_instance.manifest.author,
                "type": plugin_instance.manifest.plugin_type.value,
                "status": plugin_instance.status.value,
                "locations": plugin_instance.manifest.locations,
                "created_at": plugin_instance.created_at.isoformat(),
                "last_error": plugin_instance.last_error
            })
        
        return {
            "success": True,
            "plugins": plugins_info,
            "total_plugins": len(plugins_info),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting installed plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/install")
async def install_plugin(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Install a new plugin"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        # For this example, we'll create a mock plugin
        plugin_name = request.get("name", "")
        plugin_type = request.get("type", "integration")
        config = request.get("config", {})
        
        if not plugin_name:
            raise HTTPException(status_code=400, detail="Plugin name is required")
        
        # Create manifest for the new plugin
        manifest = PluginManifest(
            name=plugin_name,
            version="1.0.0",
            description=f"Dynamically installed {plugin_name} plugin",
            author="AI Tempo Platform",
            plugin_type=PluginType(plugin_type),
            locations=["sidebar", "toolbar"],
            dependencies=[],
            permissions=["api_access"],
            config_schema={},
            hooks=[]
        )
        
        # Create a mock plugin module
        class MockPlugin:
            async def initialize(self, config):
                pass
            
            async def render(self, location, context):
                return {
                    "type": "button",
                    "label": f"{plugin_name} Button",
                    "action": f"trigger_{plugin_name.lower()}"
                }
        
        plugin_module = MockPlugin()
        
        # Register the plugin
        success = await plugin_manager.register_plugin(manifest, plugin_module, config)
        
        if success:
            return {
                "success": True,
                "message": f"Plugin {plugin_name} installed successfully",
                "plugin": {
                    "name": plugin_name,
                    "type": plugin_type,
                    "status": "active"
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to install plugin")
        
    except Exception as e:
        logger.error(f"Error installing plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{plugin_name}")
async def uninstall_plugin(
    plugin_name: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Uninstall a plugin"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        success = await plugin_manager.unregister_plugin(plugin_name)
        
        if success:
            return {
                "success": True,
                "message": f"Plugin {plugin_name} uninstalled successfully",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
    except Exception as e:
        logger.error(f"Error uninstalling plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ui/{location}")
async def get_plugin_ui(
    location: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get UI components for a specific location"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        context = {
            "user_id": current_user["user_id"],
            "location": location
        }
        
        ui_components = await plugin_manager.get_plugin_ui(location, context)
        
        return {
            "success": True,
            "location": location,
            "components": ui_components,
            "count": len(ui_components),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting plugin UI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows/create")
async def create_workflow(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new workflow"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        name = request.get("name", "")
        triggers = request.get("triggers", [])
        actions = request.get("actions", [])
        
        if not name or not triggers or not actions:
            raise HTTPException(status_code=400, detail="Name, triggers, and actions are required")
        
        # Register workflow
        plugin_manager.workflow_engine.register_workflow(name, triggers, actions)
        
        return {
            "success": True,
            "message": f"Workflow '{name}' created successfully",
            "workflow": {
                "name": name,
                "triggers": triggers,
                "actions": actions,
                "created_at": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows/{workflow_name}/execute")
async def execute_workflow(
    workflow_name: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Execute a workflow manually"""
    try:
        if not plugin_manager:
            raise HTTPException(status_code=500, detail="Plugin manager not initialized")
        
        data = request.get("data", {})
        data["user_id"] = current_user["user_id"]
        
        result = await plugin_manager.trigger_workflow(workflow_name, data)
        
        return {
            "success": True,
            "workflow": workflow_name,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marketplace")
async def get_plugin_marketplace(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get available plugins from marketplace"""
    try:
        # Mock marketplace data
        marketplace_plugins = [
            {
                "name": "slack",
                "version": "1.2.0",
                "description": "Slack integration for notifications and sharing",
                "author": "AI Tempo Team",
                "type": "integration",
                "rating": 4.8,
                "downloads": 15420,
                "price": "free",
                "features": ["Real-time notifications", "Project sharing", "Team collaboration"],
                "screenshots": ["https://example.com/slack1.png", "https://example.com/slack2.png"]
            },
            {
                "name": "github",
                "version": "2.0.1",
                "description": "GitHub integration for repository management",
                "author": "AI Tempo Team",
                "type": "integration",
                "rating": 4.9,
                "downloads": 28350,
                "price": "free",
                "features": ["Repository sync", "Issue tracking", "Pull request management"],
                "screenshots": ["https://example.com/github1.png", "https://example.com/github2.png"]
            },
            {
                "name": "analytics_pro",
                "version": "1.0.0",
                "description": "Advanced analytics and reporting plugin",
                "author": "Analytics Corp",
                "type": "analytics",
                "rating": 4.5,
                "downloads": 8920,
                "price": "$9.99/month",
                "features": ["Advanced metrics", "Custom dashboards", "Export reports"],
                "screenshots": ["https://example.com/analytics1.png", "https://example.com/analytics2.png"]
            }
        ]
        
        return {
            "success": True,
            "plugins": marketplace_plugins,
            "total_available": len(marketplace_plugins),
            "categories": ["integration", "analytics", "ui_component", "workflow"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting plugin marketplace: {e}")
        raise HTTPException(status_code=500, detail=str(e))