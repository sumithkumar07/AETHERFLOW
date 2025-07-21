"""
AI Models Configuration for Code Editor
Optimal Llama model selection for different features
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

class AIFeature(str, Enum):
    """AI feature types with optimal model mapping"""
    CODE_COMPLETION = "completion"
    CODE_REVIEW = "review"
    DEBUG_ASSISTANCE = "debug"
    DOCUMENTATION = "docs"
    VULNERABILITY_SCAN = "vulnerability"
    REFACTORING = "refactor"
    NLP_TO_CODE = "nlp_to_code"
    OPTIMIZATION = "optimization"
    CONVERSATION = "conversation"

class ModelConfig:
    """Optimal model configuration for each feature"""
    
    # Model mappings based on our analysis
    MODEL_MAP = {
        # Fast response features - Llama 4 Maverick
        AIFeature.CODE_COMPLETION: "meta-llama/llama-4-maverick",
        AIFeature.DEBUG_ASSISTANCE: "meta-llama/llama-4-maverick", 
        AIFeature.REFACTORING: "meta-llama/llama-4-maverick",
        AIFeature.NLP_TO_CODE: "meta-llama/llama-4-maverick",
        AIFeature.CONVERSATION: "meta-llama/llama-4-maverick",
        
        # Deep analysis features - Llama 3 70B
        AIFeature.CODE_REVIEW: "meta-llama/llama-3-70b-instruct",
        AIFeature.DOCUMENTATION: "meta-llama/llama-3-70b-instruct",
        AIFeature.VULNERABILITY_SCAN: "meta-llama/llama-3-70b-instruct",
        AIFeature.OPTIMIZATION: "meta-llama/llama-3-70b-instruct",
    }
    
    @classmethod
    def get_model_for_feature(cls, feature: AIFeature) -> str:
        """Get optimal model for specific feature"""
        return cls.MODEL_MAP.get(feature, "meta-llama/llama-4-maverick")

class CodeCompletionRequest(BaseModel):
    """Code completion request model"""
    code_context: str
    cursor_position: int
    language: str = "python"
    max_completions: int = 3
    
class CodeReviewRequest(BaseModel):
    """Code review request model"""
    code: str
    language: str = "python"
    focus_areas: Optional[list] = ["security", "performance", "best_practices"]
    
class DebugRequest(BaseModel):
    """Debug assistance request model"""
    code: str
    error_message: Optional[str] = None
    language: str = "python"
    context: Optional[str] = None
    
class DocumentationRequest(BaseModel):
    """Documentation generation request model"""
    code: str
    language: str = "python"
    doc_type: str = "function"  # function, class, module
    
class VulnerabilityRequest(BaseModel):
    """Vulnerability scan request model"""
    code: str
    language: str = "python"
    scan_depth: str = "comprehensive"  # basic, comprehensive
    
class RefactorRequest(BaseModel):
    """Code refactoring request model"""
    code: str
    language: str = "python"
    refactor_type: str = "optimize"  # optimize, clean, modernize
    
class NLPToCodeRequest(BaseModel):
    """Natural language to code request model"""
    description: str
    language: str = "python"
    context: Optional[str] = None
    
class ConversationRequest(BaseModel):
    """Multi-turn conversation request model"""
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    """Standard AI response model"""
    success: bool
    response: str
    model_used: str
    processing_time: float
    suggestions: Optional[list] = None
    confidence_score: Optional[float] = None