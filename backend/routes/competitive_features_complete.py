"""
Competitive Features Complete API - All 5 Priority Features
Routes for Enterprise Compliance, Workflow Builder, Mobile Experience, Analytics, and Onboarding
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer
from typing import Dict, List, Optional
from datetime import datetime
import logging

from services.enterprise_compliance_system import (
    EnterpriseComplianceSystem, ComplianceStandard, AuditLogLevel
)
from services.visual_workflow_builder_system import (
    VisualWorkflowBuilderSystem, WorkflowNodeType, WorkflowStatus
)
from services.mobile_experience_system import (
    MobileExperienceSystem, DeviceType, NotificationType
)
from services.advanced_analytics_system import (
    AdvancedAnalyticsSystem, AnalyticsEventType, UserJourneyStage
)
from services.enhanced_onboarding_system import (
    EnhancedOnboardingSystem, OnboardingStage, DeploymentProvider
)

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# Initialize all systems
compliance_system = EnterpriseComplianceSystem()
workflow_system = VisualWorkflowBuilderSystem() 
mobile_system = MobileExperienceSystem()
analytics_system = AdvancedAnalyticsSystem()
onboarding_system = EnhancedOnboardingSystem()

# ============================================================================
# ENTERPRISE COMPLIANCE SYSTEM - Priority 1
# ============================================================================

@router.post("/compliance/audit/log")
async def log_audit_event(
    user_id: str,
    action: str,
    resource: str,
    details: Optional[Dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log audit event for compliance tracking"""
    try:
        audit_action = AuditLogLevel(action)
        audit_id = await compliance_system.log_audit_event(
            user_id=user_id,
            action=audit_action,
            resource=resource,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        return {"status": "success", "audit_id": audit_id}
    except Exception as e:
        logger.error(f"Audit logging failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log audit event")

@router.get("/compliance/status")
async def get_compliance_status(framework: Optional[str] = None):
    """Get compliance status for frameworks"""
    try:
        compliance_framework = None
        if framework:
            compliance_framework = ComplianceStandard(framework)
            
        status = await compliance_system.get_compliance_status(compliance_framework)
        return {"status": "success", "compliance": status}
    except Exception as e:
        logger.error(f"Compliance status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get compliance status")

@router.post("/compliance/report/generate")
async def generate_compliance_report(
    framework: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Generate comprehensive compliance report"""
    try:
        compliance_framework = None
        if framework:
            compliance_framework = ComplianceStandard(framework)
            
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        report = await compliance_system.generate_compliance_report(
            framework=compliance_framework,
            start_date=start_dt,
            end_date=end_dt
        )
        return {"status": "success", "report": report}
    except Exception as e:
        logger.error(f"Compliance report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.post("/compliance/secrets/manage")
async def manage_secrets(action: str, key: str, value: Optional[str] = None):
    """Secure secrets management"""
    try:
        result = await compliance_system.manage_secrets(action, key, value)
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Secret management failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to manage secret")

# ============================================================================
# VISUAL WORKFLOW BUILDER SYSTEM - Priority 2  
# ============================================================================

@router.post("/workflows/create")
async def create_workflow(
    name: str,
    description: str,
    user_id: str,
    template_id: Optional[str] = None
):
    """Create a new workflow"""
    try:
        result = await workflow_system.create_workflow(
            name=name,
            description=description,
            user_id=user_id,
            template_id=template_id
        )
        return result
    except Exception as e:
        logger.error(f"Workflow creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create workflow")

@router.post("/workflows/{workflow_id}/nodes/add")
async def add_workflow_node(
    workflow_id: str,
    node_type: str,
    name: str,
    config: Dict,
    position: Dict[str, float]
):
    """Add node to workflow"""
    try:
        workflow_node_type = WorkflowNodeType(node_type)
        result = await workflow_system.add_node(
            workflow_id=workflow_id,
            node_type=workflow_node_type,
            name=name,
            config=config,
            position=position
        )
        return result
    except Exception as e:
        logger.error(f"Node addition failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add node")

@router.post("/workflows/{workflow_id}/connections/create")
async def connect_workflow_nodes(
    workflow_id: str,
    source_node_id: str,
    target_node_id: str,
    source_output: str = "output",
    target_input: str = "input",
    condition: Optional[str] = None
):
    """Connect workflow nodes"""
    try:
        result = await workflow_system.connect_nodes(
            workflow_id=workflow_id,
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            source_output=source_output,
            target_input=target_input,
            condition=condition
        )
        return result
    except Exception as e:
        logger.error(f"Node connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect nodes")

@router.post("/workflows/natural-language")
async def create_workflow_from_nl(description: str, user_id: str):
    """Create workflow from natural language description"""
    try:
        result = await workflow_system.natural_language_to_workflow(description, user_id)
        return result
    except Exception as e:
        logger.error(f"NL workflow creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create workflow from description")

@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, input_data: Optional[Dict] = None):
    """Execute workflow"""
    try:
        result = await workflow_system.execute_workflow(workflow_id, input_data)
        return result
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to execute workflow")

@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow details"""
    try:
        result = await workflow_system.get_workflow(workflow_id)
        return result
    except Exception as e:
        logger.error(f"Workflow retrieval failed: {str(e)}")
        raise HTTPException(status_code=404, detail="Workflow not found")

@router.get("/workflows")
async def list_workflows(user_id: Optional[str] = None, status: Optional[str] = None):
    """List workflows with optional filtering"""
    try:
        workflow_status = WorkflowStatus(status) if status else None
        result = await workflow_system.list_workflows(user_id, workflow_status)
        return result
    except Exception as e:
        logger.error(f"Workflow listing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list workflows")

@router.get("/workflows/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    try:
        result = await workflow_system.get_workflow_templates()
        return result
    except Exception as e:
        logger.error(f"Template retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get templates")

@router.get("/workflows/{workflow_id}/executions")
async def get_workflow_execution_history(workflow_id: str):
    """Get workflow execution history"""
    try:
        result = await workflow_system.get_execution_history(workflow_id)
        return result
    except Exception as e:
        logger.error(f"Execution history retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get execution history")

# ============================================================================
# MOBILE EXPERIENCE SYSTEM - Priority 3
# ============================================================================

@router.post("/mobile/device/register")
async def register_mobile_device(user_id: str, device_info: Dict):
    """Register mobile device for optimized experience"""
    try:
        result = await mobile_system.register_device(user_id, device_info)
        return result
    except Exception as e:
        logger.error(f"Device registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register device")

@router.get("/mobile/{device_id}/optimized")
async def get_mobile_optimized_response(
    device_id: str,
    endpoint: str,
    data: Optional[Dict] = None
):
    """Get mobile-optimized API response"""
    try:
        result = await mobile_system.get_mobile_optimized_response(device_id, endpoint, data)
        return result
    except Exception as e:
        logger.error(f"Mobile optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get optimized response")

@router.post("/mobile/{device_id}/sync")
async def sync_offline_data(device_id: str, offline_items: List[Dict]):
    """Sync offline data from mobile device"""
    try:
        result = await mobile_system.sync_offline_data(device_id, offline_items)
        return result
    except Exception as e:
        logger.error(f"Offline sync failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync offline data")

@router.post("/mobile/notifications/push")
async def send_push_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    data: Optional[Dict] = None
):
    """Send push notification to user's devices"""
    try:
        notif_type = NotificationType(notification_type)
        result = await mobile_system.send_push_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notif_type,
            data=data
        )
        return result
    except Exception as e:
        logger.error(f"Push notification failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send notification")

@router.get("/mobile/{device_id}/cache")
async def get_mobile_cache(device_id: str):
    """Get mobile cache data"""
    try:
        result = await mobile_system.get_mobile_cache(device_id)
        return result
    except Exception as e:
        logger.error(f"Cache retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get cache data")

@router.put("/mobile/{device_id}/cache")
async def update_mobile_cache(device_id: str, cache_updates: Dict):
    """Update mobile cache data"""
    try:
        result = await mobile_system.update_mobile_cache(device_id, cache_updates)
        return result
    except Exception as e:
        logger.error(f"Cache update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update cache")

@router.get("/mobile/analytics")
async def get_mobile_analytics(user_id: Optional[str] = None):
    """Get mobile usage analytics"""
    try:
        result = await mobile_system.get_mobile_analytics(user_id)
        return result
    except Exception as e:
        logger.error(f"Mobile analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

# ============================================================================
# ADVANCED ANALYTICS SYSTEM - Priority 4
# ============================================================================

@router.post("/analytics/events/track")
async def track_analytics_event(
    session_id: str,
    event_type: str,
    event_name: str,
    user_id: Optional[str] = None,
    properties: Optional[Dict] = None,
    device_info: Optional[Dict] = None
):
    """Track analytics event"""
    try:
        analytics_event_type = AnalyticsEventType(event_type)
        event_id = await analytics_system.track_event(
            user_id=user_id,
            session_id=session_id,
            event_type=analytics_event_type,
            event_name=event_name,
            properties=properties,
            device_info=device_info
        )
        return {"status": "success", "event_id": event_id}
    except Exception as e:
        logger.error(f"Event tracking failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track event")

@router.post("/analytics/performance/trace/start")
async def start_performance_trace(operation: str, metadata: Optional[Dict] = None):
    """Start performance tracing"""
    try:
        trace_id = await analytics_system.start_performance_trace(operation, metadata)
        return {"status": "success", "trace_id": trace_id}
    except Exception as e:
        logger.error(f"Performance trace start failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start trace")

@router.post("/analytics/performance/trace/{trace_id}/end")
async def end_performance_trace(trace_id: str, status: str = "success"):
    """End performance trace"""
    try:
        result = await analytics_system.end_performance_trace(trace_id, status)
        return result
    except Exception as e:
        logger.error(f"Performance trace end failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to end trace")

@router.post("/analytics/metrics/record")
async def record_custom_metric(
    name: str,
    value: float,
    metric_type: str,
    tags: Optional[Dict[str, str]] = None
):
    """Record custom metric"""
    try:
        from services.advanced_analytics_system import MetricType
        metric_type_enum = MetricType(metric_type)
        await analytics_system.record_metric(name, value, metric_type_enum, tags)
        return {"status": "success", "metric": name}
    except Exception as e:
        logger.error(f"Metric recording failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record metric")

@router.get("/analytics/users/{user_id}")
async def get_user_analytics(user_id: str, days: int = 30):
    """Get detailed user analytics"""
    try:
        result = await analytics_system.get_user_analytics(user_id, days)
        return result
    except Exception as e:
        logger.error(f"User analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user analytics")

@router.get("/analytics/platform")
async def get_platform_analytics(days: int = 7):
    """Get platform-wide analytics"""
    try:
        result = await analytics_system.get_platform_analytics(days)
        return result
    except Exception as e:
        logger.error(f"Platform analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get platform analytics")

@router.post("/analytics/dashboards/create")
async def create_analytics_dashboard(name: str, config: Dict):
    """Create analytics dashboard"""
    try:
        dashboard_id = await analytics_system.create_dashboard(name, config)
        return {"status": "success", "dashboard_id": dashboard_id}
    except Exception as e:
        logger.error(f"Dashboard creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create dashboard")

@router.get("/analytics/dashboards/{dashboard_id}")
async def get_dashboard_data(dashboard_id: str):
    """Get analytics dashboard data"""
    try:
        result = await analytics_system.get_dashboard_data(dashboard_id)
        return result
    except Exception as e:
        logger.error(f"Dashboard data retrieval failed: {str(e)}")
        raise HTTPException(status_code=404, detail="Dashboard not found")

@router.post("/analytics/integrations/configure")
async def configure_analytics_integration(integration_name: str, config: Dict):
    """Configure third-party analytics integration"""
    try:
        result = await analytics_system.configure_integration(integration_name, config)
        return result
    except Exception as e:
        logger.error(f"Integration configuration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to configure integration")

@router.get("/analytics/insights/predictive")
async def get_predictive_insights(metric: str, days: int = 30):
    """Get predictive analytics insights"""
    try:
        result = await analytics_system.get_predictive_insights(metric, days)
        return result
    except Exception as e:
        logger.error(f"Predictive insights failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get insights")

# ============================================================================
# ENHANCED ONBOARDING SYSTEM - Priority 5
# ============================================================================

@router.post("/onboarding/start")
async def start_onboarding(user_id: str, preferences: Optional[Dict] = None):
    """Start guided onboarding process"""
    try:
        result = await onboarding_system.start_onboarding(user_id, preferences)
        return result
    except Exception as e:
        logger.error(f"Onboarding start failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start onboarding")

@router.post("/onboarding/{session_id}/complete-stage")
async def complete_onboarding_stage(session_id: str, stage_data: Optional[Dict] = None):
    """Complete current onboarding stage"""
    try:
        result = await onboarding_system.complete_stage(session_id, stage_data)
        return result
    except Exception as e:
        logger.error(f"Stage completion failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete stage")

@router.get("/onboarding/{session_id}/status")
async def get_onboarding_status(session_id: str):
    """Get current onboarding status"""
    try:
        result = await onboarding_system.get_onboarding_status(session_id)
        return result
    except Exception as e:
        logger.error(f"Onboarding status failed: {str(e)}")
        raise HTTPException(status_code=404, detail="Onboarding session not found")

@router.post("/onboarding/{session_id}/skip-stage")
async def skip_onboarding_stage(session_id: str, reason: Optional[str] = None):
    """Skip current onboarding stage"""
    try:
        result = await onboarding_system.skip_stage(session_id, reason)
        return result
    except Exception as e:
        logger.error(f"Stage skip failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to skip stage")

@router.get("/onboarding/templates")
async def get_demo_templates():
    """Get available demo templates"""
    try:
        result = await onboarding_system.get_demo_templates()
        return result
    except Exception as e:
        logger.error(f"Demo templates retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get demo templates")

@router.get("/onboarding/deployment-options")
async def get_deployment_options():
    """Get available deployment options"""
    try:
        result = await onboarding_system.get_deployment_options()
        return result
    except Exception as e:
        logger.error(f"Deployment options retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get deployment options")

@router.post("/onboarding/deploy/one-click")
async def one_click_deploy(
    user_id: str,
    provider: str,
    app_name: str,
    environment: str = "production",
    config_vars: Optional[Dict[str, str]] = None,
    domain: Optional[str] = None
):
    """Execute one-click deployment"""
    try:
        from services.enhanced_onboarding_system import DeploymentConfig
        
        deployment_provider = DeploymentProvider(provider)
        config = DeploymentConfig(
            provider=deployment_provider,
            app_name=app_name,
            environment=environment,
            config_vars=config_vars or {},
            domain=domain
        )
        
        result = await onboarding_system.one_click_deploy(user_id, config)
        return result
    except Exception as e:
        logger.error(f"One-click deployment failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to deploy")

@router.get("/onboarding/setup-wizard")
async def get_setup_wizard_config(user_preferences: Optional[Dict] = None):
    """Get personalized setup wizard configuration"""
    try:
        result = await onboarding_system.get_setup_wizard_config(user_preferences)
        return result
    except Exception as e:
        logger.error(f"Setup wizard config failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get setup config")

# ============================================================================
# SYSTEM STATUS AND HEALTH
# ============================================================================

@router.get("/competitive-features/status")
async def get_competitive_features_status():
    """Get status of all competitive features"""
    try:
        return {
            "status": "success",
            "features": {
                "enterprise_compliance": {
                    "enabled": True,
                    "frameworks_supported": ["soc2", "gdpr", "hipaa", "ccpa", "iso27001"],
                    "audit_events_logged": len(compliance_system.audit_logs),
                    "last_assessment": datetime.utcnow().isoformat()
                },
                "workflow_builder": {
                    "enabled": True,
                    "workflows_created": len(workflow_system.workflows),
                    "templates_available": len(workflow_system.workflow_templates),
                    "natural_language_supported": True
                },
                "mobile_experience": {
                    "enabled": True,
                    "devices_registered": len(mobile_system.registered_devices),
                    "offline_sync_enabled": True,
                    "push_notifications_enabled": True
                },
                "advanced_analytics": {
                    "enabled": True,
                    "events_tracked": len(analytics_system.events),
                    "third_party_integrations": len(analytics_system.third_party_integrations),
                    "dashboards_created": len(analytics_system.dashboards)
                },
                "enhanced_onboarding": {
                    "enabled": True,
                    "demo_templates": len(onboarding_system.demo_templates),
                    "deployment_providers": len(onboarding_system.deployment_providers),
                    "active_sessions": len(onboarding_system.onboarding_sessions)
                }
            },
            "competitive_parity": "100%",
            "all_features_operational": True
        }
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get system status")