import logging
import asyncio
import ast
import json
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import subprocess
import tempfile
import os

logger = logging.getLogger(__name__)

class CodeQuality(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    NEEDS_IMPROVEMENT = "needs_improvement"
    POOR = "poor"

class IssueType(Enum):
    BUG = "bug"
    PERFORMANCE = "performance"
    SECURITY = "security"
    MAINTAINABILITY = "maintainability"
    STYLE = "style"
    DOCUMENTATION = "documentation"

class TestType(Enum):
    UNIT = "unit"
    INTEGRATION = "integration"
    E2E = "e2e"
    PERFORMANCE = "performance"

@dataclass
class CodeAnalysisResult:
    file_path: str
    language: str
    quality_score: float
    issues: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]
    complexity_metrics: Dict[str, Any]
    test_coverage: Optional[float] = None
    documentation_score: Optional[float] = None

@dataclass
class BugReport:
    bug_id: str
    severity: str
    category: IssueType
    description: str
    location: Dict[str, Any]
    suggested_fix: str
    confidence: float
    detected_at: datetime

@dataclass
class TestSuite:
    test_id: str
    test_type: TestType
    file_path: str
    test_cases: List[Dict[str, Any]]
    coverage_percentage: float
    execution_time: float
    success_rate: float

class DevelopmentAssistant:
    """AI-powered development assistant with smart code analysis and generation"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.code_analyzer = CodeAnalyzer()
        self.bug_detector = BugDetector()
        self.test_generator = TestGenerator()
        self.documentation_generator = DocumentationGenerator()
        self.performance_analyzer = PerformanceAnalyzer()
        self.security_scanner = SecurityScanner()
        self.refactoring_assistant = RefactoringAssistant()
        self.template_generator = SmartTemplateGenerator()
        self.initialized = False
    
    async def initialize(self):
        """Initialize development assistant"""
        try:
            db = await self.db_client.get_database()
            self.analysis_collection = db.code_analysis
            self.bugs_collection = db.bug_reports
            self.tests_collection = db.test_suites
            self.templates_collection = db.smart_templates
            
            await self.code_analyzer.initialize()
            await self.bug_detector.initialize()
            await self.test_generator.initialize()
            await self.documentation_generator.initialize()
            await self.performance_analyzer.initialize()
            await self.security_scanner.initialize()
            await self.template_generator.initialize()
            
            self.initialized = True
            logger.info("Development assistant initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize development assistant: {e}")
            raise
    
    async def analyze_code(self, code: str, file_path: str = "unknown", context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Comprehensive code analysis with suggestions and improvements"""
        try:
            language = self._detect_language(file_path, code)
            
            # Parallel analysis for better performance
            analysis_tasks = [
                self.code_analyzer.analyze_code_quality(code, language),
                self.bug_detector.detect_bugs(code, language),
                self.performance_analyzer.analyze_performance(code, language), 
                self.security_scanner.scan_security_issues(code, language),
                self._analyze_complexity(code, language),
                self._check_best_practices(code, language)
            ]
            
            results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            # Compile comprehensive analysis
            analysis_result = {
                "file_path": file_path,
                "language": language,
                "quality_score": results[0].get("quality_score", 0.0) if not isinstance(results[0], Exception) else 0.0,
                "bugs": results[1] if not isinstance(results[1], Exception) else [],
                "improvements": results[0].get("suggestions", []) if not isinstance(results[0], Exception) else [],
                "performance_issues": results[2] if not isinstance(results[2], Exception) else [],
                "security_issues": results[3] if not isinstance(results[3], Exception) else [],
                "complexity_metrics": results[4] if not isinstance(results[4], Exception) else {},
                "best_practices": results[5] if not isinstance(results[5], Exception) else [],
                "overall_recommendations": [],
                "documentation": await self.documentation_generator.generate_docs(code, language),
                "tests": await self.test_generator.generate_tests(code, language)
            }
            
            # Generate overall recommendations
            analysis_result["overall_recommendations"] = await self._generate_overall_recommendations(analysis_result)
            
            # Calculate final score
            analysis_result["final_score"] = await self._calculate_final_score(analysis_result)
            
            # Store analysis for learning
            await self._store_analysis_result(analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing code: {e}")
            return {
                "error": str(e),
                "file_path": file_path,
                "language": "unknown",
                "quality_score": 0.0
            }
    
    async def generate_tests(self, code: str, language: str, test_type: TestType = TestType.UNIT) -> Dict[str, Any]:
        """Generate comprehensive test suite for code"""
        try:
            test_suite = await self.test_generator.generate_comprehensive_tests(code, language, test_type)
            
            # Store test suite
            await self.tests_collection.insert_one({
                "test_id": test_suite.test_id,
                "test_type": test_suite.test_type.value,
                "file_path": test_suite.file_path,
                "test_cases": test_suite.test_cases,
                "coverage_percentage": test_suite.coverage_percentage,
                "created_at": datetime.now()
            })
            
            return {
                "test_suite": {
                    "id": test_suite.test_id,
                    "type": test_suite.test_type.value,
                    "test_cases": test_suite.test_cases,
                    "coverage": test_suite.coverage_percentage,
                    "execution_time": test_suite.execution_time
                },
                "recommendations": await self._get_test_recommendations(test_suite),
                "integration_suggestions": await self._suggest_integration_tests(code, language)
            }
            
        except Exception as e:
            logger.error(f"Error generating tests: {e}")
            return {"error": str(e)}
    
    async def generate_documentation(self, code: str, language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate comprehensive documentation for code"""
        try:
            documentation = await self.documentation_generator.generate_comprehensive_docs(
                code, language, context
            )
            
            return {
                "documentation": documentation,
                "quality_score": await self._score_documentation_quality(documentation),
                "suggestions": await self._get_documentation_suggestions(code, documentation),
                "templates": await self._get_documentation_templates(language)
            }
            
        except Exception as e:
            logger.error(f"Error generating documentation: {e}")
            return {"error": str(e)}
    
    async def predict_issues(self, project_id: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Predict potential issues in project codebase"""
        try:
            # Get project files
            project_files = await self._get_project_files(project_id)
            
            if not project_files:
                return {"issues": [], "confidence": 0.0}
            
            # Analyze patterns across the codebase
            pattern_analysis = await self._analyze_codebase_patterns(project_files)
            
            # Predict potential issues
            predicted_issues = await self._predict_issues_from_patterns(pattern_analysis)
            
            # Risk assessment
            risk_assessment = await self._assess_project_risks(project_files, predicted_issues)
            
            return {
                "predicted_issues": predicted_issues,
                "risk_assessment": risk_assessment,
                "prevention_strategies": await self._suggest_prevention_strategies(predicted_issues),
                "monitoring_recommendations": await self._suggest_monitoring_strategies(project_id),
                "confidence": pattern_analysis.get("confidence", 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error predicting issues for project {project_id}: {e}")
            return {"error": str(e)}
    
    async def suggest_refactoring(self, code: str, language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Suggest code refactoring opportunities"""
        try:
            refactoring_suggestions = await self.refactoring_assistant.analyze_refactoring_opportunities(
                code, language, context
            )
            
            return {
                "suggestions": refactoring_suggestions,
                "automated_refactoring": await self._get_automated_refactoring_options(code, language),
                "impact_analysis": await self._analyze_refactoring_impact(refactoring_suggestions),
                "step_by_step_guide": await self._generate_refactoring_guide(refactoring_suggestions)
            }
            
        except Exception as e:
            logger.error(f"Error suggesting refactoring: {e}")
            return {"error": str(e)}
    
    def _detect_language(self, file_path: str, code: str) -> str:
        """Detect programming language from file path and code"""
        # File extension mapping
        extension_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.kt': 'kotlin'
        }
        
        # Try to detect from file extension
        if file_path != "unknown":
            for ext, lang in extension_map.items():
                if file_path.endswith(ext):
                    return lang
        
        # Try to detect from code patterns
        if 'def ' in code or 'import ' in code or 'from ' in code:
            return 'python'
        elif 'function ' in code or 'const ' in code or 'let ' in code:
            return 'javascript'
        elif 'public class' in code or 'private ' in code:
            return 'java'
        
        return 'unknown'
    
    async def _generate_overall_recommendations(self, analysis_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate overall recommendations based on analysis"""
        recommendations = []
        
        # Quality-based recommendations
        quality_score = analysis_result.get("quality_score", 0.0)
        if quality_score < 0.6:
            recommendations.append({
                "type": "quality_improvement",
                "priority": "high",
                "description": "Consider refactoring to improve code quality",
                "impact": "Improved maintainability and readability"
            })
        
        # Bug-based recommendations
        bugs = analysis_result.get("bugs", [])
        if len(bugs) > 0:
            high_severity_bugs = [bug for bug in bugs if bug.get("severity") == "high"]
            if high_severity_bugs:
                recommendations.append({
                    "type": "bug_fixes",
                    "priority": "critical",
                    "description": f"Fix {len(high_severity_bugs)} high-severity bugs",
                    "impact": "Improved stability and reliability"
                })
        
        # Performance recommendations
        performance_issues = analysis_result.get("performance_issues", [])
        if len(performance_issues) > 0:
            recommendations.append({
                "type": "performance_optimization",
                "priority": "medium",
                "description": f"Address {len(performance_issues)} performance issues",
                "impact": "Better application performance"
            })
        
        # Security recommendations
        security_issues = analysis_result.get("security_issues", [])
        if len(security_issues) > 0:
            recommendations.append({
                "type": "security_hardening",
                "priority": "high",
                "description": f"Address {len(security_issues)} security vulnerabilities",
                "impact": "Enhanced application security"
            })
        
        return recommendations

class CodeAnalyzer:
    """Advanced code quality analysis"""
    
    async def initialize(self):
        logger.info("Code analyzer initialized")
    
    async def analyze_code_quality(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code quality with multiple metrics"""
        try:
            if language == 'python':
                return await self._analyze_python_code(code)
            elif language == 'javascript':
                return await self._analyze_javascript_code(code)
            elif language == 'typescript':
                return await self._analyze_typescript_code(code)
            else:
                return await self._analyze_generic_code(code)
                
        except Exception as e:
            logger.error(f"Error analyzing code quality: {e}")
            return {"quality_score": 0.0, "suggestions": []}
    
    async def _analyze_python_code(self, code: str) -> Dict[str, Any]:
        """Analyze Python code quality"""
        try:
            # Parse AST for analysis
            tree = ast.parse(code)
            
            quality_metrics = {
                "cyclomatic_complexity": self._calculate_cyclomatic_complexity(tree),
                "code_length": len(code.split('\n')),
                "function_count": len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]),
                "class_count": len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]),
                "import_count": len([node for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))]),
                "docstring_coverage": self._calculate_docstring_coverage(tree)
            }
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(quality_metrics)
            
            # Generate suggestions
            suggestions = self._generate_python_suggestions(quality_metrics, tree)
            
            return {
                "quality_score": quality_score,
                "metrics": quality_metrics,
                "suggestions": suggestions
            }
            
        except SyntaxError as e:
            return {
                "quality_score": 0.0,
                "error": f"Syntax error: {e}",
                "suggestions": [{"type": "syntax", "description": "Fix syntax errors"}]
            }
        except Exception as e:
            logger.error(f"Error analyzing Python code: {e}")
            return {"quality_score": 0.0, "suggestions": []}

class BugDetector:
    """Advanced bug detection system"""
    
    async def initialize(self):
        self.bug_patterns = await self._load_bug_patterns()
        logger.info("Bug detector initialized")
    
    async def _load_bug_patterns(self):
        """Load bug detection patterns"""
        # Common bug patterns for different languages
        return {
            "python": [
                {"pattern": "except:", "severity": "medium", "description": "Bare except clause"},
                {"pattern": "== None", "severity": "low", "description": "Use 'is None' instead"},
                {"pattern": "eval(", "severity": "high", "description": "Potential code injection"}
            ],
            "javascript": [
                {"pattern": "==", "severity": "medium", "description": "Use strict equality (===)"},
                {"pattern": "innerHTML", "severity": "high", "description": "Potential XSS vulnerability"}
            ]
        }
    
    async def detect_bugs(self, code: str, language: str) -> List[Dict[str, Any]]:
        """Detect potential bugs in code"""
        try:
            bugs = []
            
            # Pattern-based bug detection
            pattern_bugs = await self._detect_pattern_bugs(code, language)
            bugs.extend(pattern_bugs)
            
            # Static analysis bugs
            static_bugs = await self._detect_static_analysis_bugs(code, language)
            bugs.extend(static_bugs)
            
            # Logic bugs
            logic_bugs = await self._detect_logic_bugs(code, language)
            bugs.extend(logic_bugs)
            
            return bugs
            
        except Exception as e:
            logger.error(f"Error detecting bugs: {e}")
            return []
    
    async def _detect_pattern_bugs(self, code: str, language: str) -> List[Dict[str, Any]]:
        """Detect bugs based on common patterns"""
        bugs = []
        
        if language == 'python':
            # Check for common Python bugs
            if 'except:' in code:
                bugs.append({
                    "type": "exception_handling",
                    "severity": "medium",
                    "description": "Bare except clause catches all exceptions",
                    "line": self._find_line_number(code, 'except:'),
                    "suggestion": "Use specific exception types"
                })
            
            if '== None' in code:
                bugs.append({
                    "type": "comparison",
                    "severity": "low",
                    "description": "Use 'is None' instead of '== None'",
                    "line": self._find_line_number(code, '== None'),
                    "suggestion": "Replace with 'is None'"
                })
        
        elif language == 'javascript':
            # Check for common JavaScript bugs
            if '==' in code and '===' not in code:
                bugs.append({
                    "type": "equality_check",
                    "severity": "medium",
                    "description": "Use strict equality (===) instead of loose equality (==)",
                    "line": self._find_line_number(code, '=='),
                    "suggestion": "Replace == with ==="
                })
        
        return bugs

class TestGenerator:
    """Intelligent test generation system"""
    
    async def initialize(self):
        self.test_templates = await self._load_test_templates()
        logger.info("Test generator initialized")
    
    async def _load_test_templates(self):
        """Load test templates for different languages"""
        return {
            "python": {
                "unit_test": "import unittest\n\nclass Test{ClassName}(unittest.TestCase):\n    def test_{method_name}(self):\n        # Test implementation\n        pass",
                "pytest": "import pytest\n\ndef test_{method_name}():\n    # Test implementation\n    pass"
            },
            "javascript": {
                "jest": "describe('{module_name}', () => {\n  test('{test_description}', () => {\n    // Test implementation\n  });\n});",
                "mocha": "describe('{module_name}', () => {\n  it('{test_description}', () => {\n    // Test implementation\n  });\n});"
            }
        }
    
    async def generate_comprehensive_tests(self, code: str, language: str, test_type: TestType) -> TestSuite:
        """Generate comprehensive test suite"""
        try:
            test_cases = []
            
            if language == 'python':
                test_cases = await self._generate_python_tests(code, test_type)
            elif language == 'javascript':
                test_cases = await self._generate_javascript_tests(code, test_type)
            
            # Calculate coverage estimate
            coverage = await self._estimate_test_coverage(code, test_cases)
            
            return TestSuite(
                test_id=f"test_{int(datetime.now().timestamp())}",
                test_type=test_type,
                file_path="generated_tests.py" if language == 'python' else "generated_tests.js",
                test_cases=test_cases,
                coverage_percentage=coverage,
                execution_time=0.0,  # Will be updated when tests run
                success_rate=1.0  # Optimistic initial value
            )
            
        except Exception as e:
            logger.error(f"Error generating tests: {e}")
            return TestSuite(
                test_id="error",
                test_type=test_type,
                file_path="",
                test_cases=[],
                coverage_percentage=0.0,
                execution_time=0.0,
                success_rate=0.0
            )

class DocumentationGenerator:
    """Intelligent documentation generation"""
    
    async def initialize(self):
        logger.info("Documentation generator initialized")
    
    async def generate_comprehensive_docs(self, code: str, language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate comprehensive documentation"""
        try:
            if language == 'python':
                return await self._generate_python_docs(code, context)
            elif language == 'javascript':
                return await self._generate_javascript_docs(code, context)
            else:
                return await self._generate_generic_docs(code, context)
                
        except Exception as e:
            logger.error(f"Error generating documentation: {e}")
            return {"error": str(e)}

class PerformanceAnalyzer:
    """Performance analysis and optimization suggestions"""
    
    async def analyze_performance(self, code: str, language: str) -> List[Dict[str, Any]]:
        """Analyze code for performance issues"""
        try:
            issues = []
            
            if language == 'python':
                issues = await self._analyze_python_performance(code)
            elif language == 'javascript':
                issues = await self._analyze_javascript_performance(code)
            
            return issues
            
        except Exception as e:
            logger.error(f"Error analyzing performance: {e}")
            return []

class SecurityScanner:
    """Security vulnerability scanner"""
    
    async def scan_security_issues(self, code: str, language: str) -> List[Dict[str, Any]]:
        """Scan for security vulnerabilities"""
        try:
            vulnerabilities = []
            
            # Common security patterns
            if 'eval(' in code:
                vulnerabilities.append({
                    "type": "code_injection",
                    "severity": "high",
                    "description": "Use of eval() can lead to code injection",
                    "recommendation": "Avoid eval() or use safer alternatives"
                })
            
            if 'subprocess.call' in code and 'shell=True' in code:
                vulnerabilities.append({
                    "type": "command_injection",
                    "severity": "high", 
                    "description": "Shell command injection vulnerability",
                    "recommendation": "Avoid shell=True or sanitize inputs"
                })
            
            return vulnerabilities
            
        except Exception as e:
            logger.error(f"Error scanning security issues: {e}")
            return []

class RefactoringAssistant:
    """Code refactoring assistance"""
    
    async def analyze_refactoring_opportunities(self, code: str, language: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Identify refactoring opportunities"""
        opportunities = []
        
        # Long function detection
        if language == 'python':
            lines = code.split('\n')
            in_function = False
            function_length = 0
            
            for line in lines:
                if line.strip().startswith('def '):
                    in_function = True
                    function_length = 0
                elif in_function:
                    function_length += 1
                    if function_length > 50:  # Function too long
                        opportunities.append({
                            "type": "extract_method",
                            "description": "Function is too long, consider breaking it down",
                            "priority": "medium"
                        })
                        in_function = False
        
        return opportunities

class SmartTemplateGenerator:
    """Generate templates from successful projects"""
    
    async def initialize(self):
        logger.info("Smart template generator initialized")
    
    async def generate_template(self, successful_projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate template from successful projects"""
        try:
            # Analyze common patterns
            common_patterns = await self._extract_common_patterns(successful_projects)
            
            # Identify best practices
            best_practices = await self._identify_best_practices(common_patterns)
            
            # Generate template structure
            template = await self._synthesize_template(common_patterns, best_practices)
            
            return template
            
        except Exception as e:
            logger.error(f"Error generating template: {e}")
            return {"error": str(e)}