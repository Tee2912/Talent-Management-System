import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  useTheme,
  alpha,
  styled,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import { 
  People as PeopleIcon,
  Event as InterviewIcon,
  Assessment as AnalyticsIcon,
  AutoAwesome as AIIcon,
  Article as ResumeIcon,
  CalendarToday as CalendarIcon,
  RateReview as FeedbackIcon,
  PsychologyAlt as PsychologyIcon,
  VerifiedUser as BiasDetectionIcon,
  Forum as ChatIcon,
  MarkunreadMailbox as EmailIcon,
  BarChart as TableauIcon,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  Refresh as RefreshIcon,
  OpenInNew,
  AdminPanelSettings as AdminIcon,
  Person as InterviewerIcon,
  ManageAccounts as ManagerIcon,
  Task as TaskIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  CheckCircle,
  HourglassEmpty,
  Star,
  TrendingDown,
  BusinessCenter,
  School,
  Timer,
} from '@mui/icons-material';
import PageTransition from '../components/PageTransition';

// Styled Components
const StatsCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  height: '120px',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
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

const FeatureTile = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  height: '160px',
  cursor: 'pointer',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  borderRadius: '16px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(3deg)',
    },
    '& .feature-button': {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  '& .feature-button': {
    transform: 'translateY(15px)',
    opacity: 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const RoleCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: '20px',
  padding: theme.spacing(3),
  color: 'white',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '100%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
    transform: 'rotate(25deg)',
  },
}));

type UserRole = 'admin' | 'manager' | 'interviewer';
type Priority = 'high' | 'medium' | 'low';

interface RoleConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  greeting: string;
  description: string;
}

interface StatItem {
  count: number;
  change: number;
  trend: 'up' | 'down';
  unit?: string;
}

interface RoleStats {
  [key: string]: StatItem;
}

interface FeatureItem {
  title: string;
  icon: React.ElementType;
  path: string;
  color: string;
  priority: Priority;
}

interface OverallMetrics {
  candidatesByState: {
    new: number;
    technicalEvaluation: number;
    interview: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  hiringRate: number;
  biasScore: number;
  hiringByPosition: {
    [position: string]: number;
  };
}

interface RoleData {
  stats: RoleStats;
  suggestions: string[];
  features: FeatureItem[];
}

const roleConfigs: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'HR Assistant',
    icon: AdminIcon,
    color: '#d32f2f',
    greeting: 'Welcome, HR Assistant',
    description: 'Support hiring managers with candidate management and interview coordination'
  },
  manager: {
    name: 'Hiring Manager',
    icon: ManagerIcon,
    color: '#1976d2',
    greeting: 'Welcome, Manager',
    description: 'Review candidates, schedule interviews, and make hiring decisions'
  },
  interviewer: {
    name: 'Interviewer',
    icon: InterviewerIcon,
    color: '#2e7d32',
    greeting: 'Welcome, Interviewer',
    description: 'Conduct interviews and evaluate candidates assigned to you'
  }
};

// Overall metrics shared across all roles
const overallMetrics: OverallMetrics = {
  candidatesByState: {
    new: 45,
    technicalEvaluation: 28,
    interview: 19,
    offered: 12,
    hired: 8,
    rejected: 23
  },
  hiringRate: 65.4, // percentage
  biasScore: 8.2, // out of 10 (higher is better)
  hiringByPosition: {
    'Software Engineer': 15,
    'Product Manager': 8,
    'Data Scientist': 6,
    'UI/UX Designer': 4,
    'DevOps Engineer': 3,
    'Marketing Specialist': 2
  }
};

