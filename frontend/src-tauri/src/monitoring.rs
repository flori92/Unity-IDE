use std::collections::HashMap;
use anyhow::Result;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub timestamp: DateTime<Utc>,
    pub cpu: CpuMetrics,
    pub memory: MemoryMetrics,
    pub disk: DiskMetrics,
    pub network: NetworkMetrics,
    pub docker: DockerMetrics,
    pub kubernetes: K8sMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuMetrics {
    pub usage_percent: f64,
    pub cores: usize,
    pub load_average: [f64; 3],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetrics {
    pub total_mb: u64,
    pub used_mb: u64,
    pub free_mb: u64,
    pub usage_percent: f64,
    pub swap_total_mb: u64,
    pub swap_used_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskMetrics {
    pub total_gb: u64,
    pub used_gb: u64,
    pub free_gb: u64,
    pub usage_percent: f64,
    pub io_read_mb_s: f64,
    pub io_write_mb_s: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMetrics {
    pub rx_mb_s: f64,
    pub tx_mb_s: f64,
    pub connections: usize,
    pub interfaces: Vec<NetworkInterface>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub ip_address: String,
    pub is_up: bool,
    pub speed_mbps: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockerMetrics {
    pub containers_running: usize,
    pub containers_stopped: usize,
    pub images_count: usize,
    pub volumes_count: usize,
    pub networks_count: usize,
    pub disk_usage_gb: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct K8sMetrics {
    pub nodes_ready: usize,
    pub nodes_total: usize,
    pub pods_running: usize,
    pub pods_pending: usize,
    pub pods_failed: usize,
    pub deployments_healthy: usize,
    pub services_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub id: String,
    pub severity: AlertSeverity,
    pub source: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub acknowledged: bool,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Critical,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub source: String,
    pub message: String,
    pub container_id: Option<String>,
    pub pod_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

pub struct MonitoringService {
    metrics_history: Arc<RwLock<Vec<SystemMetrics>>>,
    active_alerts: Arc<RwLock<Vec<Alert>>>,
    log_buffer: Arc<RwLock<Vec<LogEntry>>>,
    monitoring_enabled: Arc<RwLock<bool>>,
}

impl MonitoringService {
    pub fn new() -> Self {
        MonitoringService {
            metrics_history: Arc::new(RwLock::new(Vec::new())),
            active_alerts: Arc::new(RwLock::new(Vec::new())),
            log_buffer: Arc::new(RwLock::new(Vec::new())),
            monitoring_enabled: Arc::new(RwLock::new(true)),
        }
    }

    pub async fn start_monitoring(&self) {
        *self.monitoring_enabled.write().await = true;
        
        // Start background monitoring tasks
        self.spawn_metrics_collector().await;
        self.spawn_alert_processor().await;
        self.spawn_log_aggregator().await;
    }

    pub async fn stop_monitoring(&self) {
        *self.monitoring_enabled.write().await = false;
    }

    pub async fn get_metrics(&self) -> Result<SystemMetrics> {
        // Collect current system metrics
        let metrics = SystemMetrics {
            timestamp: Utc::now(),
            cpu: self.collect_cpu_metrics().await?,
            memory: self.collect_memory_metrics().await?,
            disk: self.collect_disk_metrics().await?,
            network: self.collect_network_metrics().await?,
            docker: self.collect_docker_metrics().await?,
            kubernetes: self.collect_k8s_metrics().await?,
        };

        // Store in history
        let mut history = self.metrics_history.write().await;
        history.push(metrics.clone());
        
        // Keep only last 1000 entries
        if history.len() > 1000 {
            history.drain(0..100);
        }

        Ok(metrics)
    }

    pub async fn get_metrics_history(&self, duration_minutes: u32) -> Result<Vec<SystemMetrics>> {
        let history = self.metrics_history.read().await;
        let cutoff = Utc::now() - chrono::Duration::minutes(duration_minutes as i64);
        
        let filtered: Vec<SystemMetrics> = history
            .iter()
            .filter(|m| m.timestamp > cutoff)
            .cloned()
            .collect();
        
        Ok(filtered)
    }

    pub async fn create_alert(&self, severity: AlertSeverity, source: String, message: String) -> Result<()> {
        let alert = Alert {
            id: uuid::Uuid::new_v4().to_string(),
            severity,
            source,
            message,
            timestamp: Utc::now(),
            acknowledged: false,
            metadata: HashMap::new(),
        };

        let mut alerts = self.active_alerts.write().await;
        alerts.push(alert);
        
        Ok(())
    }

    pub async fn get_active_alerts(&self) -> Result<Vec<Alert>> {
        let alerts = self.active_alerts.read().await;
        Ok(alerts.clone())
    }

    pub async fn acknowledge_alert(&self, alert_id: &str) -> Result<()> {
        let mut alerts = self.active_alerts.write().await;
        if let Some(alert) = alerts.iter_mut().find(|a| a.id == alert_id) {
            alert.acknowledged = true;
        }
        Ok(())
    }

    pub async fn add_log_entry(&self, level: LogLevel, source: String, message: String) {
        let entry = LogEntry {
            timestamp: Utc::now(),
            level,
            source,
            message,
            container_id: None,
            pod_name: None,
        };

        let mut buffer = self.log_buffer.write().await;
        buffer.push(entry);
        
        // Keep only last 10000 entries
        if buffer.len() > 10000 {
            buffer.drain(0..1000);
        }
    }

    pub async fn search_logs(&self, query: &str, limit: usize) -> Result<Vec<LogEntry>> {
        let buffer = self.log_buffer.read().await;
        
        let results: Vec<LogEntry> = buffer
            .iter()
            .filter(|log| log.message.contains(query) || log.source.contains(query))
            .take(limit)
            .cloned()
            .collect();
        
        Ok(results)
    }

    async fn spawn_metrics_collector(&self) {
        let enabled = self.monitoring_enabled.clone();
        let service = self.clone_for_spawn();
        
        tokio::spawn(async move {
            loop {
                if !*enabled.read().await {
                    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                    continue;
                }

                // Collect metrics every 5 seconds
                let _ = service.get_metrics().await;
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        });
    }

    async fn spawn_alert_processor(&self) {
        // Process alerts and check thresholds
    }

    async fn spawn_log_aggregator(&self) {
        // Aggregate logs from various sources
    }

    async fn collect_cpu_metrics(&self) -> Result<CpuMetrics> {
        // Use system info crates to collect real metrics
        Ok(CpuMetrics {
            usage_percent: 45.2,
            cores: 8,
            load_average: [1.5, 1.3, 1.1],
        })
    }

    async fn collect_memory_metrics(&self) -> Result<MemoryMetrics> {
        Ok(MemoryMetrics {
            total_mb: 16384,
            used_mb: 8192,
            free_mb: 8192,
            usage_percent: 50.0,
            swap_total_mb: 4096,
            swap_used_mb: 1024,
        })
    }

    async fn collect_disk_metrics(&self) -> Result<DiskMetrics> {
        Ok(DiskMetrics {
            total_gb: 500,
            used_gb: 250,
            free_gb: 250,
            usage_percent: 50.0,
            io_read_mb_s: 10.5,
            io_write_mb_s: 5.2,
        })
    }

    async fn collect_network_metrics(&self) -> Result<NetworkMetrics> {
        Ok(NetworkMetrics {
            rx_mb_s: 1.5,
            tx_mb_s: 0.8,
            connections: 42,
            interfaces: vec![],
        })
    }

    async fn collect_docker_metrics(&self) -> Result<DockerMetrics> {
        Ok(DockerMetrics {
            containers_running: 5,
            containers_stopped: 3,
            images_count: 20,
            volumes_count: 10,
            networks_count: 3,
            disk_usage_gb: 15.5,
        })
    }

    async fn collect_k8s_metrics(&self) -> Result<K8sMetrics> {
        Ok(K8sMetrics {
            nodes_ready: 3,
            nodes_total: 3,
            pods_running: 25,
            pods_pending: 2,
            pods_failed: 0,
            deployments_healthy: 8,
            services_count: 12,
        })
    }

    fn clone_for_spawn(&self) -> Self {
        MonitoringService {
            metrics_history: self.metrics_history.clone(),
            active_alerts: self.active_alerts.clone(),
            log_buffer: self.log_buffer.clone(),
            monitoring_enabled: self.monitoring_enabled.clone(),
        }
    }
}
