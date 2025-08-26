import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  CheckCircle,
  Warning,
  Cancel,
  Star,
  TrendingUp,
  School,
  Work,
  Psychology,
} from '@mui/icons-material';

interface JobPosition {
  title: string;
  core_skills: string[];
}

interface SkillMatch {
  skill: string;
  mentioned: boolean;
  context?: string;
}

interface ResumeAnalysisResult {
  overall_score: number;
  position_match: string;
  matched_skills: SkillMatch[];
  missing_skills: string[];
  experience_assessment: string;
  education_match: string;
  recommendations: string[];
  detailed_analysis: string;
  confidence_score: number;
}

function ResumeAnalyzer() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);

  useEffect(() => {
    fetchAvailablePositions();
  }, []);

  const fetchAvailablePositions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/resume/available-positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setError('Failed to load available positions');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setUploadedFile(file);
        setError('');
      } else {
        setError('Please upload a PDF or text file');
        setUploadedFile(null);
      }
    }
  };

  const analyzeResumeFile = async () => {
    if (!uploadedFile || !selectedPosition) {
      setError('Please select a position and upload a resume file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume_file', uploadedFile);
      formData.append('position_title', selectedPosition);

      const response = await fetch('http://127.0.0.1:8000/api/v1/resume/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('An error occurred while analyzing the resume');
    } finally {
      setLoading(false);
    }
  };

  const analyzeResumeText = async () => {
    if (!resumeText.trim() || !selectedPosition) {
      setError('Please select a position and enter resume text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/resume/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position_title: selectedPosition,
          resume_text: resumeText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('An error occurred while analyzing the resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getMatchIcon = (match: string) => {
    switch (match.toLowerCase()) {
      case 'excellent':
        return <Star color="success" />;
      case 'good':
        return <CheckCircle color="success" />;
      case 'fair':
        return <Warning color="warning" />;
      default:
        return <Cancel color="error" />;
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setResumeText('');
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment />
        Resume Analyzer
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Upload a resume or paste resume text to analyze skills match against job descriptions using AI
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                1. Select Position
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Job Position</InputLabel>
                <Select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  label="Job Position"
                >
                  {positions.map((position) => (
                    <MenuItem key={position.title} value={position.title}>
                      {position.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedPosition && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Core Skills Required:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {positions
                      .find((p) => p.title === selectedPosition)
                      ?.core_skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                  </Box>
                </Box>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                2. Upload Resume
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant={!showTextInput ? 'contained' : 'outlined'}
                  onClick={() => setShowTextInput(false)}
                  sx={{ mr: 1 }}
                >
                  File Upload
                </Button>
                <Button
                  variant={showTextInput ? 'contained' : 'outlined'}
                  onClick={() => setShowTextInput(true)}
                >
                  Text Input
                </Button>
              </Box>

              {!showTextInput ? (
                <Box>
                  <input
                    accept=".pdf,.txt"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Choose Resume File
                    </Button>
                  </label>
                  {uploadedFile && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Selected: {uploadedFile.name}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    onClick={analyzeResumeFile}
                    disabled={!uploadedFile || !selectedPosition || loading}
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    placeholder="Paste resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={analyzeResumeText}
                    disabled={!resumeText.trim() || !selectedPosition || loading}
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={8}>
          {analysisResult && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Analysis Results</Typography>
                <Button variant="outlined" onClick={resetAnalysis}>
                  New Analysis
                </Button>
              </Box>

              {/* Overall Score */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${getScoreColor(analysisResult.overall_score)}.main` }}>
                          <TrendingUp />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" color={`${getScoreColor(analysisResult.overall_score)}.main`}>
                            {analysisResult.overall_score.toFixed(1)}%
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Overall Score
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getMatchIcon(analysisResult.position_match)}
                        <Box>
                          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                            {analysisResult.position_match}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Position Match
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <Psychology />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {(analysisResult.confidence_score * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            AI Confidence
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {/* Skills Analysis */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle />
                        Skills Analysis
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Matched Skills:
                      </Typography>
                      <List dense>
                        {analysisResult.matched_skills
                          .filter(skill => skill.mentioned)
                          .map((skill, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={skill.skill}
                                secondary={skill.context}
                              />
                              <Chip label="Found" color="success" size="small" />
                            </ListItem>
                          ))}
                      </List>

                      {analysisResult.missing_skills.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" gutterBottom>
                            Missing Skills:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {analysisResult.missing_skills.map((skill, index) => (
                              <Chip key={index} label={skill} color="error" size="small" />
                            ))}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Experience & Education */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work />
                        Experience & Education
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work fontSize="small" />
                          Experience Assessment:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysisResult.experience_assessment}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <School fontSize="small" />
                          Education Match:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysisResult.education_match}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>
                      <List>
                        {analysisResult.recommendations.map((recommendation, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`${index + 1}. ${recommendation}`} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detailed Analysis */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Detailed Analysis
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {analysisResult.detailed_analysis}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ResumeAnalyzer;