// Mock data for different roles
const roleData: Record<UserRole, RoleData> = {
  admin: {
    stats: {
      newResumesToReview: { count: 24, change: +8, trend: 'up' },
      interviewsToSchedule: { count: 15, change: +3, trend: 'up' },
      candidatesToContact: { count: 12, change: -2, trend: 'down' },
      completedScreenings: { count: 18, change: +5, trend: 'up' }
    },
    suggestions: [
      'Review and process 24 new resume submissions',
      'Schedule 15 pending interviews for hiring managers',
      'Contact 12 candidates for follow-up information',
      'Update candidate profiles with latest interview feedback',
      'Prepare weekly hiring summary report for management'
    ],
    features: [
      { title: 'Resume Review Queue', icon: ResumeIcon, path: '/admin/resume-queue', color: '#d32f2f', priority: 'high' },
      { title: 'Candidate Database', icon: PeopleIcon, path: '/candidates', color: '#1976d2', priority: 'high' },
      { title: 'Interview Scheduling', icon: CalendarIcon, path: '/admin/scheduling', color: '#2e7d32', priority: 'high' },
      { title: 'Candidate Communication', icon: EmailIcon, path: '/admin/communications', color: '#ed6c02', priority: 'medium' },
      { title: 'Resume Analyzer', icon: ResumeIcon, path: '/resume-analyzer', color: '#9c27b0', priority: 'medium' },
      { title: 'Hiring Reports', icon: AnalyticsIcon, path: '/admin/reports', color: '#795548', priority: 'low' }
    ]
  },
  manager: {
    stats: {
      myOpenings: { count: 8, change: +2, trend: 'up' },
      pendingReviews: { count: 12, change: -5, trend: 'down' },
      thisWeekInterviews: { count: 15, change: +4, trend: 'up' },
      avgTimeToHire: { count: 18, change: -3, trend: 'down', unit: 'days' }
    },
    suggestions: [
      'Review 12 candidate profiles awaiting decision',
      'Schedule interviews for 5 shortlisted candidates',
      'Complete feedback for 3 completed interviews',
      'Update job requirements for Software Engineer role'
    ],
    features: [
      { title: 'My Candidates', icon: PeopleIcon, path: '/candidates', color: '#1976d2', priority: 'high' },
      { title: 'Interview Schedule', icon: CalendarIcon, path: '/interviews', color: '#2e7d32', priority: 'high' },
      { title: 'Resume Analyzer', icon: ResumeIcon, path: '/resume-analyzer', color: '#ed6c02', priority: 'high' },
      { title: 'Interview Feedback', icon: FeedbackIcon, path: '/interview-feedback', color: '#e91e63', priority: 'medium' },
      { title: 'Hiring Analytics', icon: TableauIcon, path: '/hiring-analytics', color: '#f57c00', priority: 'medium' },
      { title: 'Job Postings', icon: BusinessCenter, path: '/manager/jobs', color: '#9c27b0', priority: 'low' }
    ]
  },
  interviewer: {
    stats: {
      assignedCandidates: { count: 8, change: +3, trend: 'up' },
      scheduledThisWeek: { count: 12, change: +4, trend: 'up' },
      completedInterviews: { count: 5, change: +2, trend: 'up' },
      avgInterviewScore: { count: 7.8, change: +0.3, trend: 'up' }
    },
    suggestions: [
      'Review profiles of 3 candidates before tomorrow\'s interviews',
      'Complete feedback forms for 2 finished interviews',
      'Prepare technical questions for Senior Developer interview',
      'Check updated interview schedule for this week'
    ],
    features: [
      { title: 'Assigned Candidates', icon: PeopleIcon, path: '/interviewer/candidates', color: '#1976d2', priority: 'high' },
      { title: 'Interview Schedule', icon: ScheduleIcon, path: '/interviewer/schedule', color: '#2e7d32', priority: 'high' },
      { title: 'Interview Feedback', icon: FeedbackIcon, path: '/interview-feedback', color: '#e91e63', priority: 'high' },
      { title: 'Evaluation Forms', icon: GradeIcon, path: '/interviewer/evaluations', color: '#9c27b0', priority: 'medium' },
      { title: 'Interview Guidelines', icon: School, path: '/interviewer/guidelines', color: '#795548', priority: 'medium' },
      { title: 'My Interview History', icon: Timer, path: '/interviewer/history', color: '#607d8b', priority: 'low' }
    ]
  }
};

