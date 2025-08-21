"""
Sample data generator for the Fair Hiring System
Creates realistic candidate data for testing bias detection algorithms
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Sample data pools
FIRST_NAMES = {
    'male': ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
    'female': ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
    'non_binary': ['Alex', 'Jordan', 'Riley', 'Casey', 'Taylor', 'Morgan', 'Avery', 'Quinn', 'Blake', 'Sage']
}

LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
              'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

POSITIONS = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer',
    'Business Analyst', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Finance Analyst'
]

EDUCATION_LEVELS = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Degree']

SKILLS_BY_POSITION = {
    'Software Engineer': ['Python', 'JavaScript', 'Java', 'React', 'Node.js', 'SQL', 'Git', 'Docker'],
    'Data Scientist': ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'Tableau', 'TensorFlow', 'Pandas'],
    'Product Manager': ['Product Strategy', 'Agile', 'Analytics', 'Leadership', 'Market Research', 'SQL'],
    'UX Designer': ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Adobe Creative Suite'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Monitoring'],
    'Business Analyst': ['SQL', 'Excel', 'Analytics', 'Requirements Gathering', 'Process Improvement'],
    'Marketing Manager': ['Digital Marketing', 'Analytics', 'Content Strategy', 'SEO', 'Social Media'],
    'Sales Representative': ['Sales', 'CRM', 'Lead Generation', 'Customer Relations', 'Negotiation'],
    'HR Specialist': ['HR Management', 'Recruiting', 'Employee Relations', 'HRIS', 'Compliance'],
    'Finance Analyst': ['Financial Analysis', 'Excel', 'Modeling', 'Accounting', 'SQL', 'Tableau']
}

ETHNICITIES = ['white', 'black', 'hispanic', 'asian', 'native_american', 'mixed', 'other']
GENDERS = ['male', 'female', 'non_binary']

def generate_candidate_data(num_candidates: int = 50) -> List[Dict[str, Any]]:
    """Generate realistic candidate data with some bias patterns for testing"""
    candidates = []
    
    for i in range(1, num_candidates + 1):
        # Randomly select demographics
        gender = random.choice(GENDERS)
        ethnicity = random.choice(ETHNICITIES)
        age = random.randint(22, 55)
        
        # Select position and related skills
        position = random.choice(POSITIONS)
        skills = random.sample(SKILLS_BY_POSITION[position], k=random.randint(3, 6))
        
        # Generate names based on gender
        if gender in FIRST_NAMES:
            first_name = random.choice(FIRST_NAMES[gender])
        else:
            first_name = random.choice(FIRST_NAMES['non_binary'])
        
        last_name = random.choice(LAST_NAMES)
        
        # Generate scores with some bias patterns for testing
        base_resume_score = random.uniform(60, 95)
        base_interview_score = random.uniform(60, 95)
        base_technical_score = random.uniform(60, 95)
        
        # Introduce subtle bias patterns for testing (this is for demonstration only)
        bias_factor = 1.0
        if ethnicity in ['black', 'hispanic'] and random.random() < 0.3:
            bias_factor = 0.95  # Slight systematic bias for testing
        elif gender == 'female' and position in ['Software Engineer', 'DevOps Engineer'] and random.random() < 0.2:
            bias_factor = 0.93  # Gender bias in tech roles for testing
        
        resume_score = min(100, base_resume_score * bias_factor)
        interview_score = min(100, base_interview_score * bias_factor)
        technical_score = min(100, base_technical_score * bias_factor)
        
        # Calculate final score (weighted average)
        final_score = (resume_score * 0.3 + interview_score * 0.4 + technical_score * 0.3)
        
        # Make hiring decision based on score with some randomness
        if final_score >= 80:
            hiring_decision = 'hired' if random.random() < 0.8 else 'rejected'
        elif final_score >= 70:
            hiring_decision = random.choice(['hired', 'rejected', 'on_hold'])
        else:
            hiring_decision = 'rejected' if random.random() < 0.9 else 'on_hold'
        
        # Generate bias score (higher scores indicate more bias)
        bias_score = random.uniform(0.1, 0.8) if hiring_decision == 'rejected' and bias_factor < 1.0 else random.uniform(0.0, 0.3)
        
        # Create candidate record
        candidate = {
            "id": i,
            "first_name": first_name,
            "last_name": last_name,
            "email": f"{first_name.lower()}.{last_name.lower()}@email.com",
            "phone": f"+1-555-{random.randint(1000, 9999)}",
            "position_applied": position,
            "experience_years": random.randint(1, 15),
            "education_level": random.choice(EDUCATION_LEVELS),
            "skills": skills,
            "gender": gender,
            "ethnicity": ethnicity,
            "age": age,
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
            "updated_at": None,
            "is_active": True,
            "resume_score": round(resume_score, 1),
            "interview_score": round(interview_score, 1),
            "technical_score": round(technical_score, 1),
            "final_score": round(final_score, 1),
            "hiring_decision": hiring_decision,
            "bias_score": round(bias_score, 2),
            "fairness_metrics": None
        }
        
        candidates.append(candidate)
    
    return candidates

def main():
    """Generate and save sample data"""
    print("Generating sample candidate data...")
    
    # Generate 100 candidates
    candidates = generate_candidate_data(100)
    
    # Save to JSON file
    with open('candidates_sample.json', 'w') as f:
        json.dump(candidates, f, indent=2)
    
    print(f"Generated {len(candidates)} candidate records")
    print("Data saved to candidates_sample.json")
    
    # Print some statistics
    print("\nData Statistics:")
    print(f"Total candidates: {len(candidates)}")
    
    # Gender distribution
    gender_counts = {}
    for candidate in candidates:
        gender = candidate['gender']
        gender_counts[gender] = gender_counts.get(gender, 0) + 1
    print(f"Gender distribution: {gender_counts}")
    
    # Ethnicity distribution  
    ethnicity_counts = {}
    for candidate in candidates:
        ethnicity = candidate['ethnicity']
        ethnicity_counts[ethnicity] = ethnicity_counts.get(ethnicity, 0) + 1
    print(f"Ethnicity distribution: {ethnicity_counts}")
    
    # Hiring decisions
    decision_counts = {}
    for candidate in candidates:
        decision = candidate['hiring_decision']
        decision_counts[decision] = decision_counts.get(decision, 0) + 1
    print(f"Hiring decisions: {decision_counts}")
    
    # Average scores by gender
    print("\nAverage scores by gender:")
    for gender in GENDERS:
        gender_candidates = [c for c in candidates if c['gender'] == gender]
        if gender_candidates:
            avg_score = sum(c['final_score'] for c in gender_candidates) / len(gender_candidates)
            print(f"{gender}: {avg_score:.1f}")

if __name__ == "__main__":
    main()
