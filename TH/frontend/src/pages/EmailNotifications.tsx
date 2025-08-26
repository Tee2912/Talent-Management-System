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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
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

function EmailNotifications() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [templates, setTemplates] = useState<any>(null);
  const [notificationHistory, setNotificationHistory] = useState<any>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  
  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  
  // Form states
  const [sendForm, setSendForm] = useState({
    template: '',
    recipient: '',
    data: {}
  });
  const [scheduleForm, setScheduleForm] = useState({
    template: '',
    recipient: '',
    scheduled_for: '',
    data: {}
  });
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const [templatesRes, historyRes, scheduledRes, settingsRes] = await Promise.all([
          fetch('/api/v1/notifications/templates'),
          fetch('/api/v1/notifications/history'),
          fetch('/api/v1/notifications/scheduled'),
          fetch('/api/v1/notifications/settings')
        ]);

        if (templatesRes.ok && historyRes.ok && scheduledRes.ok && settingsRes.ok) {
          const [templatesData, historyData, scheduledData, settingsData] = await Promise.all([
            templatesRes.json(),
            historyRes.json(),
            scheduledRes.json(),
            settingsRes.json()
          ]);

          setTemplates(templatesData.templates);
          setNotificationHistory(historyData.history);
          setScheduledNotifications(scheduledData.scheduled_notifications);
          setSettings(settingsData.settings);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for notifications');
        
        const mockTemplates = [
          {
            id: 1,
            name: "Interview Invitation",
            subject: "Interview Invitation - {{position}}",
            content: "Dear {{candidate_name}},\n\nWe are pleased to invite you for an interview for the {{position}} position.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{location}}\n\nBest regards,\nHR Team",
            type: "interview_invitation",
            variables: ["candidate_name", "position", "interview_date", "interview_time", "location"],
            created_at: "2024-01-15T10:00:00",
            updated_at: "2024-01-20T14:30:00"
          },
          {
            id: 2,
            name: "Interview Reminder",
            subject: "Reminder: Interview Tomorrow - {{position}}",
            content: "Dear {{candidate_name}},\n\nThis is a friendly reminder about your interview tomorrow.\n\nPosition: {{position}}\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{location}}\n\nPlease be prepared and arrive 10 minutes early.\n\nBest regards,\nHR Team",
            type: "interview_reminder",
            variables: ["candidate_name", "position", "interview_date", "interview_time", "location"],
            created_at: "2024-01-16T09:00:00",
            updated_at: "2024-01-18T11:15:00"
          }
        ];

        const mockHistory = [
          {
            id: 1,
            template_name: "Interview Invitation",
            recipient: "john.smith@example.com",
            subject: "Interview Invitation - Senior Developer",
            sent_at: "2024-01-22T10:30:00",
            status: "delivered",
            opened: true,
            clicked: false,
            bounce_reason: null
          },
          {
            id: 2,
            template_name: "Interview Reminder",
            recipient: "jane.doe@example.com",
            subject: "Reminder: Interview Tomorrow - Marketing Manager",
            sent_at: "2024-01-21T15:45:00",
            status: "delivered",
            opened: true,
            clicked: true,
            bounce_reason: null
          }
        ];

        const mockScheduled = [
          {
            id: 1,
            template_name: "Interview Reminder",
            recipient: "alice.wilson@example.com",
            subject: "Reminder: Interview Tomorrow - Product Manager",
            scheduled_for: "2024-01-25T09:00:00",
            status: "pending",
            data: {
              candidate_name: "Alice Wilson",
              position: "Product Manager",
              interview_date: "2024-01-26",
              interview_time: "10:00 AM",
              location: "Conference Room B"
            }
          }
        ];

        const mockSettings = {
          smtp_host: "smtp.gmail.com",
          smtp_port: 587,
          smtp_username: "hr@company.com",
          smtp_use_tls: true,
          default_sender: "hr@company.com",
          default_sender_name: "HR Team",
          auto_reminder_enabled: true,
          reminder_hours_before: 24,
          max_retry_attempts: 3,
          retry_delay_minutes: 30
        };

        setTemplates(mockTemplates);
        setNotificationHistory(mockHistory);
        setScheduledNotifications(mockScheduled);
        setSettings(mockSettings);
      }
    } catch (error) {
      setError('Failed to fetch notification data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm)
      });

      if (response.ok) {
        setSendDialogOpen(false);
        setSendForm({ template: '', recipient: '', data: {} });
        fetchData();
        alert('Notification sent successfully!');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      alert('Error sending notification');
    }
  };

  const handleScheduleNotification = async () => {
    try {
      const response = await fetch('/api/v1/notifications/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        setScheduleDialogOpen(false);
        setScheduleForm({ template: '', recipient: '', scheduled_for: '', data: {} });
        fetchData();
        alert('Notification scheduled successfully!');
      } else {
        alert('Failed to schedule notification');
      }
    } catch (error) {
      alert('Error scheduling notification');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const response = await fetch('/api/v1/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });

      if (response.ok) {
        setTestDialogOpen(false);
        setTestEmail('');
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email');
      }
    } catch (error) {
      alert('Error sending test email');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading notifications...</Typography>
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
        <EmailIcon /> Email Notifications & Reminders
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setSendDialogOpen(true)}
        >
          Send Notification
        </Button>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => setScheduleDialogOpen(true)}
        >
          Schedule Notification
        </Button>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setSettingsDialogOpen(true)}
        >
          Settings
        </Button>
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={() => setTestDialogOpen(true)}
        >
          Send Test Email
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
          <Tab label="Email Templates" icon={<EmailIcon />} />
          <Tab label="Notification History" />
          <Tab label="Scheduled Notifications" icon={<ScheduleIcon />} />
          <Tab label="Settings" icon={<SettingsIcon />} />
        </Tabs>
      </Paper>

      {/* Email Templates Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {templates && Object.entries(templates).map(([key, template]: [string, any]) => (
            <Grid item xs={12} md={6} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.subject || key.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {template.body?.substring(0, 200)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<SendIcon />}>
                      Use Template
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Notification History Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Sent</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notificationHistory?.map((notification: any) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    {new Date(notification.sent_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>{notification.subject}</TableCell>
                  <TableCell>
                    <Chip label={notification.template_used} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={notification.status === 'sent' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={notification.status}
                      color={notification.status === 'sent' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Scheduled Notifications Tab */}
      <TabPanel value={currentTab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Scheduled For</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scheduledNotifications?.map((notification: any) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    {new Date(notification.scheduled_for).toLocaleString()}
                  </TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>
                    <Chip label={notification.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={notification.status}
                      color={notification.status === 'pending' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              {settings && (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email Notifications" />
                    <Switch checked={settings.email_enabled} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Auto Reminders" />
                    <Switch checked={settings.auto_reminders} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Daily Digest" />
                    <Switch checked={settings.daily_digest} />
                  </ListItem>
                </List>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reminder Times
              </Typography>
              {settings?.reminder_hours_before && (
                <Box>
                  {settings.reminder_hours_before.map((hours: number, index: number) => (
                    <Chip
                      key={index}
                      label={`${hours} ${hours === 1 ? 'hour' : hours < 1 ? 'minutes' : 'hours'} before`}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={sendForm.template}
                onChange={(e) => setSendForm(prev => ({ ...prev, template: e.target.value }))}
              >
                {templates && Object.keys(templates).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipient Email"
              value={sendForm.recipient}
              onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendNotification} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Notification Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={scheduleForm.template}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, template: e.target.value }))}
              >
                {templates && Object.keys(templates).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipient Email"
              value={scheduleForm.recipient}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, recipient: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Scheduled For"
              type="datetime-local"
              value={scheduleForm.scheduled_for}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduled_for: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleNotification} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test Email Address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendTestEmail} variant="contained">Send Test</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmailNotifications;
