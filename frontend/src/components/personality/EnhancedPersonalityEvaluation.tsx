import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Psychology,
  Person,
  Groups,
  TrendingUp,
  Insights,
  AutoAwesome,
  CheckCircle,
  ExpandMore,
  WorkOutline,
  School,
  Star,
  Timeline,
  EmojiObjects,
  Favorite,
  Business,
  Group,
  AccountCircle,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Enhanced Types
interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  options?: Array<{
    text: string;
    weight: Record<string, number>;
  }>;
  scale?: string;
  dimension?: string;
}

interface PersonalityProfile {
  candidate_id: number;
  assessment_date: string;
  mbti_profile?: {
    type: string;
    dimensions: Record<string, number>;
    confidence_scores: Record<string, number>;
    insights: any;
    cognitive_functions: string[];
    career_suggestions: string[];
    team_role: string;
    communication_style: string;
    leadership_style: string;
  };
  big_five_profile?: {
    scores: Record<string, any>;
    profile_summary: string;
    strengths: string[];
    development_areas: string[];
    work_preferences: any;
  };
  cultural_fit?: {
    overall_fit_score: number;
    fit_level: string;
    value_alignment: any;
    potential_challenges: string[];
    adaptation_recommendations: string[];
  };
  team_compatibility?: {
    preferred_team_roles: Array<{
      role: string;
      score: number;
      description: string;
    }>;
    collaboration_style: any;
    team_dynamics_prediction: any;
  };
  leadership_assessment?: {
    leadership_potential_score: number;
    leadership_styles: Record<string, number>;
    dominant_style: string;
    development_recommendations: string[];
  };
  emotional_intelligence?: {
    overall_eq_score: number;
    domain_scores: Record<string, number>;
    eq_strengths: string[];
    development_areas: string[];
    workplace_implications: any;
  };
  overall_insights: {
    personality_overview: string;
    key_strengths: string[];
    potential_challenges: string[];
    ideal_work_environment: any;
    career_recommendations: string[];
    development_priorities: string[];
  };
  recommendations: string[];
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position_applied: string;
  personality_profile?: PersonalityProfile;
}

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#4facfe",
  "#43e97b",
  "#fa709a",
];

const ASSESSMENT_STEPS = [
  { id: "selection", label: "Assessment Selection", icon: <Psychology /> },
  { id: "questions", label: "Assessment Questions", icon: <Person /> },
  { id: "processing", label: "AI Processing", icon: <AutoAwesome /> },
  { id: "results", label: "Results & Insights", icon: <Insights /> },
];

const ASSESSMENT_TYPES = [
  {
    id: "mbti",
    name: "MBTI Assessment",
    description: "Understand personality type and cognitive preferences",
    duration: "15-20 min",
    icon: <Psychology />,
    color: "#667eea",
  },
  {
    id: "big_five",
    name: "Big Five Personality",
    description: "Comprehensive personality trait analysis",
    duration: "10-15 min",
    icon: <Person />,
    color: "#764ba2",
  },
  {
    id: "cultural_fit",
    name: "Cultural Fit Analysis",
    description: "Assess alignment with company culture and values",
    duration: "10-12 min",
    icon: <Business />,
    color: "#f093fb",
  },
  {
    id: "team_compatibility",
    name: "Team Compatibility",
    description: "Analyze team role preferences and collaboration style",
    duration: "8-10 min",
    icon: <Group />,
    color: "#4facfe",
  },
  {
    id: "leadership_potential",
    name: "Leadership Assessment",
    description: "Evaluate leadership potential and style",
    duration: "12-15 min",
    icon: <AccountCircle />,
    color: "#43e97b",
  },
  {
    id: "emotional_intelligence",
    name: "Emotional Intelligence",
    description: "Measure emotional awareness and social skills",
    duration: "10-12 min",
    icon: <Favorite />,
    color: "#fa709a",
  },
];

