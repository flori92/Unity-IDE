import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Tab,
  Tabs,
  Badge,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import {
  BugReport as VulnerabilityIcon,
  Shield as ShieldIcon,
  PlayArrow as ScanIcon,
  Report as ReportIcon,
  Lock as SecretIcon,
  Policy as PolicyIcon,
  Gavel as ComplianceIcon,
  AutoFixHigh as AutoFixIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Vulnerability {
  id: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  version: string;
  fixedVersion?: string;
  description: string;
  exploitable: boolean;
  cvss: number;
  published: Date;
  references: string[];
}

interface SecurityScan {
  id: string;
  type: 'container' | 'code' | 'dependency' | 'infrastructure' | 'secrets';
  target: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ComplianceCheck {
  id: string;
  standard: 'PCI-DSS' | 'HIPAA' | 'GDPR' | 'SOC2' | 'ISO27001';
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  checks: {
    passed: number;
    failed: number;
    warning: number;
  };
  lastChecked: Date;
}

const SecurityHub: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoFix, setAutoFix] = useState(false);

  // Mock data
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    {
      id: '1',
      cve: 'CVE-2024-1234',
      severity: 'critical',
      component: 'nginx',
      version: '1.19.0',
      fixedVersion: '1.25.3',
      description: 'Remote code execution vulnerability in nginx',
      exploitable: true,
      cvss: 9.8,
      published: new Date('2024-01-10'),
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1234'],
    },
    {
      id: '2',
      cve: 'CVE-2024-5678',
      severity: 'high',
      component: 'log4j',
      version: '2.14.0',
      fixedVersion: '2.20.0',
      description: 'Log4Shell vulnerability allowing remote code execution',
      exploitable: true,
      cvss: 8.5,
      published: new Date('2024-01-05'),
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-5678'],
    },
    {
      id: '3',
      cve: 'CVE-2024-9101',
      severity: 'medium',
      component: 'express',
      version: '4.17.0',
      fixedVersion: '4.18.2',
      description: 'XSS vulnerability in Express.js',
      exploitable: false,
      cvss: 5.4,
      published: new Date('2024-01-15'),
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-9101'],
    },
  ]);

  const [, setScans] = useState<SecurityScan[]>([
    {
      id: '1',
      type: 'container',
      target: 'frontend:latest',
      status: 'completed',
      startTime: new Date('2024-01-20T10:00:00'),
      endTime: new Date('2024-01-20T10:05:00'),
      vulnerabilities: { critical: 2, high: 5, medium: 12, low: 23 },
    },
    {
      id: '2',
      type: 'dependency',
      target: 'package.json',
      status: 'running',
      startTime: new Date('2024-01-20T11:00:00'),
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    },
  ]);

  const [compliance] = useState<ComplianceCheck[]>([
    {
      id: '1',
      standard: 'GDPR',
      status: 'partial',
      score: 78,
      checks: { passed: 45, failed: 8, warning: 5 },
      lastChecked: new Date('2024-01-19'),
    },
    {
      id: '2',
      standard: 'SOC2',
      status: 'compliant',
      score: 92,
      checks: { passed: 92, failed: 3, warning: 5 },
      lastChecked: new Date('2024-01-18'),
    },
  ]);

  const severityColors = {
    critical: theme.palette.error.main,
    high: theme.palette.warning.main,
    medium: theme.palette.info.main,
    low: theme.palette.success.main,
  };

  const vulnerabilityData = [
    { name: 'Critical', value: 2, color: severityColors.critical },
    { name: 'High', value: 5, color: severityColors.high },
    { name: 'Medium', value: 12, color: severityColors.medium },
    { name: 'Low', value: 23, color: severityColors.low },
  ];

  const trendData = [
    { month: 'Jan', critical: 5, high: 12, medium: 20, low: 30 },
    { month: 'Feb', critical: 3, high: 10, medium: 18, low: 28 },
    { month: 'Mar', critical: 2, high: 8, medium: 15, low: 25 },
    { month: 'Apr', critical: 2, high: 5, medium: 12, low: 23 },
  ];

  const handleScan = async (type: string) => {
    setScanning(true);
    // Simulate scan
    setTimeout(() => {
      setScanning(false);
      setScans(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: type as any,
          target: 'New scan',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          vulnerabilities: {
            critical: Math.floor(Math.random() * 5),
            high: Math.floor(Math.random() * 10),
            medium: Math.floor(Math.random() * 20),
            low: Math.floor(Math.random() * 30),
          },
        },
      ]);
    }, 3000);
  };

  const handleAutoFix = async () => {
    setAutoFix(true);
    // Simulate auto-fix
    setTimeout(() => {
      setAutoFix(false);
      setVulnerabilities(prev =>
        prev.filter(v => v.severity !== 'critical' && v.severity !== 'high')
      );
    }, 2000);
  };

  const getSecurityScore = () => {
    const total = vulnerabilities.length;
    if (total === 0) return 100;
    const weights = { critical: 10, high: 5, medium: 2, low: 1 };
    const score = vulnerabilities.reduce((acc, v) => acc - weights[v.severity], 100);
    return Math.max(0, score);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Security Hub
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive security analysis and compliance monitoring
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ScanIcon />}
            onClick={() => handleScan('full')}
            disabled={scanning}
          >
            Full Scan
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoFixIcon />}
            onClick={handleAutoFix}
            disabled={autoFix}
            color="success"
          >
            Auto-Fix
          </Button>
          <IconButton>
            <ScheduleIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Security Score Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <ShieldIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {getSecurityScore()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Security Score
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getSecurityScore()}
                sx={{ height: 8, borderRadius: 4 }}
                color={getSecurityScore() > 80 ? 'success' : getSecurityScore() > 60 ? 'warning' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        {Object.entries(severityColors).map(([severity, color]) => (
          <Grid item xs={12} sm={6} md={2.25} key={severity}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color }}>
                      {vulnerabilities.filter(v => v.severity === severity).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {severity}
                    </Typography>
                  </Box>
                  <VulnerabilityIcon sx={{ color, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab 
            label={
              <Badge badgeContent={vulnerabilities.length} color="error">
                Vulnerabilities
              </Badge>
            }
            icon={<VulnerabilityIcon />}
            iconPosition="start"
          />
          <Tab label="Compliance" icon={<ComplianceIcon />} iconPosition="start" />
          <Tab label="Secrets" icon={<SecretIcon />} iconPosition="start" />
          <Tab label="Policies" icon={<PolicyIcon />} iconPosition="start" />
          <Tab label="Reports" icon={<ReportIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Vulnerability List */}
          <Grid item xs={12} lg={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Severity</TableCell>
                    <TableCell>CVE</TableCell>
                    <TableCell>Component</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>CVSS</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vulnerabilities.map((vuln) => (
                    <TableRow key={vuln.id} hover>
                      <TableCell>
                        <Chip
                          label={vuln.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(severityColors[vuln.severity], 0.1),
                            color: severityColors[vuln.severity],
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {vuln.cve}
                        </Typography>
                      </TableCell>
                      <TableCell>{vuln.component}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {vuln.version}
                        </Typography>
                        {vuln.fixedVersion && (
                          <Typography variant="caption" color="success.main">
                            → {vuln.fixedVersion}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={vuln.cvss}
                          color={vuln.cvss > 7 ? 'error' : vuln.cvss > 4 ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {vuln.exploitable && (
                          <Chip label="Exploitable" color="error" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedVulnerability(vuln);
                            setDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                        {vuln.fixedVersion && (
                          <Button size="small" color="success">
                            Fix
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vulnerability Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Trend Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke={severityColors.critical} fill={severityColors.critical} />
                  <Area type="monotone" dataKey="high" stackId="1" stroke={severityColors.high} fill={severityColors.high} />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke={severityColors.medium} fill={severityColors.medium} />
                  <Area type="monotone" dataKey="low" stackId="1" stroke={severityColors.low} fill={severityColors.low} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {compliance.map((check) => (
            <Grid item xs={12} md={6} key={check.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{check.standard}</Typography>
                      <Chip
                        label={check.status}
                        size="small"
                        color={check.status === 'compliant' ? 'success' : check.status === 'partial' ? 'warning' : 'error'}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color={check.score > 80 ? 'success.main' : 'warning.main'}>
                        {check.score}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Compliance Score
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip label={`✓ ${check.checks.passed} Passed`} size="small" color="success" variant="outlined" />
                    <Chip label={`✗ ${check.checks.failed} Failed`} size="small" color="error" variant="outlined" />
                    <Chip label={`⚠ ${check.checks.warning} Warning`} size="small" color="warning" variant="outlined" />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={check.score}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Last checked: {check.lastChecked.toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View Report</Button>
                  <Button size="small">Re-scan</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vulnerability Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedVulnerability && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={selectedVulnerability.severity}
                  sx={{
                    bgcolor: alpha(severityColors[selectedVulnerability.severity], 0.1),
                    color: severityColors[selectedVulnerability.severity],
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                />
                <Typography variant="h6">{selectedVulnerability.cve}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity={selectedVulnerability.severity === 'critical' ? 'error' : 'warning'}>
                    <AlertTitle>Description</AlertTitle>
                    {selectedVulnerability.description}
                  </Alert>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Component</Typography>
                  <Typography variant="body1">{selectedVulnerability.component}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">CVSS Score</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedVulnerability.cvss}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Version</Typography>
                  <Typography variant="body1" color="error">{selectedVulnerability.version}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Fixed Version</Typography>
                  <Typography variant="body1" color="success.main">
                    {selectedVulnerability.fixedVersion || 'Not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Remediation
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <code>npm update {selectedVulnerability.component}@{selectedVulnerability.fixedVersion}</code>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="contained" color="success" startIcon={<AutoFixIcon />}>
                Apply Fix
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SecurityHub;
