"""
Generate comprehensive mock candidate data for bias detection testing
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_comprehensive_mock_candidates(num_candidates: int = 100) -> List[Dict[str, Any]]:
    """Generate realistic mock candidate data with diverse demographics"""
    
    # Define realistic data ranges
    first_names = {
        'male': ['James', 'Michael', 'Robert', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
                'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin',
                'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary'],
        'female': ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
                  'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
                  'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen']
    }
    
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']
    
    positions = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 
                'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'Machine Learning Engineer',
                'Software Architect', 'Technical Lead', 'Quality Assurance Engineer', 'Business Analyst']
    
    education_levels = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD']
    
    ethnicities = ['white', 'black', 'hispanic', 'asian', 'native_american', 'pacific_islander', 'mixed', 'other']
    
    skills_by_position = {
        'Software Engineer': [['Python', 'Java', 'JavaScript', 'SQL'], ['C++', 'React', 'Node.js', 'Git'], 
                             ['Python', 'Django', 'PostgreSQL', 'AWS'], ['Java', 'Spring', 'MySQL', 'Docker']],
        'Data Scientist': [['Python', 'R', 'SQL', 'Machine Learning'], ['TensorFlow', 'Pandas', 'NumPy', 'Jupyter'],
                          ['Python', 'Scikit-learn', 'Tableau', 'Statistics'], ['R', 'Python', 'Deep Learning', 'Big Data']],
        'Product Manager': [['Product Strategy', 'Agile', 'Analytics', 'Roadmapping'], ['Scrum', 'Jira', 'SQL', 'A/B Testing'],
                           ['Market Research', 'User Stories', 'Wireframing', 'Data Analysis']],
        'UX Designer': [['UI/UX Design', 'Figma', 'User Research', 'Prototyping'], ['Adobe XD', 'Sketch', 'InVision', 'Usability Testing'],
                       ['Design Systems', 'Information Architecture', 'Interaction Design', 'Visual Design']],
        'DevOps Engineer': [['AWS', 'Docker', 'Kubernetes', 'Jenkins'], ['Terraform', 'Ansible', 'Linux', 'CI/CD'],
                           ['Azure', 'Git', 'Monitoring', 'Infrastructure as Code']],
        'Backend Developer': [['Python', 'Django', 'PostgreSQL', 'Redis'], ['Java', 'Spring Boot', 'MySQL', 'Microservices'],
                             ['Node.js', 'Express', 'MongoDB', 'REST APIs']],
        'Frontend Developer': [['React', 'JavaScript', 'HTML', 'CSS'], ['Vue.js', 'TypeScript', 'Sass', 'Webpack'],
                              ['Angular', 'JavaScript', 'Bootstrap', 'jQuery']],
        'Full Stack Developer': [['React', 'Node.js', 'MongoDB', 'Express'], ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
                                ['Angular', 'Java', 'Spring', 'MySQL']],
        'Machine Learning Engineer': [['Python', 'TensorFlow', 'PyTorch', 'MLOps'], ['Scikit-learn', 'Kubernetes', 'Docker', 'AWS'],
                                     ['Deep Learning', 'Computer Vision', 'NLP', 'Model Deployment']],
        'Software Architect': [['System Design', 'Microservices', 'Cloud Architecture', 'Leadership'], 
                              ['Enterprise Patterns', 'API Design', 'Security', 'Scalability']],
        'Technical Lead': [['Leadership', 'Architecture', 'Code Review', 'Mentoring'], ['Team Management', 'Technical Strategy', 'Agile', 'Planning']],
        'Quality Assurance Engineer': [['Test Automation', 'Selenium', 'Java', 'Quality Assurance'], ['Manual Testing', 'API Testing', 'Performance Testing', 'Bug Tracking']],
        'Business Analyst': [['Requirements Analysis', 'SQL', 'Data Analysis', 'Documentation'], ['Process Improvement', 'Stakeholder Management', 'Agile', 'Business Intelligence']]
    }
    
    candidates = []
    
    for i in range(num_candidates):
        # Basic demographics
        gender = random.choice(['male', 'female'])
        ethnicity = random.choices(
            ethnicities, 
            weights=[40, 15, 20, 15, 3, 2, 3, 2]  # Realistic US demographic distribution
        )[0]
        
        first_name = random.choice(first_names[gender])
        last_name = random.choice(last_names)
        position = random.choice(positions)
        
        # Experience and education correlation
        education = random.choices(
            education_levels,
            weights=[5, 10, 50, 30, 5]  # Most have Bachelor's
        )[0]
        
        # Experience years based on position and education
        if education == 'PhD':
            experience_base = random.randint(2, 8)
        elif education == 'Master\'s Degree':
            experience_base = random.randint(1, 6)
        elif education == 'Bachelor\'s Degree':
            experience_base = random.randint(0, 5)
        else:
            experience_base = random.randint(0, 3)
        
        experience_years = experience_base + random.randint(0, 3)
        
        # Age correlation with experience
        age = 22 + experience_years + random.randint(-2, 5)
        age = max(18, min(65, age))  # Reasonable age bounds
        
        # Skills based on position
        skills = random.choice(skills_by_position.get(position, [['General Skills']]))
        
        # Generate scores with some realistic bias patterns
        base_resume_score = random.uniform(70, 95)
        base_interview_score = random.uniform(70, 95)
        base_technical_score = random.uniform(70, 95)
        
        # Introduce subtle bias patterns (for testing bias detection)
        bias_factor = 1.0
        
        # Gender bias simulation (subtle)
        if gender == 'female' and position in ['Software Engineer', 'DevOps Engineer', 'Software Architect']:
            bias_factor *= random.uniform(0.95, 1.0)  # Very slight negative bias
        
        # Ethnicity bias simulation (subtle)
        if ethnicity in ['black', 'hispanic'] and random.random() < 0.3:
            bias_factor *= random.uniform(0.92, 1.0)  # Occasional slight bias
        
        # Age bias simulation
        if age > 50 and random.random() < 0.2:
            bias_factor *= random.uniform(0.90, 1.0)  # Occasional age bias
        
        # Apply bias factor
        resume_score = min(100, base_resume_score * bias_factor)
        interview_score = min(100, base_interview_score * bias_factor)
        technical_score = min(100, base_technical_score * bias_factor)
        
        # Calculate final score
        final_score = (resume_score * 0.3 + interview_score * 0.4 + technical_score * 0.3)
        
        # Hiring decision based on final score with some randomness
        if final_score >= 85:
            hiring_decision = random.choices(['hired', 'hired', 'hired', 'on_hold'], weights=[80, 10, 5, 5])[0]
        elif final_score >= 75:
            hiring_decision = random.choices(['hired', 'on_hold', 'rejected'], weights=[60, 25, 15])[0]
        elif final_score >= 65:
            hiring_decision = random.choices(['hired', 'on_hold', 'rejected'], weights=[20, 30, 50])[0]
        else:
            hiring_decision = random.choices(['rejected', 'on_hold'], weights=[85, 15])[0]
        
        # Calculate bias score (0 = no bias, 1 = high bias)
        bias_score = max(0, 1 - bias_factor) + random.uniform(0, 0.3)
        bias_score = min(1.0, bias_score)
        
        # Generate creation date
        created_date = datetime.now() - timedelta(days=random.randint(1, 180))
        
        candidate = {
            "id": i + 1,
            "first_name": first_name,
            "last_name": last_name,
            "email": f"{first_name.lower()}.{last_name.lower()}@email.com",
            "phone": f"+1-555-{random.randint(1000, 9999)}",
            "position_applied": position,
            "experience_years": experience_years,
            "education_level": education,
            "skills": skills,
            "gender": gender,
            "ethnicity": ethnicity,
            "age": age,
            "created_at": created_date.isoformat(),
            "updated_at": None,
            "is_active": True,
            "resume_score": round(resume_score, 1),
            "interview_score": round(interview_score, 1),
            "technical_score": round(technical_score, 1),
            "final_score": round(final_score, 1),
            "hiring_decision": hiring_decision,
            "bias_score": round(bias_score, 2),
            "fairness_metrics": None,
            # Additional fields for bias analysis
            "department": position.split()[0] if len(position.split()) > 1 else "Engineering",
            "referral_source": random.choice(['LinkedIn', 'Company Website', 'Referral', 'Recruiter', 'Job Board']),
            "interview_rounds": random.randint(2, 5),
            "years_since_graduation": max(0, age - 22),
            "previous_companies": random.randint(0, 4),
            "location": random.choice(['New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Remote'])
        }
        
        candidates.append(candidate)
    
    return candidates

def save_mock_candidates(candidates: List[Dict[str, Any]], filename: str = "candidates.json"):
    """Save candidates to JSON file"""
    with open(filename, 'w') as f:
        json.dump(candidates, f, indent=2)
    print(f"Generated {len(candidates)} mock candidates and saved to {filename}")

def generate_bias_analysis_summary(candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate summary statistics for bias analysis"""
    total = len(candidates)
    
    # Gender analysis
    gender_stats = {}
    for gender in ['male', 'female']:
        gender_candidates = [c for c in candidates if c['gender'] == gender]
        hired = sum(1 for c in gender_candidates if c['hiring_decision'] == 'hired')
        gender_stats[gender] = {
            'total': len(gender_candidates),
            'hired': hired,
            'hiring_rate': hired / len(gender_candidates) if gender_candidates else 0,
            'avg_final_score': sum(c['final_score'] for c in gender_candidates) / len(gender_candidates) if gender_candidates else 0
        }
    
    # Ethnicity analysis
    ethnicity_stats = {}
    for ethnicity in ['white', 'black', 'hispanic', 'asian', 'other']:
        eth_candidates = [c for c in candidates if c['ethnicity'] == ethnicity]
        hired = sum(1 for c in eth_candidates if c['hiring_decision'] == 'hired')
        if eth_candidates:
            ethnicity_stats[ethnicity] = {
                'total': len(eth_candidates),
                'hired': hired,
                'hiring_rate': hired / len(eth_candidates),
                'avg_final_score': sum(c['final_score'] for c in eth_candidates) / len(eth_candidates)
            }
    
    # Position analysis
    position_stats = {}
    positions = list(set(c['position_applied'] for c in candidates))
    for position in positions:
        pos_candidates = [c for c in candidates if c['position_applied'] == position]
        hired = sum(1 for c in pos_candidates if c['hiring_decision'] == 'hired')
        position_stats[position] = {
            'total': len(pos_candidates),
            'hired': hired,
            'hiring_rate': hired / len(pos_candidates) if pos_candidates else 0
        }
    
    return {
        'total_candidates': total,
        'overall_hiring_rate': sum(1 for c in candidates if c['hiring_decision'] == 'hired') / total,
        'gender_analysis': gender_stats,
        'ethnicity_analysis': ethnicity_stats,
        'position_analysis': position_stats
    }

if __name__ == "__main__":
    # Generate comprehensive mock data
    candidates = generate_comprehensive_mock_candidates(100)
    
    # Save to file
    save_mock_candidates(candidates)
    
    # Generate and print analysis summary
    summary = generate_bias_analysis_summary(candidates)
    print("\nBias Analysis Summary:")
    print(f"Total Candidates: {summary['total_candidates']}")
    print(f"Overall Hiring Rate: {summary['overall_hiring_rate']:.2%}")
    
    print("\nGender Analysis:")
    for gender, stats in summary['gender_analysis'].items():
        print(f"  {gender.title()}: {stats['total']} candidates, {stats['hired']} hired ({stats['hiring_rate']:.2%})")
    
    print("\nEthnicity Analysis:")
    for ethnicity, stats in summary['ethnicity_analysis'].items():
        print(f"  {ethnicity.title()}: {stats['total']} candidates, {stats['hired']} hired ({stats['hiring_rate']:.2%})")
