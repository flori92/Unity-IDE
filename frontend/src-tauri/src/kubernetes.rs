use kube::{Api, Client, Config};
use k8s_openapi::api::core::v1::{Pod, Service, Node, Namespace};
use k8s_openapi::api::apps::v1::{Deployment, StatefulSet, DaemonSet};
use kube::api::{ListParams, PostParams, DeleteParams};
use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PodInfo {
    pub name: String,
    pub namespace: String,
    pub status: String,
    pub node: Option<String>,
    pub containers: Vec<ContainerStatus>,
    pub age: String,
    pub labels: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerStatus {
    pub name: String,
    pub ready: bool,
    pub restart_count: i32,
    pub image: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub name: String,
    pub namespace: String,
    pub service_type: String,
    pub cluster_ip: Option<String>,
    pub external_ip: Option<String>,
    pub ports: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentInfo {
    pub name: String,
    pub namespace: String,
    pub ready_replicas: i32,
    pub replicas: i32,
    pub available_replicas: i32,
    pub age: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub name: String,
    pub status: String,
    pub role: String,
    pub version: String,
    pub os: String,
    pub kernel_version: String,
}

pub struct K8sManager {
    client: Option<Client>,
    current_context: Option<String>,
}

impl K8sManager {
    pub fn new() -> Self {
        K8sManager {
            client: None,
            current_context: None,
        }
    }

    pub async fn connect(&mut self, config_path: &str) -> Result<()> {
        let config = if config_path.is_empty() {
            Config::infer().await?
        } else {
            Config::from_kubeconfig_file(config_path).await?
        };

        self.current_context = Some(config.current_context.clone().unwrap_or_default());
        self.client = Some(Client::try_from(config)?);
        
        Ok(())
    }

    pub async fn list_pods(&self, namespace: Option<String>) -> Result<Vec<PodInfo>> {
        let client = self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Not connected to cluster"))?;

        let pods: Api<Pod> = if let Some(ns) = namespace {
            Api::namespaced(client.clone(), &ns)
        } else {
            Api::all(client.clone())
        };

        let pod_list = pods.list(&ListParams::default()).await?;
        
        let mut pod_infos = Vec::new();
        for pod in pod_list {
            let metadata = pod.metadata;
            let spec = pod.spec.unwrap_or_default();
            let status = pod.status.unwrap_or_default();

            let container_statuses: Vec<ContainerStatus> = status.container_statuses
                .unwrap_or_default()
                .into_iter()
                .map(|cs| ContainerStatus {
                    name: cs.name,
                    ready: cs.ready,
                    restart_count: cs.restart_count,
                    image: cs.image,
                })
                .collect();

            pod_infos.push(PodInfo {
                name: metadata.name.unwrap_or_default(),
                namespace: metadata.namespace.unwrap_or_default(),
                status: status.phase.unwrap_or_else(|| "Unknown".to_string()),
                node: spec.node_name,
                containers: container_statuses,
                age: Self::calculate_age(metadata.creation_timestamp),
                labels: metadata.labels.unwrap_or_default(),
            });
        }

        Ok(pod_infos)
    }

    pub async fn list_services(&self, namespace: Option<String>) -> Result<Vec<ServiceInfo>> {
        let client = self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Not connected to cluster"))?;

        let services: Api<Service> = if let Some(ns) = namespace {
            Api::namespaced(client.clone(), &ns)
        } else {
            Api::all(client.clone())
        };

        let service_list = services.list(&ListParams::default()).await?;
        
        let mut service_infos = Vec::new();
        for service in service_list {
            let metadata = service.metadata;
            let spec = service.spec.unwrap_or_default();

            let ports: Vec<String> = spec.ports.unwrap_or_default()
                .into_iter()
                .map(|p| format!("{}:{}", p.port, p.target_port.unwrap_or_default()))
                .collect();

            service_infos.push(ServiceInfo {
                name: metadata.name.unwrap_or_default(),
                namespace: metadata.namespace.unwrap_or_default(),
                service_type: spec.type_.unwrap_or_else(|| "ClusterIP".to_string()),
                cluster_ip: spec.cluster_ip,
                external_ip: spec.external_ips.and_then(|ips| ips.first().cloned()),
                ports,
            });
        }

        Ok(service_infos)
    }

    pub async fn list_deployments(&self, namespace: Option<String>) -> Result<Vec<DeploymentInfo>> {
        let client = self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Not connected to cluster"))?;

        let deployments: Api<Deployment> = if let Some(ns) = namespace {
            Api::namespaced(client.clone(), &ns)
        } else {
            Api::all(client.clone())
        };

        let deployment_list = deployments.list(&ListParams::default()).await?;
        
        let mut deployment_infos = Vec::new();
        for deployment in deployment_list {
            let metadata = deployment.metadata;
            let status = deployment.status.unwrap_or_default();

            deployment_infos.push(DeploymentInfo {
                name: metadata.name.unwrap_or_default(),
                namespace: metadata.namespace.unwrap_or_default(),
                ready_replicas: status.ready_replicas.unwrap_or(0),
                replicas: status.replicas.unwrap_or(0),
                available_replicas: status.available_replicas.unwrap_or(0),
                age: Self::calculate_age(metadata.creation_timestamp),
            });
        }

        Ok(deployment_infos)
    }

    pub async fn list_nodes(&self) -> Result<Vec<NodeInfo>> {
        let client = self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Not connected to cluster"))?;

        let nodes: Api<Node> = Api::all(client.clone());
        let node_list = nodes.list(&ListParams::default()).await?;
        
        let mut node_infos = Vec::new();
        for node in node_list {
            let metadata = node.metadata;
            let status = node.status.unwrap_or_default();
            let node_info = status.node_info.unwrap_or_default();

            let role = if metadata.labels.as_ref()
                .and_then(|labels| labels.get("node-role.kubernetes.io/master"))
                .is_some() {
                "master".to_string()
            } else {
                "worker".to_string()
            };

            node_infos.push(NodeInfo {
                name: metadata.name.unwrap_or_default(),
                status: Self::get_node_status(&status.conditions.unwrap_or_default()),
                role,
                version: node_info.kubelet_version,
                os: format!("{}/{}", node_info.operating_system, node_info.architecture),
                kernel_version: node_info.kernel_version,
            });
        }

        Ok(node_infos)
    }

    pub async fn apply_yaml(&self, yaml_content: &str) -> Result<()> {
        // Parse and apply YAML manifests
        // This would use the kube API to create/update resources
        Ok(())
    }

    pub async fn delete_resource(&self, resource_type: &str, name: &str, namespace: Option<String>) -> Result<()> {
        let client = self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Not connected to cluster"))?;

        match resource_type {
            "pod" => {
                let pods: Api<Pod> = if let Some(ns) = namespace {
                    Api::namespaced(client.clone(), &ns)
                } else {
                    Api::default_namespaced(client.clone())
                };
                pods.delete(name, &DeleteParams::default()).await?;
            }
            "deployment" => {
                let deployments: Api<Deployment> = if let Some(ns) = namespace {
                    Api::namespaced(client.clone(), &ns)
                } else {
                    Api::default_namespaced(client.clone())
                };
                deployments.delete(name, &DeleteParams::default()).await?;
            }
            _ => return Err(anyhow::anyhow!("Unsupported resource type: {}", resource_type)),
        }

        Ok(())
    }

    fn calculate_age(timestamp: Option<k8s_openapi::apimachinery::pkg::apis::meta::v1::Time>) -> String {
        if let Some(ts) = timestamp {
            let duration = chrono::Utc::now().signed_duration_since(ts.0);
            if duration.num_days() > 0 {
                format!("{}d", duration.num_days())
            } else if duration.num_hours() > 0 {
                format!("{}h", duration.num_hours())
            } else if duration.num_minutes() > 0 {
                format!("{}m", duration.num_minutes())
            } else {
                format!("{}s", duration.num_seconds())
            }
        } else {
            "Unknown".to_string()
        }
    }

    fn get_node_status(conditions: &[k8s_openapi::api::core::v1::NodeCondition]) -> String {
        for condition in conditions {
            if condition.type_ == "Ready" && condition.status == "True" {
                return "Ready".to_string();
            }
        }
        "NotReady".to_string()
    }
}
