import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Psychology,
  Person,
  Assessment,
  TrendingUp,
  Insights,
  Search,
  CheckCircle,
  Info,
  AutoAwesome,
} from "@mui/icons-material";

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
      id={`personality-tabpanel-${index}`}
      aria-labelledby={`personality-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position_applied: string;
  mbti_type?: string;
  personality_scores?: {
    extraversion: number;
    intuition: number;
    thinking: number;
    judging: number;
  };
  personality_traits?: string[];
  assessment_date?: string;
}

const mbtiQuestions = [
  {
    id: 1,
    question: "I prefer to work in teams rather than alone",
    dimension: "E",
  },
  {
    id: 2,
    question: "I focus on details and facts rather than possibilities",
    dimension: "S",
  },
  {
    id: 3,
    question: "I make decisions based on logic rather than feelings",
    dimension: "T",
  },
  {
    id: 4,
    question: "I prefer to have things planned and organized",
    dimension: "J",
  },
  {
    id: 5,
    question: "I enjoy meeting new people and socializing",
    dimension: "E",
  },
  { id: 6, question: "I trust my hunches and intuition", dimension: "N" },
  {
    id: 7,
    question: "I consider the impact on people when making decisions",
    dimension: "F",
  },
  {
    id: 8,
    question: "I prefer to keep my options open and be flexible",
    dimension: "P",
  },
  {
    id: 9,
    question: "I feel energized after social interactions",
    dimension: "E",
  },
  {
    id: 10,
    question: "I like to explore new ideas and concepts",
    dimension: "N",
  },
  {
    id: 11,
    question: "I value fairness and logical consistency",
    dimension: "T",
  },
  {
    id: 12,
    question: "I like to finish projects before starting new ones",
    dimension: "J",
  },
];

const mbtiTypes = {
  INTJ: {
    name: "The Architect",
    description: "Strategic, analytical, and independent",
  },
  INTP: {
    name: "The Thinker",
    description: "Logical, analytical, and innovative",
  },
  ENTJ: {
    name: "The Commander",
    description: "Natural leaders, strategic and assertive",
  },
  ENTP: {
    name: "The Debater",
    description: "Innovative, enthusiastic, and strategic",
  },
  INFJ: {
    name: "The Advocate",
    description: "Creative, insightful, and principled",
  },
  INFP: {
    name: "The Mediator",
    description: "Idealistic, creative, and caring",
  },
  ENFJ: {
    name: "The Protagonist",
    description: "Charismatic, inspiring, and empathetic",
  },
  ENFP: {
    name: "The Campaigner",
    description: "Enthusiastic, creative, and sociable",
  },
  ISTJ: {
    name: "The Logistician",
    description: "Practical, fact-minded, and reliable",
  },
  ISFJ: {
    name: "The Protector",
    description: "Warm, responsible, and conscientious",
  },
  ESTJ: {
    name: "The Executive",
    description: "Organized, practical, and decisive",
  },
  ESFJ: {
    name: "The Consul",
    description: "Caring, social, and community-minded",
  },
  ISTP: { name: "The Virtuoso", description: "Bold, practical, and adaptable" },
  ISFP: {
    name: "The Adventurer",
    description: "Flexible, charming, and artistic",
  },
  ESTP: {
    name: "The Entrepreneur",
    description: "Bold, perceptive, and direct",
  },
  ESFP: {
    name: "The Entertainer",
    description: "Spontaneous, energetic, and enthusiastic",
  },
};

function PersonalityEvaluation() {
  const [currentTab, setCurrentTab] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentResponses, setAssessmentResponses] = useState<
    Record<string, number>
  >({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/candidates/");
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      } else {
        throw new Error("Failed to fetch candidates");
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Failed to fetch candidates";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const startAssessment = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setAssessmentResponses({});
    setAssessmentOpen(true);
  };

  const handleAssessmentResponse = (questionId: string, value: number) => {
    setAssessmentResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const submitAssessment = async () => {
    if (!selectedCandidate) return;

    try {
      const response = await fetch("/api/v1/personality/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_id: selectedCandidate.id,
          responses: assessmentResponses,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update candidate with MBTI results
        const updatedCandidate = {
          ...selectedCandidate,
          mbti_type: result.result.mbti_type,
          personality_scores: result.result.personality_scores,
          personality_traits: result.result.personality_traits,
          assessment_date: new Date().toISOString(),
        };

        // Update local state
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id ? updatedCandidate : c
          )
        );

        setAssessmentOpen(false);
        setSelectedCandidate(null);
      } else {
        throw new Error("Failed to submit assessment");
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Failed to submit assessment";
      setError(errorMessage);
    }
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      `${candidate.first_name} ${candidate.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position_applied
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const candidatesWithMBTI = candidates.filter((c) => c.mbti_type);
  const mbtiDistribution = candidatesWithMBTI.reduce((acc, candidate) => {
    const type = candidate.mbti_type!;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Box sx={{ ml: "240px", p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading candidates...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Psychology sx={{ mr: 2, color: "primary.main" }} />
        Personality Evaluation (MBTI)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Person sx={{ mr: 2, color: "primary.main", fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{candidates.length}</Typography>
                  <Typography color="textSecondary">
                    Total Candidates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assessment
                  sx={{ mr: 2, color: "success.main", fontSize: 40 }}
                />
                <Box>
                  <Typography variant="h4">
                    {candidatesWithMBTI.length}
                  </Typography>
                  <Typography color="textSecondary">Assessed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp sx={{ mr: 2, color: "info.main", fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {candidates.length > 0
                      ? Math.round(
                          (candidatesWithMBTI.length / candidates.length) * 100
                        )
                      : 0}
                    %
                  </Typography>
                  <Typography color="textSecondary">Completion Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Insights sx={{ mr: 2, color: "warning.main", fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {Object.keys(mbtiDistribution).length}
                  </Typography>
                  <Typography color="textSecondary">Unique Types</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Candidate Assessment" />
          <Tab label="MBTI Analytics" />
          <Tab label="Type Distribution" />
        </Tabs>
      </Paper>

      {/* Candidate Assessment Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Candidate List</Typography>
                <TextField
                  size="small"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>MBTI Type</TableCell>
                      <TableCell>Assessment Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                              {candidate.first_name[0]}
                              {candidate.last_name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {candidate.first_name} {candidate.last_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {candidate.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{candidate.position_applied}</TableCell>
                        <TableCell>
                          {candidate.mbti_type ? (
                            <Chip
                              label={candidate.mbti_type}
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Chip label="Not Assessed" color="default" />
                          )}
                        </TableCell>
                        <TableCell>
                          {candidate.assessment_date
                            ? new Date(
                                candidate.assessment_date
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={
                              candidate.mbti_type ? "outlined" : "contained"
                            }
                            size="small"
                            onClick={() => startAssessment(candidate)}
                            startIcon={<Psychology />}
                          >
                            {candidate.mbti_type ? "Re-assess" : "Assess"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* MBTI Analytics Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {candidatesWithMBTI.map((candidate) => (
            <Grid item xs={12} md={6} lg={4} key={candidate.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      {candidate.first_name[0]}
                      {candidate.last_name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {candidate.first_name} {candidate.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {candidate.position_applied}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={candidate.mbti_type}
                    color="primary"
                    sx={{ mb: 2 }}
                  />

                  {candidate.personality_traits && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {candidate.personality_traits[1]}
                    </Typography>
                  )}

                  {candidate.personality_scores && (
                    <Box>
                      {Object.entries(candidate.personality_scores).map(
                        ([trait, score]) => (
                          <Box key={trait} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {trait}
                              </Typography>
                              <Typography variant="body2">{score}%</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={score}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        )
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Type Distribution Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                MBTI Type Distribution
              </Typography>
              {Object.entries(mbtiDistribution).map(([type, count]) => {
                const typeInfo = mbtiTypes[type as keyof typeof mbtiTypes];
                const percentage = (count / candidatesWithMBTI.length) * 100;

                return (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {type} - {typeInfo.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {typeInfo.description}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assessment Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Assessment Complete"
                    secondary={`${candidatesWithMBTI.length} of ${candidates.length} candidates`}
                  />
                </ListItem>

                {Object.keys(mbtiDistribution).length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Most Common Type"
                      secondary={
                        Object.entries(mbtiDistribution).sort(
                          (a, b) => b[1] - a[1]
                        )[0][0]
                      }
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Personality Diversity"
                    secondary={`${
                      Object.keys(mbtiDistribution).length
                    } different types identified`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Assessment Dialog */}
      <Dialog
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Psychology sx={{ mr: 2 }} />
            MBTI Personality Assessment
          </Box>
          {selectedCandidate && (
            <Typography variant="subtitle2" color="textSecondary">
              {selectedCandidate.first_name} {selectedCandidate.last_name} -{" "}
              {selectedCandidate.position_applied}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly
            Agree)
          </Typography>

          {mbtiQuestions.map((question) => (
            <Box key={question.id} sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {question.id}. {question.question}
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={assessmentResponses[question.id.toString()] || ""}
                  onChange={(e) =>
                    handleAssessmentResponse(
                      question.id.toString(),
                      Number(e.target.value)
                    )
                  }
                >
                  <MenuItem value={1}>1 - Strongly Disagree</MenuItem>
                  <MenuItem value={2}>2 - Disagree</MenuItem>
                  <MenuItem value={3}>3 - Neutral</MenuItem>
                  <MenuItem value={4}>4 - Agree</MenuItem>
                  <MenuItem value={5}>5 - Strongly Agree</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAssessmentOpen(false)}>Cancel</Button>
          <Button
            onClick={submitAssessment}
            variant="contained"
            disabled={
              Object.keys(assessmentResponses).length < mbtiQuestions.length
            }
            startIcon={<AutoAwesome />}
          >
            Calculate MBTI Type
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PersonalityEvaluation;
