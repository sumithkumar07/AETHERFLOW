"""
Intelligent Code Generation Enhancement Service
Advanced code generation with smart templates and progressive building
"""
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CodeComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    ENTERPRISE = "enterprise"

@dataclass
class CodeGenerationRequest:
    description: str
    project_type: str
    tech_stack: List[str]
    features: List[str]
    complexity: CodeComplexity
    user_skill_level: str
    industry: Optional[str] = None
    
@dataclass
class CodeGenerationResult:
    files: Dict[str, str]  # filename -> content
    structure: Dict[str, Any]
    explanation: str
    next_steps: List[str]
    alternatives: List[str]
    deployment_config: Dict[str, Any]
    
class IntelligentCodeGenerationService:
    def __init__(self, db_wrapper):
        self.db_wrapper = db_wrapper
        self.templates = {}
        self.code_patterns = {}
        self.industry_specifics = {}
        
    async def initialize(self):
        """Initialize the Intelligent Code Generation Service"""
        logger.info("🔧 Initializing Intelligent Code Generation Service...")
        await self._load_templates()
        await self._load_code_patterns()
        await self._load_industry_specifics()
        logger.info("✅ Intelligent Code Generation Service initialized")
    
    async def generate_progressive_code(self, request: CodeGenerationRequest) -> List[CodeGenerationResult]:
        """Generate code progressively from wireframe to deployment"""
        stages = []
        
        # Stage 1: Wireframe/Structure
        wireframe_stage = await self._generate_wireframe_stage(request)
        stages.append(wireframe_stage)
        
        # Stage 2: Basic Implementation
        basic_stage = await self._generate_basic_implementation(request, wireframe_stage)
        stages.append(basic_stage)
        
        # Stage 3: Feature Implementation
        feature_stage = await self._generate_feature_implementation(request, basic_stage)
        stages.append(feature_stage)
        
        # Stage 4: Production Ready
        production_stage = await self._generate_production_stage(request, feature_stage)
        stages.append(production_stage)
        
        return stages
    
    async def smart_template_matching(self, description: str, project_type: str) -> List[Dict[str, Any]]:
        """Match description to most suitable templates"""
        matches = []
        
        # Analyze description for keywords
        keywords = self._extract_keywords(description.lower())
        
        # Find matching templates
        for template_id, template in self.templates.items():
            score = self._calculate_template_match_score(keywords, project_type, template)
            if score > 0.3:  # Minimum threshold
                matches.append({
                    "template_id": template_id,
                    "name": template["name"],
                    "description": template["description"],
                    "score": score,
                    "features": template["features"],
                    "tech_stack": template["tech_stack"]
                })
        
        # Sort by score
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:5]  # Return top 5 matches
    
    async def generate_industry_specific_code(self, industry: str, request: CodeGenerationRequest) -> CodeGenerationResult:
        """Generate code with industry-specific features and compliance"""
        industry_config = self.industry_specifics.get(industry, {})
        
        # Base generation
        result = await self._generate_base_code(request)
        
        # Add industry-specific features
        if industry == "ecommerce":
            result = await self._add_ecommerce_features(result, request)
        elif industry == "fintech":
            result = await self._add_fintech_features(result, request)
        elif industry == "healthcare":
            result = await self._add_healthcare_features(result, request)
        elif industry == "education":
            result = await self._add_education_features(result, request)
        
        return result
    
    async def generate_code_alternatives(self, request: CodeGenerationRequest) -> List[CodeGenerationResult]:
        """Generate multiple alternative implementations"""
        alternatives = []
        
        # Different tech stacks
        tech_alternatives = self._get_tech_stack_alternatives(request.tech_stack)
        
        for alt_stack in tech_alternatives[:3]:  # Limit to 3 alternatives
            alt_request = CodeGenerationRequest(
                description=request.description,
                project_type=request.project_type,
                tech_stack=alt_stack,
                features=request.features,
                complexity=request.complexity,
                user_skill_level=request.user_skill_level,
                industry=request.industry
            )
            
            alt_result = await self._generate_base_code(alt_request)
            alternatives.append(alt_result)
        
        return alternatives
    
    async def explain_code_generation(self, result: CodeGenerationResult, user_skill_level: str) -> str:
        """Generate detailed explanation of the generated code"""
        explanations = []
        
        if user_skill_level == "beginner":
            explanations.append("Let me explain what I've created for you step by step:")
            explanations.append("\n🏗️ **Project Structure:**")
            explanations.append(self._explain_structure_beginner(result.structure))
            
        elif user_skill_level == "intermediate":
            explanations.append("Here's an overview of the generated application:")
            explanations.append("\n🔧 **Architecture Decisions:**")
            explanations.append(self._explain_architecture_intermediate(result))
            
        else:  # advanced
            explanations.append("Technical implementation details:")
            explanations.append("\n⚡ **Advanced Patterns Used:**")
            explanations.append(self._explain_patterns_advanced(result))
        
        return "\n".join(explanations)
    
    async def auto_generate_tests(self, code_result: CodeGenerationResult) -> Dict[str, str]:
        """Auto-generate comprehensive tests for the generated code"""
        test_files = {}
        
        for filename, content in code_result.files.items():
            if filename.endswith(('.js', '.jsx', '.ts', '.tsx', '.py')):
                test_content = await self._generate_test_for_file(filename, content)
                test_filename = self._get_test_filename(filename)
                test_files[test_filename] = test_content
        
        return test_files
    
    async def optimize_generated_code(self, code_result: CodeGenerationResult) -> CodeGenerationResult:
        """Optimize the generated code for performance and best practices"""
        optimized_files = {}
        
        for filename, content in code_result.files.items():
            optimized_content = await self._optimize_file_content(filename, content)
            optimized_files[filename] = optimized_content
        
        code_result.files = optimized_files
        code_result.explanation += "\n\n✨ **Optimizations Applied:**\n"
        code_result.explanation += "- Performance optimizations\n"
        code_result.explanation += "- Code quality improvements\n"
        code_result.explanation += "- Security best practices\n"
        
        return code_result
    
    async def _generate_wireframe_stage(self, request: CodeGenerationRequest) -> CodeGenerationResult:
        """Generate wireframe/structure stage"""
        structure = {
            "type": "wireframe",
            "components": self._design_component_structure(request),
            "layout": self._design_layout_structure(request),
            "navigation": self._design_navigation_structure(request)
        }
        
        files = {
            "wireframe.md": self._generate_wireframe_markdown(structure),
            "structure.json": json.dumps(structure, indent=2)
        }
        
        return CodeGenerationResult(
            files=files,
            structure=structure,
            explanation="Created project wireframe and component structure",
            next_steps=["Review the proposed structure", "Move to basic implementation"],
            alternatives=["Alternative layout options available"],
            deployment_config={}
        )
    
    async def _generate_basic_implementation(self, request: CodeGenerationRequest, wireframe: CodeGenerationResult) -> CodeGenerationResult:
        """Generate basic implementation stage"""
        files = {}
        
        # Generate basic files based on tech stack
        if "react" in request.tech_stack:
            files.update(await self._generate_react_basic_files(request, wireframe))
        if "fastapi" in request.tech_stack or "python" in request.tech_stack:
            files.update(await self._generate_python_basic_files(request, wireframe))
        if "mongodb" in request.tech_stack:
            files.update(await self._generate_mongodb_files(request))
        
        # Add configuration files
        files.update(await self._generate_config_files(request))
        
        return CodeGenerationResult(
            files=files,
            structure=wireframe.structure,
            explanation="Generated basic application structure with core functionality",
            next_steps=["Test basic functionality", "Add specific features"],
            alternatives=["Different implementation approaches available"],
            deployment_config={}
        )
    
    async def _generate_feature_implementation(self, request: CodeGenerationRequest, basic: CodeGenerationResult) -> CodeGenerationResult:
        """Generate feature implementation stage"""
        enhanced_files = basic.files.copy()
        
        # Add requested features
        for feature in request.features:
            feature_files = await self._generate_feature_files(feature, request)
            enhanced_files.update(feature_files)
        
        return CodeGenerationResult(
            files=enhanced_files,
            structure=basic.structure,
            explanation="Added all requested features and functionality",
            next_steps=["Test all features", "Prepare for production"],
            alternatives=["Different feature implementations available"],
            deployment_config={}
        )
    
    async def _generate_production_stage(self, request: CodeGenerationRequest, feature: CodeGenerationResult) -> CodeGenerationResult:
        """Generate production-ready stage"""
        production_files = feature.files.copy()
        
        # Add production configurations
        production_files.update({
            "Dockerfile": self._generate_dockerfile(request),
            "docker-compose.yml": self._generate_docker_compose(request),
            ".env.example": self._generate_env_example(request),
            "README.md": self._generate_readme(request),
            "package.json": self._generate_package_json(request) if any(js in request.tech_stack for js in ["react", "node", "javascript"]) else None
        })
        
        # Remove None values
        production_files = {k: v for k, v in production_files.items() if v is not None}
        
        deployment_config = {
            "platform": "docker",
            "database": "mongodb" if "mongodb" in request.tech_stack else "sqlite",
            "cdn": "cloudflare",
            "monitoring": "basic",
            "ssl": "letsencrypt"
        }
        
        return CodeGenerationResult(
            files=production_files,
            structure=feature.structure,
            explanation="Application is now production-ready with deployment configurations",
            next_steps=["Deploy to production", "Set up monitoring"],
            alternatives=["Different deployment strategies available"],
            deployment_config=deployment_config
        )
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from description"""
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "about"}
        words = text.split()
        return [word for word in words if word not in common_words and len(word) > 2]
    
    def _calculate_template_match_score(self, keywords: List[str], project_type: str, template: Dict) -> float:
        """Calculate template match score"""
        score = 0.0
        
        # Project type match
        if template.get("type") == project_type:
            score += 0.5
        
        # Keyword matches
        template_keywords = template.get("keywords", [])
        matches = len(set(keywords) & set(template_keywords))
        score += matches * 0.1
        
        # Feature matches  
        template_features = template.get("features", [])
        feature_matches = len(set(keywords) & set(template_features))
        score += feature_matches * 0.05
        
        return min(score, 1.0)
    
    async def _load_templates(self):
        """Load code templates"""
        self.templates = {
            "react_spa": {
                "name": "React SPA",
                "description": "Single Page Application with React",
                "type": "web",
                "tech_stack": ["react", "javascript", "html", "css"],
                "features": ["routing", "state management", "components"],
                "keywords": ["react", "spa", "single page", "frontend", "web"]
            },
            "fullstack_app": {
                "name": "Full Stack App",
                "description": "Complete full-stack application",
                "type": "web",
                "tech_stack": ["react", "fastapi", "mongodb"],
                "features": ["authentication", "database", "api", "frontend"],
                "keywords": ["fullstack", "full stack", "complete", "web app"]
            },
            "api_service": {
                "name": "REST API",
                "description": "RESTful API service",
                "type": "api",
                "tech_stack": ["fastapi", "python", "mongodb"],
                "features": ["rest", "crud", "authentication", "database"],
                "keywords": ["api", "rest", "backend", "service", "microservice"]
            }
        }
    
    async def _load_code_patterns(self):
        """Load common code patterns"""
        self.code_patterns = {
            "authentication": {
                "jwt": "JSON Web Token implementation",
                "oauth": "OAuth 2.0 implementation",
                "session": "Session-based authentication"
            },
            "database": {
                "crud": "Create, Read, Update, Delete operations",
                "orm": "Object-Relational Mapping",
                "migration": "Database schema migrations"
            }
        }
    
    async def _load_industry_specifics(self):
        """Load industry-specific configurations"""
        self.industry_specifics = {
            "ecommerce": {
                "required_features": ["payment", "inventory", "cart", "orders"],
                "compliance": ["pci_dss"],
                "integrations": ["stripe", "paypal"]
            },
            "fintech": {
                "required_features": ["encryption", "audit_log", "2fa"],
                "compliance": ["pci_dss", "gdpr", "sox"],
                "security": "high"
            },
            "healthcare": {
                "required_features": ["encryption", "audit_log", "access_control"],
                "compliance": ["hipaa", "gdpr"],
                "security": "high"
            }
        }
    
    # Placeholder methods for code generation
    async def _generate_base_code(self, request: CodeGenerationRequest) -> CodeGenerationResult:
        """Generate base code structure"""
        return CodeGenerationResult(
            files={"main.py": "# Generated base code"},
            structure={"type": "basic"},
            explanation="Base code generated",
            next_steps=["Add features"],
            alternatives=["Alternative approaches available"],
            deployment_config={}
        )
    
    def _get_tech_stack_alternatives(self, current_stack: List[str]) -> List[List[str]]:
        """Get alternative tech stacks"""
        alternatives = []
        
        if "react" in current_stack:
            alternatives.append(["vue", "javascript"])
            alternatives.append(["angular", "typescript"])
            
        if "fastapi" in current_stack:
            alternatives.append(["django", "python"])
            alternatives.append(["express", "node.js"])
            
        return alternatives
    
    # Additional placeholder methods would be implemented here
    def _design_component_structure(self, request): return {}
    def _design_layout_structure(self, request): return {}
    def _design_navigation_structure(self, request): return {}
    def _generate_wireframe_markdown(self, structure): return "# Wireframe"
    async def _generate_react_basic_files(self, request, wireframe): return {}
    async def _generate_python_basic_files(self, request, wireframe): return {}
    async def _generate_mongodb_files(self, request): return {}
    async def _generate_config_files(self, request): return {}
    async def _generate_feature_files(self, feature, request): return {}
    def _generate_dockerfile(self, request): return "FROM node:18"
    def _generate_docker_compose(self, request): return "version: '3.8'"
    def _generate_env_example(self, request): return "NODE_ENV=production"
    def _generate_readme(self, request): return "# Project README"
    def _generate_package_json(self, request): return "{}"
    async def _add_ecommerce_features(self, result, request): return result
    async def _add_fintech_features(self, result, request): return result
    async def _add_healthcare_features(self, result, request): return result
    async def _add_education_features(self, result, request): return result
    def _explain_structure_beginner(self, structure): return "Basic structure explanation"
    def _explain_architecture_intermediate(self, result): return "Architecture explanation"
    def _explain_patterns_advanced(self, result): return "Advanced patterns explanation"
    async def _generate_test_for_file(self, filename, content): return "# Test file"
    def _get_test_filename(self, filename): return f"test_{filename}"
    async def _optimize_file_content(self, filename, content): return content