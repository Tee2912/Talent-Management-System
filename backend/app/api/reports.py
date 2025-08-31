from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import random

router = APIRouter()

# Mock data for enhanced reporting
REPORTING_DATA = {
    "executive_summary": {
        "total_candidates": 1250,
        "total_interviews": 890,
        "total_hires": 125,
        "average_time_to_hire": 18.5,
        "cost_per_hire": 3250,
        "quality_of_hire_score": 4.2,
        "retention_rate": 89.5,
        "diversity_index": 0.72,
        "candidate_satisfaction": 4.3,
        "interviewer_efficiency": 87.2
    },
    "detailed_metrics": {
        "recruitment_funnel": {
            "applications": 2450,
            "screening_passed": 1250,
            "phone_interviews": 890,
            "technical_interviews": 445,
            "final_interviews": 223,
            "offers_extended": 145,
            "offers_accepted": 125,
            "conversion_rates": {
                "application_to_screening": 51.0,
                "screening_to_phone": 71.2,
                "phone_to_technical": 50.0,
                "technical_to_final": 50.1,
                "final_to_offer": 65.0,
                "offer_to_acceptance": 86.2
            }
        },
        "time_metrics": {
            "average_time_to_screen": 3.2,
            "average_time_to_phone": 5.8,
            "average_time_to_technical": 8.4,
            "average_time_to_final": 12.1,
            "average_time_to_offer": 15.3,
            "average_time_to_acceptance": 18.5,
            "bottlenecks": [
                {
                    "stage": "Technical Interview Scheduling",
                    "average_delay": 4.2,
                    "impact": "High"
                },
                {
                    "stage": "Final Interview Coordination",
                    "average_delay": 2.8,
                    "impact": "Medium"
                }
            ]
        },
        "quality_metrics": {
            "interview_scores": {
                "technical_average": 7.3,
                "cultural_fit_average": 8.1,
                "communication_average": 7.8,
                "problem_solving_average": 7.5
            },
            "interviewer_consistency": 0.85,
            "score_variance": 1.2,
            "assessment_reliability": 0.89
        },
        "diversity_metrics": {
            "gender_distribution": {
                "male": 52.3,
                "female": 45.2,
                "non_binary": 2.5
            },
            "ethnicity_distribution": {
                "white": 48.5,
                "asian": 22.3,
                "hispanic": 15.2,
                "black": 10.8,
                "other": 3.2
            },
            "age_distribution": {
                "under_25": 18.5,
                "25_35": 45.2,
                "35_45": 28.3,
                "over_45": 8.0
            }
        }
    },
    "performance_trends": {
        "monthly_hiring": [
            {"month": "Jan 2024", "hires": 12, "applications": 235, "time_to_hire": 19.2},
            {"month": "Feb 2024", "hires": 8, "applications": 180, "time_to_hire": 17.8},
            {"month": "Mar 2024", "hires": 15, "applications": 290, "time_to_hire": 18.9},
            {"month": "Apr 2024", "hires": 18, "applications": 325, "time_to_hire": 16.5},
            {"month": "May 2024", "hires": 22, "applications": 380, "time_to_hire": 17.2},
            {"month": "Jun 2024", "hires": 25, "applications": 420, "time_to_hire": 18.1}
        ],
        "source_effectiveness": [
            {"source": "LinkedIn", "applications": 450, "hires": 45, "cost_per_hire": 2800, "quality_score": 4.2},
            {"source": "Indeed", "applications": 380, "hires": 28, "cost_per_hire": 2200, "quality_score": 3.8},
            {"source": "Company Website", "applications": 290, "hires": 32, "cost_per_hire": 1800, "quality_score": 4.5},
            {"source": "Referrals", "applications": 125, "hires": 18, "cost_per_hire": 1200, "quality_score": 4.7},
            {"source": "University Partnerships", "applications": 95, "hires": 12, "cost_per_hire": 1500, "quality_score": 4.1}
        ],
        "position_analysis": [
            {
                "position": "Software Engineer",
                "total_applications": 580,
                "hires": 35,
                "average_time_to_hire": 22.3,
                "success_rate": 6.0,
                "average_salary": 95000,
                "retention_rate": 92.1
            },
            {
                "position": "Data Scientist",
                "total_applications": 420,
                "hires": 18,
                "average_time_to_hire": 28.1,
                "success_rate": 4.3,
                "average_salary": 110000,
                "retention_rate": 88.9
            },
            {
                "position": "Product Manager",
                "total_applications": 350,
                "hires": 12,
                "average_time_to_hire": 31.5,
                "success_rate": 3.4,
                "average_salary": 125000,
                "retention_rate": 85.4
            }
        ]
    },
    "custom_reports": [
        {
            "id": 1,
            "name": "Weekly Hiring Dashboard",
            "description": "Weekly overview of hiring activities and metrics",
            "created_by": "HR Manager",
            "created_at": "2024-01-15T10:00:00",
            "last_generated": "2024-01-22T09:00:00",
            "frequency": "weekly",
            "recipients": ["hr@company.com", "ceo@company.com"],
            "metrics": ["total_hires", "time_to_hire", "conversion_rates", "cost_per_hire"]
        },
        {
            "id": 2,
            "name": "Diversity & Inclusion Report",
            "description": "Monthly analysis of diversity metrics and trends",
            "created_by": "D&I Specialist",
            "created_at": "2024-01-10T14:30:00",
            "last_generated": "2024-01-20T15:00:00",
            "frequency": "monthly",
            "recipients": ["di@company.com", "hr@company.com"],
            "metrics": ["diversity_index", "gender_distribution", "ethnicity_distribution"]
        }
    ]
}

