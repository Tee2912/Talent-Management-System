/**
 * Mock AI Service for Frontend
 * Provides realistic AI responses without requiring backend API
 */

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'query' | 'insight' | 'recommendation' | 'warning';
}

export interface SmartRecommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  action_items: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface AIInsights {
  hiring_velocity: {
    current_rate: string;
    ai_contribution: string;
    trend: string;
  };
  quality_metrics: {
    candidate_match_accuracy: number;
    bias_reduction: string;
    interview_efficiency: string;
  };
  predictive_analytics: {
    next_quarter_hiring_needs: number;
    success_probability_average: number;
    retention_prediction: string;
  };
  recommendations: string[];
  alerts: Array<{
    type: string;
    message: string;
    priority: string;
    action: string;
  }>;
}

class MockAIService {
  private conversationHistory: ChatMessage[] = [];
  
  // Mock candidate data
  private candidates = {
    "1": {
      name: "Sarah Johnson",
      position: "Senior Software Engineer",
      experience: "8 years",
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
      score: 95,
      stage: "Technical Interview",
      resume_summary: "Experienced full-stack developer with strong leadership skills and expertise in modern web technologies.",
      strengths: ["Technical expertise", "Leadership experience", "Problem-solving skills"],
      concerns: ["May be overqualified for some positions", "Salary expectations might be high"]
    },
    "2": {
      name: "Michael Chen",
      position: "Data Scientist",
      experience: "6 years",
      skills: ["Python", "TensorFlow", "SQL", "Tableau", "Spark"],
      score: 92,
      stage: "Final Interview",
      resume_summary: "Data scientist with deep expertise in machine learning and analytics.",
      strengths: ["Strong analytical skills", "ML expertise", "Research background"],
      concerns: ["Limited industry experience", "Prefers research over product work"]
    },
    "3": {
      name: "Emma Rodriguez",
      position: "UX Designer",
      experience: "5 years",
      skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
      score: 88,
      stage: "Portfolio Review",
      resume_summary: "Creative UX designer with a user-centered approach and strong portfolio.",
      strengths: ["Creative problem solving", "User empathy", "Design thinking"],
      concerns: ["Limited technical background", "Portfolio lacks enterprise experience"]
    }
  };

