import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  Balance as BiasIcon,
  AutoAwesome as AutoIcon,
  TrendingUp as TrendIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';

interface ConversationExamplesProps {
  open: boolean;
  onClose: () => void;
  onSelectExample: (message: string) => void;
}

interface ExampleConversation {
  category: string;
  icon: React.ReactElement;
  examples: Array<{
    user: string;
    ai: string;
    description: string;
    features: string[];
  }>;
}

const conversationExamples: ExampleConversation[] = [
  {
    category: "Candidate Analysis",
    icon: <PersonIcon />,
    examples: [
      {
        user: "Can you analyze Sarah Johnson for me?",
        ai: "Based on my analysis of Sarah Johnson:\n\n✅ Technical Skills: Strong proficiency in React, TypeScript, Node.js\n✅ Experience Level: 8 years of relevant experience\n✅ Achievement Record: Demonstrated success in previous roles\n✅ Cultural Indicators: Shows alignment with team values",
        description: "Comprehensive candidate evaluation with technical and soft skill assessment",
        features: ["Resume Analysis", "Skill Assessment", "Cultural Fit"]
      },
      {
        user: "What are Michael Chen's key strengths?",
        ai: "Michael Chen shows excellent qualifications:\n\n**Strengths:**\n• Strong analytical skills\n• ML expertise\n• Research background\n\n**Recommendation**: Proceed with technical assessment focusing on practical applications",
        description: "Detailed strength analysis with actionable recommendations",
        features: ["Strength Analysis", "Recommendations", "Interview Guidance"]
      }
    ]
  },
  {
    category: "Bias Detection",
    icon: <BiasIcon />,
    examples: [
      {
        user: "Check this for bias: 'Looking for a young, energetic team player'",
        ai: "**Bias Assessment: High**\n\n⚠️ Multiple bias indicators detected. Immediate review recommended.\n\n**Detected Issues:**\n• 'Young' - Age discrimination risk\n• 'Team player' - Subjective cultural bias",
        description: "Real-time bias detection with specific issue identification",
        features: ["Language Analysis", "Risk Assessment", "Compliance Check"]
      },
      {
        user: "How can I make my hiring process more fair?",
        ai: "Here are key best practices for bias-free hiring:\n\n1. **Structured Interviews**: Use standardized questions\n2. **Diverse Panels**: Include different backgrounds\n3. **Objective Criteria**: Focus on skills and experience",
        description: "Best practices guidance for inclusive hiring",
        features: ["Best Practices", "Process Improvement", "Training"]
      }
    ]
  },
  {
    category: "Workflow Automation",
    icon: <AutoIcon />,
    examples: [
      {
        user: "Help me automate candidate screening",
        ai: "I've successfully triggered the Candidate Screening workflow!\n\n**Workflow Details:**\n• Workflow ID: WF-CANDIDATE_SCREENING-1234\n• Status: Initiated\n• Estimated completion: 15-30 minutes",
        description: "Instant workflow setup with progress tracking",
        features: ["Process Automation", "Progress Tracking", "Notifications"]
      },
      {
        user: "Set up interview scheduling automation",
        ai: "Interview Scheduling workflow initiated!\n\n**Automated Steps:**\n• Availability check\n• Calendar integration\n• Invite sending\n• Confirmation tracking",
        description: "Smart scheduling with calendar integration",
        features: ["Calendar Integration", "Automated Invites", "Status Tracking"]
      }
    ]
  },
  {
    category: "Predictive Analytics",
    icon: <TrendIcon />,
    examples: [
      {
        user: "What's the hiring success probability for Sarah Johnson?",
        ai: "Based on predictive analysis:\n\n**Success Probability: 94.5%**\n\n**Key Factors:**\n• Technical skill match: 96%\n• Experience alignment: 93%\n• Cultural compatibility: 92%",
        description: "AI-powered success prediction with detailed breakdown",
        features: ["Success Prediction", "Risk Analysis", "Data Insights"]
      },
      {
        user: "Predict our Q4 hiring needs",
        ai: "Q4 Hiring Forecast:\n\n**Predicted Needs:** 12 candidates\n**Key Roles:** Senior Engineers (5), Data Scientists (3), Designers (2)\n**Timeline:** October - December 2025",
        description: "Forward-looking hiring planning with role breakdown",
        features: ["Demand Forecasting", "Resource Planning", "Timeline Projection"]
      }
    ]
  }
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ConversationExamples({ open, onClose, onSelectExample }: ConversationExamplesProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleExampleClick = (userMessage: string) => {
    onSelectExample(userMessage);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon color="primary" />
          <Typography variant="h6">AI Copilot Conversation Examples</Typography>
          <Chip label="Interactive Demo" color="primary" size="small" />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Click any example below to try it in the chat! These demonstrate the AI Copilot's capabilities in mock mode.
        </Typography>

        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {conversationExamples.map((category, index) => (
            <Tab 
              key={index}
              icon={category.icon}
              label={category.category}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {conversationExamples.map((category, categoryIndex) => (
          <TabPanel key={categoryIndex} value={selectedTab} index={categoryIndex}>
            <List>
              {category.examples.map((example, exampleIndex) => (
                <ListItem 
                  key={exampleIndex}
                  sx={{ 
                    mb: 2, 
                    p: 0,
                    cursor: 'pointer',
                    '&:hover .example-card': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => handleExampleClick(example.user)}
                >
                  <Card 
                    className="example-card"
                    sx={{ 
                      width: '100%',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        👤 User Question:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        "{example.user}"
                      </Typography>
                      
                      <Typography variant="subtitle2" color="secondary" gutterBottom>
                        🤖 AI Response Preview:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        {example.ai.length > 150 ? example.ai.substring(0, 150) + "..." : example.ai}
                      </Typography>
                      
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                        {example.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {example.features.map((feature, featureIndex) => (
                          <Chip 
                            key={featureIndex}
                            label={feature}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </TabPanel>
        ))}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrainIcon color="primary" />
            💡 Pro Tips for Better Conversations:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Be specific: "Analyze Sarah Johnson's technical skills" vs "Tell me about candidates"</li>
            <li>Ask follow-ups: "Generate interview questions for this candidate"</li>
            <li>Test different scenarios: Try various bias detection examples</li>
            <li>Explore workflows: Ask about automation for different hiring stages</li>
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          onClick={() => handleExampleClick("Hello! What can you help me with?")}
        >
          Start Fresh Conversation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