@router.get("/executive-summary")
async def get_executive_summary():
    """Get high-level executive summary of hiring metrics"""
    return {
        "success": True,
        "summary": REPORTING_DATA["executive_summary"]
    }

@router.get("/detailed-metrics")
async def get_detailed_metrics(category: Optional[str] = None):
    """Get detailed hiring metrics, optionally filtered by category"""
    if category and category in REPORTING_DATA["detailed_metrics"]:
        return {
            "success": True,
            "metrics": {category: REPORTING_DATA["detailed_metrics"][category]}
        }
    
    return {
        "success": True,
        "metrics": REPORTING_DATA["detailed_metrics"]
    }

@router.get("/performance-trends")
async def get_performance_trends(
    time_range: Optional[str] = "6months",
    metric: Optional[str] = None
):
    """Get performance trends over time"""
    trends = REPORTING_DATA["performance_trends"]
    
    if metric and metric in trends:
        return {
            "success": True,
            "trends": {metric: trends[metric]}
        }
    
    return {
        "success": True,
        "trends": trends
    }

@router.get("/benchmarks")
async def get_industry_benchmarks():
    """Get industry benchmarks for comparison"""
    benchmarks = {
        "industry_averages": {
            "time_to_hire": 25.2,
            "cost_per_hire": 4129,
            "offer_acceptance_rate": 87.1,
            "quality_of_hire": 3.9,
            "retention_rate_1_year": 84.2,
            "candidate_satisfaction": 4.1
        },
        "company_vs_industry": {
            "time_to_hire": {
                "company": 18.5,
                "industry": 25.2,
                "performance": "26.6% better"
            },
            "cost_per_hire": {
                "company": 3250,
                "industry": 4129,
                "performance": "21.3% better"
            },
            "offer_acceptance_rate": {
                "company": 86.2,
                "industry": 87.1,
                "performance": "1.0% below"
            },
            "quality_of_hire": {
                "company": 4.2,
                "industry": 3.9,
                "performance": "7.7% better"
            }
        },
        "peer_companies": [
            {"company": "Company A", "time_to_hire": 22.1, "cost_per_hire": 3800, "quality": 4.0},
            {"company": "Company B", "time_to_hire": 19.5, "cost_per_hire": 3200, "quality": 4.1},
            {"company": "Company C", "time_to_hire": 21.8, "cost_per_hire": 3600, "quality": 3.9}
        ]
    }
    
    return {
        "success": True,
        "benchmarks": benchmarks
    }

