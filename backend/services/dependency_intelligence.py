from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime, timedelta
import re

class DependencyIntelligence:
    """AI service for intelligent dependency management"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.dependency_cache = {}
        self.update_history = {}
        self.compatibility_matrix = {}
    
    async def initialize(self):
        """Initialize the dependency intelligence service"""
        try:
            await self._load_compatibility_matrix()
            await self._load_security_database()
            return True
        except Exception as e:
            print(f"Dependency Intelligence initialization error: {e}")
            return False
    
    async def analyze_dependencies(self, project_id: str, dependencies: Dict[str, str]) -> Dict[str, Any]:
        """Analyze project dependencies for updates, security, and compatibility"""
        try:
            analysis = {
                "project_id": project_id,
                "timestamp": datetime.utcnow().isoformat(),
                "total_dependencies": len(dependencies),
                "outdated_dependencies": [],
                "security_vulnerabilities": [],
                "compatibility_issues": [],
                "update_recommendations": [],
                "dependency_health_score": 0,
                "breaking_change_risk": "low"
            }
            
            for dep_name, version in dependencies.items():
                dep_analysis = await self._analyze_single_dependency(dep_name, version)
                
                if dep_analysis.get("is_outdated"):
                    analysis["outdated_dependencies"].append(dep_analysis)
                
                if dep_analysis.get("security_issues"):
                    analysis["security_vulnerabilities"].extend(dep_analysis["security_issues"])
                
                if dep_analysis.get("compatibility_issues"):
                    analysis["compatibility_issues"].extend(dep_analysis["compatibility_issues"])
                
                if dep_analysis.get("update_recommendation"):
                    analysis["update_recommendations"].append(dep_analysis["update_recommendation"])
            
            # Calculate overall health score
            analysis["dependency_health_score"] = await self._calculate_health_score(analysis)
            analysis["breaking_change_risk"] = await self._assess_breaking_change_risk(analysis)
            
            return analysis
        except Exception as e:
            return {"error": str(e), "project_id": project_id}
    
    async def suggest_updates(self, project_id: str, dependencies: Dict[str, str], update_strategy: str = "conservative") -> Dict[str, Any]:
        """Suggest dependency updates based on strategy"""
        try:
            suggestions = {
                "project_id": project_id,
                "strategy": update_strategy,
                "timestamp": datetime.utcnow().isoformat(),
                "immediate_updates": [],
                "scheduled_updates": [],
                "breaking_updates": [],
                "security_critical": [],
                "estimated_effort": "low"
            }
            
            for dep_name, current_version in dependencies.items():
                update_info = await self._get_update_suggestion(dep_name, current_version, update_strategy)
                
                if update_info["priority"] == "critical":
                    suggestions["security_critical"].append(update_info)
                elif update_info["priority"] == "high":
                    suggestions["immediate_updates"].append(update_info)
                elif update_info["priority"] == "medium":
                    suggestions["scheduled_updates"].append(update_info)
                elif update_info["breaking_changes"]:
                    suggestions["breaking_updates"].append(update_info)
            
            # Estimate overall effort
            suggestions["estimated_effort"] = await self._estimate_update_effort(suggestions)
            
            return suggestions
        except Exception as e:
            return {"error": str(e)}
    
    async def resolve_conflicts(self, dependencies: Dict[str, str]) -> Dict[str, Any]:
        """Resolve dependency conflicts automatically"""
        try:
            resolution = {
                "timestamp": datetime.utcnow().isoformat(),
                "conflicts_found": [],
                "resolutions": [],
                "unresolvable_conflicts": [],
                "success_rate": 0.0
            }
            
            conflicts = await self._detect_conflicts(dependencies)
            
            for conflict in conflicts:
                resolution_strategy = await self._find_resolution_strategy(conflict)
                
                if resolution_strategy:
                    resolution["resolutions"].append({
                        "conflict": conflict,
                        "strategy": resolution_strategy,
                        "confidence": resolution_strategy.get("confidence", 0.8)
                    })
                else:
                    resolution["unresolvable_conflicts"].append(conflict)
            
            # Calculate success rate
            total_conflicts = len(conflicts)
            resolved_conflicts = len(resolution["resolutions"])
            resolution["success_rate"] = (resolved_conflicts / total_conflicts * 100) if total_conflicts > 0 else 100.0
            
            return resolution
        except Exception as e:
            return {"error": str(e)}
    
    async def predict_compatibility(self, dependency_changes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict compatibility issues before applying changes"""
        try:
            prediction = {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_compatibility": "good",
                "potential_issues": [],
                "required_code_changes": [],
                "testing_recommendations": [],
                "rollback_plan": {}
            }
            
            for change in dependency_changes:
                compatibility_check = await self._check_compatibility(change)
                
                if compatibility_check.get("issues"):
                    prediction["potential_issues"].extend(compatibility_check["issues"])
                
                if compatibility_check.get("code_changes"):
                    prediction["required_code_changes"].extend(compatibility_check["code_changes"])
                
                if compatibility_check.get("testing_needs"):
                    prediction["testing_recommendations"].extend(compatibility_check["testing_needs"])
            
            # Determine overall compatibility
            issue_count = len(prediction["potential_issues"])
            if issue_count == 0:
                prediction["overall_compatibility"] = "excellent"
            elif issue_count <= 2:
                prediction["overall_compatibility"] = "good"
            elif issue_count <= 5:
                prediction["overall_compatibility"] = "fair"
            else:
                prediction["overall_compatibility"] = "poor"
            
            # Generate rollback plan
            prediction["rollback_plan"] = await self._generate_rollback_plan(dependency_changes)
            
            return prediction
        except Exception as e:
            return {"error": str(e)}
    
    async def optimize_bundle_size(self, dependencies: Dict[str, str]) -> Dict[str, Any]:
        """Optimize bundle size by suggesting lighter alternatives"""
        try:
            optimization = {
                "timestamp": datetime.utcnow().isoformat(),
                "current_bundle_size": 0,
                "optimized_bundle_size": 0,
                "savings_percentage": 0,
                "alternatives": [],
                "tree_shaking_opportunities": [],
                "unused_dependencies": []
            }
            
            # Calculate current bundle size (estimated)
            current_size = await self._estimate_bundle_size(dependencies)
            optimization["current_bundle_size"] = current_size
            
            # Find lighter alternatives
            for dep_name, version in dependencies.items():
                alternatives = await self._find_lighter_alternatives(dep_name, version)
                if alternatives:
                    optimization["alternatives"].extend(alternatives)
            
            # Identify unused dependencies
            unused = await self._identify_unused_dependencies(dependencies)
            optimization["unused_dependencies"] = unused
            
            # Calculate optimized size
            optimized_size = await self._calculate_optimized_size(optimization)
            optimization["optimized_bundle_size"] = optimized_size
            optimization["savings_percentage"] = ((current_size - optimized_size) / current_size * 100) if current_size > 0 else 0
            
            return optimization
        except Exception as e:
            return {"error": str(e)}
    
    async def _analyze_single_dependency(self, dep_name: str, version: str) -> Dict[str, Any]:
        """Analyze a single dependency"""
        analysis = {
            "name": dep_name,
            "current_version": version,
            "latest_version": await self._get_latest_version(dep_name),
            "is_outdated": False,
            "security_issues": [],
            "compatibility_issues": [],
            "update_recommendation": None
        }
        
        # Check if outdated
        latest = analysis["latest_version"]
        if latest and latest != version:
            analysis["is_outdated"] = True
            analysis["update_recommendation"] = {
                "from": version,
                "to": latest,
                "priority": "medium",
                "breaking_changes": await self._check_breaking_changes(dep_name, version, latest)
            }
        
        # Check for security issues
        security_issues = await self._check_security_vulnerabilities(dep_name, version)
        if security_issues:
            analysis["security_issues"] = security_issues
            if analysis["update_recommendation"]:
                analysis["update_recommendation"]["priority"] = "critical"
        
        return analysis
    
    async def _calculate_health_score(self, analysis: Dict[str, Any]) -> int:
        """Calculate overall dependency health score"""
        score = 100
        
        # Penalize for outdated dependencies
        outdated_count = len(analysis.get("outdated_dependencies", []))
        score -= outdated_count * 5
        
        # Heavily penalize for security vulnerabilities
        security_count = len(analysis.get("security_vulnerabilities", []))
        score -= security_count * 20
        
        # Penalize for compatibility issues
        compatibility_count = len(analysis.get("compatibility_issues", []))
        score -= compatibility_count * 10
        
        return max(0, score)
    
    async def _assess_breaking_change_risk(self, analysis: Dict[str, Any]) -> str:
        """Assess the risk of breaking changes"""
        breaking_updates = 0
        
        for rec in analysis.get("update_recommendations", []):
            if rec.get("breaking_changes"):
                breaking_updates += 1
        
        if breaking_updates == 0:
            return "low"
        elif breaking_updates <= 2:
            return "medium"
        else:
            return "high"
    
    async def _get_update_suggestion(self, dep_name: str, current_version: str, strategy: str) -> Dict[str, Any]:
        """Get update suggestion for a dependency"""
        latest_version = await self._get_latest_version(dep_name)
        
        suggestion = {
            "name": dep_name,
            "current_version": current_version,
            "suggested_version": latest_version,
            "priority": "low",
            "breaking_changes": False,
            "security_fix": False,
            "effort_estimate": "low"
        }
        
        # Check for security fixes
        if await self._has_security_fixes(dep_name, current_version, latest_version):
            suggestion["priority"] = "critical"
            suggestion["security_fix"] = True
        
        # Check for breaking changes
        if await self._check_breaking_changes(dep_name, current_version, latest_version):
            suggestion["breaking_changes"] = True
            suggestion["effort_estimate"] = "high"
        
        # Adjust based on strategy
        if strategy == "aggressive" and not suggestion["breaking_changes"]:
            suggestion["priority"] = "high"
        elif strategy == "conservative" and suggestion["breaking_changes"]:
            suggestion["priority"] = "low"
        
        return suggestion
    
    async def _estimate_update_effort(self, suggestions: Dict[str, Any]) -> str:
        """Estimate overall update effort"""
        high_effort_count = 0
        total_updates = (
            len(suggestions.get("immediate_updates", [])) +
            len(suggestions.get("scheduled_updates", [])) +
            len(suggestions.get("breaking_updates", [])) +
            len(suggestions.get("security_critical", []))
        )
        
        # Count high-effort updates
        for update_list in [suggestions.get("immediate_updates", []), suggestions.get("scheduled_updates", [])]:
            for update in update_list:
                if update.get("effort_estimate") == "high":
                    high_effort_count += 1
        
        # All breaking updates are high effort
        high_effort_count += len(suggestions.get("breaking_updates", []))
        
        if high_effort_count == 0:
            return "low"
        elif high_effort_count <= 2:
            return "medium"
        else:
            return "high"
    
    async def _detect_conflicts(self, dependencies: Dict[str, str]) -> List[Dict[str, Any]]:
        """Detect dependency conflicts"""
        conflicts = []
        
        # Simplified conflict detection
        # In reality, this would check version ranges, peer dependencies, etc.
        for dep1, version1 in dependencies.items():
            for dep2, version2 in dependencies.items():
                if dep1 != dep2:
                    conflict = await self._check_dependency_conflict(dep1, version1, dep2, version2)
                    if conflict:
                        conflicts.append(conflict)
        
        return conflicts
    
    async def _find_resolution_strategy(self, conflict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find resolution strategy for a conflict"""
        # Simplified resolution strategy
        return {
            "strategy": "update_to_compatible_versions",
            "suggested_versions": {
                conflict["dependency1"]: "latest",
                conflict["dependency2"]: "latest"
            },
            "confidence": 0.8
        }
    
    async def _check_compatibility(self, change: Dict[str, Any]) -> Dict[str, Any]:
        """Check compatibility for a dependency change"""
        return {
            "issues": [],
            "code_changes": [],
            "testing_needs": []
        }
    
    async def _generate_rollback_plan(self, changes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate rollback plan for dependency changes"""
        return {
            "backup_lockfile": True,
            "rollback_commands": ["npm install", "yarn install"],
            "testing_required": True,
            "estimated_rollback_time": "5 minutes"
        }
    
    async def _estimate_bundle_size(self, dependencies: Dict[str, str]) -> int:
        """Estimate bundle size in KB"""
        # Simplified size estimation
        base_sizes = {
            "react": 42,
            "lodash": 70,
            "moment": 67,
            "axios": 13,
            "express": 250
        }
        
        total_size = 0
        for dep_name in dependencies.keys():
            size = base_sizes.get(dep_name, 25)  # Default 25KB
            total_size += size
        
        return total_size
    
    async def _find_lighter_alternatives(self, dep_name: str, version: str) -> List[Dict[str, Any]]:
        """Find lighter alternatives to a dependency"""
        alternatives = {
            "moment": [
                {"name": "date-fns", "size_reduction": "87%", "migration_effort": "medium"},
                {"name": "dayjs", "size_reduction": "96%", "migration_effort": "low"}
            ],
            "lodash": [
                {"name": "ramda", "size_reduction": "30%", "migration_effort": "high"},
                {"name": "just", "size_reduction": "90%", "migration_effort": "medium"}
            ]
        }
        
        return alternatives.get(dep_name, [])
    
    async def _identify_unused_dependencies(self, dependencies: Dict[str, str]) -> List[str]:
        """Identify unused dependencies"""
        # Simplified unused dependency detection
        # In reality, this would analyze the codebase
        return []
    
    async def _calculate_optimized_size(self, optimization: Dict[str, Any]) -> int:
        """Calculate optimized bundle size"""
        current_size = optimization.get("current_bundle_size", 0)
        
        # Calculate savings from alternatives
        alternative_savings = 0
        for alt in optimization.get("alternatives", []):
            if "size_reduction" in alt:
                reduction_percent = int(alt["size_reduction"].replace("%", ""))
                alternative_savings += (current_size * reduction_percent / 100) * 0.1  # Assume 10% adoption
        
        # Calculate savings from removing unused dependencies
        unused_savings = len(optimization.get("unused_dependencies", [])) * 25  # 25KB average
        
        return max(0, current_size - alternative_savings - unused_savings)
    
    async def _load_compatibility_matrix(self):
        """Load dependency compatibility matrix"""
        self.compatibility_matrix = {
            # Simplified compatibility data
            "react": {
                "compatible_with": ["react-dom", "react-router"],
                "incompatible_with": ["vue", "angular"]
            }
        }
    
    async def _load_security_database(self):
        """Load security vulnerability database"""
        self.security_database = {
            # Simplified security data
            "vulnerable_versions": {
                "lodash": ["<4.17.21"],
                "axios": ["<0.21.1"]
            }
        }
    
    async def _get_latest_version(self, dep_name: str) -> Optional[str]:
        """Get latest version of a dependency"""
        # Simplified version lookup
        latest_versions = {
            "react": "18.2.0",
            "vue": "3.3.4",
            "lodash": "4.17.21",
            "axios": "1.4.0",
            "express": "4.18.2"
        }
        
        return latest_versions.get(dep_name)
    
    async def _check_breaking_changes(self, dep_name: str, from_version: str, to_version: str) -> bool:
        """Check if update contains breaking changes"""
        # Simplified breaking change detection
        # In reality, this would check semantic versioning and changelog
        from_major = int(from_version.split('.')[0])
        to_major = int(to_version.split('.')[0])
        
        return to_major > from_major
    
    async def _check_security_vulnerabilities(self, dep_name: str, version: str) -> List[Dict[str, Any]]:
        """Check for security vulnerabilities"""
        vulnerabilities = []
        
        vulnerable_versions = self.security_database.get("vulnerable_versions", {}).get(dep_name, [])
        
        for vuln_pattern in vulnerable_versions:
            if self._version_matches_pattern(version, vuln_pattern):
                vulnerabilities.append({
                    "severity": "high",
                    "description": f"Known vulnerability in {dep_name} {version}",
                    "fix_version": await self._get_latest_version(dep_name)
                })
        
        return vulnerabilities
    
    async def _has_security_fixes(self, dep_name: str, from_version: str, to_version: str) -> bool:
        """Check if update includes security fixes"""
        current_vulns = await self._check_security_vulnerabilities(dep_name, from_version)
        target_vulns = await self._check_security_vulnerabilities(dep_name, to_version)
        
        return len(current_vulns) > len(target_vulns)
    
    async def _check_dependency_conflict(self, dep1: str, version1: str, dep2: str, version2: str) -> Optional[Dict[str, Any]]:
        """Check if two dependencies conflict"""
        # Simplified conflict checking
        incompatible = self.compatibility_matrix.get(dep1, {}).get("incompatible_with", [])
        
        if dep2 in incompatible:
            return {
                "dependency1": dep1,
                "version1": version1,
                "dependency2": dep2,
                "version2": version2,
                "conflict_type": "incompatible",
                "severity": "high"
            }
        
        return None
    
    def _version_matches_pattern(self, version: str, pattern: str) -> bool:
        """Check if version matches vulnerability pattern"""
        # Simplified pattern matching
        if pattern.startswith("<"):
            target_version = pattern[1:]
            return self._compare_versions(version, target_version) < 0
        
        return version == pattern
    
    def _compare_versions(self, version1: str, version2: str) -> int:
        """Compare two semantic versions"""
        v1_parts = [int(x) for x in version1.split('.')]
        v2_parts = [int(x) for x in version2.split('.')]
        
        for i in range(max(len(v1_parts), len(v2_parts))):
            v1_part = v1_parts[i] if i < len(v1_parts) else 0
            v2_part = v2_parts[i] if i < len(v2_parts) else 0
            
            if v1_part < v2_part:
                return -1
            elif v1_part > v2_part:
                return 1
        
        return 0