  // Mock response templates
  private responses = {
    greetings: [
      "Hello! I'm your AI Assistant for HireIQ Pro. I can help you with intelligent candidate analysis, bias detection, predictive hiring insights, workflow automation, and candidate conversations. What would you like to explore?",
      "Hi there! I'm here to assist with your hiring needs. I can analyze candidates, detect bias, predict hiring success, and automate workflows. How can I help you today?",
      "Welcome to HireIQ Pro's AI Copilot! I specialize in making hiring decisions smarter, fairer, and more efficient. What hiring challenge can I help you solve?"
    ],
    
    candidateAnalysis: {
      "1": [
        "Based on my analysis of Sarah Johnson:\n\n✅ **Technical Skills**: Strong proficiency in React, TypeScript, Node.js\n✅ **Experience Level**: 8 years of relevant experience\n✅ **Achievement Record**: Demonstrated success in previous roles\n✅ **Cultural Indicators**: Shows alignment with team values\n\n**Recommended next steps:**\n• Schedule technical deep-dive interview\n• Check references for leadership examples\n• Assess project management capabilities",
        
        "Here's my comprehensive assessment of Sarah Johnson:\n\n**Strengths:**\n• Technical expertise\n• Leadership experience\n• Problem-solving skills\n\n**Development Areas:**\n• May be overqualified for some positions\n• Salary expectations might be high\n\n**Overall Recommendation**: Strong candidate - proceed to next interview stage\n\nWould you like me to generate specific interview questions for this candidate?"
      ],
      "2": [
        "Michael Chen Analysis:\n\n✅ **Data Science Expertise**: Deep knowledge in Python, TensorFlow, and ML\n✅ **Analytical Skills**: Strong problem-solving and research background\n✅ **Technical Proficiency**: Excellent with data tools and visualization\n✅ **Growth Potential**: Shows continuous learning mindset\n\n**Recommended actions:**\n• Discuss real-world project applications\n• Assess team collaboration skills\n• Verify industry vs academic experience balance",
        
        "Michael Chen shows excellent technical qualifications:\n\n**Strengths:**\n• Strong analytical skills\n• ML expertise\n• Research background\n\n**Areas to explore:**\n• Limited industry experience\n• Preference for research vs product work\n\n**Recommendation**: Proceed with technical assessment focusing on practical applications"
      ],
      "3": [
        "Emma Rodriguez Portfolio Assessment:\n\n✅ **Design Skills**: Strong proficiency in Figma and design tools\n✅ **User Research**: Good understanding of user-centered design\n✅ **Creative Problem Solving**: Shows innovative design thinking\n✅ **Portfolio Quality**: Well-presented work samples\n\n**Next steps:**\n• Review enterprise-level project experience\n• Assess technical collaboration skills\n• Discuss design system experience",
        
        "Emma Rodriguez demonstrates solid UX capabilities:\n\n**Strengths:**\n• Creative problem solving\n• User empathy\n• Design thinking\n\n**Development opportunities:**\n• Limited technical background\n• Portfolio could use more enterprise examples\n\n**Recommendation**: Strong cultural fit, consider for design challenge"
      ]
    },
    
    biasDetection: [
      "I've analyzed the text for potential bias indicators:\n\n**Bias Assessment: {risk_level}**\n\n{analysis}\n\n**Recommendations:**\n• Use objective, skill-based language\n• Focus on job-relevant qualifications\n• Avoid subjective descriptors\n\n**Revised Language Suggestions:**\n{suggestions}",
      
      "Bias analysis complete:\n\n**Risk Level**: {risk_level}\n**Detected Patterns**: {patterns}\n\n**Improvement Areas:**\n• Remove age-related references\n• Focus on measurable skills\n• Use inclusive language\n\nConfidence: {confidence}%"
    ],
    
    workflowAutomation: [
      "I've successfully initiated the {workflow_type} workflow!\n\n**Workflow Details:**\n• Workflow ID: WF-{workflow_id}\n• Status: Initiated\n• Estimated completion: {duration}\n• AI Enhancement: Active\n\n**Automated Steps:**\n{steps}\n\n**Next Actions:**\n• Monitor progress in dashboard\n• Review results when complete\n• Manual intervention available if needed\n\nI'll notify you when the workflow completes!",
      
      "Workflow automation setup complete:\n\n**Process**: {workflow_type}\n**ID**: WF-{workflow_id}\n**Status**: Running\n**ETA**: {duration}\n\n**Key Features:**\n• AI-powered analysis\n• Automated notifications\n• Progress tracking\n• Quality checks\n\nYou can monitor progress in the workflow dashboard."
    ],
    
    bestPractices: [
      "Here are key best practices for bias-free hiring:\n\n1. **Structured Interviews**: Use standardized questions for all candidates\n2. **Diverse Interview Panels**: Include people from different backgrounds\n3. **Objective Criteria**: Focus on skills and experience, not cultural fit\n4. **Blind Resume Reviews**: Remove identifying information initially\n5. **Data-Driven Decisions**: Use scoring rubrics and metrics\n\nWould you like me to elaborate on any of these practices?",
      
      "For effective hiring, I recommend:\n\n• **Clear Job Requirements**: Define specific skills and qualifications\n• **Consistent Process**: Same steps for every candidate\n• **Reference Checks**: Verify past performance\n• **Team Involvement**: Get input from future colleagues\n• **Candidate Experience**: Ensure positive experience regardless of outcome\n\nWhat specific aspect would you like to improve?"
    ],
    
    jobMatching: [
      "For this {job_title} position, I've identified key matching criteria:\n\n**Must-Have Skills:**\n• {skill_1} - Essential for daily tasks\n• {skill_2} - Core technology requirement\n• {skill_3} - Critical for team integration\n\n**Ideal Candidate Profile:**\n• {min_experience}+ years experience\n• Strong {domain} background\n• Excellent communication skills\n• Growth mindset and adaptability\n\n**Top Candidate Matches:**\n1. Sarah Johnson (95% match) - Exceeds all requirements\n2. Michael Chen (92% match) - Strong technical fit\n3. Emma Rodriguez (88% match) - Great cultural alignment\n\nWould you like detailed analysis of any specific candidate?"
    ]
  };