@router.get("/custom-reports")
async def get_custom_reports():
    """Get list of custom reports"""
    return {
        "success": True,
        "reports": REPORTING_DATA["custom_reports"]
    }

@router.post("/custom-reports")
async def create_custom_report(report_data: Dict[str, Any]):
    """Create a new custom report"""
    try:
        new_report = {
            "id": len(REPORTING_DATA["custom_reports"]) + 1,
            "name": report_data.get("name"),
            "description": report_data.get("description"),
            "created_by": report_data.get("created_by"),
            "created_at": datetime.now().isoformat(),
            "frequency": report_data.get("frequency", "weekly"),
            "recipients": report_data.get("recipients", []),
            "metrics": report_data.get("metrics", []),
            "filters": report_data.get("filters", {}),
            "charts": report_data.get("charts", [])
        }
        
        REPORTING_DATA["custom_reports"].append(new_report)
        
        return {
            "success": True,
            "message": "Custom report created successfully",
            "report": new_report
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create custom report: {str(e)}")

@router.get("/custom-reports/{report_id}/generate")
async def generate_custom_report(report_id: int):
    """Generate a specific custom report"""
    try:
        # Find the report
        report = None
        for r in REPORTING_DATA["custom_reports"]:
            if r["id"] == report_id:
                report = r
                break
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Generate report data based on metrics
        report_data = {}
        
        for metric in report["metrics"]:
            if metric == "total_hires":
                report_data["total_hires"] = REPORTING_DATA["executive_summary"]["total_hires"]
            elif metric == "time_to_hire":
                report_data["time_to_hire"] = REPORTING_DATA["executive_summary"]["average_time_to_hire"]
            elif metric == "conversion_rates":
                report_data["conversion_rates"] = REPORTING_DATA["detailed_metrics"]["recruitment_funnel"]["conversion_rates"]
            elif metric == "cost_per_hire":
                report_data["cost_per_hire"] = REPORTING_DATA["executive_summary"]["cost_per_hire"]
            elif metric == "diversity_index":
                report_data["diversity_index"] = REPORTING_DATA["executive_summary"]["diversity_index"]
            elif metric == "gender_distribution":
                report_data["gender_distribution"] = REPORTING_DATA["detailed_metrics"]["diversity_metrics"]["gender_distribution"]
            elif metric == "ethnicity_distribution":
                report_data["ethnicity_distribution"] = REPORTING_DATA["detailed_metrics"]["diversity_metrics"]["ethnicity_distribution"]
        
        # Update last generated timestamp
        report["last_generated"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "report": {
                "metadata": report,
                "data": report_data,
                "generated_at": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/export")
async def export_report(
    format: str = "pdf",
    report_type: str = "executive_summary",
    date_range: Optional[str] = None
):
    """Export report in specified format"""
    try:
        if format not in ["pdf", "excel", "csv"]:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
        if report_type not in ["executive_summary", "detailed_metrics", "performance_trends"]:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        # In a real implementation, you would generate the actual file
        export_data = {
            "export_id": f"report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "format": format,
            "report_type": report_type,
            "date_range": date_range,
            "generated_at": datetime.now().isoformat(),
            "download_url": f"/api/v1/reports/download/{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
        return {
            "success": True,
            "export": export_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")

@router.get("/real-time-dashboard")
async def get_real_time_dashboard():
    """Get real-time dashboard data"""
    # Simulate real-time data with some randomization
    base_time = datetime.now()
    
    real_time_data = {
        "live_metrics": {
            "active_interviews": random.randint(5, 15),
            "applications_today": random.randint(20, 50),
            "interviews_scheduled_today": random.randint(8, 20),
            "offers_pending": random.randint(3, 12),
            "response_rate_today": round(random.uniform(0.65, 0.85), 2)
        },
        "recent_activities": [
            {
                "timestamp": (base_time - timedelta(minutes=5)).isoformat(),
                "activity": "New application received",
                "candidate": "John Smith",
                "position": "Software Engineer"
            },
            {
                "timestamp": (base_time - timedelta(minutes=12)).isoformat(),
                "activity": "Interview completed",
                "candidate": "Sarah Johnson",
                "position": "Product Manager"
            },
            {
                "timestamp": (base_time - timedelta(minutes=18)).isoformat(),
                "activity": "Offer accepted",
                "candidate": "Mike Chen",
                "position": "Data Scientist"
            }
        ],
        "alerts": [
            {
                "type": "warning",
                "message": "Interview response rate below threshold (65%)",
                "timestamp": (base_time - timedelta(hours=2)).isoformat()
            },
            {
                "type": "info",
                "message": "Weekly hiring target 80% complete",
                "timestamp": (base_time - timedelta(hours=6)).isoformat()
            }
        ],
        "performance_indicators": {
            "this_week": {
                "applications": random.randint(150, 250),
                "interviews": random.randint(60, 120),
                "hires": random.randint(8, 18),
                "avg_time_to_hire": round(random.uniform(15, 25), 1)
            },
            "vs_last_week": {
                "applications": round(random.uniform(-0.1, 0.2), 2),
                "interviews": round(random.uniform(-0.15, 0.25), 2),
                "hires": round(random.uniform(-0.2, 0.3), 2),
                "avg_time_to_hire": round(random.uniform(-0.1, 0.1), 2)
            }
        }
    }
    
    return {
        "success": True,
        "dashboard": real_time_data
    }

@router.get("/kpi-dashboard")
async def get_kpi_dashboard():
    """Get KPI dashboard with key performance indicators"""
    kpi_data = {
        "primary_kpis": [
            {
                "name": "Time to Hire",
                "value": 18.5,
                "unit": "days",
                "target": 20.0,
                "trend": "improving",
                "change": -1.2,
                "status": "on_track"
            },
            {
                "name": "Cost per Hire",
                "value": 3250,
                "unit": "USD",
                "target": 3500,
                "trend": "improving",
                "change": -7.1,
                "status": "on_track"
            },
            {
                "name": "Quality of Hire",
                "value": 4.2,
                "unit": "score",
                "target": 4.0,
                "trend": "stable",
                "change": 0.1,
                "status": "exceeding"
            },
            {
                "name": "Offer Acceptance Rate",
                "value": 86.2,
                "unit": "%",
                "target": 85.0,
                "trend": "improving",
                "change": 2.3,
                "status": "exceeding"
            }
        ],
        "secondary_kpis": [
            {
                "name": "Candidate Satisfaction",
                "value": 4.3,
                "unit": "score",
                "target": 4.0,
                "status": "exceeding"
            },
            {
                "name": "Interviewer Efficiency",
                "value": 87.2,
                "unit": "%",
                "target": 85.0,
                "status": "exceeding"
            },
            {
                "name": "Diversity Index",
                "value": 0.72,
                "unit": "index",
                "target": 0.70,
                "status": "on_track"
            },
            {
                "name": "Retention Rate (1yr)",
                "value": 89.5,
                "unit": "%",
                "target": 90.0,
                "status": "at_risk"
            }
        ],
        "department_breakdown": [
            {
                "department": "Engineering",
                "hires": 45,
                "time_to_hire": 22.1,
                "cost_per_hire": 3800,
                "quality_score": 4.3
            },
            {
                "department": "Marketing",
                "hires": 18,
                "time_to_hire": 15.2,
                "cost_per_hire": 2900,
                "quality_score": 4.1
            },
            {
                "department": "Sales",
                "hires": 32,
                "time_to_hire": 12.8,
                "cost_per_hire": 2200,
                "quality_score": 3.9
            }
        ]
    }
    
    return {
        "success": True,
        "kpis": kpi_data
    }
