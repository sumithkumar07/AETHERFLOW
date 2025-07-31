from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime

from models.integration import Integration, IntegrationCreate, BusinessConnector
from models.workflow import Workflow, WorkflowExecution, BusinessProcess
from models.compliance import CompliancePolicy, ComplianceViolation, AuditLog
from models.user import User
from services.enterprise_integrator import EnterpriseIntegrator
from services.business_automation import BusinessAutomationEngine
from services.compliance_engine import ComplianceEngine
from routes.auth import get_current_user
from models.database import get_database

router = APIRouter()

# Integration Management Endpoints
@router.post("/integrations", response_model=Integration)
async def create_integration(
    integration_data: IntegrationCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new enterprise integration"""
    try:
        integrator = EnterpriseIntegrator(db)
        await integrator.initialize()
        
        integration = await integrator.create_integration(
            integration_data.dict(),
            current_user.id
        )
        
        return integration
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/integrations")
async def list_integrations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """List user's integrations"""
    try:
        integrations_collection = db.integrations
        integrations_data = await integrations_collection.find(
            {"created_by": current_user.id}
        ).to_list(None)
        
        return [Integration(**integration_data) for integration_data in integrations_data]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/integrations/{integration_id}/status")
async def get_integration_status(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get integration status and health"""
    try:
        integrator = EnterpriseIntegrator(db)
        await integrator.initialize()
        
        status = await integrator.get_integration_status(integration_id)
        return status
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/integrations/connectors")
async def get_available_connectors(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get list of available business system connectors"""
    try:
        integrator = EnterpriseIntegrator(db)
        await integrator.initialize()
        
        connectors = await integrator.get_available_connectors()
        return connectors
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/integrations/{integration_id}/test")
async def test_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Test integration connectivity"""
    try:
        integrator = EnterpriseIntegrator(db)
        await integrator.initialize()
        
        # Get integration
        integrations_collection = db.integrations
        integration_data = await integrations_collection.find_one({
            "id": integration_id,
            "created_by": current_user.id
        })
        
        if not integration_data:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        integration = Integration(**integration_data)
        test_result = await integrator._test_integration(integration)
        
        return test_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Business Process Automation Endpoints
@router.post("/automation/processes")
async def create_business_process(
    process_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new automated business process"""
    try:
        automation_engine = BusinessAutomationEngine(db)
        await automation_engine.initialize()
        
        process = await automation_engine.create_business_process(
            process_data,
            current_user.id
        )
        
        return process.dict()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/automation/workflows/execute")
async def execute_automation_workflow(
    workflow_request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Execute an automated workflow"""
    try:
        automation_engine = BusinessAutomationEngine(db)
        await automation_engine.initialize()
        
        workflow_id = workflow_request.get("workflow_id")
        integration_id = workflow_request.get("integration_id")
        data = workflow_request.get("data", {})
        
        if not workflow_id:
            raise HTTPException(status_code=400, detail="Workflow ID is required")
        
        # Queue workflow execution
        background_tasks.add_task(
            execute_workflow_background,
            automation_engine,
            workflow_id,
            integration_id,
            data,
            current_user.id
        )
        
        return {
            "message": "Workflow execution queued",
            "workflow_id": workflow_id,
            "status": "queued"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def execute_workflow_background(
    automation_engine: BusinessAutomationEngine,
    workflow_id: str,
    integration_id: str,
    data: Dict[str, Any],
    user_id: str
):
    """Background workflow execution"""
    try:
        if integration_id:
            result = await automation_engine.integrator.execute_integration_workflow(
                workflow_id, integration_id, data
            )
        else:
            # Execute workflow without specific integration
            result = {"message": "Workflow executed successfully"}
        
        # Log result (could save to database)
        print(f"Workflow {workflow_id} executed successfully: {result}")
        
    except Exception as e:
        print(f"Workflow {workflow_id} execution failed: {e}")

@router.post("/automation/development")
async def automate_development_workflow(
    project_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Automate entire development workflow"""
    try:
        automation_engine = BusinessAutomationEngine(db)
        await automation_engine.initialize()
        
        # Queue development automation
        background_tasks.add_task(
            automate_development_background,
            automation_engine,
            project_data,
            current_user.id
        )
        
        return {
            "message": "Development workflow automation started",
            "estimated_duration": "30-60 minutes",
            "status": "started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def automate_development_background(
    automation_engine: BusinessAutomationEngine,
    project_data: Dict[str, Any],
    user_id: str
):
    """Background development automation"""
    try:
        result = await automation_engine.automate_development_workflow(
            project_data, user_id
        )
        
        # Save result to database
        results_collection = automation_engine.db.automation_results
        await results_collection.insert_one({
            "user_id": user_id,
            "type": "development_automation",
            "project_data": project_data,
            "result": result,
            "created_at": datetime.utcnow()
        })
        
    except Exception as e:
        print(f"Development automation failed: {e}")

@router.get("/automation/dashboard")
async def get_automation_dashboard(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get automation dashboard data"""
    try:
        automation_engine = BusinessAutomationEngine(db)
        await automation_engine.initialize()
        
        dashboard_data = await automation_engine.get_automation_dashboard()
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/automation/emergency")
async def trigger_emergency_automation(
    emergency_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Trigger emergency automation procedures"""
    try:
        automation_engine = BusinessAutomationEngine(db)
        await automation_engine.initialize()
        
        emergency_type = emergency_request.get("type")
        context = emergency_request.get("context", {})
        
        if not emergency_type:
            raise HTTPException(status_code=400, detail="Emergency type is required")
        
        result = await automation_engine.trigger_emergency_automation(
            emergency_type, context
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Compliance and Safety Endpoints
@router.post("/compliance/policies")
async def create_compliance_policy(
    policy_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new compliance policy"""
    try:
        compliance_engine = ComplianceEngine(db)
        await compliance_engine.initialize()
        
        policy = await compliance_engine.create_compliance_policy(
            policy_data, current_user.id
        )
        
        return policy.dict()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/compliance/validate/content")
async def validate_content(
    validation_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Validate content against compliance policies"""
    try:
        compliance_engine = ComplianceEngine(db)
        await compliance_engine.initialize()
        
        content = validation_request.get("content", "")
        context = validation_request.get("context", {})
        context["user_id"] = current_user.id
        
        validation_result = await compliance_engine.validate_content(content, context)
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/compliance/validate/code")
async def validate_code(
    validation_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Validate code against security and compliance policies"""
    try:
        compliance_engine = ComplianceEngine(db)
        await compliance_engine.initialize()
        
        code = validation_request.get("code", "")
        language = validation_request.get("language", "javascript")
        context = validation_request.get("context", {})
        context["user_id"] = current_user.id
        
        validation_result = await compliance_engine.validate_code(code, language, context)
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compliance/dashboard")
async def get_compliance_dashboard(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get compliance dashboard data"""
    try:
        compliance_engine = ComplianceEngine(db)
        await compliance_engine.initialize()
        
        dashboard_data = await compliance_engine.get_compliance_dashboard()
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compliance/violations")
async def get_compliance_violations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
    limit: int = 50,
    offset: int = 0
):
    """Get compliance violations"""
    try:
        violations_collection = db.compliance_violations
        violations_data = await violations_collection.find().sort(
            "detected_at", -1
        ).skip(offset).limit(limit).to_list(limit)
        
        return [ComplianceViolation(**violation_data) for violation_data in violations_data]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compliance/audit-logs")
async def get_audit_logs(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
    limit: int = 100,
    offset: int = 0
):
    """Get audit logs"""
    try:
        audit_collection = db.audit_logs
        audit_data = await audit_collection.find(
            {"user_id": current_user.id}
        ).sort("timestamp", -1).skip(offset).limit(limit).to_list(limit)
        
        return [AuditLog(**log_data) for log_data in audit_data]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Enhanced AI Endpoints
@router.post("/ai/enhanced/chat")
async def enhanced_ai_chat(
    chat_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Enhanced AI chat with compliance and multi-provider support"""
    try:
        from services.enhanced_ai_service import EnhancedAIService
        
        ai_service = EnhancedAIService(db)
        await ai_service.initialize()
        
        content = chat_request.get("content", "")
        model = chat_request.get("model", "gpt-4o-mini")
        context = chat_request.get("context", {})
        context["user_id"] = current_user.id
        
        response = await ai_service.process_message_enhanced(
            content=content,
            model=model,
            context=context,
            compliance_check=True
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ai/enhanced/code")
async def enhanced_code_generation(
    code_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Enhanced code generation with security validation"""
    try:
        from services.enhanced_ai_service import EnhancedAIService
        
        ai_service = EnhancedAIService(db)
        await ai_service.initialize()
        
        requirements = code_request.get("requirements", "")
        language = code_request.get("language", "javascript")
        framework = code_request.get("framework")
        model = code_request.get("model", "gpt-4o")
        context = code_request.get("context", {})
        context["user_id"] = current_user.id
        
        response = await ai_service.generate_code_enhanced(
            requirements=requirements,
            language=language,
            framework=framework,
            model=model,
            context=context
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ai/metrics")
async def get_ai_metrics(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get AI service metrics and dashboard data"""
    try:
        from services.enhanced_ai_service import EnhancedAIService
        
        ai_service = EnhancedAIService(db)
        await ai_service.initialize()
        
        metrics = await ai_service.get_ai_metrics_dashboard()
        return metrics
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))