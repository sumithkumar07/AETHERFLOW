from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
project_migrator_service = None

def set_project_migrator_service(service):
    global project_migrator_service
    project_migrator_service = service

router = APIRouter()

class MigrationFeasibilityRequest(BaseModel):
    project_id: str
    source_tech: str
    target_tech: str

class MigrationPlanRequest(BaseModel):
    project_id: str
    source_tech: str
    target_tech: str
    project_data: Dict[str, Any]

class CodeTransformationRequest(BaseModel):
    source_code: str
    source_lang: str
    target_lang: str

class DependencyMigrationRequest(BaseModel):
    dependencies: List[str]
    source_ecosystem: str
    target_ecosystem: str

class MigrationValidationRequest(BaseModel):
    migration_id: str
    migrated_code: Dict[str, str]

class ModernizationRequest(BaseModel):
    project_data: Dict[str, Any]

@router.post("/analyze-feasibility")
async def analyze_migration_feasibility(request: MigrationFeasibilityRequest):
    """Analyze feasibility of migrating from source to target technology"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        analysis = await project_migrator_service.analyze_migration_feasibility(
            request.project_id,
            request.source_tech,
            request.target_tech
        )
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-plan")
async def generate_migration_plan(request: MigrationPlanRequest):
    """Generate detailed migration plan"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        plan = await project_migrator_service.generate_migration_plan(
            request.project_id,
            request.source_tech,
            request.target_tech,
            request.project_data
        )
        
        return {
            "success": True,
            "data": plan,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transform-code")
async def execute_code_transformation(request: CodeTransformationRequest):
    """Execute code transformation from source to target language"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        transformation = await project_migrator_service.execute_code_transformation(
            request.source_code,
            request.source_lang,
            request.target_lang
        )
        
        return {
            "success": True,
            "data": transformation,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/migrate-dependencies")
async def migrate_dependencies(request: DependencyMigrationRequest):
    """Migrate dependencies from source to target ecosystem"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        migration = await project_migrator_service.migrate_dependencies(
            request.dependencies,
            request.source_ecosystem,
            request.target_ecosystem
        )
        
        return {
            "success": True,
            "data": migration,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-migration")
async def validate_migration(request: MigrationValidationRequest):
    """Validate migrated code for correctness and completeness"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        validation = await project_migrator_service.validate_migration(
            request.migration_id,
            request.migrated_code
        )
        
        return {
            "success": True,
            "data": validation,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-modernization")
async def suggest_modernization_opportunities(request: ModernizationRequest):
    """Suggest modernization opportunities for the project"""
    try:
        if not project_migrator_service:
            raise HTTPException(status_code=503, detail="Project Migrator service not available")
        
        opportunities = await project_migrator_service.suggest_modernization_opportunities(
            request.project_data
        )
        
        return {
            "success": True,
            "data": {"opportunities": opportunities},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for project migrator service"""
    return {
        "service": "Project Migrator",
        "status": "healthy" if project_migrator_service else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }