from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime
import hashlib
import difflib

class PatternIntelligence:
    """AI service for cross-project pattern recognition and code reuse"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.pattern_cache = {}
        self.code_fingerprints = {}
        self.reuse_opportunities = {}
    
    async def initialize(self):
        """Initialize the pattern intelligence service"""
        try:
            await self._build_pattern_database()
            await self._initialize_similarity_algorithms()
            return True
        except Exception as e:
            print(f"Pattern Intelligence initialization error: {e}")
            return False
    
    async def analyze_project_patterns(self, project_id: str, codebase: Dict[str, str]) -> Dict[str, Any]:
        """Analyze patterns across a project's codebase"""
        try:
            analysis = {
                "project_id": project_id,
                "timestamp": datetime.utcnow().isoformat(),
                "identified_patterns": [],
                "reusable_components": [],
                "duplicated_code": [],
                "architectural_patterns": [],
                "design_patterns": [],
                "anti_patterns": [],
                "refactoring_opportunities": []
            }
            
            # Identify various types of patterns
            analysis["identified_patterns"] = await self._identify_code_patterns(codebase)
            analysis["reusable_components"] = await self._identify_reusable_components(codebase)
            analysis["duplicated_code"] = await self._detect_code_duplication(codebase)
            analysis["architectural_patterns"] = await self._detect_architectural_patterns(codebase)
            analysis["design_patterns"] = await self._detect_design_patterns(codebase)
            analysis["anti_patterns"] = await self._detect_anti_patterns(codebase)
            analysis["refactoring_opportunities"] = await self._identify_refactoring_opportunities(analysis)
            
            # Cache patterns for cross-project analysis
            await self._cache_project_patterns(project_id, analysis)
            
            return analysis
        except Exception as e:
            return {"error": str(e), "project_id": project_id}
    
    async def find_cross_project_patterns(self, user_id: str, current_project_id: str) -> Dict[str, Any]:
        """Find patterns that can be reused across user's projects"""
        try:
            patterns = {
                "user_id": user_id,
                "current_project": current_project_id,
                "timestamp": datetime.utcnow().isoformat(),
                "reusable_patterns": [],
                "common_utilities": [],
                "shared_components": [],
                "optimization_patterns": [],
                "suggested_libraries": []
            }
            
            # Get user's other projects
            user_projects = await self._get_user_projects(user_id)
            
            # Find common patterns across projects
            for project_id in user_projects:
                if project_id != current_project_id:
                    project_patterns = self.pattern_cache.get(project_id, {})
                    
                    # Find reusable patterns
                    reusable = await self._find_reusable_patterns(project_patterns, current_project_id)
                    patterns["reusable_patterns"].extend(reusable)
                    
                    # Find common utilities
                    utilities = await self._find_common_utilities(project_patterns)
                    patterns["common_utilities"].extend(utilities)
                    
                    # Find shared components
                    components = await self._find_shared_components(project_patterns)
                    patterns["shared_components"].extend(components)
            
            # Identify optimization patterns
            patterns["optimization_patterns"] = await self._identify_optimization_patterns(patterns["reusable_patterns"])
            
            # Suggest shared libraries
            patterns["suggested_libraries"] = await self._suggest_shared_libraries(patterns)
            
            return patterns
        except Exception as e:
            return {"error": str(e)}
    
    async def extract_reusable_utilities(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Extract utilities that can be moved to shared libraries"""
        try:
            utilities = []
            
            for file_path, code in codebase.items():
                file_utilities = await self._extract_file_utilities(file_path, code)
                utilities.extend(file_utilities)
            
            # Group similar utilities
            grouped_utilities = await self._group_similar_utilities(utilities)
            
            # Rank by reusability potential
            ranked_utilities = await self._rank_utilities_by_reusability(grouped_utilities)
            
            return ranked_utilities
        except Exception as e:
            return [{"error": str(e)}]
    
    async def suggest_code_consolidation(self, project_id: str, codebase: Dict[str, str]) -> Dict[str, Any]:
        """Suggest opportunities to consolidate similar code"""
        try:
            consolidation = {
                "project_id": project_id,
                "timestamp": datetime.utcnow().isoformat(),
                "consolidation_opportunities": [],
                "estimated_savings": {
                    "lines_of_code": 0,
                    "maintenance_effort": "medium",
                    "complexity_reduction": "high"
                },
                "implementation_plan": []
            }
            
            # Find duplicated code blocks
            duplicates = await self._find_duplicate_code_blocks(codebase)
            
            # Group duplicates by similarity
            grouped_duplicates = await self._group_duplicates_by_similarity(duplicates)
            
            # Generate consolidation suggestions
            for group in grouped_duplicates:
                suggestion = await self._create_consolidation_suggestion(group)
                consolidation["consolidation_opportunities"].append(suggestion)
            
            # Calculate estimated savings
            consolidation["estimated_savings"] = await self._calculate_consolidation_savings(
                consolidation["consolidation_opportunities"]
            )
            
            # Create implementation plan
            consolidation["implementation_plan"] = await self._create_consolidation_plan(
                consolidation["consolidation_opportunities"]
            )
            
            return consolidation
        except Exception as e:
            return {"error": str(e)}
    
    async def generate_pattern_library(self, user_id: str, projects: List[str]) -> Dict[str, Any]:
        """Generate a pattern library from user's projects"""
        try:
            library = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "patterns": {
                    "components": [],
                    "utilities": [],
                    "hooks": [],
                    "services": [],
                    "configurations": []
                },
                "usage_statistics": {},
                "recommended_extractions": []
            }
            
            # Analyze all projects
            all_patterns = []
            for project_id in projects:
                project_patterns = self.pattern_cache.get(project_id, {})
                all_patterns.append(project_patterns)
            
            # Extract common patterns
            library["patterns"]["components"] = await self._extract_common_components(all_patterns)
            library["patterns"]["utilities"] = await self._extract_common_utilities(all_patterns)
            library["patterns"]["hooks"] = await self._extract_common_hooks(all_patterns)
            library["patterns"]["services"] = await self._extract_common_services(all_patterns)
            library["patterns"]["configurations"] = await self._extract_common_configurations(all_patterns)
            
            # Calculate usage statistics
            library["usage_statistics"] = await self._calculate_pattern_usage_stats(all_patterns)
            
            # Recommend extractions
            library["recommended_extractions"] = await self._recommend_pattern_extractions(library)
            
            return library
        except Exception as e:
            return {"error": str(e)}
    
    async def _identify_code_patterns(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Identify common code patterns"""
        patterns = []
        
        for file_path, code in codebase.items():
            # Identify function patterns
            function_patterns = await self._identify_function_patterns(code)
            patterns.extend(function_patterns)
            
            # Identify class patterns
            class_patterns = await self._identify_class_patterns(code)
            patterns.extend(class_patterns)
            
            # Identify import patterns
            import_patterns = await self._identify_import_patterns(code)
            patterns.extend(import_patterns)
        
        return patterns
    
    async def _identify_reusable_components(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Identify components that could be reused"""
        components = []
        
        for file_path, code in codebase.items():
            if self._is_component_file(file_path):
                component_info = await self._analyze_component_reusability(file_path, code)
                if component_info["reusability_score"] > 70:
                    components.append(component_info)
        
        return sorted(components, key=lambda x: x["reusability_score"], reverse=True)
    
    async def _detect_code_duplication(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Detect duplicated code across files"""
        duplicates = []
        
        # Create fingerprints for code blocks
        fingerprints = {}
        for file_path, code in codebase.items():
            blocks = await self._extract_code_blocks(code)
            for block in blocks:
                fingerprint = self._create_code_fingerprint(block["code"])
                if fingerprint in fingerprints:
                    duplicates.append({
                        "original": fingerprints[fingerprint],
                        "duplicate": {"file": file_path, "block": block},
                        "similarity": block.get("similarity", 100),
                        "lines": block.get("lines", 0)
                    })
                else:
                    fingerprints[fingerprint] = {"file": file_path, "block": block}
        
        return duplicates
    
    async def _detect_architectural_patterns(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Detect architectural patterns like MVC, Repository, etc."""
        patterns = []
        
        # Check for MVC pattern
        if await self._has_mvc_structure(codebase):
            patterns.append({
                "pattern": "Model-View-Controller (MVC)",
                "confidence": 0.8,
                "files_involved": await self._get_mvc_files(codebase),
                "benefits": ["Separation of concerns", "Maintainability", "Testability"]
            })
        
        # Check for Repository pattern
        if await self._has_repository_pattern(codebase):
            patterns.append({
                "pattern": "Repository Pattern",
                "confidence": 0.7,
                "files_involved": await self._get_repository_files(codebase),
                "benefits": ["Data abstraction", "Testability", "Flexibility"]
            })
        
        return patterns
    
    async def _detect_design_patterns(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Detect design patterns like Singleton, Factory, etc."""
        patterns = []
        
        for file_path, code in codebase.items():
            # Check for Singleton pattern
            if await self._has_singleton_pattern(code):
                patterns.append({
                    "pattern": "Singleton",
                    "file": file_path,
                    "confidence": 0.9,
                    "description": "Ensures only one instance of a class exists"
                })
            
            # Check for Factory pattern
            if await self._has_factory_pattern(code):
                patterns.append({
                    "pattern": "Factory",
                    "file": file_path,
                    "confidence": 0.8,
                    "description": "Creates objects without specifying exact classes"
                })
            
            # Check for Observer pattern
            if await self._has_observer_pattern(code):
                patterns.append({
                    "pattern": "Observer",
                    "file": file_path,
                    "confidence": 0.7,
                    "description": "Notifies multiple objects about state changes"
                })
        
        return patterns
    
    async def _detect_anti_patterns(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Detect anti-patterns that should be avoided"""
        anti_patterns = []
        
        for file_path, code in codebase.items():
            # Check for God Object anti-pattern
            if await self._has_god_object(code):
                anti_patterns.append({
                    "anti_pattern": "God Object",
                    "file": file_path,
                    "severity": "high",
                    "description": "Class that knows too much or does too much",
                    "suggestion": "Break into smaller, focused classes"
                })
            
            # Check for Copy-Paste Programming
            if await self._has_copy_paste_programming(code):
                anti_patterns.append({
                    "anti_pattern": "Copy-Paste Programming",
                    "file": file_path,
                    "severity": "medium",
                    "description": "Duplicated code blocks",
                    "suggestion": "Extract common functionality into functions"
                })
        
        return anti_patterns
    
    async def _identify_refactoring_opportunities(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify refactoring opportunities based on analysis"""
        opportunities = []
        
        # Opportunities from duplicated code
        duplicates = analysis.get("duplicated_code", [])
        if len(duplicates) > 3:
            opportunities.append({
                "type": "Extract Common Functionality",
                "priority": "high",
                "description": f"Found {len(duplicates)} duplicated code blocks",
                "estimated_effort": "medium",
                "benefits": ["Reduced maintenance", "Better consistency"]
            })
        
        # Opportunities from anti-patterns
        anti_patterns = analysis.get("anti_patterns", [])
        for anti_pattern in anti_patterns:
            opportunities.append({
                "type": "Fix Anti-Pattern",
                "priority": anti_pattern.get("severity", "medium"),
                "description": f"Address {anti_pattern.get('anti_pattern')} in {anti_pattern.get('file')}",
                "estimated_effort": "high",
                "benefits": ["Better code quality", "Improved maintainability"]
            })
        
        return opportunities
    
    async def _cache_project_patterns(self, project_id: str, analysis: Dict[str, Any]):
        """Cache project patterns for cross-project analysis"""
        self.pattern_cache[project_id] = {
            "timestamp": datetime.utcnow().isoformat(),
            "patterns": analysis.get("identified_patterns", []),
            "components": analysis.get("reusable_components", []),
            "architectural_patterns": analysis.get("architectural_patterns", []),
            "design_patterns": analysis.get("design_patterns", [])
        }
    
    async def _build_pattern_database(self):
        """Build database of known patterns"""
        self.pattern_database = {
            "common_utilities": [
                {"name": "formatDate", "pattern": "date formatting utility"},
                {"name": "validateEmail", "pattern": "email validation utility"},
                {"name": "debounce", "pattern": "debounce function"},
                {"name": "throttle", "pattern": "throttle function"}
            ],
            "design_patterns": [
                {"name": "Singleton", "indicators": ["getInstance", "private constructor"]},
                {"name": "Factory", "indicators": ["create", "make", "build"]},
                {"name": "Observer", "indicators": ["subscribe", "notify", "addEventListener"]}
            ]
        }
    
    async def _initialize_similarity_algorithms(self):
        """Initialize code similarity algorithms"""
        self.similarity_threshold = 0.8
        self.min_block_size = 5  # Minimum lines for code block
    
    def _create_code_fingerprint(self, code: str) -> str:
        """Create fingerprint for code block"""
        # Normalize code by removing whitespace and comments
        normalized = self._normalize_code(code)
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def _normalize_code(self, code: str) -> str:
        """Normalize code for comparison"""
        # Remove comments, normalize whitespace
        lines = []
        for line in code.split('\n'):
            stripped = line.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('#'):
                lines.append(stripped)
        return '\n'.join(lines)
    
    def _is_component_file(self, file_path: str) -> bool:
        """Check if file is likely a component"""
        component_indicators = ['.component.', '.jsx', '.tsx', '.vue']
        return any(indicator in file_path.lower() for indicator in component_indicators)
    
    async def _analyze_component_reusability(self, file_path: str, code: str) -> Dict[str, Any]:
        """Analyze how reusable a component is"""
        score = 50  # Base score
        
        # Check for props/parameters
        if 'props' in code or 'parameters' in code:
            score += 20
        
        # Check for hard-coded values
        hardcoded_count = code.count('"') + code.count("'")
        if hardcoded_count < 10:
            score += 15
        
        # Check for external dependencies
        imports = code.count('import')
        if imports < 5:
            score += 15
        
        return {
            "file": file_path,
            "reusability_score": min(100, score),
            "factors": {
                "parameterized": 'props' in code,
                "minimal_hardcoding": hardcoded_count < 10,
                "few_dependencies": imports < 5
            }
        }
    
    async def _extract_code_blocks(self, code: str) -> List[Dict[str, Any]]:
        """Extract meaningful code blocks"""
        blocks = []
        lines = code.split('\n')
        
        current_block = []
        for i, line in enumerate(lines):
            if line.strip():
                current_block.append(line)
            else:
                if len(current_block) >= self.min_block_size:
                    blocks.append({
                        "code": '\n'.join(current_block),
                        "start_line": i - len(current_block) + 1,
                        "end_line": i,
                        "lines": len(current_block)
                    })
                current_block = []
        
        # Handle last block
        if len(current_block) >= self.min_block_size:
            blocks.append({
                "code": '\n'.join(current_block),
                "start_line": len(lines) - len(current_block),
                "end_line": len(lines),
                "lines": len(current_block)
            })
        
        return blocks
    
    # Simplified implementations for pattern detection
    async def _has_mvc_structure(self, codebase: Dict[str, str]) -> bool:
        """Check if codebase follows MVC structure"""
        has_models = any('model' in path.lower() for path in codebase.keys())
        has_views = any('view' in path.lower() or 'component' in path.lower() for path in codebase.keys())
        has_controllers = any('controller' in path.lower() or 'route' in path.lower() for path in codebase.keys())
        return has_models and has_views and has_controllers
    
    async def _has_repository_pattern(self, codebase: Dict[str, str]) -> bool:
        """Check if codebase uses repository pattern"""
        return any('repository' in path.lower() for path in codebase.keys())
    
    async def _has_singleton_pattern(self, code: str) -> bool:
        """Check if code implements singleton pattern"""
        return 'getInstance' in code and 'private' in code
    
    async def _has_factory_pattern(self, code: str) -> bool:
        """Check if code implements factory pattern"""
        factory_indicators = ['create', 'make', 'build', 'factory']
        return any(indicator in code.lower() for indicator in factory_indicators)
    
    async def _has_observer_pattern(self, code: str) -> bool:
        """Check if code implements observer pattern"""
        observer_indicators = ['subscribe', 'notify', 'addEventListener', 'observer']
        return any(indicator in code.lower() for indicator in observer_indicators)
    
    async def _has_god_object(self, code: str) -> bool:
        """Check if code has god object anti-pattern"""
        # Simple heuristic: too many methods or too many lines
        method_count = code.count('def ') + code.count('function ')
        line_count = len(code.split('\n'))
        return method_count > 20 or line_count > 500
    
    async def _has_copy_paste_programming(self, code: str) -> bool:
        """Check for copy-paste programming anti-pattern"""
        # Simple check for similar code blocks
        blocks = await self._extract_code_blocks(code)
        similar_count = 0
        
        for i, block1 in enumerate(blocks):
            for block2 in blocks[i+1:]:
                similarity = difflib.SequenceMatcher(None, block1["code"], block2["code"]).ratio()
                if similarity > 0.8:
                    similar_count += 1
        
        return similar_count > 2
    
    # Additional helper methods would be implemented here
    async def _get_user_projects(self, user_id: str) -> List[str]:
        """Get list of user's projects"""
        # This would query the database
        return []
    
    async def _find_reusable_patterns(self, project_patterns: Dict[str, Any], current_project_id: str) -> List[Dict[str, Any]]:
        """Find patterns that can be reused in current project"""
        return []
    
    async def _find_common_utilities(self, project_patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find common utility functions"""
        return []
    
    async def _find_shared_components(self, project_patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find components that could be shared"""
        return []
    
    async def _identify_optimization_patterns(self, reusable_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify patterns that can optimize performance"""
        return []
    
    async def _suggest_shared_libraries(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest creating shared libraries"""
        return []
    
    async def _extract_file_utilities(self, file_path: str, code: str) -> List[Dict[str, Any]]:
        """Extract utility functions from a file"""
        return []
    
    async def _group_similar_utilities(self, utilities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Group similar utility functions"""
        return utilities
    
    async def _rank_utilities_by_reusability(self, utilities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank utilities by reusability potential"""
        return utilities
    
    async def _identify_function_patterns(self, code: str) -> List[Dict[str, Any]]:
        """Identify function patterns in code"""
        return []
    
    async def _identify_class_patterns(self, code: str) -> List[Dict[str, Any]]:
        """Identify class patterns in code"""
        return []
    
    async def _identify_import_patterns(self, code: str) -> List[Dict[str, Any]]:
        """Identify import patterns in code"""
        return []
    
    async def _get_mvc_files(self, codebase: Dict[str, str]) -> List[str]:
        """Get files that are part of MVC pattern"""
        return []
    
    async def _get_repository_files(self, codebase: Dict[str, str]) -> List[str]:
        """Get files that implement repository pattern"""
        return []
    
    async def _find_duplicate_code_blocks(self, codebase: Dict[str, str]) -> List[Dict[str, Any]]:
        """Find duplicate code blocks across files"""
        return []
    
    async def _group_duplicates_by_similarity(self, duplicates: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """Group duplicates by similarity"""
        return []
    
    async def _create_consolidation_suggestion(self, group: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create consolidation suggestion for a group of duplicates"""
        return {}
    
    async def _calculate_consolidation_savings(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate estimated savings from consolidation"""
        return {
            "lines_of_code": 0,
            "maintenance_effort": "medium",
            "complexity_reduction": "high"
        }
    
    async def _create_consolidation_plan(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create implementation plan for consolidation"""
        return []
    
    async def _extract_common_components(self, all_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract common components across projects"""
        return []
    
    async def _extract_common_utilities(self, all_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract common utilities across projects"""
        return []
    
    async def _extract_common_hooks(self, all_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract common hooks across projects"""
        return []
    
    async def _extract_common_services(self, all_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract common services across projects"""
        return []
    
    async def _extract_common_configurations(self, all_patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract common configurations across projects"""
        return []
    
    async def _calculate_pattern_usage_stats(self, all_patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate usage statistics for patterns"""
        return {}
    
    async def _recommend_pattern_extractions(self, library: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommend which patterns should be extracted to libraries"""
        return []