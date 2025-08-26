import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Assessment as AssessmentIcon,
  Create as CreateIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function InterviewFeedback() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [feedbackForms, setFeedbackForms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Dialog states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  
  // Form states
  const [feedbackForm, setFeedbackForm] = useState({
    interview_id: '',
    candidate_name: '',
    position: '',
    interviewer_name: '',
    overall_rating: 0,
    technical_rating: 0,
    communication_rating: 0,
    cultural_fit_rating: 0,
    problem_solving_rating: 0,
    strengths: [''],
    areas_for_improvement: [''],
    detailed_feedback: '',
    recommendation: '',
    next_steps: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const [templatesRes, analyticsRes] = await Promise.all([
          fetch('/api/v1/feedback/templates'),
          fetch('/api/v1/feedback/analytics')
        ]);

        if (templatesRes.ok && analyticsRes.ok) {
          const [templatesData, analyticsData] = await Promise.all([
            templatesRes.json(),
            analyticsRes.json()
          ]);

          setTemplates(templatesData.templates);
          setAnalytics(analyticsData.analytics);
          
          // Fetch recent feedback
          const feedbackRes = await fetch('/api/v1/feedback/history?limit=20');
          if (feedbackRes.ok) {
            const feedbackData = await feedbackRes.json();
            setFeedbackForms(feedbackData.feedback || []);
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for feedback');
        
        const mockTemplates = [
          {
            id: 1,
            name: "Technical Interview Template",
            type: "technical",
            sections: [
              {
                name: "Technical Skills",
                questions: [
                  "How would you rate the candidate's coding ability?",
                  "How well did they solve the technical problems?",
                  "What is their understanding of system design?"
                ]
              },
              {
                name: "Problem Solving",
                questions: [
                  "How did they approach complex problems?",
                  "Did they ask clarifying questions?",
                  "How creative were their solutions?"
                ]
              }
            ],
            rating_criteria: ["Poor", "Below Average", "Average", "Good", "Excellent"],
            created_at: "2024-01-10T10:00:00"
          },
          {
            id: 2,
            name: "Cultural Fit Interview Template",
            type: "cultural",
            sections: [
              {
                name: "Team Collaboration",
                questions: [
                  "How well would they fit with our team culture?",
                  "Do they demonstrate good communication skills?",
                  "Are they adaptable to change?"
                ]
              },
              {
                name: "Leadership Potential",
                questions: [
                  "Do they show leadership qualities?",
                  "How do they handle disagreements?",
                  "Can they mentor others?"
                ]
              }
            ],
            rating_criteria: ["Poor", "Below Average", "Average", "Good", "Excellent"],
            created_at: "2024-01-12T14:30:00"
          }
        ];

        const mockAnalytics = {
          total_feedback_forms: 156,
          average_overall_rating: 3.8,
          average_interview_duration: 45,
          top_strengths: [
            { strength: "Problem Solving", count: 34 },
            { strength: "Communication", count: 28 },
            { strength: "Technical Skills", count: 25 },
            { strength: "Team Collaboration", count: 22 }
          ],
          common_improvements: [
            { area: "Technical Depth", count: 18 },
            { area: "System Design", count: 15 },
            { area: "Leadership Skills", count: 12 },
            { area: "Domain Knowledge", count: 10 }
          ],
          interviewer_performance: [
            {
              interviewer_name: "Sarah Wilson",
              interviews_conducted: 23,
              average_rating_given: 3.9,
              feedback_completion_rate: 95.7,
              average_feedback_time: 15
            },
            {
              interviewer_name: "Mike Chen",
              interviews_conducted: 19,
              average_rating_given: 3.7,
              feedback_completion_rate: 100,
              average_feedback_time: 12
            },
            {
              interviewer_name: "Lisa Johnson",
              interviews_conducted: 17,
              average_rating_given: 4.1,
              feedback_completion_rate: 94.1,
              average_feedback_time: 18
            }
          ],
          rating_distribution: {
            1: 8,
            2: 15,
            3: 45,
            4: 58,
            5: 30
          },
          trends: {
            monthly_feedback_count: [12, 15, 18, 23, 19],
            average_rating_trend: [3.6, 3.7, 3.8, 3.9, 3.8],
            completion_rate_trend: [88, 92, 94, 96, 95]
          }
        };

        const mockFeedbackForms = [
          {
            id: 1,
            interview_id: "INT_001",
            candidate_name: "John Smith",
            position: "Senior Software Engineer",
            interviewer_name: "Sarah Wilson",
            interview_date: "2024-01-22T10:00:00",
            overall_rating: 4,
            technical_rating: 4,
            communication_rating: 4,
            cultural_fit_rating: 3,
            problem_solving_rating: 5,
            recommendation: "hire",
            status: "completed",
            submitted_at: "2024-01-22T11:30:00"
          },
          {
            id: 2,
            interview_id: "INT_002",
            candidate_name: "Jane Doe",
            position: "Product Manager",
            interviewer_name: "Mike Chen",
            interview_date: "2024-01-21T14:00:00",
            overall_rating: 3,
            technical_rating: 3,
            communication_rating: 4,
            cultural_fit_rating: 4,
            problem_solving_rating: 3,
            recommendation: "maybe",
            status: "completed",
            submitted_at: "2024-01-21T15:45:00"
          }
        ];

        setTemplates(mockTemplates);
        setAnalytics(mockAnalytics);
        setFeedbackForms(mockFeedbackForms);
      }
      
    } catch (error) {
      setError('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch('/api/v1/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackForm,
          interviewer_id: 1, // Mock interviewer ID
          strengths: feedbackForm.strengths.filter(s => s.trim()),
          areas_for_improvement: feedbackForm.areas_for_improvement.filter(a => a.trim())
        })
      });

      if (response.ok) {
        setFeedbackDialogOpen(false);
        resetFeedbackForm();
        fetchData();
        alert('Feedback submitted successfully!');
      } else {
        alert('Failed to submit feedback');
      }
    } catch (error) {
      // Mock success when backend is not available
      console.log('Backend not available, simulating feedback submission');
      setFeedbackDialogOpen(false);
      resetFeedbackForm();
      alert('Feedback submitted successfully! (Demo mode)');
    }
  };

  const resetFeedbackForm = () => {
    setFeedbackForm({
      interview_id: '',
      candidate_name: '',
      position: '',
      interviewer_name: '',
      overall_rating: 0,
      technical_rating: 0,
      communication_rating: 0,
      cultural_fit_rating: 0,
      problem_solving_rating: 0,
      strengths: [''],
      areas_for_improvement: [''],
      detailed_feedback: '',
      recommendation: '',
      next_steps: ''
    });
  };

  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setViewDialogOpen(true);
  };

  const addStrength = () => {
    setFeedbackForm((prev: any) => ({
      ...prev,
      strengths: [...prev.strengths, '']
    }));
  };

  const addImprovement = () => {
    setFeedbackForm((prev: any) => ({
      ...prev,
      areas_for_improvement: [...prev.areas_for_improvement, '']
    }));
  };

  const updateStrength = (index: number, value: string) => {
    setFeedbackForm((prev: any) => ({
      ...prev,
      strengths: prev.strengths.map((s: any, i: number) => i === index ? value : s)
    }));
  };

  const updateImprovement = (index: number, value: string) => {
    setFeedbackForm((prev: any) => ({
      ...prev,
      areas_for_improvement: prev.areas_for_improvement.map((a: any, i: number) => i === index ? value : a)
    }));
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading feedback data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FeedbackIcon /> Interview Feedback Collection
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {analytics?.total_feedback_forms || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Feedback Forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {analytics?.average_rating?.toFixed(1) || 0}/5
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {analytics?.submission_rate?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Submission Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {analytics?.feedback_trends?.last_30_days || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 30 Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => setFeedbackDialogOpen(true)}
        >
          Submit Feedback
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
        >
          Export Feedback
        </Button>
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
        >
          View Analytics
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Feedback" icon={<CommentIcon />} />
          <Tab label="Templates" icon={<CreateIcon />} />
          <Tab label="Analytics" icon={<AssessmentIcon />} />
          <Tab label="Interviewer Performance" icon={<GroupIcon />} />
        </Tabs>
      </Paper>

      {/* Recent Feedback Tab */}
      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Candidate</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Interviewer</TableCell>
                <TableCell>Overall Rating</TableCell>
                <TableCell>Recommendation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackForms.map((feedback: any) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    {new Date(feedback.feedback_submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <PersonIcon />
                      </Avatar>
                      {feedback.candidate_name}
                    </Box>
                  </TableCell>
                  <TableCell>{feedback.position}</TableCell>
                  <TableCell>{feedback.interviewer_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={feedback.overall_rating} readOnly size="small" />
                      <Typography variant="body2">
                        ({feedback.overall_rating}/5)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.recommendation}
                      color={
                        feedback.recommendation === 'strong_hire' ? 'success' :
                        feedback.recommendation === 'hire' ? 'primary' :
                        feedback.recommendation === 'no_hire' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {templates && Object.entries(templates).map(([key, template]: [string, any]) => (
            <Grid item xs={12} md={6} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {template.sections?.length || 0} sections
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<CreateIcon />}>
                      Use Template
                    </Button>
                    <Button size="small" startIcon={<ViewIcon />}>
                      Preview
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rating Distribution
              </Typography>
              {analytics?.rating_distribution && (
                <Bar
                  data={{
                    labels: Object.keys(analytics.rating_distribution),
                    datasets: [
                      {
                        label: 'Count',
                        data: Object.values(analytics.rating_distribution),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recommendation Distribution
              </Typography>
              {analytics?.recommendation_distribution && (
                <Bar
                  data={{
                    labels: Object.keys(analytics.recommendation_distribution).map(key => 
                      key.replace('_', ' ').toUpperCase()
                    ),
                    datasets: [
                      {
                        label: 'Count',
                        data: Object.values(analytics.recommendation_distribution),
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(54, 162, 235, 0.6)',
                          'rgba(255, 206, 86, 0.6)',
                          'rgba(255, 99, 132, 0.6)'
                        ]
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Interviewer Performance Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {analytics?.interviewer_performance && Object.entries(analytics.interviewer_performance).map(([id, interviewer]: [string, any]) => (
            <Grid item xs={12} md={6} lg={4} key={id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                    {interviewer.name}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CommentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Feedback Count"
                        secondary={interviewer.feedback_count}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Average Rating"
                        secondary={`${interviewer.average_rating.toFixed(1)}/5`}
                      />
                    </ListItem>
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(interviewer.recommendations).map(([rec, count]: [string, any]) => (
                      <Chip
                        key={rec}
                        label={`${rec.replace('_', ' ')}: ${count}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Submit Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Interview Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interview ID"
                  value={feedbackForm.interview_id}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, interview_id: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Candidate Name"
                  value={feedbackForm.candidate_name}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, candidate_name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={feedbackForm.position}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interviewer Name"
                  value={feedbackForm.interviewer_name}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, interviewer_name: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>Ratings</Typography>
            <Grid container spacing={2}>
              {[
                { key: 'overall_rating', label: 'Overall Rating' },
                { key: 'technical_rating', label: 'Technical Skills' },
                { key: 'communication_rating', label: 'Communication' },
                { key: 'cultural_fit_rating', label: 'Cultural Fit' },
                { key: 'problem_solving_rating', label: 'Problem Solving' }
              ].map((rating) => (
                <Grid item xs={12} sm={6} key={rating.key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      {rating.label}:
                    </Typography>
                    <Rating
                      value={feedbackForm[rating.key as keyof typeof feedbackForm] as number}
                      onChange={(_, newValue) => 
                        setFeedbackForm(prev => ({ ...prev, [rating.key]: newValue || 0 }))
                      }
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>Strengths</Typography>
            {feedbackForm.strengths.map((strength, index) => (
              <TextField
                key={index}
                fullWidth
                label={`Strength ${index + 1}`}
                value={strength}
                onChange={(e) => updateStrength(index, e.target.value)}
              />
            ))}
            <Button onClick={addStrength} variant="outlined" size="small">
              Add Strength
            </Button>

            <Typography variant="h6" sx={{ mt: 2 }}>Areas for Improvement</Typography>
            {feedbackForm.areas_for_improvement.map((area, index) => (
              <TextField
                key={index}
                fullWidth
                label={`Area for Improvement ${index + 1}`}
                value={area}
                onChange={(e) => updateImprovement(index, e.target.value)}
              />
            ))}
            <Button onClick={addImprovement} variant="outlined" size="small">
              Add Area for Improvement
            </Button>

            <TextField
              fullWidth
              label="Detailed Feedback"
              multiline
              rows={4}
              value={feedbackForm.detailed_feedback}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, detailed_feedback: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel>Recommendation</InputLabel>
              <Select
                value={feedbackForm.recommendation}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, recommendation: e.target.value }))}
              >
                <MenuItem value="strong_hire">Strong Hire</MenuItem>
                <MenuItem value="hire">Hire</MenuItem>
                <MenuItem value="no_hire">No Hire</MenuItem>
                <MenuItem value="strong_no_hire">Strong No Hire</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Next Steps"
              value={feedbackForm.next_steps}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, next_steps: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained">Submit Feedback</Button>
        </DialogActions>
      </Dialog>

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Feedback Details</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Candidate:</Typography>
                  <Typography>{selectedFeedback.candidate_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Position:</Typography>
                  <Typography>{selectedFeedback.position}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Interviewer:</Typography>
                  <Typography>{selectedFeedback.interviewer_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date:</Typography>
                  <Typography>
                    {new Date(selectedFeedback.feedback_submitted_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="h6">Ratings</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Overall', value: selectedFeedback.overall_rating },
                  { label: 'Technical', value: selectedFeedback.technical_rating },
                  { label: 'Communication', value: selectedFeedback.communication_rating },
                  { label: 'Cultural Fit', value: selectedFeedback.cultural_fit_rating },
                  { label: 'Problem Solving', value: selectedFeedback.problem_solving_rating }
                ].map((rating, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {rating.label}:
                      </Typography>
                      <Rating value={rating.value || 0} readOnly size="small" />
                      <Typography variant="body2">
                        ({rating.value || 0}/5)
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {selectedFeedback.strengths?.length > 0 && (
                <>
                  <Typography variant="h6">Strengths</Typography>
                  <List dense>
                    {selectedFeedback.strengths.map((strength: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {selectedFeedback.areas_for_improvement?.length > 0 && (
                <>
                  <Typography variant="h6">Areas for Improvement</Typography>
                  <List dense>
                    {selectedFeedback.areas_for_improvement.map((area: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUpIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={area} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {selectedFeedback.detailed_feedback && (
                <>
                  <Typography variant="h6">Detailed Feedback</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedFeedback.detailed_feedback}
                  </Typography>
                </>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Recommendation:</Typography>
                <Chip
                  label={selectedFeedback.recommendation?.replace('_', ' ').toUpperCase()}
                  color={
                    selectedFeedback.recommendation === 'strong_hire' ? 'success' :
                    selectedFeedback.recommendation === 'hire' ? 'primary' :
                    selectedFeedback.recommendation === 'no_hire' ? 'warning' : 'error'
                  }
                />
              </Box>

              {selectedFeedback.next_steps && (
                <>
                  <Typography variant="h6">Next Steps</Typography>
                  <Typography variant="body2">
                    {selectedFeedback.next_steps}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InterviewFeedback;
