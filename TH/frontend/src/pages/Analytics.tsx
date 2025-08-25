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
  LinearProgress,
  Alert,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  QuestionAnswer as QuestionIcon,
  CalendarToday as CalendarIcon,
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
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Analytics() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic analytics states
  const [summary, setSummary] = useState<any>(null);
  const [positions, setPositions] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);

  // Advanced analytics states
  const [predictiveMetrics, setPredictiveMetrics] = useState<any>(null);
  const [interviewerPerformance, setInterviewerPerformance] = useState<any>(null);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [funnelAnalysis, setFunnelAnalysis] = useState<any>(null);
  const [questionEffectiveness, setQuestionEffectiveness] = useState<any>(null);
  const [seasonalTrends, setSeasonalTrends] = useState<any>(null);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const endpoints = [
          '/api/v1/analytics/summary',
          '/api/v1/analytics/positions',
          '/api/v1/analytics/demographics',
          '/api/v1/analytics/timeline',
          '/api/v1/analytics/scores',
          '/api/v1/analytics/conversion-funnel',
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint => fetch(endpoint))
        );

        // Check if all responses are successful
        const allSuccessful = responses.every(response => response.ok);
        
        if (allSuccessful) {
          const data = await Promise.all(
            responses.map(response => response.json())
          );

          setSummary(data[0]);
          setPositions(data[1]);
          setDemographics(data[2]);
          setTimeline(data[3]);
          setScores(data[4]);
          setFunnel(data[5]);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for analytics');
        
        const mockSummary = {
          total_candidates: 1247,
          total_interviews: 856,
          total_offers: 134,
          total_hires: 98,
          conversion_rate: 7.86,
          avg_time_to_hire: 21.5,
          avg_interview_score: 3.7,
          active_positions: 23
        };

        const mockPositions = [
          { position: 'Software Engineer', candidates: 234, interviews: 156, offers: 23, hires: 18 },
          { position: 'Product Manager', candidates: 189, interviews: 112, offers: 18, hires: 12 },
          { position: 'Data Scientist', candidates: 167, interviews: 98, offers: 15, hires: 11 },
          { position: 'UX Designer', candidates: 143, interviews: 87, offers: 12, hires: 9 },
          { position: 'DevOps Engineer', candidates: 98, interviews: 67, offers: 8, hires: 6 }
        ];

        const mockDemographics = {
          gender: { male: 52, female: 45, other: 3 },
          ethnicity: { 
            caucasian: 42, 
            asian: 28, 
            hispanic: 15, 
            african_american: 12, 
            other: 3 
          },
          age_groups: {
            '20-25': 18,
            '26-30': 35,
            '31-35': 28,
            '36-40': 15,
            '40+': 4
          }
        };

        const mockTimeline = [
          { month: 'Jan', applications: 156, interviews: 89, hires: 12 },
          { month: 'Feb', applications: 134, interviews: 76, hires: 9 },
          { month: 'Mar', applications: 178, interviews: 98, hires: 15 },
          { month: 'Apr', applications: 145, interviews: 87, hires: 11 },
          { month: 'May', applications: 167, interviews: 92, hires: 13 },
          { month: 'Jun', applications: 189, interviews: 103, hires: 16 }
        ];

        const mockScores = {
          technical: 3.8,
          communication: 3.6,
          cultural_fit: 3.9,
          problem_solving: 3.7,
          leadership: 3.5
        };

        const mockFunnel = [
          { stage: 'Application', count: 1247, percentage: 100 },
          { stage: 'Resume Screen', count: 856, percentage: 68.6 },
          { stage: 'Phone Screen', count: 634, percentage: 50.8 },
          { stage: 'Technical Interview', count: 423, percentage: 33.9 },
          { stage: 'Final Interview', count: 234, percentage: 18.8 },
          { stage: 'Offer', count: 134, percentage: 10.7 },
          { stage: 'Hire', count: 98, percentage: 7.9 }
        ];

        setSummary(mockSummary);
        setPositions(mockPositions);
        setDemographics(mockDemographics);
        setTimeline(mockTimeline);
        setScores(mockScores);
        setFunnel(mockFunnel);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvancedAnalytics = async () => {
    setAdvancedLoading(true);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const endpoints = [
          '/api/v1/advanced-analytics/predictive-metrics',
          '/api/v1/advanced-analytics/interviewer-performance',
          '/api/v1/advanced-analytics/cost-analysis',
          '/api/v1/advanced-analytics/funnel-analysis',
          '/api/v1/advanced-analytics/question-effectiveness',
          '/api/v1/advanced-analytics/seasonal-trends',
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint => fetch(endpoint))
        );

        const allSuccessful = responses.every(response => response.ok);
        
        if (allSuccessful) {
          const data = await Promise.all(
            responses.map(response => response.json())
          );

          setPredictiveMetrics(data[0]);
          setInterviewerPerformance(data[1]);
          setCostAnalysis(data[2]);
          setFunnelAnalysis(data[3]);
          setQuestionEffectiveness(data[4]);
          setSeasonalTrends(data[5]);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for advanced analytics');
        
        const mockPredictiveMetrics = {
          hiring_likelihood: [
            { position: "Software Engineer", likelihood: 0.76, trend: "up" },
            { position: "Product Manager", likelihood: 0.62, trend: "stable" },
            { position: "Data Scientist", likelihood: 0.71, trend: "down" }
          ],
          quality_predictions: {
            expected_performance: 4.2,
            retention_probability: 0.85,
            promotion_likelihood: 0.34
          }
        };

        const mockInterviewerPerformance = [
          { name: "Sarah Wilson", interviews: 45, avg_score: 4.2, consistency: 0.89, bias_score: 0.15 },
          { name: "Mike Chen", interviews: 38, avg_score: 4.5, consistency: 0.92, bias_score: 0.12 },
          { name: "Lisa Johnson", interviews: 42, avg_score: 4.1, consistency: 0.87, bias_score: 0.18 }
        ];

        const mockCostAnalysis = {
          cost_per_hire: 3200,
          cost_breakdown: {
            sourcing: 1200,
            screening: 800,
            interviewing: 900,
            onboarding: 300
          },
          roi_metrics: {
            time_to_productivity: 45,
            retention_rate: 0.87,
            performance_rating: 4.1
          }
        };

        const mockFunnelAnalysis = {
          conversion_rates: [
            { stage: "Application to Screen", rate: 0.68, benchmark: 0.65 },
            { stage: "Screen to Phone", rate: 0.74, benchmark: 0.70 },
            { stage: "Phone to Technical", rate: 0.67, benchmark: 0.60 },
            { stage: "Technical to Final", rate: 0.55, benchmark: 0.50 },
            { stage: "Final to Offer", rate: 0.57, benchmark: 0.55 }
          ]
        };

        const mockQuestionEffectiveness = [
          { question: "Describe a challenging project", effectiveness: 0.87, usage: 89 },
          { question: "How do you handle deadlines?", effectiveness: 0.72, usage: 76 },
          { question: "Tell me about teamwork", effectiveness: 0.81, usage: 92 }
        ];

        const mockSeasonalTrends = {
          monthly_patterns: [
            { month: "Jan", applications: 156, quality_score: 3.8 },
            { month: "Feb", applications: 134, quality_score: 3.9 },
            { month: "Mar", applications: 178, quality_score: 3.7 },
            { month: "Apr", applications: 145, quality_score: 4.0 },
            { month: "May", applications: 167, quality_score: 3.8 },
            { month: "Jun", applications: 189, quality_score: 3.9 }
          ]
        };

        setPredictiveMetrics(mockPredictiveMetrics);
        setInterviewerPerformance(mockInterviewerPerformance);
        setCostAnalysis(mockCostAnalysis);
        setFunnelAnalysis(mockFunnelAnalysis);
        setQuestionEffectiveness(mockQuestionEffectiveness);
        setSeasonalTrends(mockSeasonalTrends);
      }
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Fetch advanced analytics when switching to advanced tabs
    if (newValue >= 6 && !predictiveMetrics) {
      fetchAdvancedAnalytics();
    }
  };

  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Chart configurations
  const positionChartData = positions ? {
    labels: Object.keys(positions),
    datasets: [
      {
        label: 'Total Candidates',
        data: Object.values(positions).map((pos: any) => pos.total_candidates),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Hired',
        data: Object.values(positions).map((pos: any) => pos.hired),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const genderPieData = demographics?.gender ? {
    labels: Object.keys(demographics.gender),
    datasets: [
      {
        data: Object.values(demographics.gender).map((gender: any) => gender.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  } : null;

  const timelineChartData = timeline ? {
    labels: timeline.map((item: any) => item.month),
    datasets: [
      {
        label: 'Applications',
        data: timeline.map((item: any) => item.applications),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Hired',
        data: timeline.map((item: any) => item.hired),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Candidates
                </Typography>
                <Typography variant="h4">
                  {summary.total_candidates}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Hired
                </Typography>
                <Typography variant="h4">
                  {summary.total_hired}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Hiring Rate
                </Typography>
                <Typography variant="h4">
                  {summary.hiring_rate?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Final Score
                </Typography>
                <Typography variant="h4">
                  {summary.average_scores?.final_score?.toFixed(1) || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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
          <Tab label="Position Analysis" />
          <Tab label="Demographics" />
          <Tab label="Timeline" />
          <Tab label="Score Analysis" />
          <Tab label="Conversion Funnel" />
          <Tab label="Predictive Analytics" icon={<TrendingUpIcon />} />
          <Tab label="Interviewer Performance" icon={<ScheduleIcon />} />
          <Tab label="Cost Analysis" icon={<MoneyIcon />} />
          <Tab label="Funnel Optimization" />
          <Tab label="Question Effectiveness" icon={<QuestionIcon />} />
          <Tab label="Seasonal Trends" icon={<CalendarIcon />} />
        </Tabs>
      </Paper>

      {/* Position Analysis Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Candidates by Position
              </Typography>
              {positionChartData && (
                <Bar data={positionChartData} options={chartOptions} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Position Details
              </Typography>
              {positions && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Position</TableCell>
                        <TableCell align="right">Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(positions).map(([position, data]: [string, any]) => (
                        <TableRow key={position}>
                          <TableCell component="th" scope="row">
                            {position}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${data.hiring_rate?.toFixed(1)}%`}
                              color={data.hiring_rate > 50 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Demographics Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              {genderPieData && (
                <Pie data={genderPieData} options={chartOptions} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hiring Rates by Demographics
              </Typography>
              {demographics && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Gender
                  </Typography>
                  {Object.entries(demographics.gender || {}).map(([gender, data]: [string, any]) => (
                    <Box key={gender} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{gender}</Typography>
                        <Typography variant="body2">
                          {data.hired}/{data.total} ({data.hiring_rate?.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.hiring_rate || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Ethnicity
                  </Typography>
                  {Object.entries(demographics.ethnicity || {}).map(([ethnicity, data]: [string, any]) => (
                    <Box key={ethnicity} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{ethnicity}</Typography>
                        <Typography variant="body2">
                          {data.hired}/{data.total} ({data.hiring_rate?.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.hiring_rate || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Timeline Tab */}
      <TabPanel value={currentTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hiring Timeline
          </Typography>
          {timelineChartData && (
            <Line data={timelineChartData} options={chartOptions} />
          )}
        </Paper>
      </TabPanel>

      {/* Score Analysis Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {scores && Object.entries(scores).map(([scoreType, data]: [string, any]) => (
            <Grid item xs={12} md={6} key={scoreType}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {scoreType.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Average: {data.average} | Range: {data.min} - {data.max}
                </Typography>
                {data.distribution && (
                  <Box>
                    {Object.entries(data.distribution).map(([range, count]: [string, any]) => (
                      <Box key={range} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{range}</Typography>
                          <Typography variant="body2">{count} candidates</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / data.count) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Conversion Funnel Tab */}
      <TabPanel value={currentTab} index={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hiring Conversion Funnel
          </Typography>
          {funnel && (
            <Grid container spacing={2}>
              {Object.entries(funnel.funnel_stages || {}).map(([stage, count]: [string, any]) => (
                <Grid item xs={12} sm={6} md={4} key={stage}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {stage.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="h5">
                        {count}
                      </Typography>
                      {funnel.conversion_rates && funnel.conversion_rates[`${stage}_rate`] && (
                        <Typography variant="body2" color="textSecondary">
                          {funnel.conversion_rates[`${stage}_rate`].toFixed(1)}% conversion
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </TabPanel>

      {/* Predictive Analytics Tab */}
      <TabPanel value={currentTab} index={5}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : predictiveMetrics ? (
            <>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Time-to-Hire Analysis
                  </Typography>
                  {predictiveMetrics.time_to_hire && (
                    <Line
                      data={{
                        labels: predictiveMetrics.time_to_hire.trend.map((item: any) => item.month),
                        datasets: [
                          {
                            label: 'Average Days to Hire',
                            data: predictiveMetrics.time_to_hire.trend.map((item: any) => item.avg_days),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' as const } }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Success Rate Predictions
                  </Typography>
                  {predictiveMetrics.success_rate_model && (
                    <Bar
                      data={{
                        labels: predictiveMetrics.success_rate_model.feature_importance.map((item: any) => item.feature),
                        datasets: [
                          {
                            label: 'Importance Score',
                            data: predictiveMetrics.success_rate_model.feature_importance.map((item: any) => item.importance),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' as const } }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No predictive analytics data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Interviewer Performance Tab */}
      <TabPanel value={currentTab} index={6}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : interviewerPerformance ? (
            <>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Interviewer Efficiency
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Interviewer</TableCell>
                          <TableCell>Efficiency Score</TableCell>
                          <TableCell>Bias Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {interviewerPerformance.efficiency_ratings?.map((interviewer: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{interviewer.interviewer_name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={`${interviewer.efficiency_score.toFixed(1)}%`}
                                color={interviewer.efficiency_score > 75 ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${interviewer.bias_score.toFixed(1)}%`}
                                color={interviewer.bias_score < 25 ? 'success' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quality Metrics
                  </Typography>
                  {interviewerPerformance.quality_metrics && (
                    <Radar
                      data={{
                        labels: ['Accuracy', 'Consistency', 'Feedback Quality', 'Time Management', 'Candidate Experience'],
                        datasets: [
                          {
                            label: 'Average Performance',
                            data: [
                              interviewerPerformance.quality_metrics.accuracy_rate,
                              interviewerPerformance.quality_metrics.consistency_score,
                              interviewerPerformance.quality_metrics.feedback_quality,
                              interviewerPerformance.quality_metrics.time_management,
                              interviewerPerformance.quality_metrics.candidate_satisfaction
                            ],
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          r: {
                            angleLines: { display: false },
                            suggestedMin: 0,
                            suggestedMax: 100
                          }
                        }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No interviewer performance data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Cost Analysis Tab */}
      <TabPanel value={currentTab} index={7}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : costAnalysis ? (
            <>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Cost per Hire Trends
                  </Typography>
                  {costAnalysis.cost_per_hire && (
                    <Line
                      data={{
                        labels: costAnalysis.cost_per_hire.monthly_trends.map((item: any) => item.month),
                        datasets: [
                          {
                            label: 'Cost per Hire ($)',
                            data: costAnalysis.cost_per_hire.monthly_trends.map((item: any) => item.cost_per_hire),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' as const } },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '$' + value;
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    ROI Analysis
                  </Typography>
                  {costAnalysis.roi_analysis && (
                    <Box>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {costAnalysis.roi_analysis.total_roi.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total ROI
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        ${costAnalysis.roi_analysis.cost_savings.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Annual Cost Savings
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No cost analysis data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Funnel Optimization Tab */}
      <TabPanel value={currentTab} index={8}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : funnelAnalysis ? (
            <>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Conversion Optimization
                  </Typography>
                  {funnelAnalysis.conversion_optimization && (
                    <Bar
                      data={{
                        labels: funnelAnalysis.conversion_optimization.stage_improvements.map((item: any) => item.stage),
                        datasets: [
                          {
                            label: 'Current Rate (%)',
                            data: funnelAnalysis.conversion_optimization.stage_improvements.map((item: any) => item.current_rate),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)'
                          },
                          {
                            label: 'Potential Rate (%)',
                            data: funnelAnalysis.conversion_optimization.stage_improvements.map((item: any) => item.potential_rate),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' as const } }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Bottleneck Analysis
                  </Typography>
                  {funnelAnalysis.bottleneck_analysis?.map((bottleneck: any, index: number) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{bottleneck.stage}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          Drop-off Rate: {bottleneck.drop_off_rate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Recommendations:
                        </Typography>
                        <ul>
                          {bottleneck.recommendations.map((rec: string, i: number) => (
                            <li key={i}>
                              <Typography variant="body2">{rec}</Typography>
                            </li>
                          ))}
                        </ul>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No funnel analysis data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Question Effectiveness Tab */}
      <TabPanel value={currentTab} index={9}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : questionEffectiveness ? (
            <>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Question Performance Analysis
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Question</TableCell>
                          <TableCell>Correlation Score</TableCell>
                          <TableCell>Difficulty</TableCell>
                          <TableCell>Usage Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {questionEffectiveness.correlation_analysis?.slice(0, 10).map((question: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Typography variant="body2" noWrap>
                                {question.question_text}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={question.correlation_score.toFixed(2)}
                                color={question.correlation_score > 0.7 ? 'success' : question.correlation_score > 0.4 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell>{question.difficulty_level}</TableCell>
                            <TableCell>{question.usage_frequency}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Question Categories
                  </Typography>
                  {questionEffectiveness.question_categories && (
                    <Pie
                      data={{
                        labels: Object.keys(questionEffectiveness.question_categories),
                        datasets: [
                          {
                            data: Object.values(questionEffectiveness.question_categories),
                            backgroundColor: [
                              '#FF6384',
                              '#36A2EB',
                              '#FFCE56',
                              '#4BC0C0',
                              '#9966FF',
                              '#FF9F40',
                            ]
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'bottom' as const } }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No question effectiveness data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Seasonal Trends Tab */}
      <TabPanel value={currentTab} index={10}>
        <Grid container spacing={3}>
          {advancedLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : seasonalTrends ? (
            <>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Seasonal Hiring Trends
                  </Typography>
                  {seasonalTrends.quarterly_analysis && (
                    <Bar
                      data={{
                        labels: seasonalTrends.quarterly_analysis.map((item: any) => `Q${item.quarter} ${item.year}`),
                        datasets: [
                          {
                            label: 'Applications',
                            data: seasonalTrends.quarterly_analysis.map((item: any) => item.applications),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)'
                          },
                          {
                            label: 'Hires',
                            data: seasonalTrends.quarterly_analysis.map((item: any) => item.hires),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' as const } }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Predictions for Next Quarter
                  </Typography>
                  {seasonalTrends.predictions && (
                    <Box>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {seasonalTrends.predictions.expected_applications}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Expected Applications
                      </Typography>
                      <Typography variant="h4" color="secondary" sx={{ mt: 2 }}>
                        {seasonalTrends.predictions.expected_hires}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expected Hires
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Confidence: {seasonalTrends.predictions.confidence_level}%
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No seasonal trends data available</Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
}

export default Analytics;
