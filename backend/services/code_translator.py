from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime
import re
import ast

class CodeTranslator:
    """AI service for multi-language code translation"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.translation_cache = {}
        self.language_mappings = {}
        self.syntax_patterns = {}
    
    async def initialize(self):
        """Initialize the code translator"""
        try:
            await self._load_language_mappings()
            await self._load_syntax_patterns()
            await self._initialize_translation_rules()
            return True
        except Exception as e:
            print(f"Code Translator initialization error: {e}")
            return False
    
    async def translate_code(self, source_code: str, source_lang: str, target_lang: str, context: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Translate code from source language to target language"""
        try:
            translation = {
                "source_language": source_lang,
                "target_language": target_lang,
                "timestamp": datetime.utcnow().isoformat(),
                "original_code": source_code,
                "translated_code": "",
                "translation_confidence": 0.0,
                "syntax_mappings": [],
                "manual_review_needed": [],
                "translation_notes": [],
                "alternative_approaches": []
            }
            
            # Analyze source code structure
            code_analysis = await self._analyze_code_structure(source_code, source_lang)
            
            # Perform syntax translation
            translated_code = await self._translate_syntax(source_code, source_lang, target_lang, code_analysis)
            translation["translated_code"] = translated_code
            
            # Map language constructs
            translation["syntax_mappings"] = await self._create_syntax_mappings(code_analysis, source_lang, target_lang)
            
            # Calculate confidence score
            translation["translation_confidence"] = await self._calculate_confidence(code_analysis, source_lang, target_lang)
            
            # Identify items needing manual review
            translation["manual_review_needed"] = await self._identify_manual_review_items(code_analysis, source_lang, target_lang)
            
            # Generate translation notes
            translation["translation_notes"] = await self._generate_translation_notes(code_analysis, source_lang, target_lang)
            
            # Suggest alternative approaches
            translation["alternative_approaches"] = await self._suggest_alternatives(code_analysis, target_lang)
            
            # Cache translation
            cache_key = f"{source_lang}_{target_lang}_{hash(source_code)}"
            self.translation_cache[cache_key] = translation
            
            return translation
        except Exception as e:
            return {"error": str(e), "source_language": source_lang, "target_language": target_lang}
    
    async def translate_algorithms(self, algorithm_code: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate algorithms preserving logic and efficiency"""
        try:
            translation = {
                "algorithm_type": await self._identify_algorithm_type(algorithm_code),
                "complexity_analysis": await self._analyze_complexity(algorithm_code, source_lang),
                "translated_versions": [],
                "optimization_suggestions": [],
                "performance_notes": []
            }
            
            # Create multiple translation approaches
            approaches = ["direct_translation", "idiomatic_translation", "optimized_translation"]
            
            for approach in approaches:
                translated_version = await self._translate_with_approach(
                    algorithm_code, source_lang, target_lang, approach
                )
                translation["translated_versions"].append(translated_version)
            
            # Add optimization suggestions
            translation["optimization_suggestions"] = await self._suggest_optimizations(
                algorithm_code, target_lang
            )
            
            # Performance considerations
            translation["performance_notes"] = await self._analyze_performance_implications(
                source_lang, target_lang, translation["algorithm_type"]
            )
            
            return translation
        except Exception as e:
            return {"error": str(e)}
    
    async def translate_frameworks(self, framework_code: str, source_framework: str, target_framework: str) -> Dict[str, Any]:
        """Translate between different frameworks (React to Vue, Express to FastAPI, etc.)"""
        try:
            translation = {
                "source_framework": source_framework,
                "target_framework": target_framework,
                "timestamp": datetime.utcnow().isoformat(),
                "component_mappings": [],
                "lifecycle_mappings": [],
                "state_management_translation": {},
                "routing_translation": {},
                "api_translations": [],
                "migration_steps": []
            }
            
            # Analyze framework-specific patterns
            framework_analysis = await self._analyze_framework_patterns(framework_code, source_framework)
            
            # Map components
            translation["component_mappings"] = await self._map_components(
                framework_analysis, source_framework, target_framework
            )
            
            # Map lifecycle methods
            translation["lifecycle_mappings"] = await self._map_lifecycle_methods(
                framework_analysis, source_framework, target_framework
            )
            
            # Translate state management
            translation["state_management_translation"] = await self._translate_state_management(
                framework_analysis, source_framework, target_framework
            )
            
            # Translate routing
            translation["routing_translation"] = await self._translate_routing(
                framework_analysis, source_framework, target_framework
            )
            
            # Create migration steps
            translation["migration_steps"] = await self._create_migration_steps(translation)
            
            return translation
        except Exception as e:
            return {"error": str(e)}
    
    async def detect_language(self, code: str) -> Dict[str, Any]:
        """Automatically detect programming language from code"""
        try:
            detection = {
                "detected_language": "unknown",
                "confidence": 0.0,
                "possible_languages": [],
                "language_indicators": {},
                "framework_hints": []
            }
            
            # Check for language-specific syntax patterns
            language_scores = {}
            
            for lang, patterns in self.syntax_patterns.items():
                score = await self._calculate_language_score(code, patterns)
                language_scores[lang] = score
            
            # Sort by confidence
            sorted_languages = sorted(language_scores.items(), key=lambda x: x[1], reverse=True)
            
            if sorted_languages:
                detection["detected_language"] = sorted_languages[0][0]
                detection["confidence"] = sorted_languages[0][1]
                detection["possible_languages"] = [
                    {"language": lang, "confidence": score}
                    for lang, score in sorted_languages[:3]
                ]
            
            # Identify language-specific indicators
            detection["language_indicators"] = await self._identify_language_indicators(code)
            
            # Detect framework hints
            detection["framework_hints"] = await self._detect_framework_hints(code)
            
            return detection
        except Exception as e:
            return {"error": str(e)}
    
    async def suggest_improvements(self, translated_code: str, target_lang: str) -> List[Dict[str, Any]]:
        """Suggest improvements for translated code to make it more idiomatic"""
        try:
            improvements = []
            
            # Check for language-specific best practices
            best_practices = await self._get_language_best_practices(target_lang)
            
            for practice in best_practices:
                if await self._check_practice_violation(translated_code, practice):
                    improvements.append({
                        "type": "best_practice",
                        "issue": practice["issue"],
                        "suggestion": practice["suggestion"],
                        "example": practice.get("example", ""),
                        "impact": practice.get("impact", "medium")
                    })
            
            # Check for performance improvements
            performance_improvements = await self._suggest_performance_improvements(translated_code, target_lang)
            improvements.extend(performance_improvements)
            
            # Check for readability improvements
            readability_improvements = await self._suggest_readability_improvements(translated_code, target_lang)
            improvements.extend(readability_improvements)
            
            # Sort by impact
            improvements.sort(key=lambda x: {"high": 3, "medium": 2, "low": 1}.get(x.get("impact", "low"), 1), reverse=True)
            
            return improvements
        except Exception as e:
            return [{"error": str(e)}]
    
    async def _analyze_code_structure(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze the structure of source code"""
        analysis = {
            "functions": [],
            "classes": [],
            "imports": [],
            "variables": [],
            "control_structures": [],
            "data_structures": [],
            "complexity_score": 0
        }
        
        if language == "python":
            analysis = await self._analyze_python_structure(code)
        elif language in ["javascript", "typescript"]:
            analysis = await self._analyze_js_structure(code)
        elif language == "java":
            analysis = await self._analyze_java_structure(code)
        elif language in ["c", "cpp"]:
            analysis = await self._analyze_c_structure(code)
        
        return analysis
    
    async def _translate_syntax(self, code: str, source_lang: str, target_lang: str, analysis: Dict[str, Any]) -> str:
        """Perform the actual syntax translation"""
        translated_code = code
        
        # Get translation rules for language pair
        rules = self.language_mappings.get(f"{source_lang}_to_{target_lang}", {})
        
        # Apply syntax transformations
        for pattern, replacement in rules.get("syntax_rules", {}).items():
            translated_code = re.sub(pattern, replacement, translated_code)
        
        # Translate function definitions
        translated_code = await self._translate_functions(translated_code, source_lang, target_lang, analysis)
        
        # Translate data types
        translated_code = await self._translate_data_types(translated_code, source_lang, target_lang)
        
        # Translate control structures
        translated_code = await self._translate_control_structures(translated_code, source_lang, target_lang)
        
        # Clean up and format
        translated_code = await self._format_translated_code(translated_code, target_lang)
        
        return translated_code
    
    async def _create_syntax_mappings(self, analysis: Dict[str, Any], source_lang: str, target_lang: str) -> List[Dict[str, Any]]:
        """Create mappings between source and target language constructs"""
        mappings = []
        
        # Function mappings
        for func in analysis.get("functions", []):
            mapping = await self._map_function_syntax(func, source_lang, target_lang)
            if mapping:
                mappings.append(mapping)
        
        # Class mappings
        for cls in analysis.get("classes", []):
            mapping = await self._map_class_syntax(cls, source_lang, target_lang)
            if mapping:
                mappings.append(mapping)
        
        # Import mappings
        for imp in analysis.get("imports", []):
            mapping = await self._map_import_syntax(imp, source_lang, target_lang)
            if mapping:
                mappings.append(mapping)
        
        return mappings
    
    async def _calculate_confidence(self, analysis: Dict[str, Any], source_lang: str, target_lang: str) -> float:
        """Calculate confidence score for translation"""
        base_confidence = 0.7
        
        # Language similarity factor
        similarity = self._get_language_similarity(source_lang, target_lang)
        base_confidence *= similarity
        
        # Code complexity factor
        complexity = analysis.get("complexity_score", 0)
        if complexity > 5:
            base_confidence *= 0.8
        elif complexity < 2:
            base_confidence *= 1.1
        
        # Available mapping rules factor
        rules_available = len(self.language_mappings.get(f"{source_lang}_to_{target_lang}", {}))
        if rules_available > 10:
            base_confidence *= 1.1
        elif rules_available < 3:
            base_confidence *= 0.7
        
        return min(1.0, max(0.1, base_confidence))
    
    async def _identify_manual_review_items(self, analysis: Dict[str, Any], source_lang: str, target_lang: str) -> List[str]:
        """Identify code sections that need manual review"""
        review_items = []
        
        # Complex functions
        complex_functions = [f for f in analysis.get("functions", []) if f.get("complexity", 0) > 5]
        if complex_functions:
            review_items.append(f"Review {len(complex_functions)} complex functions for logic accuracy")
        
        # Language-specific constructs
        if source_lang == "python" and target_lang == "javascript":
            if any("list_comprehension" in str(f) for f in analysis.get("functions", [])):
                review_items.append("Convert Python list comprehensions to appropriate JavaScript patterns")
        
        # Memory management differences
        if source_lang in ["c", "cpp"] and target_lang in ["python", "javascript"]:
            review_items.append("Review memory management - automatic garbage collection in target language")
        
        # Concurrency models
        if "async" in str(analysis) or "thread" in str(analysis):
            review_items.append("Review concurrency model differences between languages")
        
        return review_items
    
    async def _generate_translation_notes(self, analysis: Dict[str, Any], source_lang: str, target_lang: str) -> List[str]:
        """Generate helpful notes about the translation"""
        notes = []
        
        # Language paradigm differences
        if source_lang == "java" and target_lang == "python":
            notes.append("Java's static typing converted to Python's dynamic typing")
            notes.append("Access modifiers (private/protected) have no direct equivalent in Python")
        
        if source_lang == "python" and target_lang == "javascript":
            notes.append("Python indentation-based blocks converted to brace-based blocks")
            notes.append("Python's duck typing may need explicit type checking in JavaScript")
        
        # Performance considerations
        if source_lang in ["c", "cpp"] and target_lang in ["python", "javascript"]:
            notes.append("Performance may be lower in interpreted language - consider optimization")
        
        # Library ecosystem differences
        notes.append(f"Consider using {target_lang}-specific libraries for better performance and idioms")
        
        return notes
    
    async def _suggest_alternatives(self, analysis: Dict[str, Any], target_lang: str) -> List[Dict[str, Any]]:
        """Suggest alternative approaches in target language"""
        alternatives = []
        
        # Function vs Class-based approaches
        if len(analysis.get("functions", [])) > len(analysis.get("classes", [])):
            alternatives.append({
                "approach": "functional",
                "description": f"Consider using {target_lang}'s functional programming features",
                "benefit": "More idiomatic and often more performant"
            })
        
        # Data structure alternatives
        if target_lang == "python":
            alternatives.append({
                "approach": "collections",
                "description": "Use Python's collections module for specialized data structures",
                "benefit": "Better performance and more Pythonic code"
            })
        
        if target_lang == "javascript":
            alternatives.append({
                "approach": "modern_js",
                "description": "Use modern JavaScript features (arrow functions, destructuring, async/await)",
                "benefit": "More concise and readable code"
            })
        
        return alternatives
    
    async def _load_language_mappings(self):
        """Load language-to-language mapping rules"""
        self.language_mappings = {
            "python_to_javascript": {
                "syntax_rules": {
                    r"def\s+(\w+)\s*\((.*?)\):": r"function \1(\2) {",
                    r"elif": "else if",
                    r"True": "true",
                    r"False": "false",
                    r"None": "null",
                    r"print\((.*?)\)": r"console.log(\1)",
                    r"len\((.*?)\)": r"\1.length",
                    r"str\((.*?)\)": r"String(\1)",
                    r"int\((.*?)\)": r"parseInt(\1)"
                },
                "data_types": {
                    "list": "Array",
                    "dict": "Object",
                    "str": "string",
                    "int": "number",
                    "float": "number",
                    "bool": "boolean"
                }
            },
            "javascript_to_python": {
                "syntax_rules": {
                    r"function\s+(\w+)\s*\((.*?)\)\s*{": r"def \1(\2):",
                    r"else if": "elif",
                    r"true": "True",
                    r"false": "False",
                    r"null": "None",
                    r"console\.log\((.*?)\)": r"print(\1)",
                    r"\.length": "len()",
                    r"String\((.*?)\)": r"str(\1)",
                    r"parseInt\((.*?)\)": r"int(\1)"
                }
            },
            "java_to_python": {
                "syntax_rules": {
                    r"public\s+class\s+(\w+)": r"class \1:",
                    r"public\s+static\s+void\s+main": "def main",
                    r"System\.out\.println\((.*?)\)": r"print(\1)",
                    r"String\[\]": "list",
                    r"private\s+": "",
                    r"public\s+": ""
                }
            }
        }
    
    async def _load_syntax_patterns(self):
        """Load syntax patterns for language detection"""
        self.syntax_patterns = {
            "python": {
                "keywords": ["def", "class", "import", "from", "if", "elif", "else", "for", "while", "try", "except"],
                "operators": ["and", "or", "not", "in", "is"],
                "syntax": [r"def\s+\w+\s*\(", r"class\s+\w+", r"if\s+.*:", r"for\s+\w+\s+in"],
                "imports": [r"import\s+\w+", r"from\s+\w+\s+import"]
            },
            "javascript": {
                "keywords": ["function", "var", "let", "const", "if", "else", "for", "while", "try", "catch"],
                "operators": ["&&", "||", "!", "===", "!=="],
                "syntax": [r"function\s+\w+\s*\(", r"=>\s*{", r"if\s*\(", r"for\s*\("],
                "imports": [r"import\s+.*from", r"require\s*\("]
            },
            "java": {
                "keywords": ["public", "private", "class", "interface", "if", "else", "for", "while", "try", "catch"],
                "operators": ["&&", "||", "!", "==", "!="],
                "syntax": [r"public\s+class", r"private\s+\w+", r"public\s+static", r"if\s*\("],
                "imports": [r"import\s+[\w\.]+;"]
            },
            "cpp": {
                "keywords": ["class", "public", "private", "if", "else", "for", "while", "try", "catch"],
                "operators": ["&&", "||", "!", "==", "!=", "<<", ">>"],
                "syntax": [r"#include\s*<", r"class\s+\w+", r"int\s+main\s*\(", r"std::"],
                "imports": [r"#include\s*[<\"]"]
            }
        }
    
    async def _initialize_translation_rules(self):
        """Initialize translation rules and patterns"""
        self.translation_rules = {
            "function_patterns": {
                "python": r"def\s+(\w+)\s*\((.*?)\):",
                "javascript": r"function\s+(\w+)\s*\((.*?)\)\s*{",
                "java": r"(public|private|protected)?\s*(static)?\s*\w+\s+(\w+)\s*\((.*?)\)\s*{"
            },
            "class_patterns": {
                "python": r"class\s+(\w+)(?:\(.*?\))?:",
                "javascript": r"class\s+(\w+)(?:\s+extends\s+\w+)?\s*{",
                "java": r"(public|private)?\s*class\s+(\w+)(?:\s+extends\s+\w+)?\s*{"
            }
        }
    
    def _get_language_similarity(self, lang1: str, lang2: str) -> float:
        """Get similarity score between two languages"""
        similarity_matrix = {
            ("python", "ruby"): 0.8,
            ("javascript", "typescript"): 0.9,
            ("java", "c#"): 0.85,
            ("c", "cpp"): 0.9,
            ("python", "javascript"): 0.6,
            ("java", "python"): 0.7,
            ("javascript", "java"): 0.65
        }
        
        # Check both directions
        score = similarity_matrix.get((lang1, lang2)) or similarity_matrix.get((lang2, lang1))
        return score or 0.5  # Default similarity
    
    # Placeholder implementations for complex analysis methods
    async def _analyze_python_structure(self, code: str) -> Dict[str, Any]:
        """Analyze Python code structure"""
        # Simplified implementation
        return {
            "functions": re.findall(r"def\s+(\w+)\s*\(([^)]*)\):", code),
            "classes": re.findall(r"class\s+(\w+)", code),
            "imports": re.findall(r"(?:from\s+\w+\s+)?import\s+([\w,\s]+)", code),
            "complexity_score": min(10, code.count("if") + code.count("for") + code.count("while"))
        }
    
    async def _analyze_js_structure(self, code: str) -> Dict[str, Any]:
        """Analyze JavaScript code structure"""
        return {
            "functions": re.findall(r"function\s+(\w+)\s*\(([^)]*)\)", code),
            "classes": re.findall(r"class\s+(\w+)", code),
            "imports": re.findall(r"import\s+.*from\s+['\"]([^'\"]+)['\"]", code),
            "complexity_score": min(10, code.count("if") + code.count("for") + code.count("while"))
        }
    
    async def _analyze_java_structure(self, code: str) -> Dict[str, Any]:
        """Analyze Java code structure"""
        return {
            "functions": re.findall(r"(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\([^)]*\)", code),
            "classes": re.findall(r"(?:public|private)?\s*class\s+(\w+)", code),
            "imports": re.findall(r"import\s+([\w\.]+);", code),
            "complexity_score": min(10, code.count("if") + code.count("for") + code.count("while"))
        }
    
    async def _analyze_c_structure(self, code: str) -> Dict[str, Any]:
        """Analyze C/C++ code structure"""
        return {
            "functions": re.findall(r"(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{", code),
            "classes": re.findall(r"class\s+(\w+)", code),
            "imports": re.findall(r"#include\s*[<\"]([^>\"]+)[>\"]", code),
            "complexity_score": min(10, code.count("if") + code.count("for") + code.count("while"))
        }
    
    # Additional placeholder methods for comprehensive functionality
    async def _translate_functions(self, code: str, source_lang: str, target_lang: str, analysis: Dict[str, Any]) -> str:
        return code  # Simplified
    
    async def _translate_data_types(self, code: str, source_lang: str, target_lang: str) -> str:
        return code  # Simplified
    
    async def _translate_control_structures(self, code: str, source_lang: str, target_lang: str) -> str:
        return code  # Simplified
    
    async def _format_translated_code(self, code: str, target_lang: str) -> str:
        return code  # Simplified
    
    async def _map_function_syntax(self, func: Any, source_lang: str, target_lang: str) -> Optional[Dict[str, Any]]:
        return None  # Simplified
    
    async def _map_class_syntax(self, cls: Any, source_lang: str, target_lang: str) -> Optional[Dict[str, Any]]:
        return None  # Simplified
    
    async def _map_import_syntax(self, imp: Any, source_lang: str, target_lang: str) -> Optional[Dict[str, Any]]:
        return None  # Simplified
    
    async def _calculate_language_score(self, code: str, patterns: Dict[str, List[str]]) -> float:
        score = 0.0
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                matches = len(re.findall(pattern, code, re.IGNORECASE))
                score += matches * 0.1
        return min(1.0, score)
    
    async def _identify_language_indicators(self, code: str) -> Dict[str, List[str]]:
        return {"keywords": [], "syntax": [], "imports": []}  # Simplified
    
    async def _detect_framework_hints(self, code: str) -> List[str]:
        return []  # Simplified
    
    async def _get_language_best_practices(self, language: str) -> List[Dict[str, Any]]:
        return []  # Simplified
    
    async def _check_practice_violation(self, code: str, practice: Dict[str, Any]) -> bool:
        return False  # Simplified
    
    async def _suggest_performance_improvements(self, code: str, language: str) -> List[Dict[str, Any]]:
        return []  # Simplified
    
    async def _suggest_readability_improvements(self, code: str, language: str) -> List[Dict[str, Any]]:
        return []  # Simplified
    
    # Additional methods for algorithm and framework translation
    async def _identify_algorithm_type(self, code: str) -> str:
        return "general"  # Simplified
    
    async def _analyze_complexity(self, code: str, language: str) -> Dict[str, Any]:
        return {"time_complexity": "O(n)", "space_complexity": "O(1)"}  # Simplified
    
    async def _translate_with_approach(self, code: str, source_lang: str, target_lang: str, approach: str) -> Dict[str, Any]:
        return {"approach": approach, "code": code, "notes": []}  # Simplified
    
    async def _suggest_optimizations(self, code: str, target_lang: str) -> List[str]:
        return []  # Simplified
    
    async def _analyze_performance_implications(self, source_lang: str, target_lang: str, algorithm_type: str) -> List[str]:
        return []  # Simplified
    
    async def _analyze_framework_patterns(self, code: str, framework: str) -> Dict[str, Any]:
        return {"components": [], "lifecycle": [], "state": []}  # Simplified
    
    async def _map_components(self, analysis: Dict[str, Any], source: str, target: str) -> List[Dict[str, Any]]:
        return []  # Simplified
    
    async def _map_lifecycle_methods(self, analysis: Dict[str, Any], source: str, target: str) -> List[Dict[str, Any]]:
        return []  # Simplified
    
    async def _translate_state_management(self, analysis: Dict[str, Any], source: str, target: str) -> Dict[str, Any]:
        return {}  # Simplified
    
    async def _translate_routing(self, analysis: Dict[str, Any], source: str, target: str) -> Dict[str, Any]:
        return {}  # Simplified
    
    async def _create_migration_steps(self, translation: Dict[str, Any]) -> List[str]:
        return []  # Simplified