"""
Mock AI Responses for AI Copilot
Provides realistic conversation flows without requiring API keys
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import random

class MockAIResponses:
    """Mock AI response generator for demonstration purposes"""
    
    def __init__(self):
        self.conversation_history = []
        self.mock_candidates = {
            "1": {
                "name": "Sarah Johnson",
                "position": "Senior Software Engineer",
                "experience": "8 years",
                "skills": ["React", "TypeScript", "Node.js", "Python", "AWS"],
                "score": 95,
                "stage": "Technical Interview",
                "resume_summary": "Experienced full-stack developer with strong leadership skills and expertise in modern web technologies.",
                "strengths": ["Technical expertise", "Leadership experience", "Problem-solving skills"],
                "concerns": ["May be overqualified for some positions", "Salary expectations might be high"]
            },
            "2": {
                "name": "Michael Chen",
                "position": "Data Scientist",
                "experience": "6 years", 
                "skills": ["Python", "TensorFlow", "SQL", "Tableau", "Spark"],
                "score": 92,
                "stage": "Final Interview",
                "resume_summary": "Data scientist with deep expertise in machine learning and analytics.",
                "strengths": ["Strong analytical skills", "ML expertise", "Research background"],
                "concerns": ["Limited industry experience", "Prefers research over product work"]
            },
            "3": {
                "name": "Emma Rodriguez",
                "position": "UX Designer",
                "experience": "5 years",
                "skills": ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
                "score": 88,
                "stage": "Portfolio Review",
                "resume_summary": "Creative UX designer with a user-centered approach and strong portfolio.",
                "strengths": ["Creative problem solving", "User empathy", "Design thinking"],
                "concerns": ["Limited technical background", "Portfolio lacks enterprise experience"]
            }
        }
        
        self.mock_responses = {
            "general": {
                "greetings": [
                    "Hello! I'm your AI Assistant for HireIQ Pro. I can help you with intelligent candidate analysis, bias detection, predictive hiring insights, workflow automation, and candidate conversations. What would you like to explore?",
                    "Hi there! I'm here to assist with your hiring needs. I can analyze candidates, detect bias, predict hiring success, and automate workflows. How can I help you today?",
                    "Welcome to HireIQ Pro's AI Copilot! I specialize in making hiring decisions smarter, fairer, and more efficient. What hiring challenge can I help you solve?"
                ],
                "hiring_best_practices": [
                    "Here are some key best practices for bias-free hiring:\n\n1. **Structured Interviews**: Use standardized questions for all candidates\n2. **Diverse Interview Panels**: Include people from different backgrounds\n3. **Objective Criteria**: Focus on skills and experience, not cultural fit\n4. **Blind Resume Reviews**: Remove identifying information initially\n5. **Data-Driven Decisions**: Use scoring rubrics and metrics\n\nWould you like me to elaborate on any of these practices?",
                    "For effective hiring, I recommend:\n\n• **Clear Job Requirements**: Define specific skills and qualifications\n• **Consistent Process**: Same steps for every candidate\n• **Reference Checks**: Verify past performance\n• **Team Involvement**: Get input from future colleagues\n• **Candidate Experience**: Ensure positive experience regardless of outcome\n\nWhat specific aspect of your hiring process would you like to improve?"
                ],
                "bias_detection": [
                    "I can help identify potential bias in your hiring process. Common bias types include:\n\n🔍 **Unconscious Bias**: Implicit preferences based on demographics\n⚖️ **Confirmation Bias**: Seeking information that confirms initial impressions\n🎯 **Halo Effect**: One positive trait influencing overall perception\n📊 **Statistical Bias**: Unequal outcomes across demographic groups\n\nWould you like me to analyze specific job descriptions, interview notes, or candidate evaluations for bias?"
                ],
                "workflow_automation": [
                    "I can help automate several hiring workflows:\n\n🤖 **Candidate Screening**: Automated resume analysis and initial scoring\n📅 **Interview Scheduling**: Smart scheduling based on availability\n📞 **Reference Checks**: Automated reference request and tracking\n📋 **Onboarding**: New hire setup and welcome processes\n\nWhich workflow would you like to set up first? I can guide you through the automation process."
                ]
            },
            "candidate_analysis": {
                "strengths_analysis": [
                    "Based on my analysis of {candidate_name}, here are the key strengths:\n\n✅ **Technical Skills**: Strong proficiency in {primary_skills}\n✅ **Experience Level**: {experience} of relevant experience\n✅ **Achievement Record**: Demonstrated success in previous roles\n✅ **Cultural Indicators**: Shows alignment with team values\n\nRecommended next steps:\n• Schedule technical deep-dive interview\n• Check references for leadership examples\n• Assess project management capabilities",
                    
                    "Here's my comprehensive assessment of {candidate_name}:\n\n**Strengths:**\n• {strength_1}\n• {strength_2}\n• {strength_3}\n\n**Development Areas:**\n• {concern_1}\n• {concern_2}\n\n**Overall Recommendation**: {recommendation}\n\nWould you like me to generate specific interview questions for this candidate?"
                ],
                "interview_questions": [
                    "Here are AI-generated interview questions for {candidate_name}:\n\n**Technical Questions:**\n1. Can you walk me through your experience with {primary_skill}?\n2. Describe a challenging technical problem you solved recently\n3. How do you stay current with {technology_stack} developments?\n\n**Behavioral Questions:**\n1. Tell me about a time you had to learn a new technology quickly\n2. Describe your approach to code reviews and team collaboration\n3. How do you handle competing priorities and tight deadlines?\n\n**Role-Specific Questions:**\n1. What interests you most about this {position} role?\n2. How would you approach {specific_challenge} in this position?\n\nEstimated interview duration: 45-60 minutes"
                ]
            },
            "job_matching": [
                "For this {job_title} position, I've identified key matching criteria:\n\n**Must-Have Skills:**\n• {skill_1} - Essential for daily tasks\n• {skill_2} - Core technology requirement\n• {skill_3} - Critical for team integration\n\n**Ideal Candidate Profile:**\n• {min_experience}+ years experience\n• Strong {domain} background\n• Excellent communication skills\n• Growth mindset and adaptability\n\n**Top Candidate Matches:**\n1. Sarah Johnson (95% match) - Exceeds all requirements\n2. Michael Chen (92% match) - Strong technical fit\n3. Emma Rodriguez (88% match) - Great cultural alignment\n\nWould you like detailed analysis of any specific candidate?"
            ],
            "bias_detection_analysis": [
                "I've analyzed the text for potential bias indicators:\n\n**Bias Assessment: {bias_level}**\n\n{bias_analysis}\n\n**Recommendations:**\n• {recommendation_1}\n• {recommendation_2}\n• {recommendation_3}\n\n**Revised Language Suggestions:**\n{revised_text}\n\nBias confidence score: {confidence}%"
            ],
            "workflow_responses": [
                "I've successfully triggered the {workflow_type} workflow!\n\n**Workflow Details:**\n• Workflow ID: {workflow_id}\n• Status: Initiated\n• Estimated completion: {duration}\n• AI Enhancement: Active\n\n**Automated Steps:**\n{steps}\n\n**Next Actions:**\n• Monitor progress in workflow dashboard\n• Review results when complete\n• Manual intervention available if needed\n\nI'll notify you when the workflow completes!"
            ]
        }

    def get_general_response(self, query: str, context: str = "general") -> Dict[str, Any]:
        """Generate general AI responses"""
        query_lower = query.lower()
        
        # Greeting responses
        if any(word in query_lower for word in ['hello', 'hi', 'hey', 'start']):
            response = random.choice(self.mock_responses["general"]["greetings"])
            
        # Bias-related queries
        elif any(word in query_lower for word in ['bias', 'fair', 'discrimination', 'diversity']):
            response = random.choice(self.mock_responses["general"]["bias_detection"])
            
        # Best practices queries  
        elif any(word in query_lower for word in ['best practice', 'recommend', 'how to', 'guide']):
            response = random.choice(self.mock_responses["general"]["hiring_best_practices"])
            
        # Workflow automation queries
        elif any(word in query_lower for word in ['automate', 'workflow', 'process', 'schedule']):
            response = random.choice(self.mock_responses["general"]["workflow_automation"])
            
        # Interview-related queries
        elif any(word in query_lower for word in ['interview', 'question', 'assess']):
            response = "I can help generate smart interview questions! Here are some approaches:\n\n🎯 **Behavioral Questions**: Assess past performance and decision-making\n🔧 **Technical Questions**: Evaluate specific skills and knowledge\n🤝 **Cultural Questions**: Understand values and work style\n📈 **Growth Questions**: Assess learning ability and career goals\n\nWould you like me to generate questions for a specific candidate or role?"
            
        # Prediction queries
        elif any(word in query_lower for word in ['predict', 'success', 'likely', 'probability']):
            response = "I can help predict hiring success! My analysis considers:\n\n📊 **Historical Data**: Past hiring outcomes and performance\n🎯 **Skill Alignment**: Match between candidate skills and job requirements\n🧠 **Behavioral Indicators**: Interview responses and assessment results\n📈 **Growth Potential**: Learning ability and career trajectory\n\nFor accurate predictions, I'll need candidate data and job requirements. Would you like me to analyze a specific candidate?"
            
        else:
            # Default helpful response
            response = f"I understand you're asking about: '{query}'\n\nI can help with:\n• Candidate analysis and recommendations\n• Bias detection and fair hiring practices\n• Interview question generation\n• Hiring success predictions\n• Workflow automation setup\n\nCould you be more specific about what aspect you'd like help with?"

        return {
            "response": response,
            "confidence": 0.85,
            "source": "AI Mock Assistant",
            "context_used": context,
            "recommendations": self._generate_general_recommendations(query_lower)
        }

    def get_candidate_analysis(self, candidate_id: str, query: str) -> Dict[str, Any]:
        """Generate candidate analysis responses"""
        candidate = self.mock_candidates.get(candidate_id)
        if not candidate:
            return {
                "response": "I couldn't find information for that candidate. Please check the candidate ID and try again.",
                "recommendations": []
            }

        query_lower = query.lower()
        
        if any(word in query_lower for word in ['strength', 'positive', 'good', 'skill']):
            response = self.mock_responses["candidate_analysis"]["strengths_analysis"][0].format(
                candidate_name=candidate["name"],
                primary_skills=", ".join(candidate["skills"][:3]),
                experience=candidate["experience"]
            )
        elif any(word in query_lower for word in ['interview', 'question']):
            response = self.mock_responses["candidate_analysis"]["interview_questions"][0].format(
                candidate_name=candidate["name"],
                primary_skill=candidate["skills"][0],
                technology_stack=", ".join(candidate["skills"][:2]),
                position=candidate["position"]
            )
        else:
            # Comprehensive analysis
            response = self.mock_responses["candidate_analysis"]["strengths_analysis"][1].format(
                candidate_name=candidate["name"],
                strength_1=candidate["strengths"][0],
                strength_2=candidate["strengths"][1], 
                strength_3=candidate["strengths"][2],
                concern_1=candidate["concerns"][0],
                concern_2=candidate["concerns"][1] if len(candidate["concerns"]) > 1 else "No major concerns identified",
                recommendation="Strong candidate - proceed to next interview stage"
            )

        return {
            "response": response,
            "candidate_analysis": candidate,
            "ai_insights": {
                "technical_score": candidate["score"],
                "overall_rating": candidate["score"],
                "experience_level": "Senior" if "Senior" in candidate["position"] else "Mid-level",
                "skill_coverage": len(candidate["skills"])
            },
            "recommendations": self._generate_candidate_recommendations(candidate)
        }

    def get_job_matching_response(self, query: str, job_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate job matching responses"""
        
        # Mock job data
        job_data = {
            "title": "Senior Software Engineer",
            "required_skills": ["Python", "React", "AWS", "Leadership"],
            "min_experience": "5",
            "domain": "web development"
        }
        
        response = self.mock_responses["job_matching"][0].format(
            job_title=job_data["title"],
            skill_1=job_data["required_skills"][0],
            skill_2=job_data["required_skills"][1], 
            skill_3=job_data["required_skills"][2],
            min_experience=job_data["min_experience"],
            domain=job_data["domain"]
        )

        return {
            "response": response,
            "job_analysis": job_data,
            "matching_insights": {
                "priority_skills": job_data["required_skills"][:3],
                "experience_weight": 0.4,
                "skills_weight": 0.6,
                "estimated_candidate_pool": "15-25 qualified candidates"
            },
            "recommendations": [
                "Focus screening on Python and React experience",
                "Assess leadership potential through behavioral questions",
                "Consider candidates with 4+ years if other skills are strong"
            ]
        }

    def get_bias_analysis(self, text: str, context: str = "evaluation") -> Dict[str, Any]:
        """Generate bias detection responses"""
        
        # Simple bias detection logic
        bias_indicators = {
            'age_bias': ['young', 'old', 'mature', 'fresh', 'experienced'],
            'gender_bias': ['aggressive', 'emotional', 'nurturing', 'assertive'],
            'cultural_bias': ['cultural fit', 'team fit', 'communication style'],
            'appearance_bias': ['professional appearance', 'well-groomed']
        }
        
        text_lower = text.lower()
        detected_bias = []
        bias_phrases = []
        
        for bias_type, indicators in bias_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    detected_bias.append(bias_type)
                    bias_phrases.append(indicator)
        
        bias_level = "High" if len(detected_bias) > 2 else "Medium" if len(detected_bias) > 0 else "Low"
        
        if bias_level == "High":
            bias_analysis = "⚠️ Multiple bias indicators detected. Immediate review recommended."
        elif bias_level == "Medium":
            bias_analysis = "⚡ Some potential bias indicators found. Consider revision."
        else:
            bias_analysis = "✅ No significant bias indicators detected. Text appears objective."
            
        response = self.mock_responses["bias_detection_analysis"][0].format(
            bias_level=bias_level,
            bias_analysis=bias_analysis,
            recommendation_1="Use objective, skill-based language",
            recommendation_2="Focus on job-relevant qualifications",
            recommendation_3="Avoid subjective descriptors",
            revised_text="Consider rephrasing to focus on specific achievements and measurable skills.",
            confidence=random.randint(85, 95)
        )

        return {
            "bias_detected": len(detected_bias) > 0,
            "risk_level": bias_level.lower(),
            "overall_bias_score": len(detected_bias) * 0.2,
            "confidence": 0.85,
            "detected_patterns": {bias_type: bias_phrases for bias_type in detected_bias},
            "response": response,
            "recommendations": [
                "Review language for objectivity",
                "Focus on measurable qualifications",
                "Consider diverse perspectives in evaluation"
            ]
        }

    def get_workflow_response(self, workflow_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate workflow automation responses"""
        
        workflow_details = {
            "candidate_screening": {
                "duration": "15-30 minutes",
                "steps": ["Resume analysis", "Skill extraction", "Bias check", "Initial scoring", "Recruiter notification"]
            },
            "interview_scheduling": {
                "duration": "5-15 minutes", 
                "steps": ["Availability check", "Calendar integration", "Invite sending", "Confirmation tracking"]
            },
            "reference_check": {
                "duration": "24-48 hours",
                "steps": ["Contact extraction", "Email automation", "Response tracking", "Report generation"]
            }
        }
        
        workflow_info = workflow_details.get(workflow_type, {
            "duration": "30-60 minutes",
            "steps": ["Process initiation", "Data processing", "Analysis", "Results compilation"]
        })
        
        workflow_id = f"WF-{workflow_type.upper()}-{random.randint(1000, 9999)}"
        
        response = self.mock_responses["workflow_responses"][0].format(
            workflow_type=workflow_type.replace('_', ' ').title(),
            workflow_id=workflow_id,
            duration=workflow_info["duration"],
            steps="\n".join([f"• {step}" for step in workflow_info["steps"]])
        )

        return {
            "success": True,
            "workflow_id": workflow_id,
            "workflow_type": workflow_type,
            "status": "initiated",
            "response": response,
            "estimated_completion": workflow_info["duration"],
            "ai_enhanced": True,
            "mock_mode": True
        }

    def _generate_general_recommendations(self, query: str) -> List[Dict[str, Any]]:
        """Generate contextual recommendations"""
        base_recommendations = [
            {
                "type": "best_practice",
                "title": "Structured Interview Process",
                "description": "Implement consistent interview questions for fair evaluation",
                "confidence": 0.9,
                "action_items": ["Create question templates", "Train interviewers", "Document responses"],
                "priority": "medium"
            },
            {
                "type": "bias_prevention",
                "title": "Bias Awareness Training",
                "description": "Regular training on unconscious bias recognition",
                "confidence": 0.85,
                "action_items": ["Schedule training sessions", "Review hiring data", "Update processes"],
                "priority": "high"
            }
        ]
        
        if 'automate' in query:
            base_recommendations.append({
                "type": "automation",
                "title": "Workflow Automation Setup",
                "description": "Automate repetitive hiring tasks for efficiency",
                "confidence": 0.88,
                "action_items": ["Identify automation opportunities", "Configure workflows", "Monitor results"],
                "priority": "medium"
            })
            
        return base_recommendations

    def _generate_candidate_recommendations(self, candidate: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate candidate-specific recommendations"""
        return [
            {
                "type": "interview",
                "title": "Technical Deep Dive",
                "description": f"Assess {candidate['name']}'s expertise in {candidate['skills'][0]}",
                "confidence": 0.92,
                "action_items": [
                    "Prepare technical scenarios",
                    "Review portfolio/projects", 
                    "Assess problem-solving approach"
                ],
                "priority": "high"
            },
            {
                "type": "reference",
                "title": "Leadership Verification",
                "description": "Verify leadership experience and team collaboration",
                "confidence": 0.88,
                "action_items": [
                    "Contact previous managers",
                    "Ask about team leadership examples",
                    "Verify project outcomes"
                ],
                "priority": "medium"
            }
        ]

# Global mock instance
mock_ai = MockAIResponses()
