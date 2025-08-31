from fastapi import APIRouter
from typing import Dict, List, Any
import json
import os
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()

def load_candidates() -> List[dict]:
    """Load candidates from JSON file"""
    if not os.path.exists("candidates.json"):
        return []
    try:
        with open("candidates.json", 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

@router.get("/summary")
async def get_analytics_summary():
    """Get overall hiring analytics summary"""
    candidates = load_candidates()
    
    if not candidates:
        return {
            "total_candidates": 0,
            "total_positions": 0,
            "hiring_rate": 0,
            "average_scores": {},
            "trends": {}
        }
    
    total_candidates = len(candidates)
    hired_count = len([c for c in candidates if c.get('hiring_decision') == 'hired'])
    
    # Position statistics
    positions = set(c.get('position_applied', 'Unknown') for c in candidates)
    total_positions = len(positions)
    
    # Score averages
    score_fields = ['resume_score', 'interview_score', 'technical_score', 'final_score']
    average_scores = {}
    
    for field in score_fields:
        scores = [c.get(field) for c in candidates if c.get(field) is not None]
        if scores:
            average_scores[field] = sum(scores) / len(scores)
        else:
            average_scores[field] = 0
    
    # Time trends (last 30 days)
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)
    
    recent_candidates = []
    for c in candidates:
        created_at = c.get('created_at')
        if created_at:
            try:
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if created_date >= thirty_days_ago:
                    recent_candidates.append(c)
            except:
                continue
    
    trends = {
        "candidates_last_30_days": len(recent_candidates),
        "hiring_rate_last_30_days": (
            len([c for c in recent_candidates if c.get('hiring_decision') == 'hired']) / 
            len(recent_candidates) * 100
        ) if recent_candidates else 0
    }
    
    return {
        "total_candidates": total_candidates,
        "total_hired": hired_count,
        "total_positions": total_positions,
        "hiring_rate": (hired_count / total_candidates * 100) if total_candidates > 0 else 0,
        "average_scores": average_scores,
        "trends": trends
    }

@router.get("/positions")
async def get_position_analytics():
    """Get analytics by position"""
    candidates = load_candidates()
    
    position_stats = defaultdict(lambda: {
        'total_candidates': 0,
        'hired': 0,
        'rejected': 0,
        'on_hold': 0,
        'pending': 0,
        'average_scores': {},
        'demographics': defaultdict(lambda: defaultdict(int))
    })
    
    for candidate in candidates:
        position = candidate.get('position_applied', 'Unknown')
        decision = candidate.get('hiring_decision', 'pending')
        
        position_stats[position]['total_candidates'] += 1
        
        if decision == 'hired':
            position_stats[position]['hired'] += 1
        elif decision == 'rejected':
            position_stats[position]['rejected'] += 1
        elif decision == 'on_hold':
            position_stats[position]['on_hold'] += 1
        else:
            position_stats[position]['pending'] += 1
        
        # Demographics
        gender = candidate.get('gender', 'unknown')
        ethnicity = candidate.get('ethnicity', 'unknown')
        position_stats[position]['demographics']['gender'][gender] += 1
        position_stats[position]['demographics']['ethnicity'][ethnicity] += 1
    
    # Calculate averages and rates
    result = {}
    for position, stats in position_stats.items():
        total = stats['total_candidates']
        result[position] = {
            'total_candidates': total,
            'hired': stats['hired'],
            'rejected': stats['rejected'],
            'on_hold': stats['on_hold'],
            'pending': stats['pending'],
            'hiring_rate': (stats['hired'] / total * 100) if total > 0 else 0,
            'demographics': dict(stats['demographics'])
        }
    
    return result