function DashboardPersonalized() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<UserRole>('interviewer');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (event: SelectChangeEvent) => {
    setLoading(true);
    setCurrentRole(event.target.value as UserRole);
    setTimeout(() => setLoading(false), 800);
  };

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const refreshStats = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const roleConfig = roleConfigs[currentRole];
  const data = roleData[currentRole];

  const getStatCards = () => {
    const stats = data.stats;
    const statKeys = Object.keys(stats) as Array<keyof typeof stats>;
    
    return statKeys.map((key, index) => {
      const stat = stats[key];
      const icons = [PeopleIcon, InterviewIcon, CheckCircle, TrendingUp];
      const colors = ['primary.main', 'success.main', 'warning.main', 'info.main'];
      const Icon = icons[index] || TaskIcon;
      
      return (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <StatsCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: colors[index], mr: 2, width: 32, height: 32 }}>
                  <Icon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.count}{stat.unit && ` ${stat.unit}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <Chip
                  icon={stat.trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                  label={`${stat.change > 0 ? '+' : ''}${stat.change}`}
                  color={stat.trend === 'up' ? 'success' : 'error'}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      );
    });
  };

  if (loading) {
    return (
      <PageTransition>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2, fontSize: '3rem' }}>⚡</Box>
            <Typography variant="h6" color="text.secondary">Switching to {roleConfig.name} view...</Typography>
          </Box>
        </Box>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Role Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            HireIQ Pro Home
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Demo Role</InputLabel>
            <Select
              value={currentRole}
              label="Demo Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="admin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon sx={{ color: roleConfigs.admin.color }} />
                  HR Assistant
                </Box>
              </MenuItem>
              <MenuItem value="manager">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ManagerIcon sx={{ color: roleConfigs.manager.color }} />
                  Hiring Manager
                </Box>
              </MenuItem>
              <MenuItem value="interviewer">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InterviewerIcon sx={{ color: roleConfigs.interviewer.color }} />
                  Interviewer
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Role-specific Welcome Section */}
        <RoleCard>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    mr: 2, 
                    width: 56, 
                    height: 56 
                  }}
                >
                  <roleConfig.icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {roleConfig.greeting}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {roleConfig.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '3rem', mb: 1 }}>
                {currentRole === 'admin' ? '🛠️' : currentRole === 'manager' ? '📊' : '📋'}
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Grid>
          </Grid>
        </RoleCard>

        {/* Statistics Overview */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Your Key Metrics
            </Typography>
            <Tooltip title="Refresh Statistics">
              <IconButton onClick={refreshStats} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container spacing={3}>
            {getStatCards()}
          </Grid>
        </Box>

        {/* Overall Company Metrics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Company Overview
          </Typography>
          
          {/* Candidate Pipeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="primary" />
                Candidate Pipeline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {overallMetrics.candidatesByState.new}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {overallMetrics.candidatesByState.technicalEvaluation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tech Eval
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {overallMetrics.candidatesByState.interview}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interview
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {overallMetrics.candidatesByState.offered}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Offered
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.dark">
                      {overallMetrics.candidatesByState.hired}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hired
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {overallMetrics.candidatesByState.rejected}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Key Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <TrendingUp color="success" />
                    Hiring Rate
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {overallMetrics.hiringRate}%
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={overallMetrics.hiringRate} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'success.main'
                        }
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Success rate from application to hire
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <BiasDetectionIcon color="primary" />
                    Bias Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {overallMetrics.biasScore}/10
                    </Typography>
                    {overallMetrics.biasScore >= 8 ? (
                      <CheckCircle color="success" sx={{ fontSize: '2rem' }} />
                    ) : overallMetrics.biasScore >= 6 ? (
                      <HourglassEmpty color="warning" sx={{ fontSize: '2rem' }} />
                    ) : (
                      <TrendingDown color="error" sx={{ fontSize: '2rem' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Fairness in hiring process
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <BusinessCenter color="info" />
                    Active Positions
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {Object.keys(overallMetrics.hiringByPosition).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open roles across departments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Hiring by Position */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon color="primary" />
                Hiring by Position
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(overallMetrics.hiringByPosition).map(([position, count]) => (
                  <Grid item xs={12} sm={6} md={4} key={position}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {position}
                      </Typography>
                      <Chip 
                        label={count} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Grid container spacing={4}>
          {/* Suggestions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="warning" />
                  Suggested Actions
                </Typography>
                <List dense>
                  {data.suggestions.map((suggestion, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Chip 
                          label={index + 1} 
                          size="small" 
                          color="primary" 
                          sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={suggestion}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontSize: '0.9rem',
                            lineHeight: 1.4
                          } 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer color="info" />
                  Priority Features
                </Typography>
                <Grid container spacing={2}>
                  {data.features.filter(f => f.priority === 'high').map((feature) => {
                    const IconComponent = feature.icon;
                    return (
                      <Grid item xs={12} key={feature.title}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<IconComponent />}
                          onClick={() => handleFeatureClick(feature.path)}
                          sx={{ 
                            justifyContent: 'flex-start',
                            py: 1.5,
                            borderColor: alpha(feature.color, 0.3),
                            color: feature.color,
                            '&:hover': {
                              borderColor: feature.color,
                              bgcolor: alpha(feature.color, 0.05)
                            }
                          }}
                        >
                          {feature.title}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* All Features */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            All Available Features
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Access features organized by priority for your role
          </Typography>

          <Grid container spacing={3}>
            {data.features.map((feature) => {
              const IconComponent = feature.icon;
              const priorityColors: Record<Priority, string> = {
                high: '#d32f2f',
                medium: '#ed6c02',
                low: '#2e7d32'
              };
              
              return (
                <Grid item xs={12} sm={6} md={4} key={feature.title}>
                  <FeatureTile onClick={() => handleFeatureClick(feature.path)}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{ 
                            bgcolor: feature.color, 
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                          className="feature-icon"
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                            {feature.title}
                          </Typography>
                          <Chip 
                            label={feature.priority} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(priorityColors[feature.priority], 0.1),
                              color: priorityColors[feature.priority],
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20
                            }} 
                          />
                        </Box>
                      </Box>

                      <CardActions sx={{ p: 0, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<OpenInNew />}
                          sx={{ 
                            bgcolor: feature.color,
                            '&:hover': { bgcolor: alpha(feature.color, 0.8) },
                            fontSize: '0.75rem'
                          }}
                          className="feature-button"
                          fullWidth
                        >
                          Open
                        </Button>
                      </CardActions>
                    </CardContent>
                  </FeatureTile>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </PageTransition>
  );
}

export default DashboardPersonalized;
