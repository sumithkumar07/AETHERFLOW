"""
Enhanced Database Models for New Features
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class SecuritySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CodeQualityLevel(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class AnalysisType(str, Enum):
    SECURITY = "security"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    DOCUMENTATION = "documentation"

class SearchCategory(str, Enum):
    FILE = "file"
    FUNCTION = "function"
    CLASS = "class"
    VARIABLE = "variable"
    COMMENT = "comment"
    DOCUMENTATION = "documentation"

class PipelineStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Code Review Models
class CodeIssue(BaseModel):
    id: str = Field(..., description="Unique issue identifier")
    type: AnalysisType
    severity: SecuritySeverity
    rule: str = Field(..., description="Rule that triggered this issue")
    message: str = Field(..., description="Human-readable issue description")
    line_number: int = Field(..., description="Line number where issue occurs")
    column_number: Optional[int] = Field(None, description="Column number where issue occurs")
    code_snippet: str = Field(..., description="Code snippet showing the issue")
    recommendation: str = Field(..., description="Recommended fix for the issue")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level of the detection")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CodeAnalysisResult(BaseModel):
    id: str = Field(..., description="Unique analysis result identifier")
    file_path: str = Field(..., description="Path to analyzed file")
    language: str = Field(..., description="Programming language of the file")
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Issues found
    security_issues: List[CodeIssue] = Field(default_factory=list)
    quality_issues: List[CodeIssue] = Field(default_factory=list)
    performance_issues: List[CodeIssue] = Field(default_factory=list)
    
    # Metrics
    lines_of_code: int = Field(..., ge=0)
    complexity_score: float = Field(..., ge=0.0)
    maintainability_index: float = Field(..., ge=0.0, le=100.0)
    test_coverage: Optional[float] = Field(None, ge=0.0, le=100.0)
    
    # Overall scores
    security_score: float = Field(..., ge=0.0, le=100.0)
    quality_score: float = Field(..., ge=0.0, le=100.0)
    overall_score: float = Field(..., ge=0.0, le=100.0)
    
    # Suggestions
    suggestions: List[str] = Field(default_factory=list)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Code Generation Models
class CodeGenerationRequest(BaseModel):
    language: str = Field(..., description="Target programming language")
    framework: str = Field(default="general", description="Framework to use")
    code_type: str = Field(default="function", description="Type of code to generate")
    description: str = Field(..., description="Description of what the code should do")
    requirements: List[str] = Field(default_factory=list, description="Specific requirements")
    style_preferences: Dict[str, Any] = Field(default_factory=dict)
    include_tests: bool = Field(default=True, description="Whether to generate tests")
    include_docs: bool = Field(default=True, description="Whether to generate documentation")

class GeneratedCode(BaseModel):
    id: str = Field(..., description="Unique generation identifier")
    request: CodeGenerationRequest
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Generated content
    main_code: str = Field(..., description="Main generated code")
    test_code: Optional[str] = Field(None, description="Generated test code")
    documentation: Optional[str] = Field(None, description="Generated documentation")
    
    # Metadata
    estimated_complexity: float = Field(..., ge=0.0)
    best_practices_applied: List[str] = Field(default_factory=list)
    optimization_suggestions: List[str] = Field(default_factory=list)
    
    # Quality metrics
    estimated_quality_score: float = Field(..., ge=0.0, le=100.0)
    estimated_performance: str = Field(default="medium")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# API Documentation Models
class APIParameter(BaseModel):
    name: str = Field(..., description="Parameter name")
    type: str = Field(..., description="Parameter type")
    description: str = Field(..., description="Parameter description")
    required: bool = Field(default=True, description="Whether parameter is required")
    default_value: Optional[Any] = Field(None, description="Default value if any")
    example: Optional[Any] = Field(None, description="Example value")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Parameter constraints")

class APIEndpoint(BaseModel):
    path: str = Field(..., description="API endpoint path")
    method: str = Field(..., description="HTTP method")
    summary: str = Field(..., description="Brief endpoint summary")
    description: str = Field(..., description="Detailed endpoint description")
    tags: List[str] = Field(default_factory=list, description="Endpoint tags")
    
    parameters: List[APIParameter] = Field(default_factory=list)
    request_body_schema: Optional[Dict[str, Any]] = Field(None)
    response_schemas: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    deprecated: bool = Field(default=False)
    security_requirements: List[str] = Field(default_factory=list)

class APIDocumentation(BaseModel):
    id: str = Field(..., description="Unique documentation identifier")
    title: str = Field(..., description="API title")
    description: str = Field(..., description="API description")
    version: str = Field(..., description="API version")
    
    endpoints: List[APIEndpoint] = Field(default_factory=list)
    schemas: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    openapi_spec: Dict[str, Any] = Field(default_factory=dict)
    
    # Generated documentation formats
    markdown_docs: Optional[str] = Field(None)
    html_docs: Optional[str] = Field(None)
    postman_collection: Optional[Dict[str, Any]] = Field(None)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Search & Knowledge Base Models
class SearchResult(BaseModel):
    id: str = Field(..., description="Unique result identifier")
    title: str = Field(..., description="Result title")
    content: str = Field(..., description="Result content")
    file_path: str = Field(..., description="File path")
    line_number: int = Field(..., description="Line number")
    
    category: SearchCategory = Field(..., description="Result category")
    language: Optional[str] = Field(None, description="Programming language")
    
    score: float = Field(..., ge=0.0, le=1.0, description="Relevance score")
    highlighted_content: str = Field(..., description="Content with query highlighted")
    
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchQuery(BaseModel):
    id: str = Field(..., description="Unique query identifier")
    query: str = Field(..., description="Search query")
    category: Optional[SearchCategory] = Field(None, description="Search category filter")
    
    executed_at: datetime = Field(default_factory=datetime.utcnow)
    execution_time: float = Field(..., ge=0.0, description="Query execution time in seconds")
    
    results: List[SearchResult] = Field(default_factory=list)
    total_results: int = Field(..., ge=0)
    
    # Search method info
    methods_used: List[str] = Field(default_factory=list, description="Search methods used")
    suggestions: List[str] = Field(default_factory=list, description="Search suggestions")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CodebaseIndex(BaseModel):
    id: str = Field(..., description="Unique index identifier")
    project_path: str = Field(..., description="Indexed project path")
    
    indexed_at: datetime = Field(default_factory=datetime.utcnow)
    indexing_time: float = Field(..., ge=0.0, description="Indexing time in seconds")
    
    # Statistics
    total_files: int = Field(..., ge=0)
    indexed_files: int = Field(..., ge=0)
    total_functions: int = Field(..., ge=0)
    total_classes: int = Field(..., ge=0)
    
    # Language breakdown
    language_stats: Dict[str, int] = Field(default_factory=dict)
    
    # Index metadata
    index_version: str = Field(default="1.0")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# DevOps Pipeline Models
class PipelineStage(BaseModel):
    name: str = Field(..., description="Stage name")
    description: str = Field(..., description="Stage description")
    commands: List[str] = Field(default_factory=list, description="Commands to execute")
    environment_variables: Dict[str, str] = Field(default_factory=dict)
    
    timeout: int = Field(default=300, ge=1, description="Timeout in seconds")
    retry_count: int = Field(default=0, ge=0, description="Number of retries")
    
    dependencies: List[str] = Field(default_factory=list, description="Dependent stages")
    artifacts: List[str] = Field(default_factory=list, description="Artifacts produced")

class PipelineTemplate(BaseModel):
    id: str = Field(..., description="Unique template identifier")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    
    language: str = Field(..., description="Target language")
    framework: Optional[str] = Field(None, description="Target framework")
    
    stages: List[PipelineStage] = Field(default_factory=list)
    
    # Configuration
    platform: str = Field(..., description="Target platform (GitHub Actions, GitLab CI, etc.)")
    docker_support: bool = Field(default=False)
    kubernetes_support: bool = Field(default=False)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = Field(default=0, ge=0)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PipelineExecution(BaseModel):
    id: str = Field(..., description="Unique execution identifier")
    template_id: str = Field(..., description="Template used")
    project_id: str = Field(..., description="Project identifier")
    
    status: PipelineStatus = Field(..., description="Execution status")
    
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(None)
    duration: Optional[float] = Field(None, ge=0.0, description="Duration in seconds")
    
    # Stage results
    stage_results: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    # Logs and artifacts
    logs: List[str] = Field(default_factory=list)
    artifacts: List[str] = Field(default_factory=list)
    
    # Metrics
    success_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    performance_metrics: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Integration Models
class IntegrationConfig(BaseModel):
    id: str = Field(..., description="Unique integration identifier")
    name: str = Field(..., description="Integration name")
    type: str = Field(..., description="Integration type")
    provider: str = Field(..., description="Service provider")
    
    # Configuration
    endpoint: str = Field(..., description="Service endpoint")
    authentication: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)
    
    # Status
    enabled: bool = Field(default=True)
    last_sync: Optional[datetime] = Field(None)
    sync_frequency: int = Field(default=3600, ge=0, description="Sync frequency in seconds")
    
    # Health
    health_status: str = Field(default="unknown")
    last_health_check: Optional[datetime] = Field(None)
    error_count: int = Field(default=0, ge=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Enhanced Analytics Models
class AnalyticsMetric(BaseModel):
    id: str = Field(..., description="Unique metric identifier")
    name: str = Field(..., description="Metric name")
    category: str = Field(..., description="Metric category")
    
    value: float = Field(..., description="Metric value")
    unit: str = Field(..., description="Metric unit")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Context
    project_id: Optional[str] = Field(None)
    user_id: Optional[str] = Field(None)
    session_id: Optional[str] = Field(None)
    
    # Additional data
    tags: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PerformanceReport(BaseModel):
    id: str = Field(..., description="Unique report identifier")
    title: str = Field(..., description="Report title")
    period_start: datetime = Field(..., description="Report period start")
    period_end: datetime = Field(..., description="Report period end")
    
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Metrics
    metrics: List[AnalyticsMetric] = Field(default_factory=list)
    
    # Summary
    summary: Dict[str, Any] = Field(default_factory=dict)
    insights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    
    # Trends
    trends: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }