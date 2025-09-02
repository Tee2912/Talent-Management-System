import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  VideoCall as VideoCallIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as StartInterviewIcon,
} from '@mui/icons-material';
import RealTimeInterviewScoring from '../components/RealTimeInterviewScoring';

interface Candidate {
  id: number;
  name: string;
  position: string;
  email?: string;
}

interface Interviewer {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface Interview {
  id: number;
  candidateId: number;
  candidateName: string;
  position: string;
  interviewers: Interviewer[];
  scheduledDate: Date;
  duration: number; // in minutes
  type: 'technical' | 'behavioral' | 'cultural' | 'final';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  meetingLink?: string;
  notes?: string;
  scores?: InterviewScore[];
  templateId?: number;
}

interface InterviewTemplate {
  id: number;
  name: string;
  type: 'technical' | 'behavioral' | 'cultural' | 'final';
  position: string;
  duration: number;
  questions: InterviewQuestion[];
  scoringCriteria: ScoringCriteria[];
}

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  timeLimit?: number;
}

interface ScoringCriteria {
  id: number;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface InterviewScore {
  criteriaId: number;
  criteriaName: string;
  score: number;
  maxScore: number;
  feedback: string;
  interviewerId: number;
}

function InterviewManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [selectedInterviewForScoring, setSelectedInterviewForScoring] = useState<Interview | null>(null);
  
  // Form states
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    type: 'technical',
    duration: 60,
    status: 'scheduled',
    location: 'Video Call',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchInterviews(),
          fetchCandidates(),
          fetchInterviewers(),
          fetchTemplates(),
        ]);
      } catch (error) {
        setError('Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.map((interview: any) => ({
          ...interview,
          scheduledDate: new Date(interview.scheduledDate),
        })));
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/v1/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchInterviewers = async () => {
    // Mock data for now - in real app, this would be an API call
    const interviewersData = [
      { id: 1, name: 'John Smith', email: 'john.smith@company.com', department: 'Engineering', role: 'Senior Developer' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Engineering', role: 'Tech Lead' },
      { id: 3, name: 'Mike Chen', email: 'mike.chen@company.com', department: 'HR', role: 'HR Manager' },
      { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Product', role: 'Product Manager' },
    ];
    // Store in component state if needed later
    console.log('Interviewers loaded:', interviewersData);
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/interviews/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      // Mock templates for development
      setTemplates([
        {
          id: 1,
          name: 'Technical Interview - Senior Developer',
          type: 'technical',
          position: 'Senior Software Developer',
          duration: 90,
          questions: [
            { id: 1, question: 'Explain the concept of closures in JavaScript', category: 'JavaScript', difficulty: 'medium' },
            { id: 2, question: 'Design a system for handling millions of requests', category: 'System Design', difficulty: 'hard' },
          ],
          scoringCriteria: [
            { id: 1, name: 'Technical Knowledge', description: 'Understanding of core concepts', weight: 40, maxScore: 10 },
            { id: 2, name: 'Problem Solving', description: 'Approach to solving problems', weight: 30, maxScore: 10 },
            { id: 3, name: 'Communication', description: 'Ability to explain solutions', weight: 30, maxScore: 10 },
          ],
        },
      ]);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInterview,
          scheduledDate: newInterview.scheduledDate?.toISOString(),
        }),
      });

      if (response.ok) {
        await fetchInterviews();
        setScheduleDialogOpen(false);
        setNewInterview({
          type: 'technical',
          duration: 60,
          status: 'scheduled',
          location: 'Video Call',
        });
      }
    } catch (error) {
      setError('Failed to schedule interview');
      console.error('Error scheduling interview:', error);
    }
  };

  const handleStartInterview = (interview: Interview) => {
    setSelectedInterviewForScoring(interview);
    setScoringDialogOpen(true);
  };

  const handleSaveScores = async (scores: InterviewScore[], overallFeedback: string) => {
    if (!selectedInterviewForScoring) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/interviews/${selectedInterviewForScoring.id}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores,
          overallFeedback,
          completedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Update the interview status to completed
        await fetch(`http://127.0.0.1:8000/api/interviews/${selectedInterviewForScoring.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedInterviewForScoring,
            status: 'completed'
          }),
        });

        // Refresh the interviews list
        await fetchInterviews();
        setScoringDialogOpen(false);
        setSelectedInterviewForScoring(null);
      } else {
        throw new Error('Failed to save scores');
      }
    } catch (error) {
      setError('Failed to save interview scores');
      console.error('Error saving scores:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <AssessmentIcon />;
      case 'behavioral': return <PersonIcon />;
      case 'cultural': return <PersonIcon />;
      case 'final': return <CheckCircleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const renderInterviewsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Interview Schedule</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setScheduleDialogOpen(true)}
        >
          Schedule Interview
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {interviews.map((interview) => (
            <Grid item xs={12} md={6} lg={4} key={interview.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getTypeIcon(interview.type)}
                    <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
                      {interview.candidateName}
                    </Typography>
                    <Chip
                      label={interview.status}
                      color={getStatusColor(interview.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {interview.position}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {interview.scheduledDate.toLocaleDateString()} at{' '}
                      {interview.scheduledDate.toLocaleTimeString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Duration: {interview.duration} minutes
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Type: {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {interview.interviewers?.map((interviewer) => (
                      <Chip
                        key={interviewer.id}
                        label={interviewer.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    {interview.meetingLink && (
                      <Button size="small" startIcon={<VideoCallIcon />}>
                        Join
                      </Button>
                    )}
                    {interview.status === 'scheduled' && (
                      <Button 
                        size="small" 
                        startIcon={<StartInterviewIcon />}
                        onClick={() => handleStartInterview(interview)}
                        variant="contained"
                        color="primary"
                      >
                        Start
                      </Button>
                    )}
                    {interview.status === 'completed' && (
                      <Button 
                        size="small" 
                        startIcon={<AssessmentIcon />}
                        onClick={() => {
                          console.log('View scores for interview:', interview.id);
                        }}
                      >
                        Scores
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Interview Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create template clicked')}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {template.position}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={template.type} size="small" />
                  <Chip label={`${template.duration} min`} size="small" variant="outlined" />
                  <Chip label={`${template.questions.length} questions`} size="small" variant="outlined" />
                </Box>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>View Questions & Criteria</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" gutterBottom>Questions:</Typography>
                    {template.questions.map((question, index) => (
                      <Typography key={question.id} variant="body2" sx={{ mb: 1 }}>
                        {index + 1}. {question.question}
                      </Typography>
                    ))}
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Scoring Criteria:
                    </Typography>
                    {template.scoringCriteria.map((criteria) => (
                      <Typography key={criteria.id} variant="body2" sx={{ mb: 1 }}>
                        • {criteria.name} ({criteria.weight}% weight)
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>Interview Analytics</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overall Statistics</Typography>
              <Typography variant="h4" color="primary">
                {interviews.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Interviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Completed</Typography>
              <Typography variant="h4" color="success.main">
                {interviews.filter(i => i.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finished Interviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Success Rate</Typography>
              <Typography variant="h4" color="info.main">
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positive Outcomes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Interview Performance</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Average Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interviews.slice(0, 10).map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>{interview.candidateName}</TableCell>
                        <TableCell>{interview.position}</TableCell>
                        <TableCell>{interview.type}</TableCell>
                        <TableCell>{interview.scheduledDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={interview.status}
                            color={getStatusColor(interview.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {interview.scores ? 
                            `${(interview.scores.reduce((sum, score) => sum + score.score, 0) / interview.scores.length).toFixed(1)}/10` 
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon />
        Interview Management
      </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Interviews" />
            <Tab label="Templates" />
            <Tab label="Analytics" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && renderInterviewsTab()}
            {tabValue === 1 && renderTemplatesTab()}
            {tabValue === 2 && renderAnalyticsTab()}
          </Box>
        </Paper>

        {/* Schedule Interview Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Schedule New Interview</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Candidate</InputLabel>
                  <Select
                    value={newInterview.candidateId || ''}
                    onChange={(e) => {
                      const candidateId = e.target.value as number;
                      const candidate = candidates.find(c => c.id === candidateId);
                      setNewInterview(prev => ({
                        ...prev,
                        candidateId,
                        candidateName: candidate?.name,
                        position: candidate?.position,
                      }));
                    }}
                  >
                    {candidates.map((candidate) => (
                      <MenuItem key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Interview Type</InputLabel>
                  <Select
                    value={newInterview.type || 'technical'}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="behavioral">Behavioral</MenuItem>
                    <MenuItem value="cultural">Cultural Fit</MenuItem>
                    <MenuItem value="final">Final Round</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Interview Date & Time"
                  type="datetime-local"
                  value={newInterview.scheduledDate ? 
                    new Date(newInterview.scheduledDate.getTime() - newInterview.scheduledDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) 
                    : ''
                  }
                  onChange={(e) => setNewInterview(prev => ({ 
                    ...prev, 
                    scheduledDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newInterview.duration || 60}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location / Meeting Link"
                  value={newInterview.location || ''}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={newInterview.notes || ''}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} variant="contained">
              Schedule Interview
            </Button>
          </DialogActions>
        </Dialog>

        {/* Real-time Interview Scoring Dialog */}
        <RealTimeInterviewScoring
          open={scoringDialogOpen}
          onClose={() => setScoringDialogOpen(false)}
          interview={selectedInterviewForScoring}
          onSaveScores={handleSaveScores}
        />
    </Box>
  );
}

export default InterviewManagement;
