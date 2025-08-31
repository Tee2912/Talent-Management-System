import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Chip,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Psychology as PsychologyIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

interface Candidate {
  id: number;
  name: string;
  position: string;
  experience: number;
  education: string;
  skills: string[];
  resumeScore: number;
  interview_score?: number;
  personality_type?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  candidateId?: number;
  recommendation?: 'hire' | 'not_hire' | 'interview' | null;
}

function CandidateChat() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCandidates();
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI hiring assistant. Select a candidate and ask me anything about their suitability for the role. I can analyze their skills, experience, and provide hiring recommendations.',
      timestamp: new Date(),
      recommendation: null,
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const simulateAIResponse = async (userMessage: string, candidateId: number): Promise<string> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          candidate_id: candidateId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCandidate) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      candidateId: selectedCandidate as number,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      const aiResponse = await simulateAIResponse(inputMessage, selectedCandidate as number);
      
      let recommendation: 'hire' | 'not_hire' | 'interview' | null = null;
      if (aiResponse.includes('recommend hiring')) recommendation = 'hire';
      else if (aiResponse.includes('do not recommend')) recommendation = 'not_hire';
      else if (aiResponse.includes('proceed to interview')) recommendation = 'interview';
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        candidateId: selectedCandidate as number,
        recommendation,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        recommendation: null,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationChip = (recommendation: string | null | undefined) => {
    if (!recommendation) return null;
    
    const config = {
      hire: { label: 'Recommend Hire', color: 'success' as const, icon: <ThumbUpIcon /> },
      not_hire: { label: 'Not Recommended', color: 'error' as const, icon: <ThumbDownIcon /> },
      interview: { label: 'Interview Needed', color: 'warning' as const, icon: <WorkIcon /> },
    };
    
    const rec = config[recommendation as keyof typeof config];
    return rec ? (
      <Chip
        icon={rec.icon}
        label={rec.label}
        color={rec.color}
        size="small"
        sx={{ mt: 1 }}
      />
    ) : null;
  };

  const suggestedQuestions = [
    "Is this candidate suitable to hire?",
    "What are their key technical skills?",
    "How much experience do they have?",
    "What are the main concerns about this candidate?",
    "How do they fit culturally?",
    "What's their personality type?",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PsychologyIcon />
        AI Hiring Assistant
      </Typography>
      
      <Grid container spacing={3}>
        {/* Candidate Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Candidate
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Choose a candidate to analyze</InputLabel>
                <Select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value as number | '')}
                  label="Choose a candidate to analyze"
                >
                  {candidates.map((candidate) => (
                    <MenuItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedCandidate && (
                <Box sx={{ mt: 2 }}>
                  {(() => {
                    const candidate = candidates.find(c => c.id === selectedCandidate);
                    return candidate ? (
                      <Box>
                        <Typography variant="subtitle2">Quick Info:</Typography>
                        <Typography variant="body2">Experience: {candidate.experience} years</Typography>
                        <Typography variant="body2">Education: {candidate.education}</Typography>
                        <Typography variant="body2">Resume Score: {candidate.resumeScore}/100</Typography>
                        <Box sx={{ mt: 1 }}>
                          {candidate.skills.slice(0, 3).map(skill => (
                            <Chip key={skill} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Suggested Questions
              </Typography>
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mb: 1, textAlign: 'left', justifyContent: 'flex-start' }}
                  onClick={() => setInputMessage(question)}
                  disabled={!selectedCandidate}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              <List>
                {messages.map((message) => (
                  <ListItem key={message.id} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main' }}>
                          {message.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flexGrow: 1, ml: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {message.type === 'user' ? 'You' : 'AI Assistant'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content.split('**').map((part, index) => 
                              index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                            )}
                          </Typography>
                          {getRecommendationChip(message.recommendation)}
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                {loading && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <SmartToyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        AI is analyzing...
                      </Typography>
                    </Box>
                  </ListItem>
                )}
              </List>
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              {!selectedCandidate && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please select a candidate to start the conversation.
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask about the candidate's suitability, skills, experience..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={!selectedCandidate || loading}
                  multiline
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !selectedCandidate || loading}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CandidateChat;
