import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Slider,
  TextField,
  Box,
  Chip,
  Rating,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface ScoringCriteria {
  id: number;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  timeLimit?: number;
  asked?: boolean;
  timeSpent?: number;
  candidateResponse?: string;
  score?: number;
}

interface InterviewScore {
  criteriaId: number;
  criteriaName: string;
  score: number;
  maxScore: number;
  feedback: string;
  interviewerId: number;
}

interface RealTimeScoreProps {
  open: boolean;
  onClose: () => void;
  interview: any;
  onSaveScores: (scores: InterviewScore[], overallFeedback: string) => void;
}

function RealTimeInterviewScoring({ open, onClose, interview, onSaveScores }: RealTimeScoreProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [scores, setScores] = useState<Record<number, InterviewScore>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentQuestionTimer, setCurrentQuestionTimer] = useState(0);
  const [interviewPhase, setInterviewPhase] = useState<'preparation' | 'questions' | 'scoring' | 'completed'>('preparation');

  const scoringCriteria: ScoringCriteria[] = useMemo(() => [
    { id: 1, name: 'Technical Knowledge', description: 'Understanding of core technical concepts', weight: 30, maxScore: 10 },
    { id: 2, name: 'Problem Solving', description: 'Ability to approach and solve problems systematically', weight: 25, maxScore: 10 },
    { id: 3, name: 'Communication', description: 'Clarity in explaining technical concepts', weight: 20, maxScore: 10 },
    { id: 4, name: 'Code Quality', description: 'Writing clean, efficient, and maintainable code', weight: 15, maxScore: 10 },
    { id: 5, name: 'Cultural Fit', description: 'Alignment with team values and work style', weight: 10, maxScore: 10 },
  ], []);

  useEffect(() => {
    if (open && interview) {
      // Initialize questions based on interview template
      const mockQuestions: InterviewQuestion[] = [
        {
          id: 1,
          question: "Explain the concept of closures in JavaScript and provide an example.",
          category: "JavaScript",
          difficulty: "medium",
          timeLimit: 10,
          expectedAnswer: "A closure is a function that has access to variables in its outer scope even after the outer function returns.",
        },
        {
          id: 2,
          question: "How would you optimize a React application for better performance?",
          category: "React",
          difficulty: "hard",
          timeLimit: 15,
        },
        {
          id: 3,
          question: "Design a simple REST API for a user management system.",
          category: "System Design",
          difficulty: "medium",
          timeLimit: 20,
        },
      ];
      setQuestions(mockQuestions);
      
      // Initialize scores
      const initialScores: Record<number, InterviewScore> = {};
      scoringCriteria.forEach(criteria => {
        initialScores[criteria.id] = {
          criteriaId: criteria.id,
          criteriaName: criteria.name,
          score: 0,
          maxScore: criteria.maxScore,
          feedback: '',
          interviewerId: 1, // Current interviewer ID
        };
      });
      setScores(initialScores);
    }
  }, [open, interview, scoringCriteria]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        if (interviewPhase === 'questions') {
          setCurrentQuestionTimer(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, interviewPhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = () => {
    setInterviewPhase('questions');
    setIsTimerRunning(true);
  };

  const handleNextQuestion = () => {
    // Save current question timing
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      asked: true,
      timeSpent: currentQuestionTimer,
    };
    setQuestions(updatedQuestions);
    setCurrentQuestionTimer(0);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setInterviewPhase('scoring');
    }
  };

  const handleScoreChange = (criteriaId: number, field: 'score' | 'feedback', value: any) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        [field]: value,
      },
    }));
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let totalWeight = 0;
    
    scoringCriteria.forEach(criteria => {
      const score = scores[criteria.id]?.score || 0;
      totalScore += (score * criteria.weight);
      totalWeight += criteria.weight;
    });
    
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 10) / 10 : 0;
  };

  const handleSaveAndClose = () => {
    const scoresList = Object.values(scores);
    onSaveScores(scoresList, overallFeedback);
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const overallScore = calculateOverallScore();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            Real-time Interview Scoring - {interview?.candidateName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<TimerIcon />} 
              label={`Total: ${formatTime(timer)}`} 
              color="primary" 
            />
            <Chip 
              label={interviewPhase} 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {interviewPhase === 'preparation' && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Interview Preparation</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ready to start the interview with {interview?.candidateName}?
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Interview Details:</Typography>
                <Typography variant="body2">Position: {interview?.position}</Typography>
                <Typography variant="body2">Type: {interview?.type}</Typography>
                <Typography variant="body2">Duration: {interview?.duration} minutes</Typography>
                <Typography variant="body2">Questions: {questions.length}</Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={handleStartInterview}
                startIcon={<CheckCircleIcon />}
              >
                Start Interview
              </Button>
            </CardContent>
          </Card>
        )}

        {interviewPhase === 'questions' && currentQuestion && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={currentQuestion.category} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={currentQuestion.difficulty} 
                        size="small" 
                        color={currentQuestion.difficulty === 'hard' ? 'error' : currentQuestion.difficulty === 'medium' ? 'warning' : 'success'}
                      />
                      <Chip 
                        icon={<TimerIcon />}
                        label={formatTime(currentQuestionTimer)}
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {currentQuestion.question}
                  </Typography>
                  
                  {currentQuestion.timeLimit && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Suggested time limit: {currentQuestion.timeLimit} minutes
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((currentQuestionTimer / (currentQuestion.timeLimit * 60)) * 100, 100)}
                        color={currentQuestionTimer > currentQuestion.timeLimit * 60 ? "error" : "primary"}
                      />
                    </Box>
                  )}
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Candidate's Response (Optional Notes)"
                    value={currentQuestion.candidateResponse || ''}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[currentQuestionIndex] = {
                        ...updatedQuestions[currentQuestionIndex],
                        candidateResponse: e.target.value,
                      };
                      setQuestions(updatedQuestions);
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleNextQuestion}
                      disabled={!currentQuestion.candidateResponse}
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Proceed to Scoring'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Question Progress</Typography>
                  {questions.map((q, index) => (
                    <Box key={q.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon 
                        color={q.asked ? 'success' : index === currentQuestionIndex ? 'primary' : 'disabled'} 
                        sx={{ mr: 1 }}
                      />
                      <Typography 
                        variant="body2" 
                        color={index === currentQuestionIndex ? 'primary' : 'text.secondary'}
                      >
                        Q{index + 1}: {q.category}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {interviewPhase === 'scoring' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Interview Evaluation</Typography>
              
              {scoringCriteria.map((criteria) => (
                <Accordion key={criteria.id} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                      <Typography variant="subtitle1">{criteria.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating 
                          value={scores[criteria.id]?.score || 0} 
                          max={criteria.maxScore}
                          size="small"
                          readOnly
                        />
                        <Typography variant="caption">({criteria.weight}% weight)</Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {criteria.description}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormLabel component="legend">Score (0-{criteria.maxScore})</FormLabel>
                        <Slider
                          value={scores[criteria.id]?.score || 0}
                          onChange={(_, value) => handleScoreChange(criteria.id, 'score', value)}
                          min={0}
                          max={criteria.maxScore}
                          marks
                          step={1}
                          valueLabelDisplay="on"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Feedback & Comments"
                          value={scores[criteria.id]?.feedback || ''}
                          onChange={(e) => handleScoreChange(criteria.id, 'feedback', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Overall Interview Feedback"
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="Provide overall assessment, recommendations, and next steps..."
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Score Summary</Typography>
                  
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" color="primary">
                      {overallScore}/10
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Weighted Overall Score
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {scoringCriteria.map((criteria) => (
                    <Box key={criteria.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{criteria.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {scores[criteria.id]?.score || 0}/{criteria.maxScore}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(scores[criteria.id]?.score || 0) / criteria.maxScore * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Alert 
                    severity={overallScore >= 7 ? 'success' : overallScore >= 5 ? 'warning' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    {overallScore >= 7 ? 'Strong candidate - Recommend for next round' :
                     overallScore >= 5 ? 'Moderate performance - Consider additional assessment' :
                     'Below expectations - May not be suitable for this role'}
                  </Alert>
                  
                  <Typography variant="caption" color="text.secondary">
                    Interview duration: {formatTime(timer)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {interviewPhase === 'scoring' && (
          <Button 
            variant="contained" 
            onClick={handleSaveAndClose}
            startIcon={<SaveIcon />}
            disabled={!overallFeedback.trim()}
          >
            Save Interview Results
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RealTimeInterviewScoring;