function EnhancedPersonalityEvaluation() {
  // State management
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<
    Record<string, AssessmentQuestion[]>
  >({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PersonalityProfile | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/v1/candidates");
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const startAssessment = useCallback((candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCurrentStep(0);
    setSelectedAssessments([]);
    setResponses({});
    setResults(null);
    setShowResults(false);
  }, []);

  const handleAssessmentSelection = useCallback((assessmentId: string) => {
    setSelectedAssessments((prev) => {
      if (prev.includes(assessmentId)) {
        return prev.filter((id) => id !== assessmentId);
      } else {
        return [...prev, assessmentId];
      }
    });
  }, []);

  const loadAssessmentQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const questionsData: Record<string, AssessmentQuestion[]> = {};

      for (const assessmentType of selectedAssessments) {
        const response = await fetch(
          `/api/personality/assessment-questions/${assessmentType}`
        );
        if (response.ok) {
          const data = await response.json();
          questionsData[assessmentType] = data.questions;
        }
      }

      setAssessmentQuestions(questionsData);
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAssessments]);

  const handleQuestionResponse = useCallback(
    (questionId: string, value: any) => {
      setResponses((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    []
  );

  const nextQuestion = useCallback(() => {
    const currentAssessmentType = selectedAssessments[currentAssessmentIndex];
    const currentQuestions = assessmentQuestions[currentAssessmentType] || [];

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentAssessmentIndex < selectedAssessments.length - 1) {
      setCurrentAssessmentIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All questions completed, process results
      processAssessment();
    }
  }, [
    currentQuestionIndex,
    currentAssessmentIndex,
    selectedAssessments,
    assessmentQuestions,
  ]);

  const processAssessment = useCallback(async () => {
    if (!selectedCandidate) return;

    setCurrentStep(2);
    setLoading(true);

    try {
      const assessmentData = {
        candidate_id: selectedCandidate.id,
        assessment_types: selectedAssessments,
        responses: responses,
        metadata: {
          company_culture: "innovative_startup", // This could be configurable
          assessment_date: new Date().toISOString(),
        },
      };

      const response = await fetch(
        "/api/personality/comprehensive-assessment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assessmentData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setResults(result.profile);
        setCurrentStep(3);

        // Update candidate in local state
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id
              ? { ...c, personality_profile: result.profile }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Assessment processing failed:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCandidate, selectedAssessments, responses]);

  // Render functions
  const renderCandidateSelection = () => (
    <Grid container spacing={3}>
      {candidates.map((candidate) => (
        <Grid item xs={12} md={6} lg={4} key={candidate.id}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              sx={{
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                "&:hover": {
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.25)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => startAssessment(candidate)}
            >
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
                  >
                    {candidate.first_name[0]}
                    {candidate.last_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {candidate.first_name} {candidate.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {candidate.position_applied}
                    </Typography>
                  </Box>
                </Box>

                {candidate.personality_profile ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Assessment Complete"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<Psychology />}
                    label="Ready for Assessment"
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  const renderAssessmentSelection = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Select Assessment Types for {selectedCandidate?.first_name}{" "}
        {selectedCandidate?.last_name}
      </Typography>

      <Grid container spacing={3}>
        {ASSESSMENT_TYPES.map((assessment) => (
          <Grid item xs={12} md={6} key={assessment.id}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                sx={{
                  cursor: "pointer",
                  background: selectedAssessments.includes(assessment.id)
                    ? `linear-gradient(135deg, ${assessment.color}20 0%, ${assessment.color}10 100%)`
                    : "rgba(255, 255, 255, 0.05)",
                  border: selectedAssessments.includes(assessment.id)
                    ? `2px solid ${assessment.color}`
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleAssessmentSelection(assessment.id)}
              >
                <CardContent>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Avatar
                      sx={{ bgcolor: assessment.color, width: 48, height: 48 }}
                    >
                      {assessment.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {assessment.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {assessment.description}
                      </Typography>
                      <Chip
                        label={assessment.duration}
                        size="small"
                        sx={{
                          bgcolor: `${assessment.color}20`,
                          color: assessment.color,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1">
          Selected: {selectedAssessments.length} assessment
          {selectedAssessments.length !== 1 ? "s" : ""}
          {selectedAssessments.length > 0 && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
              (Est. {selectedAssessments.length * 12} minutes)
            </Typography>
          )}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={loadAssessmentQuestions}
          disabled={selectedAssessments.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            px: 4,
            py: 1.5,
          }}
        >
          {loading ? "Loading Questions..." : "Start Assessment"}
        </Button>
      </Box>
    </Box>
  );

  const renderAssessmentQuestions = () => {
    const currentAssessmentType = selectedAssessments[currentAssessmentIndex];
    const currentQuestions = assessmentQuestions[currentAssessmentType] || [];
    const currentQuestion = currentQuestions[currentQuestionIndex];

    if (!currentQuestion) return null;

    const totalQuestions = selectedAssessments.reduce(
      (sum, type) => sum + (assessmentQuestions[type]?.length || 0),
      0
    );
    const completedQuestions =
      selectedAssessments
        .slice(0, currentAssessmentIndex)
        .reduce(
          (sum, type) => sum + (assessmentQuestions[type]?.length || 0),
          0
        ) + currentQuestionIndex;

    const progress = (completedQuestions / totalQuestions) * 100;

    return (
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <LinearProgress
          value={progress}
          variant="determinate"
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />

        <Card
          sx={{
            p: 4,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="overline"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            {ASSESSMENT_TYPES.find((t) => t.id === currentAssessmentType)?.name}
          </Typography>

          <Typography variant="h5" sx={{ mt: 1, mb: 3, fontWeight: 600 }}>
            {currentQuestion.question}
          </Typography>

          {currentQuestion.options ? (
            <FormControl component="fieldset">
              <RadioGroup
                value={responses[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleQuestionResponse(
                    currentQuestion.id,
                    parseInt(e.target.value)
                  )
                }
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option.text}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ) : (
            <Box sx={{ px: 2, py: 4 }}>
              <Typography gutterBottom>
                Strongly Disagree → Strongly Agree
              </Typography>
              <Slider
                value={responses[currentQuestion.id] || 3}
                onChange={(_, value) =>
                  handleQuestionResponse(currentQuestion.id, value)
                }
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: "5" },
                ]}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Question {completedQuestions + 1} of {totalQuestions}
            </Typography>

            <Button
              variant="contained"
              onClick={nextQuestion}
              disabled={!responses[currentQuestion.id]}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                px: 4,
              }}
            >
              {completedQuestions + 1 === totalQuestions
                ? "Complete Assessment"
                : "Next Question"}
            </Button>
          </Box>
        </Card>
      </Box>
    );
  };

  const renderProcessing = () => (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Psychology sx={{ fontSize: 80, color: "primary.main", mb: 3 }} />
      </motion.div>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        AI Processing Your Assessment
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
      >
        Our advanced AI is analyzing your responses to generate comprehensive
        personality insights, cultural fit analysis, and personalized
        recommendations.
      </Typography>

      <LinearProgress
        sx={{ maxWidth: 400, mx: "auto", height: 6, borderRadius: 3 }}
      />
    </Box>
  );

  const renderResults = () => {
    if (!results) return null;

    const tabs = [
      { label: "Overview", icon: <Insights /> },
      { label: "MBTI Profile", icon: <Psychology /> },
      { label: "Big Five", icon: <Person /> },
      { label: "Cultural Fit", icon: <Business /> },
      { label: "Team Compatibility", icon: <Group /> },
      { label: "Leadership", icon: <AccountCircle /> },
      { label: "Emotional Intelligence", icon: <Favorite /> },
    ];

    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Assessment Results for {selectedCandidate?.first_name}{" "}
          {selectedCandidate?.last_name}
        </Typography>

        <Paper
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 0 && renderOverviewTab()}
                {activeTab === 1 && renderMBTITab()}
                {activeTab === 2 && renderBigFiveTab()}
                {activeTab === 3 && renderCulturalFitTab()}
                {activeTab === 4 && renderTeamCompatibilityTab()}
                {activeTab === 5 && renderLeadershipTab()}
                {activeTab === 6 && renderEmotionalIntelligenceTab()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => setShowResults(false)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Assess Another Candidate
          </Button>
          <Button variant="outlined" onClick={() => window.print()}>
            Download Report
          </Button>
        </Box>
      </Box>
    );
  };

  // Tab rendering functions
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personality Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {results?.overall_insights.personality_overview}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Key Strengths
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {results?.overall_insights.key_strengths.map((strength, index) => (
              <Chip
                key={index}
                label={strength}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Development Areas
          </Typography>
          <List>
            {results?.overall_insights.development_priorities.map(
              (area, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText primary={area} />
                </ListItem>
              )
            )}
          </List>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assessment Completion
          </Typography>

          {selectedAssessments.map((assessment) => {
            const assessmentInfo = ASSESSMENT_TYPES.find(
              (t) => t.id === assessment
            );
            return (
              <Box
                key={assessment}
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{ bgcolor: assessmentInfo?.color, width: 32, height: 32 }}
                >
                  {assessmentInfo?.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    {assessmentInfo?.name}
                  </Typography>
                </Box>
                <CheckCircle color="success" />
              </Box>
            );
          })}
        </Card>

        <Card sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List dense>
            {results?.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Star fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={recommendation}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMBTITab = () => {
    if (!results?.mbti_profile)
      return <Typography>MBTI assessment not completed</Typography>;

    const { type, dimensions, confidence_scores } = results.mbti_profile;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}
            >
              {type}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {results.mbti_profile.team_role}
            </Typography>

            <Box sx={{ mt: 3 }}>
              {Object.entries(confidence_scores).map(([dim, score]) => (
                <Box key={dim} sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {dim.replace("_", " ")} Confidence:{" "}
                    {Math.round((score as number) * 100)}%
                  </Typography>
                  <LinearProgress
                    value={(score as number) * 100}
                    variant="determinate"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Career Suggestions
            </Typography>
            <List>
              {results.mbti_profile.career_suggestions.map(
                (suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WorkOutline />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                )
              )}
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Communication Style
            </Typography>
            <Typography variant="body1">
              {results.mbti_profile.communication_style}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderBigFiveTab = () => {
    if (!results?.big_five_profile)
      return <Typography>Big Five assessment not completed</Typography>;

    const radarData = Object.entries(results.big_five_profile.scores).map(
      ([trait, data]) => ({
        trait: trait.charAt(0).toUpperCase() + trait.slice(1),
        score: (data as any).score,
      })
    );

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Big Five Personality Traits
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#667eea"
                  fill="#667eea"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trait Breakdown
            </Typography>
            {Object.entries(results.big_five_profile.scores).map(
              ([trait, data]) => (
                <Box key={trait} sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {trait.charAt(0).toUpperCase() + trait.slice(1)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {(data as any).description}
                  </Typography>
                  <LinearProgress
                    value={(data as any).score}
                    variant="determinate"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {(data as any).level} ({(data as any).score}/100)
                  </Typography>
                </Box>
              )
            )}
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCulturalFitTab = () => {
    if (!results?.cultural_fit)
      return <Typography>Cultural fit assessment not completed</Typography>;

    const { overall_fit_score, fit_level, value_alignment } =
      results.cultural_fit;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}
            >
              {overall_fit_score}%
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Cultural Fit Score
            </Typography>
            <Chip
              label={fit_level}
              color={
                fit_level === "High"
                  ? "success"
                  : fit_level === "Medium"
                  ? "warning"
                  : "error"
              }
              sx={{ mt: 2 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cultural Challenges & Recommendations
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Potential Challenges
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {results.cultural_fit.potential_challenges.map(
                    (challenge, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={challenge} />
                      </ListItem>
                    )
                  )}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Adaptation Recommendations
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {results.cultural_fit.adaptation_recommendations.map(
                    (rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <EmojiObjects />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    )
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Additional tab rendering functions would go here...
  const renderTeamCompatibilityTab = () => (
    <Typography>Team Compatibility analysis will be displayed here</Typography>
  );

  const renderLeadershipTab = () => (
    <Typography>
      Leadership assessment results will be displayed here
    </Typography>
  );

  const renderEmotionalIntelligenceTab = () => (
    <Typography>
      Emotional Intelligence results will be displayed here
    </Typography>
  );

  // Main render
  return (
    <Box sx={{ p: 3 }}>
      {!selectedCandidate ? (
        <>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            🧠 Enhanced Personality Assessment & Cultural Fit Analysis
          </Typography>
          {renderCandidateSelection()}
        </>
      ) : (
        <Dialog
          open={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              background: "rgba(17, 25, 40, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minHeight: "80vh",
            },
          }}
        >
          <DialogContent sx={{ p: 4 }}>
            <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
              {ASSESSMENT_STEPS.map((step, index) => (
                <Step key={step.id}>
                  <StepLabel
                    icon={step.icon}
                    sx={{
                      "& .MuiStepLabel-label": {
                        color:
                          index <= currentStep
                            ? "primary.main"
                            : "text.secondary",
                      },
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && renderAssessmentSelection()}
                {currentStep === 1 && renderAssessmentQuestions()}
                {currentStep === 2 && renderProcessing()}
                {currentStep === 3 && renderResults()}
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default EnhancedPersonalityEvaluation;
