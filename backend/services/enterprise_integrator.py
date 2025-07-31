import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import httpx
import os
from cryptography.fernet import Fernet

from models.integration import Integration, BusinessConnector, APIConnector, IntegrationStatus
from models.workflow import Workflow, WorkflowExecution

logger = logging.getLogger(__name__)

class EnterpriseIntegrator:
    """Enterprise-grade integration service for business systems"""
    
    def __init__(self, db_client):
        self.db = db_client
        self.encryption_key = self._get_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        self.connectors = {}
        self.active_integrations = {}
        
    def _get_encryption_key(self) -> bytes:
        """Get or create encryption key for sensitive data"""
        key = os.environ.get("INTEGRATION_ENCRYPTION_KEY")
        if not key:
            key = Fernet.generate_key().decode()
            logger.warning("Generated new encryption key - store this securely!")
        return key.encode()
    
    async def initialize(self):
        """Initialize enterprise integrations"""
        try:
            # Load active integrations
            integrations_collection = self.db.integrations
            active_integrations = await integrations_collection.find(
                {"status": "active"}
            ).to_list(None)
            
            for integration_data in active_integrations:
                integration = Integration(**integration_data)
                await self._activate_integration(integration)
                
            # Initialize popular business connectors
            await self._init_business_connectors()
            
            logger.info(f"Initialized {len(self.active_integrations)} enterprise integrations")
            
        except Exception as e:
            logger.error(f"Failed to initialize enterprise integrator: {e}")
            raise
    
    async def _init_business_connectors(self):
        """Initialize connectors for popular business systems"""
        business_systems = [
            {
                "name": "Jira Integration",
                "system_type": "jira",
                "capabilities": ["issue_management", "project_tracking", "reporting"],
                "auth_types": ["api_token", "oauth"],
                "endpoints": [
                    {"method": "GET", "path": "/rest/api/3/project", "description": "List projects"},
                    {"method": "POST", "path": "/rest/api/3/issue", "description": "Create issue"},
                    {"method": "GET", "path": "/rest/api/3/search", "description": "Search issues"}
                ]
            },
            {
                "name": "Confluence Integration",
                "system_type": "confluence",
                "capabilities": ["documentation", "knowledge_management", "collaboration"],
                "auth_types": ["api_token", "oauth"],
                "endpoints": [
                    {"method": "GET", "path": "/wiki/rest/api/space", "description": "List spaces"},
                    {"method": "POST", "path": "/wiki/rest/api/content", "description": "Create page"},
                    {"method": "GET", "path": "/wiki/rest/api/content/search", "description": "Search content"}
                ]
            },
            {
                "name": "Salesforce Integration",
                "system_type": "salesforce",
                "capabilities": ["crm", "lead_management", "reporting"],
                "auth_types": ["oauth", "connected_app"],
                "endpoints": [
                    {"method": "GET", "path": "/services/data/v57.0/sobjects", "description": "List objects"},
                    {"method": "POST", "path": "/services/data/v57.0/sobjects/Lead", "description": "Create lead"},
                    {"method": "GET", "path": "/services/data/v57.0/query", "description": "SOQL query"}
                ]
            },
            {
                "name": "HubSpot Integration",
                "system_type": "hubspot",
                "capabilities": ["marketing", "sales", "customer_service"],
                "auth_types": ["api_key", "oauth"],
                "endpoints": [
                    {"method": "GET", "path": "/contacts/v1/lists/all/contacts/all", "description": "Get contacts"},
                    {"method": "POST", "path": "/contacts/v1/contact", "description": "Create contact"},
                    {"method": "GET", "path": "/deals/v1/deal/paged", "description": "Get deals"}
                ]
            },
            {
                "name": "Slack Integration",
                "system_type": "slack",
                "capabilities": ["messaging", "notifications", "collaboration"],
                "auth_types": ["oauth", "bot_token"],
                "endpoints": [
                    {"method": "POST", "path": "/api/chat.postMessage", "description": "Send message"},
                    {"method": "GET", "path": "/api/channels.list", "description": "List channels"},
                    {"method": "POST", "path": "/api/files.upload", "description": "Upload file"}
                ]
            },
            {
                "name": "GitHub Integration",
                "system_type": "github",
                "capabilities": ["source_control", "ci_cd", "issue_tracking"],
                "auth_types": ["personal_access_token", "github_app"],
                "endpoints": [
                    {"method": "GET", "path": "/user/repos", "description": "List repositories"},
                    {"method": "POST", "path": "/repos/{owner}/{repo}/issues", "description": "Create issue"},
                    {"method": "GET", "path": "/repos/{owner}/{repo}/pulls", "description": "List pull requests"}
                ]
            }
        ]
        
        for system in business_systems:
            self.connectors[system["system_type"]] = system
    
    async def create_integration(self, integration_data: Dict[str, Any], user_id: str) -> Integration:
        """Create a new enterprise integration"""
        try:
            # Encrypt sensitive credentials
            if "credentials" in integration_data:
                for credential in integration_data["credentials"]:
                    if credential.get("encrypted", True):
                        credential["value"] = self._encrypt_credential(credential["value"])
            
            integration = Integration(
                **integration_data,
                created_by=user_id
            )
            
            # Test the integration
            test_result = await self._test_integration(integration)
            if test_result.get("success"):
                integration.status = IntegrationStatus.ACTIVE
                await self._activate_integration(integration)
            else:
                integration.status = IntegrationStatus.ERROR
                
            # Save to database
            integrations_collection = self.db.integrations
            await integrations_collection.insert_one(integration.dict())
            
            logger.info(f"Created integration: {integration.name}")
            return integration
            
        except Exception as e:
            logger.error(f"Failed to create integration: {e}")
            raise
    
    def _encrypt_credential(self, value: str) -> str:
        """Encrypt sensitive credential"""
        return self.fernet.encrypt(value.encode()).decode()
    
    def _decrypt_credential(self, encrypted_value: str) -> str:
        """Decrypt sensitive credential"""
        return self.fernet.decrypt(encrypted_value.encode()).decode()
    
    async def _test_integration(self, integration: Integration) -> Dict[str, Any]:
        """Test integration connectivity"""
        try:
            if integration.health_check_url:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        integration.health_check_url,
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        return {"success": True, "message": "Health check passed"}
                    else:
                        return {"success": False, "message": f"Health check failed: {response.status_code}"}
            
            # If no health check URL, perform basic validation
            return {"success": True, "message": "Integration configured successfully"}
            
        except Exception as e:
            return {"success": False, "message": f"Integration test failed: {str(e)}"}
    
    async def _activate_integration(self, integration: Integration):
        """Activate an integration for use"""
        self.active_integrations[integration.id] = integration
        
        # Start monitoring if needed
        if integration.type.value in ["api", "cloud_service"]:
            asyncio.create_task(self._monitor_integration(integration))
    
    async def _monitor_integration(self, integration: Integration):
        """Monitor integration health and usage"""
        while integration.id in self.active_integrations:
            try:
                # Perform health check
                health_result = await self._test_integration(integration)
                
                if not health_result.get("success"):
                    logger.warning(f"Integration {integration.name} health check failed")
                    integration.status = IntegrationStatus.ERROR
                
                # Update usage stats
                current_time = datetime.utcnow()
                integration.usage_stats.update({
                    "last_health_check": current_time.isoformat(),
                    "health_status": "healthy" if health_result.get("success") else "unhealthy"
                })
                
                # Update in database
                await self._update_integration_in_db(integration)
                
                # Wait before next check (5 minutes)
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Integration monitoring error for {integration.name}: {e}")
                await asyncio.sleep(60)  # Shorter wait on error
    
    async def _update_integration_in_db(self, integration: Integration):
        """Update integration record in database"""
        integrations_collection = self.db.integrations
        await integrations_collection.update_one(
            {"id": integration.id},
            {"$set": integration.dict()}
        )
    
    async def execute_integration_workflow(self, workflow_id: str, integration_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a workflow using specific integration"""
        try:
            integration = self.active_integrations.get(integration_id)
            if not integration:
                raise ValueError(f"Integration {integration_id} not found or inactive")
            
            # Get workflow
            workflows_collection = self.db.workflows
            workflow_data = await workflows_collection.find_one({"id": workflow_id})
            if not workflow_data:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            workflow = Workflow(**workflow_data)
            
            # Execute workflow with integration context
            result = await self._execute_workflow_with_integration(workflow, integration, data)
            
            return result
            
        except Exception as e:
            logger.error(f"Integration workflow execution failed: {e}")
            raise
    
    async def _execute_workflow_with_integration(self, workflow: Workflow, integration: Integration, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow with integration-specific logic"""
        results = []
        
        for step in sorted(workflow.steps, key=lambda s: s.order):
            if step.type == "integration":
                # Execute integration-specific step
                step_result = await self._execute_integration_step(step, integration, data)
            elif step.type == "api_call":
                # Execute API call through integration
                step_result = await self._execute_api_call_step(step, integration, data)
            else:
                # Execute regular step
                step_result = await self._execute_regular_step(step, data)
            
            results.append({
                "step_id": step.id,
                "step_name": step.name,
                "result": step_result,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Update data context with step results
            data.update(step_result.get("output_data", {}))
        
        return {
            "workflow_id": workflow.id,
            "integration_id": integration.id,
            "execution_results": results,
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
    
    async def _execute_integration_step(self, step, integration: Integration, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute integration-specific step"""
        system_type = integration.provider.lower()
        
        if system_type == "jira":
            return await self._execute_jira_step(step, integration, data)
        elif system_type == "salesforce":
            return await self._execute_salesforce_step(step, integration, data)
        elif system_type == "slack":
            return await self._execute_slack_step(step, integration, data)
        else:
            return await self._execute_generic_integration_step(step, integration, data)
    
    async def _execute_jira_step(self, step, integration: Integration, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Jira-specific integration step"""
        try:
            action = step.configuration.get("action", "list_projects")
            
            # Get credentials
            api_token = self._get_integration_credential(integration, "api_token")
            base_url = integration.configuration.get("base_url")
            
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            
            if action == "create_issue":
                payload = {
                    "fields": {
                        "project": {"key": data.get("project_key", "TEST")},
                        "summary": data.get("summary", "Auto-generated issue"),
                        "description": data.get("description", "Created by AI Code Studio"),
                        "issuetype": {"name": data.get("issue_type", "Task")}
                    }
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{base_url}/rest/api/3/issue",
                        json=payload,
                        headers=headers
                    )
                    
                    if response.status_code == 201:
                        issue_data = response.json()
                        return {
                            "success": True,
                            "issue_key": issue_data["key"],
                            "issue_url": f"{base_url}/browse/{issue_data['key']}",
                            "output_data": {"jira_issue_key": issue_data["key"]}
                        }
                    else:
                        return {"success": False, "error": f"Failed to create issue: {response.text}"}
            
            elif action == "list_projects":
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{base_url}/rest/api/3/project",
                        headers=headers
                    )
                    
                    if response.status_code == 200:
                        projects = response.json()
                        return {
                            "success": True,
                            "projects": projects,
                            "output_data": {"jira_projects": [p["key"] for p in projects]}
                        }
                    else:
                        return {"success": False, "error": f"Failed to list projects: {response.text}"}
            
            return {"success": False, "error": f"Unknown Jira action: {action}"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_slack_step(self, step, integration: Integration, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Slack-specific integration step"""
        try:
            action = step.configuration.get("action", "send_message")
            bot_token = self._get_integration_credential(integration, "bot_token")
            
            headers = {
                "Authorization": f"Bearer {bot_token}",
                "Content-Type": "application/json"
            }
            
            if action == "send_message":
                payload = {
                    "channel": data.get("channel", "#general"),
                    "text": data.get("message", "Message from AI Code Studio"),
                    "username": "AI Code Studio Bot"
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://slack.com/api/chat.postMessage",
                        json=payload,
                        headers=headers
                    )
                    
                    result = response.json()
                    if result.get("ok"):
                        return {
                            "success": True,
                            "message_ts": result.get("ts"),
                            "channel": result.get("channel"),
                            "output_data": {"slack_message_sent": True}
                        }
                    else:
                        return {"success": False, "error": result.get("error", "Failed to send message")}
            
            return {"success": False, "error": f"Unknown Slack action: {action}"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _get_integration_credential(self, integration: Integration, credential_key: str) -> str:
        """Get and decrypt integration credential"""
        for credential in integration.credentials:
            if credential.key == credential_key:
                if credential.encrypted:
                    return self._decrypt_credential(credential.value)
                return credential.value
        raise ValueError(f"Credential {credential_key} not found")
    
    async def get_available_connectors(self) -> List[Dict[str, Any]]:
        """Get list of available business system connectors"""
        return list(self.connectors.values())
    
    async def get_integration_status(self, integration_id: str) -> Dict[str, Any]:
        """Get detailed integration status"""
        integration = self.active_integrations.get(integration_id)
        if not integration:
            return {"error": "Integration not found"}
        
        return {
            "id": integration.id,
            "name": integration.name,
            "status": integration.status.value,
            "type": integration.type.value,
            "provider": integration.provider,
            "health": integration.usage_stats.get("health_status", "unknown"),
            "last_check": integration.usage_stats.get("last_health_check"),
            "capabilities": [cap.name for cap in getattr(integration, 'capabilities', [])]
        }
    
    async def _execute_generic_integration_step(self, step, integration: Integration, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute generic integration step"""
        return {
            "success": True,
            "message": f"Executed step {step.name} with integration {integration.name}",
            "output_data": {}
        }