from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime
import re
import ast

class ProjectMigrator:
    """AI service for smart project migration between frameworks/technologies"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.migration_patterns = {}
        self.framework_mappings = {}
        self.migration_cache = {}
    
    async def initialize(self):
        """Initialize the project migration service"""
        try:
            await self._load_migration_patterns()
            await self._load_framework_mappings()
            return True
        except Exception as e:
            print(f"Project Migrator initialization error: {e}")
            return False
    
    async def analyze_migration_feasibility(self, project_id: str, source_tech: str, target_tech: str) -> Dict[str, Any]:
        """Analyze feasibility of migrating from source to target technology"""
        try:
            analysis = {
                "project_id": project_id,
                "source_technology": source_tech,
                "target_technology": target_tech,
                "timestamp": datetime.utcnow().isoformat(),
                "feasibility_score": await self._calculate_feasibility_score(source_tech, target_tech),
                "compatibility_issues": await self._identify_compatibility_issues(source_tech, target_tech),
                "migration_complexity": await self._assess_migration_complexity(source_tech, target_tech),
                "estimated_effort": await self._estimate_migration_effort(source_tech, target_tech),
                "recommended_approach": await self._recommend_migration_approach(source_tech, target_tech),
                "potential_benefits": await self._identify_migration_benefits(source_tech, target_tech),
                "risk_assessment": await self._assess_migration_risks(source_tech, target_tech)
            }
            
            return analysis
        except Exception as e:
            return {"error": str(e), "project_id": project_id}
    
    async def generate_migration_plan(self, project_id: str, source_tech: str, target_tech: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed migration plan"""
        try:
            plan = {
                "migration_id": f"migration_{project_id}_{int(datetime.utcnow().timestamp())}",
                "project_id": project_id,
                "source_technology": source_tech,
                "target_technology": target_tech,
                "created_at": datetime.utcnow().isoformat(),
                "phases": await self._create_migration_phases(source_tech, target_tech, project_data),
                "dependencies": await self._map_dependency_changes(source_tech, target_tech, project_data),
                "file_transformations": await self._plan_file_transformations(source_tech, target_tech, project_data),
                "testing_strategy": await self._create_testing_strategy(source_tech, target_tech),
                "rollback_plan": await self._create_rollback_plan(project_data),
                "timeline_estimate": await self._estimate_timeline(source_tech, target_tech, project_data)
            }
            
            # Cache the migration plan
            self.migration_cache[plan["migration_id"]] = plan
            
            return plan
        except Exception as e:
            return {"error": str(e), "project_id": project_id}
    
    async def execute_code_transformation(self, source_code: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Execute code transformation from source to target language"""
        try:
            transformation = {
                "source_language": source_lang,
                "target_language": target_lang,
                "timestamp": datetime.utcnow().isoformat(),
                "original_code": source_code,
                "transformed_code": await self._transform_code_syntax(source_code, source_lang, target_lang),
                "transformation_notes": await self._generate_transformation_notes(source_code, source_lang, target_lang),
                "manual_review_needed": await self._identify_manual_review_items(source_code, source_lang, target_lang),
                "confidence_score": await self._calculate_transformation_confidence(source_code, source_lang, target_lang)
            }
            
            return transformation
        except Exception as e:
            return {"error": str(e), "source_language": source_lang, "target_language": target_lang}
    
    async def migrate_dependencies(self, dependencies: List[str], source_ecosystem: str, target_ecosystem: str) -> Dict[str, Any]:
        """Migrate dependencies from source to target ecosystem"""
        try:
            migration = {
                "source_ecosystem": source_ecosystem,
                "target_ecosystem": target_ecosystem,
                "timestamp": datetime.utcnow().isoformat(),
                "dependency_mappings": [],
                "unmappable_dependencies": [],
                "additional_dependencies": [],
                "migration_notes": []
            }
            
            for dep in dependencies:
                mapping = await self._find_dependency_equivalent(dep, source_ecosystem, target_ecosystem)
                if mapping:
                    migration["dependency_mappings"].append(mapping)
                else:
                    migration["unmappable_dependencies"].append({
                        "original": dep,
                        "reason": "No direct equivalent found",
                        "suggestions": await self._suggest_alternatives(dep, target_ecosystem)
                    })
            
            # Suggest additional dependencies that might be needed
            migration["additional_dependencies"] = await self._suggest_additional_dependencies(
                target_ecosystem, migration["dependency_mappings"]
            )
            
            return migration
        except Exception as e:
            return {"error": str(e)}
    
    async def validate_migration(self, migration_id: str, migrated_code: Dict[str, str]) -> Dict[str, Any]:
        """Validate migrated code for correctness and completeness"""
        try:
            validation = {
                "migration_id": migration_id,
                "timestamp": datetime.utcnow().isoformat(),
                "validation_results": [],
                "overall_status": "pending",
                "errors": [],
                "warnings": [],
                "success_rate": 0.0
            }
            
            total_files = 0
            successful_files = 0
            
            for file_path, code in migrated_code.items():
                total_files += 1
                file_validation = await self._validate_file(file_path, code)
                validation["validation_results"].append(file_validation)
                
                if file_validation["status"] == "success":
                    successful_files += 1
                elif file_validation["status"] == "error":
                    validation["errors"].extend(file_validation.get("errors", []))
                elif file_validation["status"] == "warning":
                    validation["warnings"].extend(file_validation.get("warnings", []))
            
            validation["success_rate"] = (successful_files / total_files) * 100 if total_files > 0 else 0
            validation["overall_status"] = "success" if validation["success_rate"] >= 80 else "needs_review"
            
            return validation
        except Exception as e:
            return {"error": str(e), "migration_id": migration_id}
    
    async def suggest_modernization_opportunities(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest modernization opportunities for the project"""
        try:
            opportunities = []
            
            # Check for outdated dependencies
            outdated_deps = await self._identify_outdated_dependencies(project_data)
            if outdated_deps:
                opportunities.append({
                    "type": "dependency_update",
                    "title": "Update Outdated Dependencies",
                    "description": f"Found {len(outdated_deps)} outdated dependencies",
                    "impact": "security_and_performance",
                    "effort": "low",
                    "details": outdated_deps
                })
            
            # Check for deprecated syntax/patterns
            deprecated_patterns = await self._identify_deprecated_patterns(project_data)
            if deprecated_patterns:
                opportunities.append({
                    "type": "syntax_modernization",
                    "title": "Modernize Code Syntax",
                    "description": "Update to modern language features",
                    "impact": "maintainability",
                    "effort": "medium",
                    "details": deprecated_patterns
                })
            
            # Check for architecture improvements
            architecture_improvements = await self._suggest_architecture_improvements(project_data)
            if architecture_improvements:
                opportunities.append({
                    "type": "architecture_upgrade",
                    "title": "Architecture Modernization",
                    "description": "Improve project architecture",
                    "impact": "scalability",
                    "effort": "high",
                    "details": architecture_improvements
                })
            
            return opportunities
        except Exception as e:
            return [{"error": str(e)}]
    
    async def _calculate_feasibility_score(self, source_tech: str, target_tech: str) -> int:
        """Calculate migration feasibility score (0-100)"""
        base_scores = {
            ("react", "vue"): 85,
            ("vue", "react"): 80,
            ("python", "javascript"): 70,
            ("javascript", "python"): 65,
            ("angular", "react"): 75,
            ("express", "fastapi"): 80,
            ("django", "fastapi"): 85
        }
        
        return base_scores.get((source_tech.lower(), target_tech.lower()), 50)
    
    async def _identify_compatibility_issues(self, source_tech: str, target_tech: str) -> List[Dict[str, str]]:
        """Identify potential compatibility issues"""
        issues = []
        
        if source_tech.lower() == "python" and target_tech.lower() == "javascript":
            issues.append({
                "issue": "Type system differences",
                "description": "Python's dynamic typing vs JavaScript's type system",
                "severity": "medium",
                "solution": "Consider using TypeScript for better type safety"
            })
        
        if source_tech.lower() == "react" and target_tech.lower() == "vue":
            issues.append({
                "issue": "Component lifecycle differences",
                "description": "React hooks vs Vue composition API",
                "severity": "low",
                "solution": "Map React hooks to Vue composition functions"
            })
        
        return issues
    
    async def _assess_migration_complexity(self, source_tech: str, target_tech: str) -> str:
        """Assess migration complexity level"""
        complexity_matrix = {
            ("react", "vue"): "medium",
            ("vue", "react"): "medium",
            ("python", "javascript"): "high",
            ("javascript", "python"): "high",
            ("angular", "react"): "high",
            ("express", "fastapi"): "low"
        }
        
        return complexity_matrix.get((source_tech.lower(), target_tech.lower()), "medium")
    
    async def _estimate_migration_effort(self, source_tech: str, target_tech: str) -> Dict[str, str]:
        """Estimate migration effort"""
        return {
            "small_project": "1-2 weeks",
            "medium_project": "2-6 weeks",
            "large_project": "2-4 months",
            "factors": "Depends on codebase size, complexity, and team experience"
        }
    
    async def _recommend_migration_approach(self, source_tech: str, target_tech: str) -> Dict[str, Any]:
        """Recommend migration approach"""
        return {
            "strategy": "incremental",
            "steps": [
                "Set up target environment",
                "Migrate core utilities first",
                "Transform components incrementally",
                "Update tests and documentation",
                "Performance validation"
            ],
            "tools": await self._suggest_migration_tools(source_tech, target_tech)
        }
    
    async def _identify_migration_benefits(self, source_tech: str, target_tech: str) -> List[str]:
        """Identify potential benefits of migration"""
        benefits = [
            "Access to modern features and improvements",
            "Better community support and ecosystem",
            "Enhanced performance characteristics",
            "Improved developer experience",
            "Future-proofing the codebase"
        ]
        
        # Add technology-specific benefits
        if target_tech.lower() == "typescript":
            benefits.append("Better type safety and IDE support")
        
        return benefits
    
    async def _assess_migration_risks(self, source_tech: str, target_tech: str) -> List[Dict[str, str]]:
        """Assess migration risks"""
        return [
            {
                "risk": "Feature parity",
                "description": "Some features might not have direct equivalents",
                "mitigation": "Thorough feature mapping and alternative solutions"
            },
            {
                "risk": "Performance regression",
                "description": "New technology might have different performance characteristics",
                "mitigation": "Comprehensive performance testing and optimization"
            },
            {
                "risk": "Team learning curve",
                "description": "Team needs to learn new technology",
                "mitigation": "Training and gradual adoption"
            }
        ]
    
    async def _create_migration_phases(self, source_tech: str, target_tech: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create migration phases"""
        return [
            {
                "phase": 1,
                "name": "Preparation",
                "duration": "1-2 weeks",
                "tasks": [
                    "Analyze current codebase",
                    "Set up target environment",
                    "Create migration scripts",
                    "Establish testing framework"
                ]
            },
            {
                "phase": 2,
                "name": "Core Migration",
                "duration": "2-4 weeks",
                "tasks": [
                    "Migrate utility functions",
                    "Transform core components",
                    "Update configuration files",
                    "Migrate tests"
                ]
            },
            {
                "phase": 3,
                "name": "Validation",
                "duration": "1-2 weeks",
                "tasks": [
                    "Run comprehensive tests",
                    "Performance validation",
                    "Security review",
                    "Documentation update"
                ]
            }
        ]
    
    async def _map_dependency_changes(self, source_tech: str, target_tech: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map dependency changes"""
        return {
            "removed": ["old-dependency-1", "old-dependency-2"],
            "added": ["new-dependency-1", "new-dependency-2"],
            "updated": [
                {"from": "old-package@1.0", "to": "new-package@2.0"}
            ],
            "configuration_changes": [
                "Update package.json",
                "Modify build configuration",
                "Update environment variables"
            ]
        }
    
    async def _plan_file_transformations(self, source_tech: str, target_tech: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Plan file transformations"""
        return [
            {
                "file": "src/component.jsx",
                "transformation": "Convert React component to Vue component",
                "new_file": "src/component.vue",
                "complexity": "medium"
            },
            {
                "file": "package.json",
                "transformation": "Update dependencies and scripts",
                "new_file": "package.json",
                "complexity": "low"
            }
        ]
    
    async def _create_testing_strategy(self, source_tech: str, target_tech: str) -> Dict[str, Any]:
        """Create testing strategy for migration"""
        return {
            "unit_tests": "Migrate and update unit tests",
            "integration_tests": "Create new integration tests",
            "e2e_tests": "Update end-to-end test scenarios",
            "performance_tests": "Establish baseline and compare",
            "manual_testing": "UI/UX validation checklist"
        }
    
    async def _create_rollback_plan(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create rollback plan"""
        return {
            "backup_strategy": "Full codebase backup before migration",
            "rollback_triggers": [
                "Critical performance regression",
                "Unresolvable compatibility issues",
                "Major functionality loss"
            ],
            "rollback_steps": [
                "Stop target environment",
                "Restore source codebase",
                "Verify functionality",
                "Update deployment"
            ],
            "data_migration_rollback": "Database rollback procedures if applicable"
        }
    
    async def _estimate_timeline(self, source_tech: str, target_tech: str, project_data: Dict[str, Any]) -> Dict[str, str]:
        """Estimate migration timeline"""
        return {
            "planning": "1 week",
            "migration": "2-6 weeks",
            "testing": "1-2 weeks",
            "deployment": "1 week",
            "total": "5-10 weeks",
            "factors": "Timeline depends on project size and complexity"
        }
    
    async def _transform_code_syntax(self, source_code: str, source_lang: str, target_lang: str) -> str:
        """Transform code syntax from source to target language"""
        # This is a simplified transformation - in reality, this would be much more complex
        if source_lang.lower() == "python" and target_lang.lower() == "javascript":
            # Basic Python to JavaScript transformations
            transformed = source_code
            transformed = re.sub(r'def\s+(\w+)\s*\((.*?)\):', r'function \1(\2) {', transformed)
            transformed = re.sub(r'print\((.*?)\)', r'console.log(\1)', transformed)
            transformed = transformed.replace('True', 'true').replace('False', 'false').replace('None', 'null')
            return transformed
        
        return source_code  # Return original if no transformation available
    
    async def _generate_transformation_notes(self, source_code: str, source_lang: str, target_lang: str) -> List[str]:
        """Generate notes about the transformation"""
        notes = []
        
        if source_lang.lower() == "python" and target_lang.lower() == "javascript":
            notes.append("Function definitions converted from 'def' to 'function'")
            notes.append("Print statements converted to console.log")
            notes.append("Boolean values converted (True/False to true/false)")
        
        return notes
    
    async def _identify_manual_review_items(self, source_code: str, source_lang: str, target_lang: str) -> List[str]:
        """Identify items that need manual review"""
        return [
            "Complex data structures may need manual adjustment",
            "Error handling patterns should be reviewed",
            "Library-specific code requires manual migration"
        ]
    
    async def _calculate_transformation_confidence(self, source_code: str, source_lang: str, target_lang: str) -> float:
        """Calculate confidence score for transformation"""
        # Simplified confidence calculation
        if source_lang.lower() == target_lang.lower():
            return 100.0
        
        similar_languages = [
            ("javascript", "typescript"),
            ("python", "ruby"),
            ("java", "kotlin")
        ]
        
        if (source_lang.lower(), target_lang.lower()) in similar_languages:
            return 85.0
        
        return 60.0  # Default moderate confidence
    
    async def _find_dependency_equivalent(self, dependency: str, source_ecosystem: str, target_ecosystem: str) -> Optional[Dict[str, str]]:
        """Find equivalent dependency in target ecosystem"""
        mappings = {
            ("npm", "pip"): {
                "express": "fastapi",
                "lodash": "underscore",
                "axios": "requests"
            },
            ("pip", "npm"): {
                "requests": "axios",
                "flask": "express",
                "django": "next"
            }
        }
        
        ecosystem_mappings = mappings.get((source_ecosystem, target_ecosystem), {})
        equivalent = ecosystem_mappings.get(dependency)
        
        if equivalent:
            return {
                "source": dependency,
                "target": equivalent,
                "confidence": "high",
                "notes": "Direct equivalent available"
            }
        
        return None
    
    async def _suggest_alternatives(self, dependency: str, target_ecosystem: str) -> List[str]:
        """Suggest alternative dependencies"""
        return [
            f"Alternative 1 for {dependency}",
            f"Alternative 2 for {dependency}",
            "Consider custom implementation"
        ]
    
    async def _suggest_additional_dependencies(self, target_ecosystem: str, mappings: List[Dict[str, str]]) -> List[str]:
        """Suggest additional dependencies that might be needed"""
        return [
            "Type definitions (if using TypeScript)",
            "Testing framework adapters",
            "Build tool configurations"
        ]
    
    async def _validate_file(self, file_path: str, code: str) -> Dict[str, Any]:
        """Validate a single migrated file"""
        validation = {
            "file": file_path,
            "status": "success",
            "errors": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Basic syntax validation (simplified)
        try:
            if file_path.endswith('.py'):
                ast.parse(code)
            # Add more language-specific validations as needed
        except SyntaxError as e:
            validation["status"] = "error"
            validation["errors"].append(f"Syntax error: {str(e)}")
        
        return validation
    
    async def _identify_outdated_dependencies(self, project_data: Dict[str, Any]) -> List[str]:
        """Identify outdated dependencies"""
        # Simplified - in reality, this would check against a package registry
        return ["old-package@1.0", "deprecated-lib@0.5"]
    
    async def _identify_deprecated_patterns(self, project_data: Dict[str, Any]) -> List[str]:
        """Identify deprecated code patterns"""
        return [
            "Class components instead of functional components",
            "Callback-based async instead of async/await",
            "Old context API usage"
        ]
    
    async def _suggest_architecture_improvements(self, project_data: Dict[str, Any]) -> List[str]:
        """Suggest architecture improvements"""
        return [
            "Implement microservices architecture",
            "Add proper error boundaries",
            "Implement state management pattern",
            "Add API layer abstraction"
        ]
    
    async def _suggest_migration_tools(self, source_tech: str, target_tech: str) -> List[str]:
        """Suggest tools for migration"""
        tools = {
            ("react", "vue"): ["Vue CLI", "React-to-Vue converter", "ESLint Vue plugin"],
            ("python", "javascript"): ["Babel", "Transpilation tools", "Code formatters"],
            ("angular", "react"): ["React CLI", "Component migration tools", "Routing adapters"]
        }
        
        return tools.get((source_tech.lower(), target_tech.lower()), ["Generic migration tools"])
    
    async def _load_migration_patterns(self):
        """Load migration patterns and rules"""
        self.migration_patterns = {
            "react_to_vue": {
                "component_structure": "class -> export default",
                "lifecycle": "componentDidMount -> mounted",
                "state": "this.state -> data()"
            },
            "python_to_js": {
                "functions": "def -> function",
                "classes": "class -> class (ES6)",
                "imports": "import -> import/require"
            }
        }
    
    async def _load_framework_mappings(self):
        """Load framework feature mappings"""
        self.framework_mappings = {
            "component_lifecycle": {
                "react": ["componentDidMount", "componentWillUnmount", "componentDidUpdate"],
                "vue": ["mounted", "beforeDestroy", "updated"],
                "angular": ["ngOnInit", "ngOnDestroy", "ngOnChanges"]
            },
            "state_management": {
                "react": ["useState", "useReducer", "Redux"],
                "vue": ["data", "computed", "Vuex"],
                "angular": ["property binding", "NgRx"]
            }
        }