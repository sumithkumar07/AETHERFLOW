from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import base64
import json

router = APIRouter()

# Global service instance (will be set by main.py)  
visual_programming_service = None

def set_visual_programming_service(service):
    global visual_programming_service
    visual_programming_service = service

# Pydantic models
class DiagramAnalysisRequest(BaseModel):
    diagram_data: Dict[str, Any]
    diagram_type: Optional[str] = None

class FlowchartCodeGenRequest(BaseModel):
    flowchart_data: Dict[str, Any]
    target_language: str = "python"

class WireframeUIGenRequest(BaseModel):
    wireframe_data: Dict[str, Any]
    framework: str = "react"

class SequenceAPIGenRequest(BaseModel):
    sequence_data: Dict[str, Any] 
    api_style: str = "rest"

class SketchConversionRequest(BaseModel):
    sketch_data: Dict[str, Any]
    component_type: str = "react"

class ERDSchemaGenRequest(BaseModel):
    erd_data: Dict[str, Any]
    database_type: str = "postgresql"

@router.post("/analyze-diagram")
async def analyze_diagram(request: DiagramAnalysisRequest):
    """Analyze visual diagram and extract programmable elements"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.analyze_diagram(request.diagram_data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/generate-code-from-flowchart")
async def generate_code_from_flowchart(request: FlowchartCodeGenRequest):
    """Generate executable code from flowchart diagram"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.generate_code_from_flowchart(
        request.flowchart_data, request.target_language
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/generate-ui-from-wireframe")
async def generate_ui_from_wireframe(request: WireframeUIGenRequest):
    """Generate responsive UI code from wireframe or mockup"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.generate_ui_from_wireframe(
        request.wireframe_data, request.framework
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/generate-api-from-sequence")
async def generate_api_from_sequence(request: SequenceAPIGenRequest):
    """Generate API endpoints from sequence diagram"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.generate_api_from_sequence_diagram(
        request.sequence_data, request.api_style
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/convert-sketch-to-component")
async def convert_sketch_to_component(request: SketchConversionRequest):
    """Convert hand-drawn sketches to code components using AI"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.convert_sketch_to_component(
        request.sketch_data, request.component_type
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/generate-database-schema")
async def generate_database_schema(request: ERDSchemaGenRequest):
    """Generate complete database schema from Entity Relationship Diagram"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    result = await visual_programming_service.generate_database_schema(
        request.erd_data, request.database_type
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/upload-diagram")
async def upload_diagram_image(file: UploadFile = File(...), diagram_type: Optional[str] = None):
    """Upload diagram image for analysis"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image data
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Create diagram data structure
        diagram_data = {
            "filename": file.filename,
            "content_type": file.content_type,
            "image_data": image_base64,
            "metadata": {
                "type": diagram_type,
                "upload_method": "file_upload"
            }
        }
        
        # Analyze the uploaded diagram
        result = await visual_programming_service.analyze_diagram(diagram_data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "upload_success": True,
            "filename": file.filename,
            "analysis": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@router.get("/supported-diagram-types")
async def get_supported_diagram_types():
    """Get list of supported diagram types and their capabilities"""
    return {
        "supported_types": [
            {
                "type": "flowchart",
                "description": "Process flow diagrams for code generation",
                "capabilities": ["code_generation", "logic_extraction", "test_case_generation"],
                "supported_languages": ["python", "javascript", "java", "cpp"],
                "complexity_limit": "high"
            },
            {
                "type": "wireframe",
                "description": "UI mockups and wireframes for component generation",
                "capabilities": ["ui_generation", "responsive_design", "accessibility_features"],
                "supported_frameworks": ["react", "vue", "angular", "html"],
                "complexity_limit": "medium"
            },
            {
                "type": "sequence_diagram",
                "description": "Interaction diagrams for API generation",
                "capabilities": ["api_generation", "endpoint_creation", "documentation"],
                "supported_api_styles": ["rest", "graphql", "grpc"],
                "complexity_limit": "high"
            },
            {
                "type": "sketch",
                "description": "Hand-drawn UI sketches for component conversion",
                "capabilities": ["sketch_recognition", "component_generation", "styling"],
                "supported_formats": ["react", "vue", "html"],
                "complexity_limit": "low"
            },
            {
                "type": "entity_relationship",
                "description": "Database diagrams for schema generation",
                "capabilities": ["schema_generation", "migration_scripts", "orm_models"],
                "supported_databases": ["postgresql", "mysql", "mongodb", "sqlite"],
                "complexity_limit": "high"
            }
        ],
        "file_formats": ["png", "jpg", "jpeg", "svg", "pdf"],
        "max_file_size": "10MB",
        "processing_time": "5-30 seconds depending on complexity"
    }

@router.get("/diagram/{diagram_id}")
async def get_diagram_analysis(diagram_id: str):
    """Get cached diagram analysis by ID"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    if diagram_id not in visual_programming_service.diagram_cache:
        raise HTTPException(status_code=404, detail="Diagram analysis not found")
    
    return visual_programming_service.diagram_cache[diagram_id]

@router.get("/examples")
async def get_diagram_examples():
    """Get example diagrams for each supported type"""
    return {
        "examples": [
            {
                "type": "flowchart",
                "title": "Simple Calculator Flow",
                "description": "Basic flowchart showing calculator logic",
                "example_data": {
                    "elements": [
                        {"id": "start", "type": "start", "text": "Start", "position": {"x": 100, "y": 50}},
                        {"id": "input1", "type": "data", "text": "Input first number", "position": {"x": 100, "y": 120}},
                        {"id": "input2", "type": "data", "text": "Input second number", "position": {"x": 100, "y": 190}},
                        {"id": "process", "type": "process", "text": "Calculate sum", "position": {"x": 100, "y": 260}},
                        {"id": "output", "type": "data", "text": "Display result", "position": {"x": 100, "y": 330}},
                        {"id": "end", "type": "end", "text": "End", "position": {"x": 100, "y": 400}}
                    ]
                },
                "expected_output": "Python function with input, calculation, and output"
            },
            {
                "type": "wireframe",
                "title": "Login Page Wireframe",
                "description": "Simple login form wireframe",
                "example_data": {
                    "elements": [
                        {"id": "header", "type": "text", "text": "Login", "position": {"x": 200, "y": 50}},
                        {"id": "email", "type": "input", "text": "Email input", "position": {"x": 100, "y": 120}},
                        {"id": "password", "type": "input", "text": "Password input", "position": {"x": 100, "y": 180}},
                        {"id": "button", "type": "button", "text": "Login Button", "position": {"x": 150, "y": 240}}
                    ]
                },
                "expected_output": "React component with form elements and styling"
            }
        ]
    }

@router.post("/batch-process")
async def batch_process_diagrams(diagrams: List[DiagramAnalysisRequest]):
    """Process multiple diagrams in batch"""
    if not visual_programming_service:
        raise HTTPException(status_code=503, detail="Visual Programming service not available")
    
    if len(diagrams) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 diagrams per batch")
    
    results = []
    for i, diagram_request in enumerate(diagrams):
        try:
            result = await visual_programming_service.analyze_diagram(diagram_request.diagram_data)
            results.append({
                "index": i,
                "success": True,
                "result": result
            })
        except Exception as e:
            results.append({
                "index": i,
                "success": False,
                "error": str(e)
            })
    
    return {
        "batch_id": f"batch_{len(results)}_{hash(str(diagrams))}",
        "total_processed": len(results),
        "successful": len([r for r in results if r["success"]]),
        "failed": len([r for r in results if not r["success"]]),
        "results": results
    }