  // Generate realistic delay for AI responses
  private async simulateThinking(minMs: number = 1000, maxMs: number = 3000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Generate unique IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Analyze user message and determine response type
  private analyzeMessage(message: string): { type: string; context: any } {
    const messageLower = message.toLowerCase();
    
    // Greeting detection
    if (/\b(hello|hi|hey|start|help)\b/.test(messageLower)) {
      return { type: 'greeting', context: {} };
    }
    
    // Candidate analysis detection
    if (/\b(analyze|assessment|candidate|sarah|michael|emma)\b/.test(messageLower)) {
      let candidateId = "1"; // Default to Sarah
      if (/michael|chen/i.test(message)) candidateId = "2";
      if (/emma|rodriguez/i.test(message)) candidateId = "3";
      
      return { 
        type: 'candidate_analysis', 
        context: { candidateId, query: message }
      };
    }
    
    // Bias detection
    if (/\b(bias|fair|discrimination|check.*text|young|energetic|cultural fit)\b/.test(messageLower)) {
      return { 
        type: 'bias_detection', 
        context: { text: message }
      };
    }
    
    // Workflow automation
    if (/\b(automate|workflow|schedule|screening|reference)\b/.test(messageLower)) {
      let workflowType = "candidate_screening";
      if (/interview|schedule/i.test(message)) workflowType = "interview_scheduling";
      if (/reference/i.test(message)) workflowType = "reference_check";
      
      return { 
        type: 'workflow_automation', 
        context: { workflowType }
      };
    }
    
    // Job matching
    if (/\b(match|job|position|role|engineer|scientist|designer)\b/.test(messageLower)) {
      return { 
        type: 'job_matching', 
        context: { query: message }
      };
    }
    
    // Best practices
    if (/\b(best practice|recommend|how to|guide|tip)\b/.test(messageLower)) {
      return { 
        type: 'best_practices', 
        context: { query: message }
      };
    }
    
    // Default to general response
    return { 
      type: 'general', 
      context: { query: message }
    };
  }

  // Generate responses based on message type
  private generateResponse(type: string, context: any): { text: string; recommendations: SmartRecommendation[] } {
    switch (type) {
      case 'greeting':
        return {
          text: this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)],
          recommendations: [
            {
              type: "getting_started",
              title: "Explore AI Capabilities",
              description: "Try asking about candidate analysis, bias detection, or workflow automation",
              confidence: 0.9,
              action_items: ["Ask about a specific candidate", "Test bias detection", "Explore automation options"],
              priority: "medium"
            }
          ]
        };
        
      case 'candidate_analysis':
        const candidate = this.candidates[context.candidateId as keyof typeof this.candidates];
        const responses = this.responses.candidateAnalysis[context.candidateId as keyof typeof this.responses.candidateAnalysis];
        const responseText = responses[Math.floor(Math.random() * responses.length)];
        
        return {
          text: responseText,
          recommendations: [
            {
              type: "interview",
              title: "Schedule Next Interview",
              description: `Move ${candidate.name} to the next stage of the interview process`,
              confidence: 0.92,
              action_items: ["Prepare technical questions", "Schedule interview", "Brief interview panel"],
              priority: "high"
            },
            {
              type: "reference_check",
              title: "Verify Background",
              description: "Contact previous employers for reference verification",
              confidence: 0.85,
              action_items: ["Collect references", "Schedule calls", "Document findings"],
              priority: "medium"
            }
          ]
        };
        
      case 'bias_detection':
        const biasIndicators = ['young', 'energetic', 'cultural fit', 'team player'];
        const foundBias = biasIndicators.some(indicator => 
          context.text.toLowerCase().includes(indicator)
        );
        
        const riskLevel = foundBias ? "High" : "Low";
        const analysis = foundBias ? 
          "⚠️ Multiple bias indicators detected. Immediate review recommended." :
          "✅ No significant bias indicators detected. Text appears objective.";
        
        return {
          text: this.responses.biasDetection[0]
            .replace('{risk_level}', riskLevel)
            .replace('{analysis}', analysis)
            .replace('{suggestions}', "Consider rephrasing to focus on specific achievements and measurable skills."),
          recommendations: [
            {
              type: "bias_prevention",
              title: "Language Review",
              description: "Review and update job descriptions for inclusive language",
              confidence: 0.88,
              action_items: ["Audit job descriptions", "Update language guidelines", "Train hiring team"],
              priority: foundBias ? "high" : "low"
            }
          ]
        };
        
      case 'workflow_automation':
        const workflowId = Math.floor(Math.random() * 9000) + 1000;
        const durations = {
          candidate_screening: "15-30 minutes",
          interview_scheduling: "5-15 minutes",
          reference_check: "24-48 hours"
        };
        
        const steps = {
          candidate_screening: "• Resume analysis\n• Skill extraction\n• Bias check\n• Initial scoring\n• Recruiter notification",
          interview_scheduling: "• Availability check\n• Calendar integration\n• Invite sending\n• Confirmation tracking",
          reference_check: "• Contact extraction\n• Email automation\n• Response tracking\n• Report generation"
        };
        
        return {
          text: this.responses.workflowAutomation[0]
            .replace('{workflow_type}', context.workflowType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
            .replace('{workflow_id}', workflowId.toString())
            .replace('{duration}', durations[context.workflowType as keyof typeof durations])
            .replace('{steps}', steps[context.workflowType as keyof typeof steps]),
          recommendations: [
            {
              type: "automation",
              title: "Monitor Workflow",
              description: "Track the progress and results of the automated workflow",
              confidence: 0.95,
              action_items: ["Check dashboard", "Review results", "Optimize settings"],
              priority: "medium"
            }
          ]
        };
        
      case 'job_matching':
        return {
          text: this.responses.jobMatching[0]
            .replace('{job_title}', "Senior Software Engineer")
            .replace('{skill_1}', "Python")
            .replace('{skill_2}', "React")
            .replace('{skill_3}', "AWS")
            .replace('{min_experience}', "5")
            .replace('{domain}', "web development"),
          recommendations: [
            {
              type: "candidate_selection",
              title: "Review Top Matches",
              description: "Schedule interviews with the highest-matching candidates",
              confidence: 0.91,
              action_items: ["Contact top candidates", "Schedule screenings", "Prepare assessments"],
              priority: "high"
            }
          ]
        };
        
      case 'best_practices':
        return {
          text: this.responses.bestPractices[Math.floor(Math.random() * this.responses.bestPractices.length)],
          recommendations: [
            {
              type: "process_improvement",
              title: "Implement Best Practices",
              description: "Gradually implement these practices in your hiring process",
              confidence: 0.87,
              action_items: ["Create implementation plan", "Train team", "Monitor results"],
              priority: "medium"
            }
          ]
        };
        
      default:
        return {
          text: `I understand you're asking about: "${context.query}"\n\nI can help with:\n• Candidate analysis and recommendations\n• Bias detection and fair hiring practices\n• Interview question generation\n• Hiring success predictions\n• Workflow automation setup\n\nCould you be more specific about what aspect you'd like help with?`,
          recommendations: [
            {
              type: "clarification",
              title: "Specify Your Needs",
              description: "Help me understand what specific assistance you need",
              confidence: 0.75,
              action_items: ["Ask about specific candidates", "Request bias analysis", "Explore automation"],
              priority: "low"
            }
          ]
        };
    }
  }

