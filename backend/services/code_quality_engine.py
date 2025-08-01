from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime
import re
import ast
import math

class CodeQualityEngine:
    """AI service for real-time code quality scoring and improvement suggestions"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.quality_metrics = {}
        self.scoring_cache = {}
        self.quality_rules = {}
    
    async def initialize(self):
        """Initialize the code quality engine"""
        try:
            await self._load_quality_rules()
            await self._initialize_metrics()
            return True
        except Exception as e:
            print(f"Code Quality Engine initialization error: {e}")
            return False
    
    async def analyze_code_quality(self, code: str, file_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze code quality and provide comprehensive scoring"""
        try:
            analysis = {
                "timestamp": datetime.utcnow().isoformat(),
                "file_type": file_type,
                "overall_score": 0,
                "category_scores": {},
                "metrics": {},
                "issues": [],
                "suggestions": [],
                "security_analysis": {},
                "performance_analysis": {},
                "maintainability_score": 0
            }
            
            # Calculate various quality metrics
            analysis["metrics"] = await self._calculate_metrics(code, file_type)
            analysis["category_scores"] = await self._calculate_category_scores(code, file_type)
            analysis["overall_score"] = await self._calculate_overall_score(analysis["category_scores"])
            analysis["issues"] = await self._identify_issues(code, file_type)
            analysis["suggestions"] = await self._generate_suggestions(code, file_type, analysis["issues"])
            analysis["security_analysis"] = await self._analyze_security(code, file_type)
            analysis["performance_analysis"] = await self._analyze_performance(code, file_type)
            analysis["maintainability_score"] = await self._calculate_maintainability(code, file_type)
            
            return analysis
        except Exception as e:
            return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    async def get_realtime_quality_feedback(self, code: str, file_type: str, cursor_position: Dict[str, int]) -> Dict[str, Any]:
        """Provide real-time quality feedback as user types"""
        try:
            feedback = {
                "timestamp": datetime.utcnow().isoformat(),
                "cursor_line": cursor_position.get("line", 0),
                "immediate_issues": [],
                "suggestions": [],
                "quick_fixes": [],
                "quality_trend": "stable"
            }
            
            # Analyze the current line and surrounding context
            lines = code.split('\n')
            current_line = cursor_position.get("line", 0)
            
            if current_line < len(lines):
                line_code = lines[current_line]
                feedback["immediate_issues"] = await self._analyze_line_quality(line_code, file_type, current_line)
                feedback["suggestions"] = await self._get_line_suggestions(line_code, file_type)
                feedback["quick_fixes"] = await self._generate_quick_fixes(line_code, file_type)
            
            # Calculate quality trend
            feedback["quality_trend"] = await self._calculate_quality_trend(code, file_type)
            
            return feedback
        except Exception as e:
            return {"error": str(e)}
    
    async def suggest_code_improvements(self, code: str, file_type: str, focus_area: str = "all") -> List[Dict[str, Any]]:
        """Suggest specific code improvements"""
        try:
            improvements = []
            
            if focus_area in ["all", "performance"]:
                perf_improvements = await self._suggest_performance_improvements(code, file_type)
                improvements.extend(perf_improvements)
            
            if focus_area in ["all", "readability"]:
                readability_improvements = await self._suggest_readability_improvements(code, file_type)
                improvements.extend(readability_improvements)
            
            if focus_area in ["all", "security"]:
                security_improvements = await self._suggest_security_improvements(code, file_type)
                improvements.extend(security_improvements)
            
            if focus_area in ["all", "maintainability"]:
                maintainability_improvements = await self._suggest_maintainability_improvements(code, file_type)
                improvements.extend(maintainability_improvements)
            
            # Sort by impact and effort
            improvements.sort(key=lambda x: (x.get("impact_score", 0), -x.get("effort_score", 0)), reverse=True)
            
            return improvements
        except Exception as e:
            return [{"error": str(e)}]
    
    async def detect_code_smells(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect code smells and anti-patterns"""
        try:
            smells = []
            
            # Long method detection
            long_methods = await self._detect_long_methods(code, file_type)
            smells.extend(long_methods)
            
            # Duplicate code detection
            duplicates = await self._detect_duplicate_code(code, file_type)
            smells.extend(duplicates)
            
            # Complex conditionals
            complex_conditionals = await self._detect_complex_conditionals(code, file_type)
            smells.extend(complex_conditionals)
            
            # Large classes
            large_classes = await self._detect_large_classes(code, file_type)
            smells.extend(large_classes)
            
            # Dead code
            dead_code = await self._detect_dead_code(code, file_type)
            smells.extend(dead_code)
            
            return smells
        except Exception as e:
            return [{"error": str(e)}]
    
    async def generate_quality_report(self, project_files: Dict[str, str]) -> Dict[str, Any]:
        """Generate comprehensive quality report for entire project"""
        try:
            report = {
                "timestamp": datetime.utcnow().isoformat(),
                "project_summary": {
                    "total_files": len(project_files),
                    "total_lines": 0,
                    "overall_score": 0,
                    "quality_grade": "A"
                },
                "file_scores": {},
                "category_breakdown": {},
                "trends": {},
                "recommendations": [],
                "hotspots": []
            }
            
            total_score = 0
            total_lines = 0
            
            # Analyze each file
            for file_path, code in project_files.items():
                file_type = self._get_file_type(file_path)
                analysis = await self.analyze_code_quality(code, file_type, {})
                
                report["file_scores"][file_path] = {
                    "score": analysis.get("overall_score", 0),
                    "lines": len(code.split('\n')),
                    "issues": len(analysis.get("issues", [])),
                    "suggestions": len(analysis.get("suggestions", []))
                }
                
                total_score += analysis.get("overall_score", 0)
                total_lines += len(code.split('\n'))
            
            # Calculate project averages
            if project_files:
                report["project_summary"]["overall_score"] = total_score / len(project_files)
                report["project_summary"]["total_lines"] = total_lines
                report["project_summary"]["quality_grade"] = self._score_to_grade(report["project_summary"]["overall_score"])
            
            # Generate recommendations
            report["recommendations"] = await self._generate_project_recommendations(report["file_scores"])
            
            # Identify quality hotspots
            report["hotspots"] = await self._identify_quality_hotspots(report["file_scores"])
            
            return report
        except Exception as e:
            return {"error": str(e)}
    
    async def _calculate_metrics(self, code: str, file_type: str) -> Dict[str, Any]:
        """Calculate various code metrics"""
        lines = code.split('\n')
        
        metrics = {
            "lines_of_code": len([line for line in lines if line.strip()]),
            "comment_lines": len([line for line in lines if line.strip().startswith(('#', '//', '/*'))]),
            "blank_lines": len([line for line in lines if not line.strip()]),
            "cyclomatic_complexity": await self._calculate_cyclomatic_complexity(code, file_type),
            "function_count": await self._count_functions(code, file_type),
            "class_count": await self._count_classes(code, file_type),
            "max_line_length": max(len(line) for line in lines) if lines else 0,
            "avg_line_length": sum(len(line) for line in lines) / len(lines) if lines else 0
        }
        
        # Add comment ratio
        total_lines = metrics["lines_of_code"] + metrics["comment_lines"]
        metrics["comment_ratio"] = (metrics["comment_lines"] / total_lines * 100) if total_lines > 0 else 0
        
        return metrics
    
    async def _calculate_category_scores(self, code: str, file_type: str) -> Dict[str, int]:
        """Calculate scores for different quality categories"""
        scores = {}
        
        # Readability score
        scores["readability"] = await self._calculate_readability_score(code, file_type)
        
        # Maintainability score
        scores["maintainability"] = await self._calculate_maintainability_score(code, file_type)
        
        # Performance score
        scores["performance"] = await self._calculate_performance_score(code, file_type)
        
        # Security score
        scores["security"] = await self._calculate_security_score(code, file_type)
        
        # Best practices score
        scores["best_practices"] = await self._calculate_best_practices_score(code, file_type)
        
        return scores
    
    async def _calculate_overall_score(self, category_scores: Dict[str, int]) -> int:
        """Calculate overall quality score from category scores"""
        if not category_scores:
            return 0
        
        # Weighted average of category scores
        weights = {
            "readability": 0.25,
            "maintainability": 0.25,
            "performance": 0.20,
            "security": 0.20,
            "best_practices": 0.10
        }
        
        weighted_score = 0
        total_weight = 0
        
        for category, score in category_scores.items():
            weight = weights.get(category, 0.1)
            weighted_score += score * weight
            total_weight += weight
        
        return int(weighted_score / total_weight) if total_weight > 0 else 0
    
    async def _identify_issues(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Identify code quality issues"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            line_issues = await self._analyze_line_issues(line, file_type, i + 1)
            issues.extend(line_issues)
        
        return issues
    
    async def _generate_suggestions(self, code: str, file_type: str, issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate improvement suggestions based on issues"""
        suggestions = []
        
        for issue in issues:
            suggestion = await self._create_suggestion_from_issue(issue, code, file_type)
            if suggestion:
                suggestions.append(suggestion)
        
        return suggestions
    
    async def _analyze_security(self, code: str, file_type: str) -> Dict[str, Any]:
        """Analyze security aspects of the code"""
        security_analysis = {
            "score": 90,  # Base score
            "vulnerabilities": [],
            "warnings": [],
            "recommendations": []
        }
        
        # Check for common security issues
        if file_type in ['javascript', 'typescript']:
            if 'eval(' in code:
                security_analysis["vulnerabilities"].append({
                    "type": "Code Injection",
                    "description": "Use of eval() can lead to code injection",
                    "severity": "high",
                    "line": self._find_pattern_line(code, 'eval(')
                })
                security_analysis["score"] -= 20
            
            if 'innerHTML' in code:
                security_analysis["warnings"].append({
                    "type": "XSS Risk",
                    "description": "Direct innerHTML usage may lead to XSS",
                    "severity": "medium",
                    "line": self._find_pattern_line(code, 'innerHTML')
                })
                security_analysis["score"] -= 10
        
        return security_analysis
    
    async def _analyze_performance(self, code: str, file_type: str) -> Dict[str, Any]:
        """Analyze performance aspects of the code"""
        performance_analysis = {
            "score": 85,  # Base score
            "bottlenecks": [],
            "optimizations": [],
            "warnings": []
        }
        
        # Check for performance issues
        if file_type in ['javascript', 'typescript']:
            # Check for inefficient loops
            nested_loops = self._count_nested_loops(code)
            if nested_loops > 2:
                performance_analysis["bottlenecks"].append({
                    "type": "Nested Loops",
                    "description": f"Found {nested_loops} nested loops",
                    "impact": "high",
                    "suggestion": "Consider optimizing algorithm complexity"
                })
                performance_analysis["score"] -= 15
            
            # Check for synchronous operations that could be async
            if 'fs.readFileSync' in code:
                performance_analysis["warnings"].append({
                    "type": "Blocking Operation",
                    "description": "Synchronous file operations block the event loop",
                    "suggestion": "Use asynchronous alternatives"
                })
                performance_analysis["score"] -= 10
        
        return performance_analysis
    
    async def _calculate_maintainability(self, code: str, file_type: str) -> int:
        """Calculate maintainability score"""
        score = 100
        
        # Penalize for long functions
        functions = await self._extract_functions(code, file_type)
        for func in functions:
            if func.get("lines", 0) > 50:
                score -= 5
        
        # Penalize for lack of comments
        metrics = await self._calculate_metrics(code, file_type)
        if metrics.get("comment_ratio", 0) < 10:
            score -= 10
        
        # Penalize for high complexity
        complexity = metrics.get("cyclomatic_complexity", 1)
        if complexity > 10:
            score -= (complexity - 10) * 2
        
        return max(score, 0)
    
    async def _analyze_line_quality(self, line: str, file_type: str, line_number: int) -> List[Dict[str, Any]]:
        """Analyze quality issues in a single line"""
        issues = []
        
        # Check line length
        if len(line) > 120:
            issues.append({
                "type": "Line Length",
                "severity": "warning",
                "message": f"Line {line_number} exceeds 120 characters",
                "line": line_number,
                "quick_fix": "Break long line into multiple lines"
            })
        
        # Check for trailing whitespace
        if line.endswith(' ') or line.endswith('\t'):
            issues.append({
                "type": "Whitespace",
                "severity": "info",
                "message": f"Line {line_number} has trailing whitespace",
                "line": line_number,
                "quick_fix": "Remove trailing whitespace"
            })
        
        return issues
    
    async def _get_line_suggestions(self, line: str, file_type: str) -> List[str]:
        """Get suggestions for improving a line"""
        suggestions = []
        
        if file_type in ['javascript', 'typescript']:
            # Suggest const/let over var
            if 'var ' in line:
                suggestions.append("Consider using 'const' or 'let' instead of 'var'")
            
            # Suggest arrow functions
            if 'function(' in line and line.count('function') == 1:
                suggestions.append("Consider using arrow function syntax")
        
        return suggestions
    
    async def _generate_quick_fixes(self, line: str, file_type: str) -> List[Dict[str, Any]]:
        """Generate quick fixes for line issues"""
        fixes = []
        
        # Fix trailing whitespace
        if line.endswith(' ') or line.endswith('\t'):
            fixes.append({
                "description": "Remove trailing whitespace",
                "original": line,
                "fixed": line.rstrip(),
                "confidence": "high"
            })
        
        return fixes
    
    async def _calculate_quality_trend(self, code: str, file_type: str) -> str:
        """Calculate quality trend (improving/stable/declining)"""
        # Simplified trend calculation
        # In a real implementation, this would compare with historical data
        return "stable"
    
    async def _suggest_performance_improvements(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Suggest performance improvements"""
        improvements = []
        
        if file_type in ['javascript', 'typescript']:
            # Suggest caching for repeated calculations
            if code.count('expensive_calculation()') > 1:
                improvements.append({
                    "type": "Performance",
                    "title": "Cache Repeated Calculations",
                    "description": "Multiple calls to expensive functions detected",
                    "impact_score": 8,
                    "effort_score": 3,
                    "suggestion": "Consider memoization or caching"
                })
        
        return improvements
    
    async def _suggest_readability_improvements(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Suggest readability improvements"""
        improvements = []
        
        # Check for magic numbers
        magic_numbers = re.findall(r'\b\d{2,}\b', code)
        if len(magic_numbers) > 3:
            improvements.append({
                "type": "Readability",
                "title": "Replace Magic Numbers",
                "description": "Multiple numeric literals found",
                "impact_score": 6,
                "effort_score": 2,
                "suggestion": "Use named constants instead of magic numbers"
            })
        
        return improvements
    
    async def _suggest_security_improvements(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Suggest security improvements"""
        improvements = []
        
        if 'password' in code.lower() and 'console.log' in code:
            improvements.append({
                "type": "Security",
                "title": "Remove Password Logging",
                "description": "Potential password logging detected",
                "impact_score": 10,
                "effort_score": 1,
                "suggestion": "Never log sensitive information"
            })
        
        return improvements
    
    async def _suggest_maintainability_improvements(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Suggest maintainability improvements"""
        improvements = []
        
        functions = await self._extract_functions(code, file_type)
        long_functions = [f for f in functions if f.get("lines", 0) > 30]
        
        if long_functions:
            improvements.append({
                "type": "Maintainability",
                "title": "Break Down Large Functions",
                "description": f"Found {len(long_functions)} functions with >30 lines",
                "impact_score": 7,
                "effort_score": 4,
                "suggestion": "Consider breaking large functions into smaller ones"
            })
        
        return improvements
    
    async def _detect_long_methods(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect long methods/functions"""
        smells = []
        functions = await self._extract_functions(code, file_type)
        
        for func in functions:
            if func.get("lines", 0) > 30:
                smells.append({
                    "type": "Long Method",
                    "severity": "medium",
                    "location": func.get("name", "unknown"),
                    "description": f"Method has {func.get('lines')} lines",
                    "suggestion": "Consider breaking into smaller methods"
                })
        
        return smells
    
    async def _detect_duplicate_code(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect duplicate code blocks"""
        # Simplified duplicate detection
        return []  # Would implement actual duplicate detection algorithm
    
    async def _detect_complex_conditionals(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect complex conditional statements"""
        smells = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Count logical operators in conditionals
            if 'if ' in line and (line.count('&&') + line.count('||') + line.count('and') + line.count('or')) >= 3:
                smells.append({
                    "type": "Complex Conditional",
                    "severity": "medium",
                    "location": f"Line {i + 1}",
                    "description": "Complex conditional with multiple logical operators",
                    "suggestion": "Consider extracting to helper methods"
                })
        
        return smells
    
    async def _detect_large_classes(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect large classes"""
        smells = []
        
        if file_type in ['python', 'javascript', 'typescript']:
            class_lines = {}
            current_class = None
            
            for line in code.split('\n'):
                if 'class ' in line:
                    current_class = line.strip()
                    class_lines[current_class] = 0
                elif current_class:
                    class_lines[current_class] += 1
            
            for class_name, lines in class_lines.items():
                if lines > 100:
                    smells.append({
                        "type": "Large Class",
                        "severity": "high",
                        "location": class_name,
                        "description": f"Class has {lines} lines",
                        "suggestion": "Consider splitting into smaller classes"
                    })
        
        return smells
    
    async def _detect_dead_code(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect potentially dead/unused code"""
        # Simplified dead code detection
        return []  # Would implement actual dead code analysis
    
    # Helper methods
    async def _load_quality_rules(self):
        """Load quality rules and thresholds"""
        self.quality_rules = {
            "max_line_length": 120,
            "max_function_length": 30,
            "max_class_length": 100,
            "min_comment_ratio": 10,
            "max_complexity": 10
        }
    
    async def _initialize_metrics(self):
        """Initialize quality metrics"""
        self.quality_metrics = {
            "readability": {"weight": 0.25, "max_score": 100},
            "maintainability": {"weight": 0.25, "max_score": 100},
            "performance": {"weight": 0.20, "max_score": 100},
            "security": {"weight": 0.20, "max_score": 100},
            "best_practices": {"weight": 0.10, "max_score": 100}
        }
    
    async def _calculate_cyclomatic_complexity(self, code: str, file_type: str) -> int:
        """Calculate cyclomatic complexity"""
        # Simplified complexity calculation
        complexity_keywords = ['if', 'else', 'elif', 'for', 'while', 'case', 'catch', '&&', '||']
        complexity = 1  # Base complexity
        
        for keyword in complexity_keywords:
            complexity += code.count(keyword)
        
        return complexity
    
    async def _count_functions(self, code: str, file_type: str) -> int:
        """Count functions in code"""
        if file_type == 'python':
            return len(re.findall(r'def\s+\w+', code))
        elif file_type in ['javascript', 'typescript']:
            return len(re.findall(r'function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>', code))
        return 0
    
    async def _count_classes(self, code: str, file_type: str) -> int:
        """Count classes in code"""
        return len(re.findall(r'class\s+\w+', code))
    
    async def _calculate_readability_score(self, code: str, file_type: str) -> int:
        """Calculate readability score"""
        score = 100
        metrics = await self._calculate_metrics(code, file_type)
        
        # Penalize for long lines
        if metrics.get("max_line_length", 0) > 120:
            score -= 10
        
        # Reward for good comment ratio
        comment_ratio = metrics.get("comment_ratio", 0)
        if comment_ratio < 5:
            score -= 15
        elif comment_ratio > 20:
            score -= 5  # Too many comments can also be bad
        
        return max(score, 0)
    
    async def _calculate_maintainability_score(self, code: str, file_type: str) -> int:
        """Calculate maintainability score"""
        return await self._calculate_maintainability(code, file_type)
    
    async def _calculate_performance_score(self, code: str, file_type: str) -> int:
        """Calculate performance score"""
        score = 90
        
        # Check for performance anti-patterns
        if file_type in ['javascript', 'typescript']:
            if 'document.getElementById' in code and code.count('document.getElementById') > 3:
                score -= 10  # Repeated DOM queries
        
        return max(score, 0)
    
    async def _calculate_security_score(self, code: str, file_type: str) -> int:
        """Calculate security score"""
        security_analysis = await self._analyze_security(code, file_type)
        return security_analysis.get("score", 90)
    
    async def _calculate_best_practices_score(self, code: str, file_type: str) -> int:
        """Calculate best practices score"""
        score = 100
        
        if file_type in ['javascript', 'typescript']:
            # Check for var usage
            if 'var ' in code:
                score -= 10
            
            # Check for == instead of ===
            if '==' in code and '===' not in code:
                score -= 5
        
        return max(score, 0)
    
    async def _analyze_line_issues(self, line: str, file_type: str, line_number: int) -> List[Dict[str, Any]]:
        """Analyze issues in a single line"""
        return await self._analyze_line_quality(line, file_type, line_number)
    
    async def _create_suggestion_from_issue(self, issue: Dict[str, Any], code: str, file_type: str) -> Optional[Dict[str, Any]]:
        """Create improvement suggestion from identified issue"""
        return {
            "type": issue.get("type", "General"),
            "description": issue.get("message", ""),
            "severity": issue.get("severity", "info"),
            "line": issue.get("line", 0),
            "suggestion": issue.get("quick_fix", "Review and improve")
        }
    
    async def _extract_functions(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Extract function information from code"""
        functions = []
        
        if file_type == 'python':
            # Simple Python function extraction
            for match in re.finditer(r'def\s+(\w+)\s*\(([^)]*)\):', code):
                func_start = match.start()
                func_name = match.group(1)
                
                # Count lines (simplified)
                func_lines = 10  # Placeholder
                
                functions.append({
                    "name": func_name,
                    "lines": func_lines,
                    "start_line": code[:func_start].count('\n') + 1
                })
        
        return functions
    
    def _get_file_type(self, file_path: str) -> str:
        """Get file type from file path"""
        if file_path.endswith('.py'):
            return 'python'
        elif file_path.endswith(('.js', '.jsx')):
            return 'javascript'
        elif file_path.endswith(('.ts', '.tsx')):
            return 'typescript'
        else:
            return 'unknown'
    
    def _score_to_grade(self, score: float) -> str:
        """Convert numeric score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _find_pattern_line(self, code: str, pattern: str) -> int:
        """Find line number where pattern occurs"""
        lines = code.split('\n')
        for i, line in enumerate(lines):
            if pattern in line:
                return i + 1
        return 0
    
    def _count_nested_loops(self, code: str) -> int:
        """Count nested loops in code"""
        # Simplified nested loop detection
        return code.count('for') + code.count('while')
    
    async def _generate_project_recommendations(self, file_scores: Dict[str, Dict[str, Any]]) -> List[str]:
        """Generate project-level recommendations"""
        recommendations = []
        
        # Find files with low scores
        low_score_files = [f for f, data in file_scores.items() if data.get("score", 0) < 70]
        if low_score_files:
            recommendations.append(f"Focus on improving {len(low_score_files)} files with low quality scores")
        
        # Check for files with many issues
        high_issue_files = [f for f, data in file_scores.items() if data.get("issues", 0) > 10]
        if high_issue_files:
            recommendations.append(f"Address issues in {len(high_issue_files)} files with high issue counts")
        
        return recommendations
    
    async def _identify_quality_hotspots(self, file_scores: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify quality hotspots that need immediate attention"""
        hotspots = []
        
        for file_path, data in file_scores.items():
            if data.get("score", 0) < 60:
                hotspots.append({
                    "file": file_path,
                    "score": data.get("score", 0),
                    "issues": data.get("issues", 0),
                    "priority": "high" if data.get("score", 0) < 40 else "medium"
                })
        
        # Sort by score (lowest first)
        hotspots.sort(key=lambda x: x["score"])
        
        return hotspots[:5]  # Return top 5 hotspots