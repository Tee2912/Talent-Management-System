import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparkleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as InsightIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import PageTransition from '../components/PageTransition';
import ConversationExamples from '../components/ConversationExamples';
import { mockAIService } from '../services/mockAIService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'query' | 'insight' | 'recommendation' | 'warning';
}

interface SmartRecommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  action_items: string[];
  priority: 'low' | 'medium' | 'high';
}

interface AIInsights {
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

function AICopilot() {
  // Mock mode state - set to true when no backend API is available
  const [mockMode, setMockMode] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Assistant for HireIQ Pro. I can help you with intelligent candidate analysis, bias detection, predictive hiring insights, workflow automation, and candidate conversations. What would you like to explore?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'insight'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('general');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [candidates] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Senior Software Engineer',
      experience: '8 years',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
      score: 95,
      stage: 'Technical Interview',
    },
    {
      id: '2',
      name: 'Michael Chen',
      position: 'Data Scientist',
      experience: '6 years',
      skills: ['Python', 'TensorFlow', 'SQL', 'Tableau', 'Spark'],
      score: 92,
      stage: 'Final Interview',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      position: 'UX Designer',
      experience: '5 years',
      skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
      score: 88,
      stage: 'Portfolio Review',
    },
    {
      id: '4',
      name: 'James Thompson',
      position: 'DevOps Engineer',
      experience: '7 years',
      skills: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform', 'AWS'],
      score: 90,
      stage: 'Technical Assessment',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAIInsights = useCallback(async () => {
    try {
      if (mockMode) {
        // Use mock service when in mock mode
        const insights = await mockAIService.getAIInsights();
        setAIInsights(insights);
        return;
      }
      
      // Try to fetch from real API
      const response = await fetch('/api/v1/ai-copilot/ai-insights/dashboard');
      const data = await response.json();
      if (data.success) {
        setAIInsights(data.ai_insights);
        setMockMode(false); // Successfully connected to real API
      } else {
        throw new Error('API response unsuccessful');
      }
    } catch (error) {
      console.error('Error loading AI insights, falling back to mock mode:', error);
      // Fall back to mock service if API fails
      setMockMode(true);
      const insights = await mockAIService.getAIInsights();
      setAIInsights(insights);
    }
  }, [mockMode, setAIInsights, setMockMode]);

  useEffect(() => {
    // Load AI insights dashboard on component mount
    loadAIInsights();
  }, [loadAIInsights]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'query'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      if (mockMode) {
        // Use mock AI service
        const { response: aiResponse, recommendations } = await mockAIService.sendMessage(
          messageToSend, 
          selectedContext
        );
        
        setMessages(prev => [...prev, aiResponse]);
        setRecommendations(recommendations);

        // Add recommendations as separate messages
        if (recommendations && recommendations.length > 0) {
          recommendations.forEach((rec: SmartRecommendation, index: number) => {
            setTimeout(() => {
              const recMessage: ChatMessage = {
                id: (Date.now() + index + 2).toString(),
                text: `💡 **${rec.title}**: ${rec.description}\n\n**Confidence**: ${Math.round(rec.confidence * 100)}%\n**Priority**: ${rec.priority.toUpperCase()}`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'recommendation'
              };
              setMessages(prev => [...prev, recMessage]);
            }, (index + 1) * 500); // Stagger recommendation messages
          });
        }
        return;
      }

      // Try real API first
      const response = await fetch('/api/v1/ai-copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageToSend,
          context: selectedContext,
          candidate_id: selectedContext === 'candidate_analysis' && selectedCandidate ? selectedCandidate : null,
          job_id: selectedContext === 'job_matching' ? 1 : null
        }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'insight'
      };

      setMessages(prev => [...prev, aiMessage]);
      setRecommendations(data.recommendations || []);

      // Add recommendations as separate messages
      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((rec: SmartRecommendation, index: number) => {
          const recMessage: ChatMessage = {
            id: (Date.now() + index + 2).toString(),
            text: `💡 **${rec.title}**: ${rec.description}`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'recommendation'
          };
          setMessages(prev => [...prev, recMessage]);
        });
      }

    } catch (error) {
      console.error('Error with real API, falling back to mock service:', error);
      
      // Fall back to mock service
      try {
        setMockMode(true);
        const { response: aiResponse, recommendations } = await mockAIService.sendMessage(
          messageToSend, 
          selectedContext
        );
        
        setMessages(prev => [...prev, aiResponse]);
        setRecommendations(recommendations);
      } catch (mockError) {
        console.error('Error with mock service:', mockError);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but I encountered an error processing your request. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
          type: 'warning'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <BrainIcon color="primary" />;
      case 'recommendation':
        return <SparkleIcon color="secondary" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <AIIcon color="primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <PageTransition animation="fadeUp">
      <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon sx={{ color: 'primary.main' }} />
          AI Assistant
          <Chip label="Smart Features Enabled" color="primary" variant="outlined" size="small" />
          {mockMode && (
            <Chip 
              label="🎭 Demo Mode" 
              color="warning" 
              variant="filled" 
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        {/* Mock Mode Banner & Quick Actions */}
        {mockMode && (
          <Alert 
            severity="info" 
            sx={{ mb: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
            action={
              <Button 
                color="primary" 
                size="small" 
                onClick={() => setMockMode(false)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Try Live API
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>🚀 AI Copilot Demo Mode</strong> - Experience realistic AI conversations without API keys! 
              Try asking about candidates, bias detection, or workflow automation.
            </Typography>
          </Alert>
        )}

        {/* Quick Action Buttons */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentMessage("Can you analyze Sarah Johnson for me?")}
            startIcon={<PersonIcon />}
          >
            Analyze Candidate
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentMessage("Check this for bias: 'Looking for a young, energetic team player'")}
            startIcon={<WarningIcon />}
          >
            Test Bias Detection
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentMessage("Help me automate candidate screening")}
            startIcon={<SparkleIcon />}
          >
            Setup Automation
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentMessage("What are best practices for bias-free hiring?")}
            startIcon={<InsightIcon />}
          >
            Get Best Practices
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setShowExamples(true)}
            startIcon={<ChatIcon />}
            sx={{ ml: 'auto' }}
          >
            View All Examples
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {/* AI Insights Dashboard */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon />
                AI Insights Dashboard
              </Typography>

              {aiInsights && (
                <Box>
                  <Accordion sx={{ mb: 2, background: 'rgba(255,255,255,0.1)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                      <Typography variant="subtitle2">Hiring Velocity</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        📈 {aiInsights.hiring_velocity.current_rate}
                      </Typography>
                      <Typography variant="body2">
                        🤖 {aiInsights.hiring_velocity.ai_contribution}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ mb: 2, background: 'rgba(255,255,255,0.1)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                      <Typography variant="subtitle2">Quality Metrics</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        🎯 Match Accuracy: {(aiInsights.quality_metrics.candidate_match_accuracy * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        🛡️ {aiInsights.quality_metrics.bias_reduction}
                      </Typography>
                      <Typography variant="body2">
                        ⚡ {aiInsights.quality_metrics.interview_efficiency}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ mb: 2, background: 'rgba(255,255,255,0.1)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                      <Typography variant="subtitle2">Predictive Analytics</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        📊 Q4 Hiring Need: {aiInsights.predictive_analytics.next_quarter_hiring_needs} candidates
                      </Typography>
                      <Typography variant="body2">
                        🎲 Success Rate: {(aiInsights.predictive_analytics.success_probability_average * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        🏢 {aiInsights.predictive_analytics.retention_prediction}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  {aiInsights.alerts && aiInsights.alerts.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2, background: 'rgba(255,255,255,0.9)' }}>
                      <Typography variant="subtitle2">Active Alerts</Typography>
                      {aiInsights.alerts.map((alert, index) => (
                        <Typography key={index} variant="body2">
                          {alert.message}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Chat Interface */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Context Selection */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chat Context:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {[
                    { value: 'general', label: 'General', icon: '💬' },
                    { value: 'candidate_analysis', label: 'Candidate Analysis', icon: '👤' },
                    { value: 'job_matching', label: 'Job Matching', icon: '🎯' },
                    { value: 'bias_detection', label: 'Bias Detection', icon: '🛡️' },
                    { value: 'workflow_automation', label: 'Workflows', icon: '⚙️' }
                  ].map((context) => (
                    <Chip
                      key={context.value}
                      label={`${context.icon} ${context.label}`}
                      variant={selectedContext === context.value ? 'filled' : 'outlined'}
                      color={selectedContext === context.value ? 'primary' : 'default'}
                      onClick={() => setSelectedContext(context.value)}
                      size="small"
                    />
                  ))}
                </Box>

                {/* Candidate Selection for Context */}
                {selectedContext === 'candidate_analysis' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Select Candidate:
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Candidate</InputLabel>
                      <Select
                        value={selectedCandidate}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        label="Candidate"
                      >
                        <MenuItem value="">
                          <em>All Candidates</em>
                        </MenuItem>
                        {candidates.map((candidate) => (
                          <MenuItem key={candidate.id} value={candidate.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon />
                              <Box>
                                <Typography variant="body2">{candidate.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {candidate.position} • Score: {candidate.score}%
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedCandidate && (
                      <Box sx={{ mt: 1 }}>
                        {(() => {
                          const candidate = candidates.find(c => c.id === selectedCandidate);
                          return candidate ? (
                            <Card sx={{ p: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                              <Typography variant="subtitle2">{candidate.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {candidate.position} • {candidate.experience} • Stage: {candidate.stage}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {candidate.skills.map((skill) => (
                                  <Chip key={skill} label={skill} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Card>
                          ) : null;
                        })()}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Messages Area */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: '80%',
                        background: message.sender === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : message.type === 'recommendation'
                          ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          : message.type === 'warning'
                          ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                          : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          {message.sender === 'ai' && (
                            <Avatar sx={{ width: 32, height: 32, background: 'transparent' }}>
                              {getMessageIcon(message.type || 'insight')}
                            </Avatar>
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {message.text}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Card sx={{ maxWidth: '80%' }}>
                      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">AI is thinking...</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about candidates, bias detection, hiring predictions, or workflow automation..."
                    variant="outlined"
                    size="small"
                    disabled={isLoading}
                  />
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    sx={{ minWidth: 48 }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                  💡 Try: "Analyze resume bias", "Predict hiring success", "Generate interview questions", "Find similar candidates"
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Smart Recommendations Panel */}
        {recommendations.length > 0 && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsightIcon color="secondary" />
              Smart Recommendations
            </Typography>
            <Grid container spacing={2}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {rec.title}
                        </Typography>
                        <Chip 
                          label={rec.priority} 
                          size="small" 
                          color={getPriorityColor(rec.priority)}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                        {rec.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption">
                          Confidence: {(rec.confidence * 100).toFixed(0)}%
                        </Typography>
                        <Chip 
                          label={`${rec.action_items.length} Actions`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Conversation Examples Dialog */}
        <ConversationExamples
          open={showExamples}
          onClose={() => setShowExamples(false)}
          onSelectExample={(message) => {
            setCurrentMessage(message);
            // Optionally auto-send the message
            // setTimeout(() => sendMessage(), 100);
          }}
        />
      </Box>
    </PageTransition>
  );
}

export default AICopilot;
