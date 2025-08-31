import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';
import PageTransition from '../components/PageTransition';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function EmailNotifications() {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    candidateUpdates: true,
    interviewReminders: true,
    biasAlerts: true,
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  return (
    <PageTransition animation="fadeUp">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Settings
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<BusinessIcon />} label="Organization" />
            <Tab icon={<ThemeIcon />} label="Appearance" />
          </Tabs>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Email Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.email}
                          onChange={handleNotificationChange('email')}
                        />
                      }
                      label="Enable Email Notifications"
                    />
                    <br />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.candidateUpdates}
                          onChange={handleNotificationChange('candidateUpdates')}
                        />
                      }
                      label="Candidate Status Updates"
                    />
                    <br />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.interviewReminders}
                          onChange={handleNotificationChange('interviewReminders')}
                        />
                      }
                      label="Interview Reminders"
                    />
                    <br />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.biasAlerts}
                          onChange={handleNotificationChange('biasAlerts')}
                        />
                      }
                      label="Bias Detection Alerts"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Push Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.push}
                          onChange={handleNotificationChange('push')}
                        />
                      }
                      label="Enable Push Notifications"
                    />
                    <br />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.sms}
                          onChange={handleNotificationChange('sms')}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Password & Security
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm Password"
                      margin="normal"
                    />
                    <Button variant="contained" sx={{ mt: 2 }}>
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Two-factor authentication is not enabled
                    </Alert>
                    <Button variant="outlined">
                      Enable 2FA
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Organization Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Company Information
                    </Typography>
                    <TextField
                      fullWidth
                      label="Company Name"
                      defaultValue="HireIQ Pro"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Industry"
                      defaultValue="Technology"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Company Size"
                      defaultValue="50-200 employees"
                      margin="normal"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bias Detection Settings
                    </Typography>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Bias Sensitivity Level</InputLabel>
                      <Select defaultValue="medium" label="Bias Sensitivity Level">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto-flag potential bias"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Theme Settings
                    </Typography>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={theme}
                        label="Theme"
                        onChange={(e) => setTheme(e.target.value)}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={language}
                        label="Language"
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Display Preferences
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Show advanced analytics"
                    />
                    <br />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable animations"
                    />
                    <br />
                    <FormControlLabel
                      control={<Switch />}
                      label="Compact view"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined">
            Reset to Defaults
          </Button>
          <Button variant="contained">
            Save Changes
          </Button>
        </Box>
      </Box>
    </PageTransition>
  );
}

export default EmailNotifications;
