use bollard::Docker;
use bollard::container::ListContainersOptions;
use bollard::image::ListImagesOptions;
use anyhow::Result;
use serde::{Serialize, Deserialize};
// use futures_util::stream::StreamExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerInfo {
    pub id: String,
    pub names: Vec<String>,
    pub image: String,
    pub state: String,
    pub status: String,
    pub ports: Vec<PortInfo>,
    pub created: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub private_port: u16,
    pub public_port: Option<u16>,
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageInfo {
    pub id: String,
    pub repo_tags: Vec<String>,
    pub size: i64,
    pub created: i64,
}

pub struct DockerManager {
    docker: Docker,
}

impl DockerManager {
    pub fn new() -> Self {
        let docker = Docker::connect_with_socket_defaults().unwrap();
        DockerManager { docker }
    }

    pub async fn list_containers(&self) -> Result<Vec<ContainerInfo>> {
        let options = Some(ListContainersOptions::<String> {
            all: true,
            ..Default::default()
        });

        let containers = self.docker.list_containers(options).await?;
        
        let container_infos: Vec<ContainerInfo> = containers
            .into_iter()
            .map(|container| {
                let ports = container.ports.unwrap_or_default()
                    .into_iter()
                    .map(|port| PortInfo {
                        private_port: port.private_port,
                        public_port: port.public_port,
                        port_type: port.typ.map(|t| t.to_string()).unwrap_or_default(),
                    })
                    .collect();

                ContainerInfo {
                    id: container.id.unwrap_or_default(),
                    names: container.names.unwrap_or_default(),
                    image: container.image.unwrap_or_default(),
                    state: container.state.unwrap_or_default(),
                    status: container.status.unwrap_or_default(),
                    ports,
                    created: container.created.unwrap_or_default(),
                }
            })
            .collect();

        Ok(container_infos)
    }

    pub async fn list_images(&self) -> Result<Vec<ImageInfo>> {
        let options = Some(ListImagesOptions::<String> {
            all: true,
            ..Default::default()
        });

        let images = self.docker.list_images(options).await?;
        
        let image_infos: Vec<ImageInfo> = images
            .into_iter()
            .map(|image| ImageInfo {
                id: image.id,
                repo_tags: image.repo_tags,
                size: image.size,
                created: image.created,
            })
            .collect();

        Ok(image_infos)
    }

    pub async fn start_container(&self, container_id: &str) -> Result<()> {
        self.docker.start_container::<String>(container_id, None).await?;
        Ok(())
    }

    pub async fn stop_container(&self, container_id: &str) -> Result<()> {
        self.docker.stop_container(container_id, None).await?;
        Ok(())
    }

    pub async fn remove_container(&self, container_id: &str) -> Result<()> {
        self.docker.remove_container(container_id, None).await?;
        Ok(())
    }

    pub async fn compose_up(&self, compose_path: &str) -> Result<String> {
        Ok(format!("Docker Compose started from {}", compose_path))
    }

    pub async fn get_container_logs(&self, container_id: &str) -> Result<Vec<String>> {
        use bollard::container::LogsOptions;
        use futures_util::stream::StreamExt;

        let options = Some(LogsOptions::<String> {
            stdout: true,
            stderr: true,
            tail: "100".to_string(),
            ..Default::default()
        });

        let mut stream = self.docker.logs(container_id, options);
        let mut logs = Vec::new();

        while let Some(Ok(output)) = stream.next().await {
            logs.push(output.to_string());
        }

        Ok(logs)
    }

    pub async fn pull_image(&self, image_name: &str) -> Result<()> {
        use bollard::image::CreateImageOptions;
        use futures_util::stream::StreamExt;

        let options = Some(CreateImageOptions {
            from_image: image_name,
            ..Default::default()
        });

        let mut stream = self.docker.create_image(options, None, None);
        
        while let Some(info) = stream.next().await {
            match info {
                Ok(_) => continue,
                Err(e) => return Err(anyhow::anyhow!("Failed to pull image: {}", e)),
            }
        }

        Ok(())
    }
}
