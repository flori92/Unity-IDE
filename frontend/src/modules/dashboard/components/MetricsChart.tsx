import React, { useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, useTheme, alpha } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsData {
  labels: string[];
  cpu: number[];
  memory: number[];
  disk: number[];
  network: number[];
}

const MetricsChart: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cpu', 'memory']);
  const [metricsData, setMetricsData] = useState<MetricsData>({
    labels: [],
    cpu: [],
    memory: [],
    disk: [],
    network: [],
  });

  useEffect(() => {
    // Generate mock data based on time range
    const generateData = () => {
      const dataPoints = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 84;
      const labels: string[] = [];
      const cpu: number[] = [];
      const memory: number[] = [];
      const disk: number[] = [];
      const network: number[] = [];

      for (let i = 0; i < dataPoints; i++) {
        const time = new Date();
        if (timeRange === '1h') {
          time.setMinutes(time.getMinutes() - (dataPoints - i) * 5);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        } else if (timeRange === '6h') {
          time.setMinutes(time.getMinutes() - (dataPoints - i) * 10);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        } else {
          time.setHours(time.getHours() - (dataPoints - i));
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit' }));
        }

        cpu.push(40 + Math.random() * 30);
        memory.push(50 + Math.random() * 20);
        disk.push(60 + Math.random() * 10);
        network.push(20 + Math.random() * 40);
      }

      setMetricsData({ labels, cpu, memory, disk, network });
    };

    generateData();
    const interval = setInterval(generateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newRange: string | null) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleMetricsToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const datasets = [];
  
  if (selectedMetrics.includes('cpu')) {
    datasets.push({
      label: 'CPU Usage %',
      data: metricsData.cpu,
      borderColor: theme.palette.info.main,
      backgroundColor: alpha(theme.palette.info.main, 0.1),
      tension: 0.4,
      fill: true,
    });
  }
  
  if (selectedMetrics.includes('memory')) {
    datasets.push({
      label: 'Memory Usage %',
      data: metricsData.memory,
      borderColor: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, 0.1),
      tension: 0.4,
      fill: true,
    });
  }
  
  if (selectedMetrics.includes('disk')) {
    datasets.push({
      label: 'Disk Usage %',
      data: metricsData.disk,
      borderColor: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      tension: 0.4,
      fill: true,
    });
  }
  
  if (selectedMetrics.includes('network')) {
    datasets.push({
      label: 'Network I/O MB/s',
      data: metricsData.network,
      borderColor: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      tension: 0.4,
      fill: true,
    });
  }

  const chartData = {
    labels: metricsData.labels,
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          maxRotation: 0,
          autoSkipPadding: 20,
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['cpu', 'memory', 'disk', 'network'].map(metric => (
            <ToggleButton
              key={metric}
              value={metric}
              selected={selectedMetrics.includes(metric)}
              onChange={() => handleMetricsToggle(metric)}
              size="small"
              sx={{
                px: 1.5,
                py: 0.5,
                textTransform: 'capitalize',
              }}
            >
              {metric}
            </ToggleButton>
          ))}
        </Box>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="1h">1h</ToggleButton>
          <ToggleButton value="6h">6h</ToggleButton>
          <ToggleButton value="24h">24h</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default MetricsChart;