@router.get("/demographics")
async def get_demographic_analytics():
    """Get analytics by demographics"""
    candidates = load_candidates()
    
    demographic_stats = {
        'gender': defaultdict(lambda: {'total': 0, 'hired': 0, 'positions': defaultdict(int)}),
        'ethnicity': defaultdict(lambda: {'total': 0, 'hired': 0, 'positions': defaultdict(int)}),
        'age_groups': defaultdict(lambda: {'total': 0, 'hired': 0})
    }
    
    for candidate in candidates:
        gender = candidate.get('gender', 'unknown')
        ethnicity = candidate.get('ethnicity', 'unknown')
        age = candidate.get('age')
        position = candidate.get('position_applied', 'Unknown')
        hired = candidate.get('hiring_decision') == 'hired'
        
        # Gender stats
        demographic_stats['gender'][gender]['total'] += 1
        demographic_stats['gender'][gender]['positions'][position] += 1
        if hired:
            demographic_stats['gender'][gender]['hired'] += 1
        
        # Ethnicity stats
        demographic_stats['ethnicity'][ethnicity]['total'] += 1
        demographic_stats['ethnicity'][ethnicity]['positions'][position] += 1
        if hired:
            demographic_stats['ethnicity'][ethnicity]['hired'] += 1
        
        # Age group stats
        if age:
            if age < 25:
                age_group = 'under_25'
            elif age < 35:
                age_group = '25_34'
            elif age < 45:
                age_group = '35_44'
            elif age < 55:
                age_group = '45_54'
            else:
                age_group = '55_plus'
            
            demographic_stats['age_groups'][age_group]['total'] += 1
            if hired:
                demographic_stats['age_groups'][age_group]['hired'] += 1
    
    # Calculate hiring rates
    result = {}
    for demo_type, groups in demographic_stats.items():
        result[demo_type] = {}
        for group, stats in groups.items():
            total = stats['total']
            hired = stats['hired']
            result[demo_type][group] = {
                'total': total,
                'hired': hired,
                'hiring_rate': (hired / total * 100) if total > 0 else 0
            }
            if 'positions' in stats:
                result[demo_type][group]['positions'] = dict(stats['positions'])
    
    return result

@router.get("/timeline")
async def get_hiring_timeline():
    """Get hiring timeline analytics"""
    candidates = load_candidates()
    
    timeline_data = defaultdict(lambda: {
        'applications': 0,
        'hired': 0,
        'rejected': 0
    })
    
    for candidate in candidates:
        created_at = candidate.get('created_at')
        if not created_at:
            continue
        
        try:
            created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            month_key = created_date.strftime('%Y-%m')
            
            timeline_data[month_key]['applications'] += 1
            
            decision = candidate.get('hiring_decision')
            if decision == 'hired':
                timeline_data[month_key]['hired'] += 1
            elif decision == 'rejected':
                timeline_data[month_key]['rejected'] += 1
        except:
            continue
    
    # Sort by date and calculate rates
    sorted_timeline = []
    for month, data in sorted(timeline_data.items()):
        apps = data['applications']
        hired = data['hired']
        rejected = data['rejected']
        
        sorted_timeline.append({
            'month': month,
            'applications': apps,
            'hired': hired,
            'rejected': rejected,
            'hiring_rate': (hired / apps * 100) if apps > 0 else 0,
            'rejection_rate': (rejected / apps * 100) if apps > 0 else 0
        })
    
    return sorted_timeline

@router.get("/scores")
async def get_score_analytics():
    """Get score distribution analytics"""
    candidates = load_candidates()
    
    score_fields = ['resume_score', 'interview_score', 'technical_score', 'final_score']
    score_analytics = {}
    
    for field in score_fields:
        scores = [c.get(field) for c in candidates if c.get(field) is not None]
        
        if not scores:
            score_analytics[field] = {
                'count': 0,
                'average': 0,
                'min': 0,
                'max': 0,
                'distribution': {}
            }
            continue
        
        # Calculate statistics
        count = len(scores)
        average = sum(scores) / count
        min_score = min(scores)
        max_score = max(scores)
        
        # Score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
        distribution = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        }
        
        for score in scores:
            if score <= 20:
                distribution['0-20'] += 1
            elif score <= 40:
                distribution['21-40'] += 1
            elif score <= 60:
                distribution['41-60'] += 1
            elif score <= 80:
                distribution['61-80'] += 1
            else:
                distribution['81-100'] += 1
        
        score_analytics[field] = {
            'count': count,
            'average': round(average, 2),
            'min': min_score,
            'max': max_score,
            'distribution': distribution
        }
    
    return score_analytics

@router.get("/conversion-funnel")
async def get_conversion_funnel():
    """Get hiring conversion funnel analytics"""
    candidates = load_candidates()
    
    funnel_stages = {
        'applied': len(candidates),
        'resume_reviewed': len([c for c in candidates if c.get('resume_score') is not None]),
        'interviewed': len([c for c in candidates if c.get('interview_score') is not None]),
        'technical_tested': len([c for c in candidates if c.get('technical_score') is not None]),
        'final_scored': len([c for c in candidates if c.get('final_score') is not None]),
        'hired': len([c for c in candidates if c.get('hiring_decision') == 'hired']),
        'rejected': len([c for c in candidates if c.get('hiring_decision') == 'rejected'])
    }
    
    # Calculate conversion rates
    total_applied = funnel_stages['applied']
    conversion_rates = {}
    
    for stage, count in funnel_stages.items():
        if stage != 'applied' and total_applied > 0:
            conversion_rates[f"{stage}_rate"] = (count / total_applied * 100)
    
    return {
        'funnel_stages': funnel_stages,
        'conversion_rates': conversion_rates
    }