  // Main chat method
  async sendMessage(message: string, context?: string): Promise<{
    response: ChatMessage;
    recommendations: SmartRecommendation[];
  }> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'query'
    };
    
    this.conversationHistory.push(userMessage);
    
    // Simulate AI thinking time
    await this.simulateThinking();
    
    // Analyze message and generate response
    const analysis = this.analyzeMessage(message);
    const { text, recommendations } = this.generateResponse(analysis.type, analysis.context);
    
    // Create AI response
    const aiResponse: ChatMessage = {
      id: this.generateId(),
      text,
      sender: 'ai',
      timestamp: new Date(),
      type: analysis.type === 'bias_detection' ? 'warning' : 
           analysis.type === 'candidate_analysis' ? 'insight' : 'recommendation'
    };
    
    this.conversationHistory.push(aiResponse);
    
    return {
      response: aiResponse,
      recommendations
    };
  }

  // Get mock AI insights for dashboard
  async getAIInsights(): Promise<AIInsights> {
    // Simulate API delay
    await this.simulateThinking(500, 1500);
    
    return {
      hiring_velocity: {
        current_rate: "2.3x faster",
        ai_contribution: "65% automation",
        trend: "increasing"
      },
      quality_metrics: {
        candidate_match_accuracy: 94.5,
        bias_reduction: "78% improvement",
        interview_efficiency: "45% time saved"
      },
      predictive_analytics: {
        next_quarter_hiring_needs: 12,
        success_probability_average: 87.2,
        retention_prediction: "92% likely to stay 2+ years"
      },
      recommendations: [
        "Focus on senior-level positions for Q4",
        "Expand technical screening for data science roles",
        "Implement bias training for interview panels",
        "Automate reference checks for faster processing"
      ],
      alerts: [
        {
          type: "success",
          message: "Sarah Johnson analysis complete - 95% match",
          priority: "high",
          action: "Schedule technical interview"
        },
        {
          type: "warning",
          message: "Potential bias detected in 3 job descriptions",
          priority: "medium",
          action: "Review and update language"
        },
        {
          type: "info",
          message: "Workflow automation saved 12 hours this week",
          priority: "low",
          action: "Review efficiency metrics"
        }
      ]
    };
  }
}

// Export singleton instance
export const mockAIService = new MockAIService();
