"""
Advanced DevOps Pipeline Service
CI/CD automation with AI recommendations
"""
import json
import asyncio
import yaml
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import os
import subprocess
import tempfile
from dataclasses import dataclass

@dataclass
class PipelineConfig:
    name: str
    platform: str
    language: str
    framework: str
    stages: List[Dict[str, Any]]
    environment: Dict[str, str]

class DevOpsPipelineService:
    def __init__(self):
        self.pipeline_templates = self._load_pipeline_templates()
        self.deployment_strategies = self._load_deployment_strategies()
        
    def _load_pipeline_templates(self) -> Dict[str, Any]:
        """Load predefined pipeline templates"""
        return {
            "python_fastapi": {
                "name": "Python FastAPI CI/CD",
                "language": "python",
                "framework": "fastapi",
                "platforms": ["github_actions", "gitlab_ci", "jenkins"],
                "stages": [
                    {
                        "name": "setup",
                        "description": "Setup Python environment",
                        "commands": [
                            "python -m pip install --upgrade pip",
                            "pip install -r requirements.txt",
                            "pip install pytest black bandit"
                        ]
                    },
                    {
                        "name": "lint",
                        "description": "Code formatting and linting",
                        "commands": [
                            "black --check .",
                            "flake8 .",
                            "mypy ."
                        ]
                    },
                    {
                        "name": "security",
                        "description": "Security scanning",
                        "commands": [
                            "bandit -r . -f json -o bandit_report.json",
                            "safety check"
                        ]
                    },
                    {
                        "name": "test",
                        "description": "Run tests",
                        "commands": [
                            "pytest --cov=. --cov-report=xml",
                            "coverage report"
                        ]
                    },
                    {
                        "name": "build",
                        "description": "Build application",
                        "commands": [
                            "docker build -t app:latest .",
                            "docker save app:latest > app.tar"
                        ]
                    },
                    {
                        "name": "deploy",
                        "description": "Deploy application",
                        "commands": [
                            "docker load < app.tar",
                            "docker run -d -p 8000:8000 app:latest"
                        ]
                    }
                ]
            },
            "react_typescript": {
                "name": "React TypeScript CI/CD",
                "language": "typescript",
                "framework": "react",
                "platforms": ["github_actions", "gitlab_ci", "jenkins"],
                "stages": [
                    {
                        "name": "setup",
                        "description": "Setup Node.js environment",
                        "commands": [
                            "node --version",
                            "npm --version",
                            "npm ci"
                        ]
                    },
                    {
                        "name": "lint",
                        "description": "TypeScript and ESLint checks",
                        "commands": [
                            "npm run lint",
                            "npm run type-check",
                            "npx prettier --check ."
                        ]
                    },
                    {
                        "name": "test",
                        "description": "Run tests",
                        "commands": [
                            "npm run test:coverage",
                            "npm run test:e2e"
                        ]
                    },
                    {
                        "name": "security",
                        "description": "Security audit",
                        "commands": [
                            "npm audit",
                            "npx snyk test"
                        ]
                    },
                    {
                        "name": "build",
                        "description": "Build for production",
                        "commands": [
                            "npm run build",
                            "npm run build:analyze"
                        ]
                    },
                    {
                        "name": "deploy",
                        "description": "Deploy to CDN",
                        "commands": [
                            "aws s3 sync build/ s3://bucket-name/",
                            "aws cloudfront create-invalidation --distribution-id ID --paths '/*'"
                        ]
                    }
                ]
            },
            "microservices_docker": {
                "name": "Microservices Docker Pipeline",
                "language": "multiple",
                "framework": "microservices",
                "platforms": ["github_actions", "gitlab_ci", "jenkins"],
                "stages": [
                    {
                        "name": "matrix_build",
                        "description": "Build all services",
                        "commands": [
                            "for service in services/*; do docker build -t $service:latest $service; done",
                            "docker-compose build"
                        ]
                    },
                    {
                        "name": "integration_test",
                        "description": "Run integration tests",
                        "commands": [
                            "docker-compose up -d",
                            "npm run test:integration",
                            "docker-compose down"
                        ]
                    },
                    {
                        "name": "security_scan",
                        "description": "Scan container images",
                        "commands": [
                            "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image app:latest",
                            "snyk container test app:latest"
                        ]
                    },
                    {
                        "name": "deploy",
                        "description": "Deploy to Kubernetes",
                        "commands": [
                            "kubectl apply -f k8s/",
                            "kubectl rollout status deployment/app"
                        ]
                    }
                ]
            }
        }

    def _load_deployment_strategies(self) -> Dict[str, Any]:
        """Load deployment strategies"""
        return {
            "blue_green": {
                "name": "Blue-Green Deployment",
                "description": "Zero-downtime deployment using two identical environments",
                "steps": [
                    "Deploy to green environment",
                    "Run health checks",
                    "Switch traffic to green",
                    "Monitor for issues",
                    "Cleanup blue environment"
                ],
                "rollback_strategy": "Switch traffic back to blue environment"
            },
            "canary": {
                "name": "Canary Deployment",
                "description": "Gradual rollout to a subset of users",
                "steps": [
                    "Deploy to small percentage of servers",
                    "Monitor metrics and errors",
                    "Gradually increase traffic",
                    "Complete rollout if successful"
                ],
                "rollback_strategy": "Reduce canary traffic to zero"
            },
            "rolling": {
                "name": "Rolling Deployment",
                "description": "Update servers one by one",
                "steps": [
                    "Update one server at a time",
                    "Health check each server",
                    "Continue to next server",
                    "Complete when all updated"
                ],
                "rollback_strategy": "Rollback servers in reverse order"
            }
        }

    async def analyze_project(self, project_path: str) -> Dict[str, Any]:
        """Analyze project for DevOps optimization recommendations"""
        try:
            project_path = Path(project_path)
            
            # Detect project type and language
            project_info = await self._detect_project_type(project_path)
            
            # Analyze existing CI/CD configuration
            ci_cd_analysis = await self._analyze_existing_cicd(project_path)
            
            # Security analysis
            security_analysis = await self._analyze_security_setup(project_path)
            
            # Performance optimization opportunities
            performance_analysis = await self._analyze_performance_opportunities(project_path)
            
            # Generate recommendations
            recommendations = await self._generate_devops_recommendations(
                project_info, ci_cd_analysis, security_analysis, performance_analysis
            )
            
            return {
                "success": True,
                "project_path": str(project_path),
                "project_info": project_info,
                "analysis": {
                    "ci_cd": ci_cd_analysis,
                    "security": security_analysis,
                    "performance": performance_analysis
                },
                "recommendations": recommendations,
                "suggested_templates": await self._suggest_pipeline_templates(project_info)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _detect_project_type(self, project_path: Path) -> Dict[str, Any]:
        """Detect project type, language, and framework"""
        project_info = {
            "languages": [],
            "frameworks": [],
            "package_managers": [],
            "containerized": False,
            "has_tests": False,
            "estimated_complexity": "medium"
        }
        
        # Check for various configuration files
        config_files = {
            "package.json": {"language": "javascript", "package_manager": "npm"},
            "requirements.txt": {"language": "python", "package_manager": "pip"},
            "Pipfile": {"language": "python", "package_manager": "pipenv"},
            "pyproject.toml": {"language": "python", "package_manager": "poetry"},
            "pom.xml": {"language": "java", "package_manager": "maven"},
            "build.gradle": {"language": "java", "package_manager": "gradle"},
            "Cargo.toml": {"language": "rust", "package_manager": "cargo"},
            "go.mod": {"language": "go", "package_manager": "go_modules"},
            "composer.json": {"language": "php", "package_manager": "composer"}
        }
        
        for file_name, info in config_files.items():
            if (project_path / file_name).exists():
                project_info["languages"].append(info["language"])
                project_info["package_managers"].append(info["package_manager"])
        
        # Check for frameworks
        if (project_path / "package.json").exists():
            try:
                with open(project_path / "package.json", 'r') as f:
                    package_data = json.load(f)
                    deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
                    
                    if "react" in deps:
                        project_info["frameworks"].append("react")
                    if "vue" in deps:
                        project_info["frameworks"].append("vue")
                    if "angular" in deps:
                        project_info["frameworks"].append("angular")
                    if "next" in deps:
                        project_info["frameworks"].append("nextjs")
            except:
                pass
        
        if (project_path / "requirements.txt").exists():
            try:
                with open(project_path / "requirements.txt", 'r') as f:
                    content = f.read().lower()
                    if "fastapi" in content:
                        project_info["frameworks"].append("fastapi")
                    if "django" in content:
                        project_info["frameworks"].append("django")
                    if "flask" in content:
                        project_info["frameworks"].append("flask")
            except:
                pass
        
        # Check for containerization
        if (project_path / "Dockerfile").exists():
            project_info["containerized"] = True
        
        if (project_path / "docker-compose.yml").exists():
            project_info["containerized"] = True
        
        # Check for tests
        test_dirs = ["tests", "test", "__tests__", "spec"]
        test_files = ["*test*", "*spec*"]
        
        for test_dir in test_dirs:
            if (project_path / test_dir).exists():
                project_info["has_tests"] = True
                break
        
        return project_info

    async def _analyze_existing_cicd(self, project_path: Path) -> Dict[str, Any]:
        """Analyze existing CI/CD configuration"""
        analysis = {
            "has_cicd": False,
            "platforms": [],
            "stages_found": [],
            "issues": [],
            "recommendations": []
        }
        
        # Check for GitHub Actions
        github_workflows = project_path / ".github" / "workflows"
        if github_workflows.exists():
            analysis["has_cicd"] = True
            analysis["platforms"].append("github_actions")
            
            for workflow_file in github_workflows.glob("*.yml"):
                try:
                    with open(workflow_file, 'r') as f:
                        workflow = yaml.safe_load(f)
                        if "jobs" in workflow:
                            for job_name, job_config in workflow["jobs"].items():
                                if "steps" in job_config:
                                    analysis["stages_found"].append(job_name)
                except:
                    analysis["issues"].append(f"Invalid YAML in {workflow_file.name}")
        
        # Check for GitLab CI
        gitlab_ci = project_path / ".gitlab-ci.yml"
        if gitlab_ci.exists():
            analysis["has_cicd"] = True
            analysis["platforms"].append("gitlab_ci")
            
            try:
                with open(gitlab_ci, 'r') as f:
                    gitlab_config = yaml.safe_load(f)
                    if "stages" in gitlab_config:
                        analysis["stages_found"].extend(gitlab_config["stages"])
            except:
                analysis["issues"].append("Invalid GitLab CI configuration")
        
        # Check for Jenkins
        jenkinsfile = project_path / "Jenkinsfile"
        if jenkinsfile.exists():
            analysis["has_cicd"] = True
            analysis["platforms"].append("jenkins")
        
        # Generate recommendations based on findings
        if not analysis["has_cicd"]:
            analysis["recommendations"].append("Set up CI/CD pipeline for automated testing and deployment")
        
        common_stages = ["build", "test", "deploy"]
        missing_stages = [stage for stage in common_stages if stage not in analysis["stages_found"]]
        if missing_stages:
            analysis["recommendations"].append(f"Consider adding missing stages: {', '.join(missing_stages)}")
        
        return analysis

    async def _analyze_security_setup(self, project_path: Path) -> Dict[str, Any]:
        """Analyze security setup and practices"""
        analysis = {
            "security_files": [],
            "vulnerabilities": [],
            "recommendations": [],
            "security_score": 50  # Base score
        }
        
        # Check for security-related files
        security_files = {
            ".gitignore": "Prevents sensitive files from being committed",
            ".env.example": "Template for environment variables",
            "SECURITY.md": "Security policy documentation",
            ".snyk": "Snyk security configuration"
        }
        
        for file_name, description in security_files.items():
            if (project_path / file_name).exists():
                analysis["security_files"].append({"file": file_name, "description": description})
                analysis["security_score"] += 10
        
        # Check for secrets in files (basic check)
        secret_patterns = [
            r'password\s*=\s*["\'][^"\']{8,}["\']',
            r'api_key\s*=\s*["\'][^"\']{20,}["\']',
            r'secret\s*=\s*["\'][^"\']{16,}["\']'
        ]
        
        # Basic vulnerability checks
        if (project_path / "package.json").exists():
            analysis["recommendations"].append("Run 'npm audit' regularly to check for vulnerabilities")
        
        if (project_path / "requirements.txt").exists():
            analysis["recommendations"].append("Use 'safety check' to scan Python dependencies for vulnerabilities")
        
        # Docker security
        dockerfile = project_path / "Dockerfile"
        if dockerfile.exists():
            try:
                with open(dockerfile, 'r') as f:
                    content = f.read()
                    if "USER root" in content and "USER " not in content.split("USER root")[1]:
                        analysis["vulnerabilities"].append("Docker container runs as root user")
                    
                    if "ADD http" in content or "ADD ftp" in content:
                        analysis["vulnerabilities"].append("Using ADD with URLs can be insecure")
            except:
                pass
        
        # General recommendations
        analysis["recommendations"].extend([
            "Implement dependency scanning in CI/CD pipeline",
            "Use environment variables for sensitive configuration",
            "Enable branch protection rules in repository",
            "Set up automated security scanning"
        ])
        
        return analysis

    async def _analyze_performance_opportunities(self, project_path: Path) -> Dict[str, Any]:
        """Analyze performance optimization opportunities"""
        analysis = {
            "opportunities": [],
            "current_setup": [],
            "recommendations": [],
            "estimated_impact": "medium"
        }
        
        # Check for caching opportunities
        if (project_path / "package.json").exists():
            analysis["opportunities"].append({
                "area": "dependency_caching",
                "description": "Cache node_modules to speed up builds",
                "implementation": "Use npm ci with cache in CI/CD"
            })
        
        if (project_path / "requirements.txt").exists():
            analysis["opportunities"].append({
                "area": "pip_caching",
                "description": "Cache pip dependencies",
                "implementation": "Use pip cache in CI/CD pipeline"
            })
        
        # Docker optimization
        if (project_path / "Dockerfile").exists():
            analysis["opportunities"].append({
                "area": "docker_optimization",
                "description": "Optimize Docker builds with multi-stage builds and layer caching",
                "implementation": "Use multi-stage Dockerfile and .dockerignore"
            })
        
        # Build optimization
        analysis["recommendations"].extend([
            "Implement build caching strategies",
            "Use parallel job execution in CI/CD",
            "Optimize container image sizes",
            "Consider using build matrices for multiple environments"
        ])
        
        return analysis

    async def _generate_devops_recommendations(self, project_info: Dict, ci_cd: Dict, security: Dict, performance: Dict) -> Dict[str, Any]:
        """Generate comprehensive DevOps recommendations"""
        recommendations = {
            "immediate_actions": [],
            "short_term": [],
            "long_term": [],
            "best_practices": []
        }
        
        # Immediate actions
        if not ci_cd["has_cicd"]:
            recommendations["immediate_actions"].append({
                "action": "Set up basic CI/CD pipeline",
                "priority": "high",
                "estimated_effort": "4-8 hours",
                "impact": "high"
            })
        
        if security["security_score"] < 70:
            recommendations["immediate_actions"].append({
                "action": "Improve security practices",
                "priority": "high",
                "estimated_effort": "2-4 hours",
                "impact": "high"
            })
        
        # Short-term improvements
        recommendations["short_term"].extend([
            {
                "action": "Implement automated testing in pipeline",
                "priority": "medium",
                "estimated_effort": "1-2 days",
                "impact": "medium"
            },
            {
                "action": "Set up deployment automation",
                "priority": "medium",
                "estimated_effort": "2-3 days",
                "impact": "high"
            }
        ])
        
        # Long-term strategies
        recommendations["long_term"].extend([
            {
                "action": "Implement infrastructure as code",
                "priority": "low",
                "estimated_effort": "1-2 weeks",
                "impact": "high"
            },
            {
                "action": "Set up comprehensive monitoring and alerting",
                "priority": "medium",
                "estimated_effort": "1 week",
                "impact": "medium"
            }
        ])
        
        # Best practices
        recommendations["best_practices"] = [
            "Use semantic versioning for releases",
            "Implement automated rollback procedures",
            "Set up proper logging and monitoring",
            "Use feature flags for safer deployments",
            "Implement proper secret management",
            "Regular security audits and dependency updates"
        ]
        
        return recommendations

    async def _suggest_pipeline_templates(self, project_info: Dict) -> List[Dict[str, Any]]:
        """Suggest appropriate pipeline templates based on project"""
        suggestions = []
        
        languages = project_info.get("languages", [])
        frameworks = project_info.get("frameworks", [])
        
        for template_id, template in self.pipeline_templates.items():
            score = 0
            
            # Language match
            if template["language"] in languages:
                score += 50
            
            # Framework match
            if template["framework"] in frameworks:
                score += 30
            
            # Containerization bonus
            if project_info.get("containerized") and "docker" in template.get("name", "").lower():
                score += 20
            
            if score > 40:  # Threshold for suggestion
                suggestions.append({
                    "template_id": template_id,
                    "template": template,
                    "match_score": score,
                    "reason": f"Matches {template['language']} language and {template['framework']} framework"
                })
        
        return sorted(suggestions, key=lambda x: x["match_score"], reverse=True)

    async def generate_pipeline_config(self, template_id: str, platform: str, customizations: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate pipeline configuration for specific platform"""
        try:
            if template_id not in self.pipeline_templates:
                raise ValueError(f"Template {template_id} not found")
            
            template = self.pipeline_templates[template_id]
            
            if platform == "github_actions":
                config = await self._generate_github_actions_config(template, customizations)
            elif platform == "gitlab_ci":
                config = await self._generate_gitlab_ci_config(template, customizations)
            elif platform == "jenkins":
                config = await self._generate_jenkins_config(template, customizations)
            else:
                raise ValueError(f"Platform {platform} not supported")
            
            return {
                "success": True,
                "platform": platform,
                "template_id": template_id,
                "config": config,
                "instructions": await self._generate_setup_instructions(platform, config)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _generate_github_actions_config(self, template: Dict, customizations: Dict = None) -> Dict[str, Any]:
        """Generate GitHub Actions workflow configuration"""
        workflow = {
            "name": template["name"],
            "on": {
                "push": {"branches": ["main", "develop"]},
                "pull_request": {"branches": ["main"]}
            },
            "jobs": {
                "ci": {
                    "runs-on": "ubuntu-latest",
                    "steps": [
                        {
                            "name": "Checkout code",
                            "uses": "actions/checkout@v3"
                        }
                    ]
                }
            }
        }
        
        # Add language-specific setup
        if template["language"] == "python":
            workflow["jobs"]["ci"]["steps"].append({
                "name": "Set up Python",
                "uses": "actions/setup-python@v4",
                "with": {"python-version": "3.9"}
            })
        elif template["language"] in ["javascript", "typescript"]:
            workflow["jobs"]["ci"]["steps"].append({
                "name": "Set up Node.js",
                "uses": "actions/setup-node@v3",
                "with": {"node-version": "18", "cache": "npm"}
            })
        
        # Add stages as steps
        for stage in template["stages"]:
            for command in stage["commands"]:
                workflow["jobs"]["ci"]["steps"].append({
                    "name": f"{stage['name']}: {command[:50]}...",
                    "run": command
                })
        
        return workflow

    async def _generate_gitlab_ci_config(self, template: Dict, customizations: Dict = None) -> Dict[str, Any]:
        """Generate GitLab CI configuration"""
        config = {
            "stages": [stage["name"] for stage in template["stages"]],
            "image": self._get_docker_image(template["language"])
        }
        
        # Add jobs for each stage
        for stage in template["stages"]:
            job_name = stage["name"]
            config[job_name] = {
                "stage": stage["name"],
                "script": stage["commands"]
            }
            
            # Add caching for performance
            if stage["name"] in ["setup", "build"]:
                if template["language"] == "python":
                    config[job_name]["cache"] = {
                        "paths": [".cache/pip", "venv/"]
                    }
                elif template["language"] in ["javascript", "typescript"]:
                    config[job_name]["cache"] = {
                        "paths": ["node_modules/", ".npm/"]
                    }
        
        return config

    async def _generate_jenkins_config(self, template: Dict, customizations: Dict = None) -> str:
        """Generate Jenkins pipeline configuration"""
        pipeline = f"""
pipeline {{
    agent any
    
    environment {{
        // Environment variables
    }}
    
    stages {{
"""
        
        for stage in template["stages"]:
            pipeline += f"""
        stage('{stage["name"]}') {{
            steps {{
"""
            for command in stage["commands"]:
                pipeline += f"                sh '{command}'\n"
            
            pipeline += """            }
        }
"""
        
        pipeline += """    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
"""
        
        return pipeline

    def _get_docker_image(self, language: str) -> str:
        """Get appropriate Docker image for language"""
        images = {
            "python": "python:3.9",
            "javascript": "node:18",
            "typescript": "node:18",
            "java": "openjdk:11",
            "go": "golang:1.19"
        }
        return images.get(language, "ubuntu:latest")

    async def _generate_setup_instructions(self, platform: str, config: Dict) -> List[str]:
        """Generate setup instructions for the platform"""
        if platform == "github_actions":
            return [
                "1. Create .github/workflows directory in your repository",
                "2. Save the configuration as .github/workflows/ci.yml",
                "3. Commit and push to trigger the workflow",
                "4. Check the Actions tab in GitHub to see the pipeline run"
            ]
        elif platform == "gitlab_ci":
            return [
                "1. Save the configuration as .gitlab-ci.yml in repository root",
                "2. Commit and push to trigger the pipeline",
                "3. Check the CI/CD > Pipelines section to see the pipeline run",
                "4. Configure GitLab runners if using self-hosted runners"
            ]
        elif platform == "jenkins":
            return [
                "1. Create a new Pipeline job in Jenkins",
                "2. Configure the job to use Pipeline script from SCM",
                "3. Save the configuration as Jenkinsfile in repository root",
                "4. Commit and trigger the build manually or via webhook"
            ]
        
        return ["Platform-specific instructions not available"]

    async def get_deployment_recommendations(self, project_type: str, scale: str) -> Dict[str, Any]:
        """Get deployment strategy recommendations"""
        recommendations = {
            "suggested_strategy": "",
            "platforms": [],
            "considerations": [],
            "implementation_steps": []
        }
        
        # Recommend based on project scale
        if scale == "small":
            recommendations["suggested_strategy"] = "rolling"
            recommendations["platforms"] = ["heroku", "vercel", "netlify"]
        elif scale == "medium":
            recommendations["suggested_strategy"] = "blue_green"
            recommendations["platforms"] = ["aws_ecs", "google_cloud_run", "azure_container_instances"]
        else:  # large
            recommendations["suggested_strategy"] = "canary"
            recommendations["platforms"] = ["kubernetes", "aws_eks", "google_gke"]
        
        # Add strategy details
        strategy = self.deployment_strategies[recommendations["suggested_strategy"]]
        recommendations["strategy_details"] = strategy
        
        return recommendations