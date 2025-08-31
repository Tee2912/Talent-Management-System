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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Grow,
  Slide,
  Zoom,
  Avatar,
  styled,
  keyframes,
  alpha,
  useTheme,
  Stack,
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
  Analytics as AnalyticsIcon,
  Assessment as ReportsIcon,
  Create as CreateIcon,
  Visibility as ViewIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
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
} from 'chart.js';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
);

// Styled components for fancy UI
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    transform: scale(1.05);
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
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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

const AnimatedChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  border: 0,
  borderRadius: '25px',
  boxShadow: `0 3px 15px 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px 4px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

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
  const theme = useTheme();
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

  // Enhanced Reports states
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [customReports, setCustomReports] = useState<any>(null);
  const [kpiDashboard, setKpiDashboard] = useState<any>(null);
  const [realTimeDashboard, setRealTimeDashboard] = useState<any>(null);

  // Dialog states
  const [createReportDialogOpen, setCreateReportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Form states
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    frequency: 'weekly',
    metrics: [],
    recipients: ''
  });
  const [exportForm, setExportForm] = useState({
    format: 'pdf',
    report_type: 'executive_summary',
    date_range: '1month'
  });

  useEffect(() => {
    fetchAnalyticsData();
    fetchEnhancedReportsData();
    
    // Set up real-time data refresh
    const interval = setInterval(fetchRealTimeData, 30000); // 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchEnhancedReportsData = async () => {
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const [
          summaryRes,
          benchmarksRes,
          reportsRes,
          kpiRes
        ] = await Promise.all([
          fetch('/api/v1/reports/executive-summary'),
          fetch('/api/v1/reports/benchmarks'),
          fetch('/api/v1/reports/custom-reports'),
          fetch('/api/v1/reports/kpi-dashboard')
        ]);

        if (summaryRes.ok && benchmarksRes.ok && reportsRes.ok && kpiRes.ok) {
          const [
            summaryData,
            benchmarksData,
            reportsData,
            kpiData
          ] = await Promise.all([
            summaryRes.json(),
            benchmarksRes.json(),
            reportsRes.json(),
            kpiRes.json()
          ]);

          setExecutiveSummary(summaryData.summary);
          setBenchmarks(benchmarksData.benchmarks);
          setCustomReports(reportsData.reports);
          setKpiDashboard(kpiData.dashboard);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for enhanced reports');
        
        const mockExecutiveSummary = {
          total_candidates: 1247,
          total_interviews: 856,
          total_hires: 98,
          conversion_rate: 7.86,
          average_time_to_hire: 21.5,
          cost_per_hire: 3200,
          quality_of_hire_score: 4.2,
          interviewer_efficiency: 87.5,
          diversity_metrics: {
            gender_distribution: { male: 52, female: 48 },
            ethnicity_distribution: { caucasian: 45, asian: 25, hispanic: 15, african_american: 10, other: 5 }
          }
        };

        const mockBenchmarks = {
          company_vs_industry: {
            time_to_hire: { company: 21.5, industry: 28.3, performance: "23% better than industry" },
            conversion_rate: { company: 7.86, industry: 6.2, performance: "27% better than industry" },
            cost_per_hire: { company: 3200, industry: 4100, performance: "22% better than industry" }
          }
        };

        const mockCustomReports = [
          {
            id: 1,
            name: "Weekly Hiring Report",
            description: "Weekly summary of hiring activities",
            frequency: "weekly",
            last_generated: "2024-01-22T09:00:00"
          },
          {
            id: 2,
            name: "Diversity Analytics",
            description: "Detailed diversity and inclusion metrics",
            frequency: "monthly",
            last_generated: "2024-01-21T16:00:00"
          }
        ];

        const mockKpiDashboard = {
          primary_kpis: [
            { name: "Time to Hire", value: 21.5, target: 25, status: "exceeding", unit: "days" },
            { name: "Conversion Rate", value: 7.86, target: 7.0, status: "exceeding", unit: "%" },
            { name: "Quality of Hire", value: 4.2, target: 4.0, status: "on_track", unit: "/5" },
            { name: "Cost per Hire", value: 3200, target: 3500, status: "exceeding", unit: "$" }
          ]
        };

        setExecutiveSummary(mockExecutiveSummary);
        setBenchmarks(mockBenchmarks);
        setCustomReports(mockCustomReports);
        setKpiDashboard(mockKpiDashboard);
      }
      
      await fetchRealTimeData();
    } catch (error) {
      console.error('Failed to fetch enhanced reports data:', error);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/v1/reports/real-time-dashboard');
      if (response.ok) {
        const data = await response.json();
        setRealTimeDashboard(data.dashboard);
      } else {
        // Mock real-time data
        const mockRealTimeData = {
          live_metrics: {
            active_interviews: 5,
            applications_today: 23,
            interviews_scheduled_today: 8,
            offers_pending: 12
          }
        };
        setRealTimeDashboard(mockRealTimeData);
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  const handleCreateReport = async () => {
    try {
      const response = await fetch('/api/v1/reports/custom-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          recipients: reportForm.recipients.split(',').map((email: string) => email.trim())
        })
      });

      if (response.ok) {
        setCreateReportDialogOpen(false);
        setReportForm({ name: '', description: '', frequency: 'weekly', metrics: [], recipients: '' });
        fetchEnhancedReportsData();
        alert('Custom report created successfully!');
      } else {
        alert('Failed to create report');
      }
    } catch (error) {
      alert('Error creating report');
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/v1/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportForm)
      });

      const data = await response.json();
      if (data.success) {
        setExportDialogOpen(false);
        alert(`Report export initiated. Download will be available at: ${data.export.download_url}`);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      alert('Error exporting report');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Fetch advanced analytics when switching to advanced tabs
    if (newValue >= 6 && !predictiveMetrics) {
      fetchAdvancedAnalytics();
    }
    
    // Fetch enhanced reports data when switching to enhanced reports tabs
    if ((newValue >= 11 && newValue <= 14) && !executiveSummary) {
      fetchEnhancedReportsData();
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
    <Box sx={{ 
      p: 3,
      background: `linear-gradient(135deg, ${alpha('#f5f7fa', 0.8)} 0%, ${alpha('#c3cfe2', 0.4)} 100%)`,
      minHeight: '100vh',
    }}>
      <Fade in timeout={800}>
        <Box>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
            }}
          >
            <Avatar 
              className="card-icon"
              sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            Analytics & Enhanced Reporting
          </Typography>

          {/* Real-time Metrics Summary */}
          {realTimeDashboard && (
            <Grow in timeout={1000}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}>
                          <ScheduleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {realTimeDashboard.live_metrics?.active_interviews || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Active Interviews
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}>
                          <GroupIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {realTimeDashboard.live_metrics?.applications_today || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Applications Today
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}>
                          <CalendarIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {realTimeDashboard.live_metrics?.interviews_scheduled_today || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Interviews Scheduled
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}>
                          <MoneyIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {realTimeDashboard.live_metrics?.offers_pending || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Pending Offers
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </MetricCard>
                </Grid>
              </Grid>
            </Grow>
          )}

          {/* Action Buttons */}
          <Slide direction="up" in timeout={1200}>
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <GradientButton
                startIcon={<CreateIcon />}
                onClick={() => setCreateReportDialogOpen(true)}
              >
                Create Custom Report
              </GradientButton>
              <GradientButton
                startIcon={<ExportIcon />}
                onClick={() => setExportDialogOpen(true)}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.success.main} 90%)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.success.dark} 90%)`,
                  },
                }}
              >
                Export Report
              </GradientButton>
              <GradientButton
                startIcon={<ScheduleIcon />}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.info.main} 30%, ${theme.palette.primary.main} 90%)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.info.dark} 30%, ${theme.palette.primary.dark} 90%)`,
                  },
                }}
              >
                Schedule Report
              </GradientButton>
              <GradientButton
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchAnalyticsData();
                  fetchEnhancedReportsData();
                }}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.grey[600]} 30%, ${theme.palette.grey[800]} 90%)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.grey[700]} 30%, ${theme.palette.grey[900]} 90%)`,
                  },
                }}
              >
                Refresh Data
              </GradientButton>
            </Box>
          </Slide>

          {/* Summary Cards */}
          {summary && (
            <Zoom in timeout={1400}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className="card-icon" sx={{ bgcolor: 'primary.main' }}>
                          <GroupIcon />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" variant="body2" gutterBottom>
                            Total Candidates
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {summary.total_candidates}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className="card-icon" sx={{ bgcolor: 'success.main' }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" variant="body2" gutterBottom>
                            Total Hired
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {summary.total_hired}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className="card-icon" sx={{ bgcolor: 'warning.main' }}>
                          <SpeedIcon />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" variant="body2" gutterBottom>
                            Hiring Rate
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {summary.hiring_rate?.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className="card-icon" sx={{ bgcolor: 'secondary.main' }}>
                          <BarChartIcon />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" variant="body2" gutterBottom>
                            Avg Final Score
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="secondary.main">
                            {summary.average_scores?.final_score?.toFixed(1) || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Zoom>
          )}

          {/* Tabs */}
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
              <Tab label="Predictive Analytics" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Interviewer Performance" icon={<ScheduleIcon />} iconPosition="start" />
              <Tab label="Cost Analysis" icon={<MoneyIcon />} iconPosition="start" />
              <Tab label="Funnel Optimization" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Question Effectiveness" icon={<QuestionIcon />} iconPosition="start" />
              <Tab label="Seasonal Trends" icon={<CalendarIcon />} iconPosition="start" />
              <Tab label="Executive Summary" icon={<ReportsIcon />} iconPosition="start" />
              <Tab label="KPI Dashboard" icon={<SpeedIcon />} iconPosition="start" />
              <Tab label="Benchmarks" icon={<BarChartIcon />} iconPosition="start" />
              <Tab label="Custom Reports" icon={<CreateIcon />} iconPosition="start" />
            </Tabs>
          </GlassCard>

      {/* Position Analysis Tab */}
      <TabPanel value={currentTab} index={0}>
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <StyledCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600,
                }}>
                  <BarChartIcon />
                  Candidates by Position
                </Typography>
                {positionChartData && (
                  <Box sx={{ height: 400 }}>
                    <Bar data={positionChartData} options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                          },
                        },
                      },
                    }} />
                  </Box>
                )}
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'secondary.main',
                  fontWeight: 600,
                }}>
                  <SpeedIcon />
                  Position Details
                </Typography>
                {positions && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(positions).map(([position, data]: [string, any]) => (
                          <TableRow key={position} hover>
                            <TableCell component="th" scope="row">
                              {position}
                            </TableCell>
                            <TableCell align="right">
                              <AnimatedChip
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
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
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
      
      {/* Executive Summary Tab */}
      <TabPanel value={currentTab} index={11}>
        {executiveSummary && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon /> Hiring Metrics
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {executiveSummary.total_hires}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total Hires
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.total_candidates}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Candidates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon /> Efficiency
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {executiveSummary.average_time_to_hire}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Avg. Time to Hire (days)
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.interviewer_efficiency}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Interviewer Efficiency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon /> Cost & Quality
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ${executiveSummary.cost_per_hire?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Cost per Hire
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.quality_of_hire_score}/5
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Quality of Hire
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* KPI Dashboard Tab */}
      <TabPanel value={currentTab} index={12}>
        {kpiDashboard && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Primary KPIs</Typography>
            </Grid>
            {kpiDashboard.primary_kpis?.map((kpi: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {kpi.name}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {kpi.value} {kpi.unit}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Target: {kpi.target} {kpi.unit}
                    </Typography>
                    <Chip
                      label={kpi.status}
                      color={
                        kpi.status === 'exceeding' ? 'success' :
                        kpi.status === 'on_track' ? 'primary' : 'warning'
                      }
                      size="small"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(kpi.value / kpi.target) * 100}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Benchmarks Tab */}
      <TabPanel value={currentTab} index={13}>
        {benchmarks && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Company vs Industry Benchmarks
                </Typography>
                {benchmarks.company_vs_industry && (
                  <Bar
                    data={{
                      labels: Object.keys(benchmarks.company_vs_industry),
                      datasets: [
                        {
                          label: 'Company',
                          data: Object.values(benchmarks.company_vs_industry).map((item: any) => item.company),
                          backgroundColor: 'rgba(75, 192, 192, 0.6)'
                        },
                        {
                          label: 'Industry Average',
                          data: Object.values(benchmarks.company_vs_industry).map((item: any) => item.industry),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)'
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                {benchmarks.company_vs_industry && Object.entries(benchmarks.company_vs_industry).map(([key, value]: [string, any]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Chip
                      label={value.performance}
                      color={value.performance.includes('better') ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Custom Reports Tab */}
      <TabPanel value={currentTab} index={14}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Last Generated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customReports?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>
                    <Chip label={report.frequency} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(report.last_generated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<ExportIcon />}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Report Dialog */}
      <Dialog open={createReportDialogOpen} onClose={() => setCreateReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Custom Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Report Name"
              value={reportForm.name}
              onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={reportForm.description}
              onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={reportForm.frequency}
                onChange={(e) => setReportForm(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipients (comma-separated emails)"
              value={reportForm.recipients}
              onChange={(e) => setReportForm(prev => ({ ...prev, recipients: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateReport} variant="contained">Create Report</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={exportForm.format}
                onChange={(e) => setExportForm(prev => ({ ...prev, format: e.target.value }))}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={exportForm.report_type}
                onChange={(e) => setExportForm(prev => ({ ...prev, report_type: e.target.value }))}
              >
                <MenuItem value="executive_summary">Executive Summary</MenuItem>
                <MenuItem value="detailed_metrics">Detailed Metrics</MenuItem>
                <MenuItem value="performance_trends">Performance Trends</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={exportForm.date_range}
                onChange={(e) => setExportForm(prev => ({ ...prev, date_range: e.target.value }))}
              >
                <MenuItem value="1week">Last Week</MenuItem>
                <MenuItem value="1month">Last Month</MenuItem>
                <MenuItem value="3months">Last 3 Months</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExportReport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Fade>
    </Box>
  );
}

export default Analytics;
