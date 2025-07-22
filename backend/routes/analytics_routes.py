"""
Analytics Dashboard API Routes
Provides endpoints for development metrics, insights, and productivity analytics
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import json
import random
from enum import Enum

router = APIRouter()

# Enums
class MetricPeriod(str, Enum):
    day = "day"
    week = "week"
    month = "month"
    quarter = "quarter"
    year = "year"

class ProjectStatus(str, Enum):
    active = "active"
    completed = "completed"
    archived = "archived"
    on_hold = "on_hold"

# Pydantic models
class CodeMetrics(BaseModel):
    lines_of_code: int = Field(..., description="Total lines of code")
    files_count: int = Field(..., description="Number of files")
    functions_count: int = Field(..., description="Number of functions/methods")
    classes_count: int = Field(..., description="Number of classes")
    test_coverage: float = Field(default=0.0, description="Test coverage percentage")
    complexity_score: float = Field(default=0.0, description="Code complexity score")
    maintainability_index: float = Field(default=0.0, description="Maintainability index")

class ProductivityMetrics(BaseModel):
    commits_count: int = Field(..., description="Number of commits")
    active_days: int = Field(..., description="Days with activity")
    avg_session_duration: float = Field(..., description="Average coding session duration in hours")
    keystrokes_count: int = Field(..., description="Total keystrokes")
    files_modified: int = Field(..., description="Files modified")
    bugs_fixed: int = Field(default=0, description="Bugs fixed")
    features_completed: int = Field(default=0, description="Features completed")

class ProjectAnalytics(BaseModel):
    project_id: str
    project_name: str
    status: ProjectStatus
    code_metrics: CodeMetrics
    productivity_metrics: ProductivityMetrics
    last_activity: datetime
    team_members: int = Field(default=1, description="Number of team members")
    languages: List[str] = Field(default=[], description="Programming languages used")
    frameworks: List[str] = Field(default=[], description="Frameworks used")

class TeamMember(BaseModel):
    id: str
    name: str
    email: str
    role: str
    commits_count: int
    lines_contributed: int
    join_date: datetime
    last_active: datetime

class TimeSeriesData(BaseModel):
    timestamp: datetime
    value: float
    label: Optional[str] = None

class DashboardOverview(BaseModel):
    total_projects: int
    active_projects: int
    total_commits: int
    total_lines_of_code: int
    avg_productivity_score: float
    team_velocity: float
    code_quality_score: float
    recent_achievements: List[str]

def generate_mock_time_series(days: int, base_value: float = 100, variance: float = 20) -> List[TimeSeriesData]:
    """Generate mock time series data"""
    data = []
    current_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        value = base_value + random.uniform(-variance, variance)
        data.append(TimeSeriesData(
            timestamp=current_date + timedelta(days=i),
            value=max(0, value)
        ))
    
    return data

def generate_mock_project_analytics() -> List[ProjectAnalytics]:
    """Generate mock project analytics data"""
    projects = [
        {
            "project_id": "proj_001",
            "project_name": "E-commerce Platform",
            "status": "active",
            "languages": ["JavaScript", "Python", "SQL"],
            "frameworks": ["React", "FastAPI", "PostgreSQL"]
        },
        {
            "project_id": "proj_002", 
            "project_name": "Mobile Banking App",
            "status": "completed",
            "languages": ["Dart", "TypeScript"],
            "frameworks": ["Flutter", "Node.js"]
        },
        {
            "project_id": "proj_003",
            "project_name": "Analytics Dashboard", 
            "status": "active",
            "languages": ["TypeScript", "Python"],
            "frameworks": ["Vue.js", "Django"]
        },
        {
            "project_id": "proj_004",
            "project_name": "IoT Device Manager",
            "status": "on_hold", 
            "languages": ["C++", "Python", "JavaScript"],
            "frameworks": ["Arduino", "Flask", "React"]
        },
        {
            "project_id": "proj_005",
            "project_name": "Social Media Platform",
            "status": "active",
            "languages": ["TypeScript", "Rust", "GraphQL"],
            "frameworks": ["Next.js", "Actix", "Apollo"]
        }
    ]
    
    analytics = []
    for proj in projects:
        analytics.append(ProjectAnalytics(
            project_id=proj["project_id"],
            project_name=proj["project_name"],
            status=ProjectStatus(proj["status"]),
            code_metrics=CodeMetrics(
                lines_of_code=random.randint(1000, 50000),
                files_count=random.randint(20, 500),
                functions_count=random.randint(50, 1000),
                classes_count=random.randint(10, 200),
                test_coverage=random.uniform(60, 95),
                complexity_score=random.uniform(1, 10),
                maintainability_index=random.uniform(60, 100)
            ),
            productivity_metrics=ProductivityMetrics(
                commits_count=random.randint(50, 500),
                active_days=random.randint(30, 200),
                avg_session_duration=random.uniform(2, 8),
                keystrokes_count=random.randint(10000, 100000),
                files_modified=random.randint(20, 200),
                bugs_fixed=random.randint(5, 50),
                features_completed=random.randint(3, 25)
            ),
            last_activity=datetime.now() - timedelta(days=random.randint(0, 30)),
            team_members=random.randint(1, 8),
            languages=proj["languages"],
            frameworks=proj["frameworks"]
        ))
    
    return analytics

@router.get("/analytics/overview", response_model=DashboardOverview)
async def get_dashboard_overview():
    """Get overall dashboard overview with key metrics"""
    try:
        mock_data = generate_mock_project_analytics()
        
        total_projects = len(mock_data)
        active_projects = len([p for p in mock_data if p.status == ProjectStatus.active])
        total_commits = sum(p.productivity_metrics.commits_count for p in mock_data)
        total_lines = sum(p.code_metrics.lines_of_code for p in mock_data)
        
        # Calculate average scores
        avg_productivity = sum(
            (p.productivity_metrics.commits_count * p.productivity_metrics.active_days) / 100 
            for p in mock_data
        ) / len(mock_data)
        
        avg_code_quality = sum(p.code_metrics.maintainability_index for p in mock_data) / len(mock_data)
        
        team_velocity = sum(p.productivity_metrics.features_completed for p in mock_data) / 30  # features per day
        
        achievements = [
            "🎉 Reached 100K lines of code milestone",
            "🚀 Deployed 5 projects this month", 
            "🐛 Fixed 50+ bugs across all projects",
            "📊 Improved test coverage by 15%",
            "⚡ Reduced build time by 30%"
        ]
        
        return DashboardOverview(
            total_projects=total_projects,
            active_projects=active_projects,
            total_commits=total_commits,
            total_lines_of_code=total_lines,
            avg_productivity_score=round(avg_productivity, 1),
            team_velocity=round(team_velocity, 2),
            code_quality_score=round(avg_code_quality, 1),
            recent_achievements=achievements
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview: {str(e)}")

@router.get("/analytics/projects", response_model=List[ProjectAnalytics])
async def get_projects_analytics(
    status: Optional[ProjectStatus] = None,
    limit: int = Query(default=10, le=50)
):
    """Get analytics for all projects with optional filtering"""
    try:
        analytics = generate_mock_project_analytics()
        
        if status:
            analytics = [p for p in analytics if p.status == status]
        
        # Sort by last activity
        analytics.sort(key=lambda x: x.last_activity, reverse=True)
        
        return analytics[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project analytics: {str(e)}")

@router.get("/analytics/projects/{project_id}", response_model=ProjectAnalytics)
async def get_project_analytics(project_id: str):
    """Get detailed analytics for a specific project"""
    try:
        analytics = generate_mock_project_analytics()
        project = next((p for p in analytics if p.project_id == project_id), None)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project analytics: {str(e)}")

@router.get("/analytics/productivity/timeline")
async def get_productivity_timeline(
    period: MetricPeriod = MetricPeriod.month,
    project_id: Optional[str] = None
):
    """Get productivity metrics over time"""
    try:
        days_map = {"day": 7, "week": 4*7, "month": 12*30, "quarter": 4*90, "year": 365}
        days = days_map.get(period, 30)
        
        # Generate mock time series data
        commits = generate_mock_time_series(days//7, base_value=25, variance=10)
        lines_of_code = generate_mock_time_series(days//7, base_value=500, variance=200)
        active_time = generate_mock_time_series(days//7, base_value=6, variance=2)
        
        return {
            "period": period,
            "project_id": project_id,
            "metrics": {
                "commits_per_period": commits,
                "lines_of_code_per_period": lines_of_code,
                "active_hours_per_period": active_time
            },
            "summary": {
                "total_commits": sum(d.value for d in commits),
                "total_lines": sum(d.value for d in lines_of_code),
                "total_hours": sum(d.value for d in active_time)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching productivity timeline: {str(e)}")

@router.get("/analytics/code-quality")
async def get_code_quality_metrics(project_id: Optional[str] = None):
    """Get code quality metrics and trends"""
    try:
        if project_id:
            analytics = generate_mock_project_analytics()
            project = next((p for p in analytics if p.project_id == project_id), None)
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            
            metrics = project.code_metrics
            quality_data = {
                "project_id": project_id,
                "current_metrics": metrics,
                "trends": {
                    "test_coverage_trend": generate_mock_time_series(30, metrics.test_coverage, 5),
                    "complexity_trend": generate_mock_time_series(30, metrics.complexity_score, 1),
                    "maintainability_trend": generate_mock_time_series(30, metrics.maintainability_index, 10)
                }
            }
        else:
            # Aggregate metrics for all projects
            analytics = generate_mock_project_analytics()
            avg_coverage = sum(p.code_metrics.test_coverage for p in analytics) / len(analytics)
            avg_complexity = sum(p.code_metrics.complexity_score for p in analytics) / len(analytics)
            avg_maintainability = sum(p.code_metrics.maintainability_index for p in analytics) / len(analytics)
            
            quality_data = {
                "project_id": None,
                "aggregate_metrics": {
                    "average_test_coverage": avg_coverage,
                    "average_complexity": avg_complexity,
                    "average_maintainability": avg_maintainability,
                    "total_projects": len(analytics)
                },
                "distribution": {
                    "high_quality_projects": len([p for p in analytics if p.code_metrics.maintainability_index > 80]),
                    "medium_quality_projects": len([p for p in analytics if 60 <= p.code_metrics.maintainability_index <= 80]),
                    "low_quality_projects": len([p for p in analytics if p.code_metrics.maintainability_index < 60])
                }
            }
        
        return quality_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching code quality metrics: {str(e)}")

@router.get("/analytics/languages")
async def get_language_statistics():
    """Get programming language usage statistics"""
    try:
        analytics = generate_mock_project_analytics()
        
        # Aggregate language usage
        language_stats = {}
        for project in analytics:
            for lang in project.languages:
                if lang not in language_stats:
                    language_stats[lang] = {"projects": 0, "lines_of_code": 0}
                language_stats[lang]["projects"] += 1
                language_stats[lang]["lines_of_code"] += project.code_metrics.lines_of_code // len(project.languages)
        
        # Sort by usage
        sorted_languages = sorted(
            language_stats.items(), 
            key=lambda x: x[1]["lines_of_code"], 
            reverse=True
        )
        
        return {
            "total_languages": len(language_stats),
            "languages": [
                {
                    "name": lang,
                    "projects_count": stats["projects"],
                    "lines_of_code": stats["lines_of_code"],
                    "percentage": round((stats["lines_of_code"] / sum(s["lines_of_code"] for s in language_stats.values())) * 100, 1)
                }
                for lang, stats in sorted_languages
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching language statistics: {str(e)}")

@router.get("/analytics/team")
async def get_team_analytics():
    """Get team performance and collaboration metrics"""
    try:
        # Generate mock team data
        team_members = [
            TeamMember(
                id=f"user_{i+1}",
                name=f"Developer {i+1}",
                email=f"dev{i+1}@aetherflow.com",
                role=random.choice(["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"]),
                commits_count=random.randint(50, 300),
                lines_contributed=random.randint(5000, 50000),
                join_date=datetime.now() - timedelta(days=random.randint(30, 365)),
                last_active=datetime.now() - timedelta(days=random.randint(0, 7))
            )
            for i in range(6)
        ]
        
        total_commits = sum(member.commits_count for member in team_members)
        total_lines = sum(member.lines_contributed for member in team_members)
        
        collaboration_score = random.uniform(75, 95)  # Mock collaboration score
        
        return {
            "team_size": len(team_members),
            "total_commits": total_commits,
            "total_lines_contributed": total_lines,
            "collaboration_score": round(collaboration_score, 1),
            "avg_commits_per_member": round(total_commits / len(team_members), 1),
            "members": team_members,
            "activity_timeline": generate_mock_time_series(30, base_value=team_members[0].commits_count/30, variance=5)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching team analytics: {str(e)}")

@router.get("/analytics/reports/export")
async def export_analytics_report(
    format: str = Query(default="json", regex="^(json|csv)$"),
    period: MetricPeriod = MetricPeriod.month,
    include_projects: bool = True,
    include_team: bool = True
):
    """Export comprehensive analytics report"""
    try:
        # Generate comprehensive report data
        overview = await get_dashboard_overview()
        projects = await get_projects_analytics() if include_projects else []
        team_data = await get_team_analytics() if include_team else None
        
        report = {
            "report_generated": datetime.now().isoformat(),
            "period": period,
            "overview": overview.dict(),
            "projects": [p.dict() for p in projects] if include_projects else [],
            "team": team_data if include_team else None,
            "metadata": {
                "export_format": format,
                "total_data_points": len(projects) + (len(team_data["members"]) if team_data else 0),
                "generated_by": "AETHERFLOW Analytics Engine"
            }
        }
        
        if format == "json":
            return report
        elif format == "csv":
            # For CSV, we'll return a simplified structure
            # In production, this would generate actual CSV content
            return {
                "format": "csv",
                "message": "CSV export would be generated here",
                "csv_data": "project_name,status,lines_of_code,commits,last_activity\n" + 
                           "\n".join([
                               f"{p['project_name']},{p['status']},{p['code_metrics']['lines_of_code']},{p['productivity_metrics']['commits_count']},{p['last_activity']}"
                               for p in report["projects"]
                           ])
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting report: {str(e)}")