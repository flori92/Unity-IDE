import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingDown as SavingsIcon,
  Warning as WarningIcon,
  CloudQueue as CloudIcon,
  Computer as ComputeIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  CheckCircle as CheckIcon,
  AutoFixHigh as OptimizeIcon,
  ShowChart as TrendIcon,
  Download as ExportIcon,
  Schedule as ScheduleIcon,
  TrendingUp as IncreaseIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

interface CostRecommendation {
  id: string;
  resource: string;
  type: string;
  currentCost: number;
  potentialSavings: number;
  savingsPercent: number;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  provider: string;
}

interface ResourceCost {
  name: string;
  type: string;
  provider: string;
  monthlyCost: number;
  dailyCost: number;
  usage: number;
  trend: 'up' | 'down' | 'stable';
}

const CostOptimizer: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const recommendations: CostRecommendation[] = [
    {
      id: '1',
      resource: 'prod-web-server-cluster',
      type: 'EC2 Instance Rightsizing',
      currentCost: 450,
      potentialSavings: 180,
      savingsPercent: 40,
      recommendation: 'Downsize from m5.2xlarge to m5.xlarge (CPU avg 25%)',
      impact: 'low',
      effort: 'easy',
      provider: 'AWS',
    },
    {
      id: '2',
      resource: 'dev-database',
      type: 'Reserved Instances',
      currentCost: 320,
      potentialSavings: 112,
      savingsPercent: 35,
      recommendation: 'Purchase 1-year reserved instances',
      impact: 'medium',
      effort: 'easy',
      provider: 'AWS',
    },
    {
      id: '3',
      resource: 'backup-storage',
      type: 'Storage Optimization',
      currentCost: 250,
      potentialSavings: 125,
      savingsPercent: 50,
      recommendation: 'Move to S3 Glacier for archives older than 90 days',
      impact: 'low',
      effort: 'medium',
      provider: 'AWS',
    },
    {
      id: '4',
      resource: 'staging-k8s-cluster',
      type: 'Idle Resource',
      currentCost: 180,
      potentialSavings: 180,
      savingsPercent: 100,
      recommendation: 'Shut down during non-business hours (8PM-8AM)',
      impact: 'low',
      effort: 'easy',
      provider: 'GCP',
    },
    {
      id: '5',
      resource: 'nat-gateway',
      type: 'Network Optimization',
      currentCost: 150,
      potentialSavings: 45,
      savingsPercent: 30,
      recommendation: 'Use NAT instances instead of NAT Gateway',
      impact: 'medium',
      effort: 'hard',
      provider: 'AWS',
    },
  ];

  const topResources: ResourceCost[] = [
    { name: 'Production Kubernetes', type: 'Compute', provider: 'AWS', monthlyCost: 1250, dailyCost: 41.67, usage: 95, trend: 'up' },
    { name: 'RDS Cluster', type: 'Database', provider: 'AWS', monthlyCost: 850, dailyCost: 28.33, usage: 78, trend: 'stable' },
    { name: 'S3 Storage', type: 'Storage', provider: 'AWS', monthlyCost: 450, dailyCost: 15, usage: 85, trend: 'up' },
    { name: 'CloudFront CDN', type: 'Network', provider: 'AWS', monthlyCost: 320, dailyCost: 10.67, usage: 60, trend: 'down' },
    { name: 'Azure VMs', type: 'Compute', provider: 'Azure', monthlyCost: 280, dailyCost: 9.33, usage: 45, trend: 'stable' },
  ];

  const totalMonthlyCost = 8450;
  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
  const avgSavingsPercent = Math.round((totalPotentialSavings / totalMonthlyCost) * 100);

  const costByService = [
    { name: 'Compute', value: 3500, color: theme.palette.primary.main },
    { name: 'Storage', value: 1200, color: theme.palette.info.main },
    { name: 'Database', value: 1800, color: theme.palette.success.main },
    { name: 'Network', value: 950, color: theme.palette.warning.main },
    { name: 'Other', value: 1000, color: theme.palette.grey[500] },
  ];

  const costTrend = [
    { month: 'Jan', cost: 7200, optimized: 6500 },
    { month: 'Feb', cost: 7500, optimized: 6800 },
    { month: 'Mar', cost: 8100, optimized: 7200 },
    { month: 'Apr', cost: 8450, optimized: 7500 },
    { month: 'May', cost: 8800, optimized: 7600 },
    { month: 'Jun', cost: 8450, optimized: 6808 },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      default: return theme.palette.success.main;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'hard': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      default: return theme.palette.success.main;
    }
  };

  const applyRecommendation = (rec: CostRecommendation) => {
    console.log('Applying recommendation:', rec);
    // Implement recommendation application
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cost Optimizer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered cloud cost optimization and recommendations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<ScheduleIcon />}>Schedule Report</Button>
          <Button startIcon={<ExportIcon />}>Export</Button>
          <Button variant="contained" startIcon={<OptimizeIcon />}>
            Auto-Optimize
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${totalMonthlyCost.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Cost
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <IncreaseIcon sx={{ fontSize: 16, color: theme.palette.error.main, mr: 0.5 }} />
                <Typography variant="caption" color="error.main">
                  +12% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ${totalPotentialSavings.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Potential Savings
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <SavingsIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="success.main">
                {avgSavingsPercent}% of total cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {recommendations.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recommendations
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <WarningIcon />
                </Avatar>
              </Box>
              <Typography variant="caption">
                {recommendations.filter(r => r.effort === 'easy').length} easy wins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${(totalMonthlyCost / 30).toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Daily Burn Rate
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <TrendIcon />
                </Avatar>
              </Box>
              <Typography variant="caption">
                Projected: ${(totalMonthlyCost * 12).toLocaleString()}/year
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Recommendations" />
        <Tab label="Cost Analysis" />
        <Tab label="Resources" />
        <Tab label="Trends" />
      </Tabs>

      {/* Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Quick Wins Available</AlertTitle>
              You can save <strong>${totalPotentialSavings}</strong> per month with minimal effort. 
              The top 3 recommendations can save you <strong>${recommendations.slice(0, 3).reduce((sum, r) => sum + r.potentialSavings, 0)}</strong>.
            </Alert>
          </Grid>
          {recommendations.map(rec => (
            <Grid item xs={12} key={rec.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                          <SavingsIcon sx={{ color: theme.palette.success.main }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{rec.type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rec.resource}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rec.recommendation}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary">Savings</Typography>
                      <Typography variant="h6" color="success.main">
                        ${rec.potentialSavings}/mo
                      </Typography>
                      <Chip label={`${rec.savingsPercent}%`} size="small" color="success" />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`Impact: ${rec.impact}`}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getImpactColor(rec.impact), 0.1),
                            color: getImpactColor(rec.impact),
                          }}
                        />
                        <Chip 
                          label={`${rec.effort}`}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getEffortColor(rec.effort), 0.1),
                            color: getEffortColor(rec.effort),
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        fullWidth
                        startIcon={<CheckIcon />}
                        onClick={() => applyRecommendation(rec)}
                      >
                        Apply
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Cost by Service</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costByService}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value}`}
                  >
                    {costByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Cost Trend vs Optimized</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="cost" stroke={theme.palette.error.main} name="Actual" />
                  <Line type="monotone" dataKey="optimized" stroke={theme.palette.success.main} name="Optimized" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Top Cost Resources</Typography>
          <List>
            {topResources.map(resource => (
              <ListItem key={resource.name}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {resource.type === 'Compute' ? <ComputeIcon /> :
                     resource.type === 'Storage' ? <StorageIcon /> :
                     resource.type === 'Network' ? <NetworkIcon /> : <CloudIcon />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={resource.name}
                  secondary={`${resource.provider} • ${resource.type} • Usage: ${resource.usage}%`}
                />
                <Box sx={{ textAlign: 'right', mr: 2 }}>
                  <Typography variant="h6">${resource.monthlyCost}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${resource.dailyCost}/day
                  </Typography>
                </Box>
                <Chip 
                  label={resource.trend}
                  size="small"
                  color={resource.trend === 'up' ? 'error' : resource.trend === 'down' ? 'success' : 'default'}
                  icon={resource.trend === 'up' ? <IncreaseIcon /> : resource.trend === 'down' ? <SavingsIcon /> : undefined}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default CostOptimizer;
