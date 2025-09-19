// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Manager};
use std::sync::Arc;
use tokio::sync::Mutex;

mod docker;
mod kubernetes;
mod ansible;
mod monitoring;
mod extensions;
mod utils;

use docker::DockerManager;
use kubernetes::K8sManager;
use ansible::AnsibleManager;
use monitoring::MonitoringService;
use extensions::ExtensionManager;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

// State management
struct AppState {
    docker: Arc<Mutex<DockerManager>>,
    k8s: Arc<Mutex<K8sManager>>,
    ansible: Arc<Mutex<AnsibleManager>>,
    monitoring: Arc<Mutex<MonitoringService>>,
    extensions: Arc<Mutex<ExtensionManager>>,
}

// Tauri commands
#[tauri::command]
async fn get_docker_containers(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let docker = state.docker.lock().await;
    match docker.list_containers().await {
        Ok(containers) => Ok(serde_json::to_string(&containers).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn get_k8s_pods(state: tauri::State<'_, AppState>, namespace: Option<String>) -> Result<String, String> {
    let k8s = state.k8s.lock().await;
    match k8s.list_pods(namespace).await {
        Ok(pods) => Ok(serde_json::to_string(&pods).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn run_ansible_playbook(state: tauri::State<'_, AppState>, playbook_path: String, inventory: String) -> Result<String, String> {
    let ansible = state.ansible.lock().await;
    match ansible.run_playbook(&playbook_path, &inventory).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn get_system_metrics(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let monitoring = state.monitoring.lock().await;
    match monitoring.get_metrics().await {
        Ok(metrics) => Ok(serde_json::to_string(&metrics).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn install_extension(state: tauri::State<'_, AppState>, extension_id: String) -> Result<String, String> {
    let mut extensions = state.extensions.lock().await;
    match extensions.install(&extension_id).await {
        Ok(_) => Ok(format!("Extension {} installed successfully", extension_id)),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn connect_to_cluster(state: tauri::State<'_, AppState>, config_path: String) -> Result<String, String> {
    let mut k8s = state.k8s.lock().await;
    match k8s.connect(&config_path).await {
        Ok(_) => Ok("Connected to Kubernetes cluster".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn docker_compose_up(state: tauri::State<'_, AppState>, compose_path: String) -> Result<String, String> {
    let docker = state.docker.lock().await;
    match docker.compose_up(&compose_path).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn create_workflow(name: String, _workflow_def: String) -> Result<String, String> {
    // Workflow creation logic
    Ok(format!("Workflow {} created", name))
}

#[tauri::command]
async fn execute_workflow(workflow_id: String) -> Result<String, String> {
    // Workflow execution logic
    Ok(format!("Executing workflow {}", workflow_id))
}

fn create_menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let about = CustomMenuItem::new("about".to_string(), "About DevOps Unity IDE");
    let preferences = CustomMenuItem::new("preferences".to_string(), "Preferences");
    
    let docker_connect = CustomMenuItem::new("docker_connect".to_string(), "Connect to Docker");
    let k8s_connect = CustomMenuItem::new("k8s_connect".to_string(), "Connect to Kubernetes");
    let ansible_connect = CustomMenuItem::new("ansible_connect".to_string(), "Connect to Ansible");
    
    let new_workflow = CustomMenuItem::new("new_workflow".to_string(), "New Workflow");
    let import_workflow = CustomMenuItem::new("import_workflow".to_string(), "Import Workflow");
    
    let extensions_market = CustomMenuItem::new("extensions_market".to_string(), "Extension Marketplace");
    let manage_extensions = CustomMenuItem::new("manage_extensions".to_string(), "Manage Extensions");

    let submenu_file = Submenu::new("File", Menu::new()
        .add_item(new_workflow)
        .add_item(import_workflow)
        .add_native_item(MenuItem::Separator)
        .add_item(preferences)
        .add_native_item(MenuItem::Separator)
        .add_item(close)
        .add_item(quit));

    let submenu_connections = Submenu::new("Connections", Menu::new()
        .add_item(docker_connect)
        .add_item(k8s_connect)
        .add_item(ansible_connect));

    let submenu_extensions = Submenu::new("Extensions", Menu::new()
        .add_item(extensions_market)
        .add_item(manage_extensions));

    let submenu_help = Submenu::new("Help", Menu::new()
        .add_item(about));

    Menu::new()
        .add_submenu(submenu_file)
        .add_submenu(submenu_connections)
        .add_submenu(submenu_extensions)
        .add_native_item(MenuItem::Separator)
        .add_submenu(submenu_help)
}

fn create_system_tray() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show", "Show"))
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit_tray", "Quit"));

    SystemTray::new().with_menu(tray_menu)
}

fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    let app_state = AppState {
        docker: Arc::new(Mutex::new(DockerManager::new())),
        k8s: Arc::new(Mutex::new(K8sManager::new())),
        ansible: Arc::new(Mutex::new(AnsibleManager::new())),
        monitoring: Arc::new(Mutex::new(MonitoringService::new())),
        extensions: Arc::new(Mutex::new(ExtensionManager::new())),
    };

    tauri::Builder::default()
        .menu(create_menu())
        .system_tray(create_system_tray())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit_tray" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_docker_containers,
            get_k8s_pods,
            run_ansible_playbook,
            get_system_metrics,
            install_extension,
            connect_to_cluster,
            docker_compose_up,
            create_workflow,
            execute_workflow
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            // Emit initial setup event
            window.emit("app_ready", Payload {
                message: "DevOps Unity IDE is ready".to_string(),
            })?;

            // Start monitoring service in background
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                    app_handle.emit_all("monitoring_update", Payload {
                        message: "Monitoring data updated".to_string(),
                    }).unwrap();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
