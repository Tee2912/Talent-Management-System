from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import os
from collections import defaultdict, Counter
import statistics
from ..models.schemas import *

router = APIRouter(tags=["Advanced Analytics"])

def load_data():
    """Load all data sources for analytics"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    # Load candidates
    candidates_file = os.path.join(base_dir, "candidates.json")
    candidates = []
    if os.path.exists(candidates_file):
        with open(candidates_file, 'r') as f:
            candidates = json.load(f)
    
    # Load interviews
    interviews_file = os.path.join(base_dir, "interviews.json")
    interviews = []
    if os.path.exists(interviews_file):
        with open(interviews_file, 'r') as f:
            interviews = json.load(f)
    
    return candidates, interviews

@router.get("/predictive-metrics")
async def get_predictive_metrics():
    """Get predictive hiring success models and metrics"""
    try:
        candidates, interviews = load_data()
        
        # Calculate success prediction metrics
        hired_candidates = [c for c in candidates if c.get('hiring_decision') == 'hired']
        
        # Time to hire analysis
        time_to_hire_data = []
        for candidate in hired_candidates:
            application_date = candidate.get('application_date')
            hire_date = candidate.get('hire_date')
            if application_date and hire_date:
                app_dt = datetime.fromisoformat(application_date.replace('Z', '+00:00'))
                hire_dt = datetime.fromisoformat(hire_date.replace('Z', '+00:00'))
                days_to_hire = (hire_dt - app_dt).days
                time_to_hire_data.append(days_to_hire)
        
        avg_time_to_hire = statistics.mean(time_to_hire_data) if time_to_hire_data else 0
        
        # Success prediction by source
        source_success = defaultdict(lambda: {'total': 0, 'hired': 0})
        for candidate in candidates:
            source = candidate.get('source', 'Unknown')
            source_success[source]['total'] += 1
            if candidate.get('hiring_decision') == 'hired':
                source_success[source]['hired'] += 1
        
        # Calculate success rates
        source_metrics = {}
        for source, data in source_success.items():
            rate = (data['hired'] / data['total'] * 100) if data['total'] > 0 else 0
            source_metrics[source] = {
                'success_rate': round(rate, 2),
                'total_candidates': data['total'],
                'hired_count': data['hired']
            }
        
        # Interview-to-offer conversion
        completed_interviews = [i for i in interviews if i.get('status') == 'completed']
        offers_made = len([c for c in candidates if c.get('offer_made') == True])
        interview_conversion = (offers_made / len(completed_interviews) * 100) if completed_interviews else 0
        
        # Score correlation analysis
        score_correlations = {}
        for interview in completed_interviews:
            scores = interview.get('scores', [])
            if scores:
                for score in scores:
                    criteria = score.get('criteriaName', 'Unknown')
                    if criteria not in score_correlations:
                        score_correlations[criteria] = []
                    score_correlations[criteria].append(score.get('score', 0))
        
        # Calculate average scores by criteria
        avg_scores_by_criteria = {}
        for criteria, scores in score_correlations.items():
            avg_scores_by_criteria[criteria] = round(statistics.mean(scores), 2) if scores else 0
        
        return {
            "time_to_hire": {
                "average_days": round(avg_time_to_hire, 1),
                "median_days": round(statistics.median(time_to_hire_data), 1) if time_to_hire_data else 0,
                "fastest_hire": min(time_to_hire_data) if time_to_hire_data else 0,
                "slowest_hire": max(time_to_hire_data) if time_to_hire_data else 0
            },
            "source_effectiveness": source_metrics,
            "conversion_rates": {
                "interview_to_offer": round(interview_conversion, 2),
                "application_to_interview": 0,  # Would need application data
                "offer_to_hire": 0  # Would need offer acceptance data
            },
            "score_analytics": {
                "average_scores_by_criteria": avg_scores_by_criteria,
                "total_interviews_analyzed": len(completed_interviews)
            },
            "prediction_model": {
                "confidence_score": 0.85,  # Mock confidence
                "key_factors": ["technical_score", "communication", "cultural_fit"],
                "success_indicators": ["high_technical_score", "strong_communication", "culture_match"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating predictive metrics: {str(e)}")

@router.get("/interviewer-performance")
async def get_interviewer_performance():
    """Get interviewer performance analytics"""
    try:
        candidates, interviews = load_data()
        
        # Mock interviewer data (in real system, this would come from user management)
        interviewers = {
            1: {"name": "John Smith", "department": "Engineering"},
            2: {"name": "Sarah Johnson", "department": "Product"},
            3: {"name": "Mike Chen", "department": "Engineering"},
            4: {"name": "Emily Davis", "department": "Product"}
        }
        
        interviewer_stats = defaultdict(lambda: {
            'interviews_conducted': 0,
            'avg_score_given': [],
            'candidates_recommended': 0,
            'hire_success_rate': 0,
            'avg_interview_duration': 0,
            'feedback_quality_score': 0
        })
        
        # Analyze interview data
        for interview in interviews:
            interviewer_ids = interview.get('interviewer_ids', [1])  # Default to interviewer 1
            scores = interview.get('scores', [])
            
            for interviewer_id in interviewer_ids:
                stats = interviewer_stats[interviewer_id]
                stats['interviews_conducted'] += 1
                
                # Calculate average score given
                if scores:
                    interview_avg = statistics.mean([s.get('score', 0) for s in scores])
                    stats['avg_score_given'].append(interview_avg)
                
                # Mock additional metrics
                stats['avg_interview_duration'] = 65  # minutes
                stats['feedback_quality_score'] = 4.2  # out of 5
        
        # Calculate final metrics
        performance_data = {}
        for interviewer_id, stats in interviewer_stats.items():
            if interviewer_id in interviewers:
                avg_score = statistics.mean(stats['avg_score_given']) if stats['avg_score_given'] else 0
                performance_data[interviewer_id] = {
                    "interviewer_info": interviewers[interviewer_id],
                    "interviews_conducted": stats['interviews_conducted'],
                    "average_score_given": round(avg_score, 2),
                    "score_consistency": round(statistics.stdev(stats['avg_score_given']), 2) if len(stats['avg_score_given']) > 1 else 0,
                    "candidates_recommended": stats['interviews_conducted'] // 2,  # Mock
                    "hire_success_rate": 75.5,  # Mock percentage
                    "avg_interview_duration": stats['avg_interview_duration'],
                    "feedback_quality_score": stats['feedback_quality_score'],
                    "efficiency_rating": "High",  # Mock rating
                    "bias_score": 0.15  # Lower is better
                }
        
        return {
            "interviewer_performance": performance_data,
            "top_performers": sorted(performance_data.items(), 
                                   key=lambda x: x[1]['hire_success_rate'], 
                                   reverse=True)[:3],
            "metrics_summary": {
                "total_interviewers": len(performance_data),
                "avg_interviews_per_interviewer": round(sum(p['interviews_conducted'] for p in performance_data.values()) / len(performance_data), 1) if performance_data else 0,
                "avg_hire_success_rate": round(sum(p['hire_success_rate'] for p in performance_data.values()) / len(performance_data), 1) if performance_data else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating interviewer performance: {str(e)}")

@router.get("/cost-analysis")
async def get_cost_analysis():
    """Get cost per hire and hiring cost analytics"""
    try:
        candidates, interviews = load_data()
        
        # Mock cost data (in real system, this would come from HR/Finance systems)
        base_costs = {
            "recruiter_hourly_rate": 50,
            "interviewer_hourly_rate": 75,
            "platform_cost_per_month": 1200,
            "background_check_cost": 45,
            "job_posting_cost": 300,
            "referral_bonus": 2000
        }
        
        hired_count = len([c for c in candidates if c.get('hiring_decision') == 'hired'])
        total_interviews = len(interviews)
        
        # Calculate costs
        interview_hours = total_interviews * 1.5  # Average 1.5 hours per interview
        interviewer_costs = interview_hours * base_costs["interviewer_hourly_rate"]
        
        recruiter_hours = len(candidates) * 2  # 2 hours per candidate on average
        recruiter_costs = recruiter_hours * base_costs["recruiter_hourly_rate"]
        
        total_monthly_costs = (
            interviewer_costs +
            recruiter_costs +
            base_costs["platform_cost_per_month"] +
            (hired_count * base_costs["background_check_cost"]) +
            (len(set(c.get('position_applied') for c in candidates)) * base_costs["job_posting_cost"])
        )
        
        cost_per_hire = total_monthly_costs / hired_count if hired_count > 0 else 0
        
        # Position-wise cost analysis
        position_costs = defaultdict(lambda: {'hired': 0, 'total_candidates': 0, 'interviews': 0})
        for candidate in candidates:
            position = candidate.get('position_applied', 'Unknown')
            position_costs[position]['total_candidates'] += 1
            if candidate.get('hiring_decision') == 'hired':
                position_costs[position]['hired'] += 1
        
        for interview in interviews:
            # Mock position assignment
            position = "Software Engineer"  # Would get from candidate data
            position_costs[position]['interviews'] += 1
        
        position_analysis = {}
        for position, data in position_costs.items():
            if data['hired'] > 0:
                position_cost = (data['interviews'] * 1.5 * base_costs["interviewer_hourly_rate"] + 
                               data['total_candidates'] * 2 * base_costs["recruiter_hourly_rate"]) / data['hired']
                position_analysis[position] = {
                    'cost_per_hire': round(position_cost, 2),
                    'candidates_processed': data['total_candidates'],
                    'interviews_conducted': data['interviews'],
                    'successful_hires': data['hired'],
                    'efficiency_score': round((data['hired'] / data['total_candidates']) * 100, 1)
                }
        
        return {
            "overall_metrics": {
                "cost_per_hire": round(cost_per_hire, 2),
                "total_hiring_costs": round(total_monthly_costs, 2),
                "total_hires": hired_count,
                "average_time_to_hire": 28,  # days
                "cost_efficiency_score": "B+"
            },
            "cost_breakdown": {
                "interviewer_costs": round(interviewer_costs, 2),
                "recruiter_costs": round(recruiter_costs, 2),
                "platform_costs": base_costs["platform_cost_per_month"],
                "background_checks": hired_count * base_costs["background_check_cost"],
                "job_postings": len(set(c.get('position_applied') for c in candidates)) * base_costs["job_posting_cost"],
                "other_costs": 500  # Mock other costs
            },
            "position_analysis": position_analysis,
            "cost_trends": {
                "monthly_trend": [
                    {"month": "Jan", "cost_per_hire": 3200},
                    {"month": "Feb", "cost_per_hire": 2900},
                    {"month": "Mar", "cost_per_hire": 3100},
                    {"month": "Apr", "cost_per_hire": 2800},
                    {"month": "May", "cost_per_hire": round(cost_per_hire, 2)}
                ]
            },
            "benchmarks": {
                "industry_average": 4129,
                "company_target": 3000,
                "best_in_class": 2500
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cost analysis: {str(e)}")

@router.get("/funnel-analysis")
async def get_funnel_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    position: Optional[str] = Query(None)
):
    """Get detailed hiring funnel analysis"""
    try:
        candidates, interviews = load_data()
        
        # Filter by date range if provided
        if start_date and end_date:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
            candidates = [c for c in candidates if start_dt <= datetime.fromisoformat(c.get('application_date', '2024-01-01')) <= end_dt]
        
        # Filter by position if provided
        if position:
            candidates = [c for c in candidates if c.get('position_applied', '').lower() == position.lower()]
        
        # Calculate funnel stages
        total_applications = len(candidates)
        resume_screened = len([c for c in candidates if c.get('resume_score', 0) > 0])
        phone_screened = len([c for c in candidates if c.get('phone_screen_passed', False)])
        interviewed = len([c for c in candidates if c.get('interview_completed', False)])
        offers_made = len([c for c in candidates if c.get('offer_made', False)])
        hired = len([c for c in candidates if c.get('hiring_decision') == 'hired'])
        
        # Calculate conversion rates
        stages = [
            {
                "stage": "Applications",
                "count": total_applications,
                "conversion_rate": 100.0,
                "drop_off_rate": 0.0
            },
            {
                "stage": "Resume Screen",
                "count": resume_screened,
                "conversion_rate": round((resume_screened / total_applications * 100), 1) if total_applications > 0 else 0,
                "drop_off_rate": round(((total_applications - resume_screened) / total_applications * 100), 1) if total_applications > 0 else 0
            },
            {
                "stage": "Phone Screen",
                "count": phone_screened,
                "conversion_rate": round((phone_screened / total_applications * 100), 1) if total_applications > 0 else 0,
                "drop_off_rate": round(((resume_screened - phone_screened) / resume_screened * 100), 1) if resume_screened > 0 else 0
            },
            {
                "stage": "Interview",
                "count": interviewed,
                "conversion_rate": round((interviewed / total_applications * 100), 1) if total_applications > 0 else 0,
                "drop_off_rate": round(((phone_screened - interviewed) / phone_screened * 100), 1) if phone_screened > 0 else 0
            },
            {
                "stage": "Offer",
                "count": offers_made,
                "conversion_rate": round((offers_made / total_applications * 100), 1) if total_applications > 0 else 0,
                "drop_off_rate": round(((interviewed - offers_made) / interviewed * 100), 1) if interviewed > 0 else 0
            },
            {
                "stage": "Hire",
                "count": hired,
                "conversion_rate": round((hired / total_applications * 100), 1) if total_applications > 0 else 0,
                "drop_off_rate": round(((offers_made - hired) / offers_made * 100), 1) if offers_made > 0 else 0
            }
        ]
        
        # Time analysis at each stage
        stage_timing = {
            "application_to_resume_screen": 2,  # days
            "resume_screen_to_phone": 3,
            "phone_to_interview": 7,
            "interview_to_offer": 5,
            "offer_to_hire": 10
        }
        
        # Position comparison
        position_funnels = {}
        positions = set(c.get('position_applied') for c in candidates if c.get('position_applied'))
        
        for pos in positions:
            pos_candidates = [c for c in candidates if c.get('position_applied') == pos]
            pos_hired = len([c for c in pos_candidates if c.get('hiring_decision') == 'hired'])
            position_funnels[pos] = {
                "total_applications": len(pos_candidates),
                "hired": pos_hired,
                "success_rate": round((pos_hired / len(pos_candidates) * 100), 1) if pos_candidates else 0,
                "avg_time_to_hire": 28  # Mock data
            }
        
        return {
            "funnel_stages": stages,
            "overall_metrics": {
                "total_applications": total_applications,
                "overall_success_rate": round((hired / total_applications * 100), 1) if total_applications > 0 else 0,
                "avg_time_to_hire": sum(stage_timing.values()),
                "bottleneck_stage": "Phone Screen"  # Mock analysis
            },
            "stage_timing": stage_timing,
            "position_comparison": position_funnels,
            "improvement_opportunities": [
                {
                    "stage": "Resume Screen",
                    "issue": "High drop-off rate",
                    "recommendation": "Review screening criteria",
                    "potential_impact": "15% improvement in qualified candidates"
                },
                {
                    "stage": "Interview",
                    "issue": "Long scheduling delays",
                    "recommendation": "Implement automated scheduling",
                    "potential_impact": "Reduce time-to-hire by 3 days"
                }
            ],
            "trends": {
                "weekly_applications": [45, 52, 38, 61, 47],  # Last 5 weeks
                "conversion_trend": "Improving",
                "quality_trend": "Stable"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating funnel analysis: {str(e)}")

@router.get("/question-effectiveness")
async def get_question_effectiveness():
    """Analyze interview question effectiveness"""
    try:
        candidates, interviews = load_data()
        
        # Mock question analysis (in real system, would analyze actual question data)
        questions = [
            {
                "id": 1,
                "question": "Explain the concept of closures in JavaScript",
                "category": "Technical",
                "difficulty": "Medium",
                "times_asked": 25,
                "avg_score": 7.2,
                "correlation_with_hire": 0.68,
                "effectiveness_score": 8.5,
                "discrimination_power": 0.72
            },
            {
                "id": 2,
                "question": "How do you handle conflict in a team?",
                "category": "Behavioral",
                "difficulty": "Easy",
                "times_asked": 30,
                "avg_score": 8.1,
                "correlation_with_hire": 0.45,
                "effectiveness_score": 6.8,
                "discrimination_power": 0.52
            },
            {
                "id": 3,
                "question": "Design a system for handling millions of requests",
                "category": "System Design",
                "difficulty": "Hard",
                "times_asked": 18,
                "avg_score": 6.4,
                "correlation_with_hire": 0.82,
                "effectiveness_score": 9.2,
                "discrimination_power": 0.89
            },
            {
                "id": 4,
                "question": "Tell me about yourself",
                "category": "General",
                "difficulty": "Easy",
                "times_asked": 35,
                "avg_score": 7.8,
                "correlation_with_hire": 0.23,
                "effectiveness_score": 4.2,
                "discrimination_power": 0.31
            }
        ]
        
        # Category analysis
        category_stats = defaultdict(lambda: {
            'questions': [],
            'avg_effectiveness': 0,
            'avg_correlation': 0
        })
        
        for q in questions:
            category = q['category']
            category_stats[category]['questions'].append(q)
        
        for category, stats in category_stats.items():
            questions_in_category = stats['questions']
            stats['avg_effectiveness'] = round(
                sum(q['effectiveness_score'] for q in questions_in_category) / len(questions_in_category), 1
            )
            stats['avg_correlation'] = round(
                sum(q['correlation_with_hire'] for q in questions_in_category) / len(questions_in_category), 2
            )
            stats['question_count'] = len(questions_in_category)
        
        # Top performing questions
        top_questions = sorted(questions, key=lambda x: x['effectiveness_score'], reverse=True)[:5]
        
        # Questions needing improvement
        low_performing = sorted(questions, key=lambda x: x['effectiveness_score'])[:3]
        
        return {
            "question_analysis": questions,
            "category_performance": dict(category_stats),
            "top_performing_questions": top_questions,
            "questions_needing_improvement": low_performing,
            "recommendations": [
                {
                    "type": "Replace Low Performers",
                    "description": "Consider replacing questions with effectiveness score < 5.0",
                    "affected_questions": [q['question'] for q in low_performing if q['effectiveness_score'] < 5.0],
                    "priority": "High"
                },
                {
                    "type": "Add Technical Questions",
                    "description": "Technical questions show highest correlation with hiring success",
                    "priority": "Medium"
                },
                {
                    "type": "Review General Questions",
                    "description": "General category questions have low discrimination power",
                    "priority": "Low"
                }
            ],
            "metrics_summary": {
                "total_questions_analyzed": len(questions),
                "avg_effectiveness_score": round(sum(q['effectiveness_score'] for q in questions) / len(questions), 1),
                "avg_correlation_with_hire": round(sum(q['correlation_with_hire'] for q in questions) / len(questions), 2),
                "most_effective_category": max(category_stats.items(), key=lambda x: x[1]['avg_effectiveness'])[0]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing question effectiveness: {str(e)}")

@router.get("/seasonal-trends")
async def get_seasonal_trends():
    """Get seasonal hiring trends and predictions"""
    try:
        candidates, interviews = load_data()
        
        # Mock seasonal data (in real system, would analyze historical data)
        monthly_trends = [
            {"month": "Jan", "applications": 120, "hires": 8, "avg_time_to_hire": 32},
            {"month": "Feb", "applications": 95, "hires": 6, "avg_time_to_hire": 28},
            {"month": "Mar", "applications": 180, "hires": 12, "avg_time_to_hire": 25},
            {"month": "Apr", "applications": 200, "hires": 15, "avg_time_to_hire": 22},
            {"month": "May", "applications": 165, "hires": 11, "avg_time_to_hire": 26},
            {"month": "Jun", "applications": 140, "hires": 9, "avg_time_to_hire": 30},
            {"month": "Jul", "applications": 110, "hires": 7, "avg_time_to_hire": 35},
            {"month": "Aug", "applications": 130, "hires": 8, "avg_time_to_hire": 31},
            {"month": "Sep", "applications": 220, "hires": 16, "avg_time_to_hire": 24},
            {"month": "Oct", "applications": 190, "hires": 13, "avg_time_to_hire": 27},
            {"month": "Nov", "applications": 160, "hires": 10, "avg_time_to_hire": 29},
            {"month": "Dec", "applications": 85, "hires": 5, "avg_time_to_hire": 38}
        ]
        
        # Seasonal patterns
        patterns = {
            "peak_hiring_months": ["March", "April", "September"],
            "low_activity_months": ["December", "July", "February"],
            "best_conversion_months": ["April", "September", "March"],
            "fastest_hiring_months": ["April", "March", "September"]
        }
        
        # Predictions for next quarter
        current_month = datetime.now().month
        next_quarter_months = [(current_month + i) % 12 + 1 for i in range(1, 4)]
        
        predictions = []
        for month_num in next_quarter_months:
            month_name = datetime(2024, month_num, 1).strftime("%B")
            # Simple prediction based on historical averages
            historical_data = next((m for m in monthly_trends if m["month"] == month_name[:3]), None)
            if historical_data:
                predictions.append({
                    "month": month_name,
                    "predicted_applications": int(historical_data["applications"] * 1.1),  # 10% growth
                    "predicted_hires": int(historical_data["hires"] * 1.1),
                    "predicted_time_to_hire": historical_data["avg_time_to_hire"],
                    "confidence": 0.75
                })
        
        # Industry benchmarks
        industry_benchmarks = {
            "tech_industry": {
                "peak_months": ["March", "September"],
                "avg_applications_per_month": 156,
                "avg_time_to_hire": 28
            },
            "finance_industry": {
                "peak_months": ["January", "June"],
                "avg_applications_per_month": 134,
                "avg_time_to_hire": 35
            }
        }
        
        return {
            "monthly_trends": monthly_trends,
            "seasonal_patterns": patterns,
            "next_quarter_predictions": predictions,
            "year_over_year_comparison": {
                "applications_growth": 12.5,  # percentage
                "hire_rate_change": 2.3,
                "time_to_hire_improvement": -4.2  # negative is better
            },
            "industry_benchmarks": industry_benchmarks,
            "recommendations": [
                {
                    "period": "Next Quarter",
                    "recommendation": "Increase recruiter capacity for September peak",
                    "expected_impact": "20% reduction in time-to-hire"
                },
                {
                    "period": "Holiday Season",
                    "recommendation": "Plan for reduced activity in December",
                    "expected_impact": "Better resource allocation"
                }
            ],
            "key_insights": [
                "Spring months (March-April) show highest hiring activity",
                "September represents the best conversion opportunity",
                "Winter months require adjusted expectations",
                "Q1 typically shows strong candidate quality"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating seasonal trends: {str(e)}")
