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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Avatar,
  styled,
  keyframes,
  alpha,
  useTheme,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ChartTooltip
);

// Enhanced styled components
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: '16px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .card-icon': {
      animation: `${pulseAnimation} 2s infinite`,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  transition: 'all 0.3s ease',
  borderRadius: '16px',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
    transition: 'all 0.3s ease',
  },
  '&:hover::after': {
    top: '-25%',
    right: '-25%',
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha('#fff', 0.1)} 0%, ${alpha('#fff', 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#fff', 0.2)}`,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(145deg, ${alpha('#fff', 0.15)} 0%, ${alpha('#fff', 0.1)} 100%)`,
    transform: 'translateY(-2px)',
  },
}));

// Interfaces
interface AnalyticsData {
  summary: any;
  positions: any[] | null;
  demographics: any;
  timeline: any[] | null;
  scores: any;
  funnel: any[] | null;
  predictiveMetrics: any;
  interviewerPerformance: any;
  costAnalysis: any;
  questionEffectiveness: any;
  seasonalTrends: any;
}

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

function ConsolidatedAnalytics() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('last_30_days');
  
  // Utility function to safely convert values to numbers
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return !isNaN(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
  };

  // Utility function to safely format numbers
  const safeFormat = (value: any, decimals: number = 1): string => {
    const num = safeNumber(value);
    return num.toFixed(decimals);
  };
  
  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    summary: null,
    positions: null,
    demographics: null,
    timeline: null,
    scores: null,
    funnel: null,
    predictiveMetrics: null,
    interviewerPerformance: null,
    costAnalysis: null,
    questionEffectiveness: null,
    seasonalTrends: null,
  });

  // Dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllAnalytics();
    // Set up real-time data refresh
    const interval = setInterval(fetchAllAnalytics, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try backend first, fall back to mock data
      await Promise.all([
        fetchBasicAnalytics(),
        fetchAdvancedAnalytics(),
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchBasicAnalytics = async () => {
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
        endpoints.map(endpoint => fetch(`http://127.0.0.1:8000${endpoint}`))
      );

      if (responses.every(response => response.ok)) {
        const data = await Promise.all(responses.map(response => response.json()));
        
        setAnalyticsData(prev => ({
          ...prev,
          summary: data[0],
          positions: data[1],
          demographics: data[2],
          timeline: data[3],
          scores: data[4],
          funnel: data[5],
        }));
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Using mock data for basic analytics');
      loadMockBasicData();
    }
  };

  const fetchAdvancedAnalytics = async () => {
    try {
      const endpoints = [
        '/api/v1/analytics/predictive-metrics',
        '/api/v1/analytics/interviewer-performance',
        '/api/v1/analytics/cost-analysis',
        '/api/v1/analytics/question-effectiveness',
        '/api/v1/analytics/seasonal-trends',
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(`http://127.0.0.1:8000${endpoint}`))
      );

      if (responses.every(response => response.ok)) {
        const data = await Promise.all(responses.map(response => response.json()));
        
        setAnalyticsData(prev => ({
          ...prev,
          predictiveMetrics: data[0],
          interviewerPerformance: data[1],
          costAnalysis: data[2],
          questionEffectiveness: data[3],
          seasonalTrends: data[4],
        }));
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Using mock data for advanced analytics');
      loadMockAdvancedData();
    }
  };

  const loadMockBasicData = () => {
    setAnalyticsData(prev => ({
      ...prev,
      summary: {
        total_candidates: 1247,
        total_interviews: 856,
        total_offers: 134,
        total_hires: 98,
        conversion_rate: 7.86,
        avg_time_to_hire: 21.5,
        avg_interview_score: 3.7,
        active_positions: 23
      },
      positions: [
        { position: 'Software Engineer', candidates: 234, interviews: 156, offers: 23, hires: 18 },
        { position: 'Product Manager', candidates: 189, interviews: 112, offers: 18, hires: 12 },
        { position: 'Data Scientist', candidates: 167, interviews: 98, offers: 15, hires: 11 },
        { position: 'UX Designer', candidates: 143, interviews: 87, offers: 12, hires: 9 },
        { position: 'DevOps Engineer', candidates: 98, interviews: 67, offers: 8, hires: 6 }
      ],
      demographics: {
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
      },
      timeline: [
        { month: 'Jan', applications: 156, interviews: 89, hires: 12 },
        { month: 'Feb', applications: 134, interviews: 76, hires: 9 },
        { month: 'Mar', applications: 178, interviews: 98, hires: 15 },
        { month: 'Apr', applications: 145, interviews: 87, hires: 11 },
        { month: 'May', applications: 167, interviews: 92, hires: 13 },
        { month: 'Jun', applications: 189, interviews: 103, hires: 16 }
      ],
      scores: {
        technical: 3.8,
        communication: 3.6,
        cultural_fit: 3.9,
        problem_solving: 3.7,
        leadership: 3.5
      },
      funnel: [
        { stage: 'Application', count: 1247, percentage: 100 },
        { stage: 'Resume Screen', count: 856, percentage: 68.6 },
        { stage: 'Phone Screen', count: 634, percentage: 50.8 },
        { stage: 'Technical Interview', count: 423, percentage: 33.9 },
        { stage: 'Final Interview', count: 234, percentage: 18.8 },
        { stage: 'Offer', count: 134, percentage: 10.7 },
        { stage: 'Hire', count: 98, percentage: 7.9 }
      ]
    }));
  };

  const loadMockAdvancedData = () => {
    setAnalyticsData(prev => ({
      ...prev,
      predictiveMetrics: {
        time_to_hire: {
          average_days: 21.5,
          median_days: 18.0,
          fastest_hire: 7,
          slowest_hire: 45
        },
        source_effectiveness: {
          'LinkedIn': { success_rate: 23.5, total_candidates: 450 },
          'Indeed': { success_rate: 18.2, total_candidates: 320 },
          'Company Website': { success_rate: 31.8, total_candidates: 180 },
          'Referrals': { success_rate: 42.1, total_candidates: 125 }
        },
        conversion_rates: {
          interview_to_offer: 65.3,
          application_to_interview: 45.7,
          offer_to_hire: 73.1
        }
      },
      interviewerPerformance: {
        top_performers: [
          ['John Smith', { hire_rate: 85.2, avg_score: 4.2, interviews_conducted: 45 }],
          ['Sarah Johnson', { hire_rate: 78.9, avg_score: 4.0, interviews_conducted: 38 }],
          ['Mike Chen', { hire_rate: 74.3, avg_score: 3.9, interviews_conducted: 52 }]
        ],
        metrics_summary: {
          total_interviewers: 15,
          avg_interviews_per_interviewer: 42.3,
          avg_hire_success_rate: 68.7
        }
      },
      costAnalysis: {
        overall_metrics: {
          cost_per_hire: 3450,
          total_hiring_costs: 338100,
          total_hires: 98,
          average_time_to_hire: 21.5,
          cost_efficiency_score: 'Good'
        },
        cost_breakdown: {
          'Recruiting Software': 45000,
          'Job Board Postings': 28500,
          'Agency Fees': 125000,
          'Internal Resources': 89600,
          'Travel & Expenses': 12000,
          'Background Checks': 8000
        }
      }
    }));
  };

  const loadMockData = () => {
    loadMockBasicData();
    loadMockAdvancedData();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const exportReport = async () => {
    // Implementation for export functionality
    console.log('Exporting report...');
    setExportDialogOpen(false);
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      x: {
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  // Chart data preparation
  const getPositionChartData = () => {
    if (!analyticsData.positions || !Array.isArray(analyticsData.positions)) return null;
    
    return {
      labels: analyticsData.positions.map((p: any) => p.position || 'Unknown'),
      datasets: [
        {
          label: 'Candidates',
          data: analyticsData.positions.map((p: any) => safeNumber(p.candidates)),
          backgroundColor: alpha(theme.palette.primary.main, 0.8),
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
        },
        {
          label: 'Hires',
          data: analyticsData.positions.map((p: any) => safeNumber(p.hires)),
          backgroundColor: alpha(theme.palette.success.main, 0.8),
          borderColor: theme.palette.success.main,
          borderWidth: 1,
        },
      ],
    };
  };

  const getTimelineChartData = () => {
    if (!analyticsData.timeline || !Array.isArray(analyticsData.timeline)) return null;
    
    return {
      labels: analyticsData.timeline.map((t: any) => t.month || 'Unknown'),
      datasets: [
        {
          label: 'Applications',
          data: analyticsData.timeline.map((t: any) => safeNumber(t.applications)),
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          tension: 0.4,
        },
        {
          label: 'Interviews',
          data: analyticsData.timeline.map((t: any) => safeNumber(t.interviews)),
          borderColor: theme.palette.secondary.main,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          tension: 0.4,
        },
        {
          label: 'Hires',
          data: analyticsData.timeline.map((t: any) => safeNumber(t.hires)),
          borderColor: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          tension: 0.4,
        },
      ],
    };
  };

  const getDemographicsChartData = () => {
    if (!analyticsData.demographics || !analyticsData.demographics.gender) return null;
    
    return {
      labels: Object.keys(analyticsData.demographics.gender),
      datasets: [
        {
          data: Object.values(analyticsData.demographics.gender).map((value: any) => safeNumber(value)),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.warning.main,
          ],
          borderWidth: 2,
          borderColor: theme.palette.background.paper,
        },
      ],
    };
  };

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  Total Candidates
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {analyticsData.summary?.total_candidates?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  Total Interviews
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {analyticsData.summary?.total_interviews?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <StarIcon />
              </Avatar>
              <Box>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  Success Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {safeFormat(analyticsData.summary?.conversion_rate)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  Avg Time to Hire
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {safeFormat(analyticsData.summary?.avg_time_to_hire, 0)} days
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MetricCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Analytics Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="last_7_days">Last 7 Days</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="last_90_days">Last 90 Days</MenuItem>
              <MenuItem value="last_year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAllAnalytics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            sx={{ borderRadius: '25px' }}
          >
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {!loading && renderSummaryCards()}

      {/* Tabs */}
      {!loading && (
        <GlassCard sx={{ width: '100%', mb: 3, p: 0, overflow: 'hidden' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateY(-2px)',
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            <Tab label="Position Analysis" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Demographics" icon={<GroupIcon />} iconPosition="start" />
            <Tab label="Timeline" icon={<CalendarIcon />} iconPosition="start" />
            <Tab label="Score Analysis" icon={<SpeedIcon />} iconPosition="start" />
            <Tab label="Conversion Funnel" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Predictive Analytics" icon={<PsychologyIcon />} iconPosition="start" />
            <Tab label="Performance" icon={<StarIcon />} iconPosition="start" />
            <Tab label="Cost Analysis" icon={<MoneyIcon />} iconPosition="start" />
          </Tabs>
        </GlassCard>
      )}

      {/* Tab Panels */}
      
      {/* Position Analysis */}
      <TabPanel value={currentTab} index={0}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon color="primary" />
                    Candidates by Position
                  </Typography>
                  {getPositionChartData() && (
                    <Box sx={{ height: 400 }}>
                      <Bar data={getPositionChartData()!} options={{ ...chartOptions, maintainAspectRatio: false }} />
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Demographics */}
      <TabPanel value={currentTab} index={1}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
                  {getDemographicsChartData() && (
                    <Box sx={{ height: 300 }}>
                      <Doughnut data={getDemographicsChartData()!} options={{ maintainAspectRatio: false }} />
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Age Groups</Typography>
                  {analyticsData.demographics && analyticsData.demographics.age_groups && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Age Group</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(analyticsData.demographics.age_groups).map(([age, percentage]) => (
                            <TableRow key={age}>
                              <TableCell>{age}</TableCell>
                              <TableCell align="right">
                                <Chip label={`${safeFormat(percentage)}%`} size="small" color="primary" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Timeline */}
      <TabPanel value={currentTab} index={2}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon color="primary" />
                    Hiring Timeline Trends
                  </Typography>
                  {getTimelineChartData() && (
                    <Box sx={{ height: 400 }}>
                      <Line data={getTimelineChartData()!} options={{ ...chartOptions, maintainAspectRatio: false }} />
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Score Analysis */}
      <TabPanel value={currentTab} index={3}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Interview Score Breakdown</Typography>
                  {analyticsData.scores && (
                    <Grid container spacing={2}>
                      {Object.entries(analyticsData.scores).map(([criteria, score]) => {
                        const numericScore = safeNumber(score);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={criteria}>
                            <Box sx={{ p: 2 }}>
                              <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                                {criteria.replace(/_/g, ' ')}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(numericScore * 20, 100)}
                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                              />
                              <Typography variant="h6" color="primary">
                                {safeFormat(numericScore)}/5.0
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                  {!analyticsData.scores && (
                    <Alert severity="info">No score data available</Alert>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Conversion Funnel */}
      <TabPanel value={currentTab} index={4}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recruitment Funnel</Typography>
                  {analyticsData.funnel && Array.isArray(analyticsData.funnel) && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Stage</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Conversion Rate</TableCell>
                            <TableCell align="right">Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsData.funnel.map((stage: any, index: number) => (
                            <TableRow key={stage.stage || index}>
                              <TableCell>{stage.stage || 'Unknown'}</TableCell>
                              <TableCell align="right">{safeNumber(stage.count).toLocaleString()}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${safeFormat(stage.percentage)}%`}
                                  color={safeNumber(stage.percentage) > 50 ? 'success' : safeNumber(stage.percentage) > 20 ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ width: 150 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(safeNumber(stage.percentage), 100)}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {(!analyticsData.funnel || !Array.isArray(analyticsData.funnel)) && (
                    <Alert severity="info">No funnel data available</Alert>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Predictive Analytics */}
      <TabPanel value={currentTab} index={5}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            {analyticsData.predictiveMetrics && (
              <>
                <Grid item xs={12} md={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon color="primary" />
                        Time to Hire Analysis
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Average</Typography>
                          <Typography variant="h4" color="primary">
                            {safeFormat(analyticsData.predictiveMetrics.time_to_hire?.average_days, 0)} days
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Median</Typography>
                          <Typography variant="h4" color="secondary">
                            {safeFormat(analyticsData.predictiveMetrics.time_to_hire?.median_days, 0)} days
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </StyledCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Source Effectiveness</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Source</TableCell>
                              <TableCell align="right">Success Rate</TableCell>
                              <TableCell align="right">Candidates</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analyticsData.predictiveMetrics.source_effectiveness && Object.entries(analyticsData.predictiveMetrics.source_effectiveness).map(([source, data]: [string, any]) => (
                              <TableRow key={source}>
                                <TableCell>{source}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={`${safeFormat(data?.success_rate)}%`}
                                    color={safeNumber(data?.success_rate) > 30 ? 'success' : safeNumber(data?.success_rate) > 20 ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">{safeNumber(data?.total_candidates).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </>
            )}
          </Grid>
        </Fade>
      </TabPanel>

      {/* Performance */}
      <TabPanel value={currentTab} index={6}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            {analyticsData.interviewerPerformance && analyticsData.interviewerPerformance.top_performers && Array.isArray(analyticsData.interviewerPerformance.top_performers) && (
              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Top Performing Interviewers</Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Interviewer</TableCell>
                            <TableCell align="right">Hire Rate</TableCell>
                            <TableCell align="right">Avg Score</TableCell>
                            <TableCell align="right">Interviews</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsData.interviewerPerformance.top_performers.map(([name, data]: [string, any], index: number) => (
                            <TableRow key={typeof name === 'string' ? name : index}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {typeof name === 'string' ? name.split(' ').map(n => n[0]).join('') : 'N/A'}
                                  </Avatar>
                                  <Typography>{typeof name === 'string' ? name : 'Unknown'}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Chip label={`${safeFormat(data?.hire_rate)}%`} color="success" size="small" />
                              </TableCell>
                              <TableCell align="right">{safeFormat(data?.avg_score)}</TableCell>
                              <TableCell align="right">{safeNumber(data?.interviews_conducted, 0).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </StyledCard>
              </Grid>
            )}
            {(!analyticsData.interviewerPerformance || !analyticsData.interviewerPerformance.top_performers || !Array.isArray(analyticsData.interviewerPerformance.top_performers)) && (
              <Grid item xs={12}>
                <Alert severity="info">No interviewer performance data available</Alert>
              </Grid>
            )}
          </Grid>
        </Fade>
      </TabPanel>

      {/* Cost Analysis */}
      <TabPanel value={currentTab} index={7}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            {analyticsData.costAnalysis && analyticsData.costAnalysis.cost_breakdown && analyticsData.costAnalysis.overall_metrics && (
              <>
                <Grid item xs={12} md={8}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(analyticsData.costAnalysis.cost_breakdown).map(([category, amount]) => {
                              const numericAmount = safeNumber(amount);
                              const totalCosts = safeNumber(analyticsData.costAnalysis?.overall_metrics?.total_hiring_costs);
                              const percentage = totalCosts > 0 ? (numericAmount / totalCosts * 100) : 0;
                              return (
                                <TableRow key={category}>
                                  <TableCell>{category}</TableCell>
                                  <TableCell align="right">${numericAmount.toLocaleString()}</TableCell>
                                  <TableCell align="right">
                                    <Chip label={`${safeFormat(percentage)}%`} size="small" />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>

                <Grid item xs={12} md={4}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Key Metrics</Typography>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Cost per Hire</Typography>
                          <Typography variant="h4" color="primary">
                            ${safeNumber(analyticsData.costAnalysis?.overall_metrics?.cost_per_hire).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Total Costs</Typography>
                          <Typography variant="h5">
                            ${safeNumber(analyticsData.costAnalysis?.overall_metrics?.total_hiring_costs).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Efficiency Score</Typography>
                          <Chip 
                            label={analyticsData.costAnalysis?.overall_metrics?.cost_efficiency_score || 'N/A'}
                            color="success"
                            size="medium"
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </>
            )}
            {(!analyticsData.costAnalysis || !analyticsData.costAnalysis.cost_breakdown || !analyticsData.costAnalysis.overall_metrics) && (
              <Grid item xs={12}>
                <Alert severity="info">No cost analysis data available</Alert>
              </Grid>
            )}
          </Grid>
        </Fade>
      </TabPanel>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Format</InputLabel>
                <Select defaultValue="pdf" label="Report Format">
                  <MenuItem value="pdf">PDF Report</MenuItem>
                  <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                  <MenuItem value="csv">CSV Data</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select defaultValue="current" label="Date Range">
                  <MenuItem value="current">Current Period</MenuItem>
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="last_quarter">Last Quarter</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={exportReport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConsolidatedAnalytics;
