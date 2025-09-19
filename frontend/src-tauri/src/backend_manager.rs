use std::process::{Command, Child, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::Manager;

pub struct BackendManager {
    process: Option<Child>,
}

impl BackendManager {
    pub fn new() -> Self {
        BackendManager { process: None }
    }

    /// Start the local backend server
    pub fn start(&mut self) -> Result<(), String> {
        // Check if already running
        if self.is_running() {
            return Ok(());
        }

        // Get the path to the backend executable
        let backend_path = if cfg!(windows) {
            "./backend/devops-backend.exe"
        } else {
            "./backend/devops-backend"
        };

        // Start the backend process
        let child = Command::new(backend_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}", e))?;

        self.process = Some(child);
        
        // Wait for backend to be ready
        thread::sleep(Duration::from_secs(2));
        
        // Check if backend is responding
        if !self.check_health() {
            self.stop();
            return Err("Backend failed to start properly".to_string());
        }

        Ok(())
    }

    /// Stop the local backend server
    pub fn stop(&mut self) {
        if let Some(mut child) = self.process.take() {
            let _ = child.kill();
        }
    }

    /// Check if backend is running
    pub fn is_running(&self) -> bool {
        if let Some(ref process) = self.process {
            // Try to check if process is still alive
            return true; // Simplified for now
        }
        false
    }

    /// Check backend health
    fn check_health(&self) -> bool {
        // Try to connect to the backend API
        let client = reqwest::blocking::Client::new();
        
        match client.get("http://127.0.0.1:9090/api/health")
            .timeout(Duration::from_secs(5))
            .send() {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }
}

// Global backend manager instance
lazy_static::lazy_static! {
    static ref BACKEND: Mutex<BackendManager> = Mutex::new(BackendManager::new());
}

/// Initialize and start the backend when the app starts
pub fn initialize_backend(app: &tauri::App) -> Result<(), String> {
    let mut backend = BACKEND.lock().unwrap();
    backend.start()?;
    
    // Setup cleanup on app exit
    let app_handle = app.handle();
    app_handle.listen_global("app-close", move |_| {
        let mut backend = BACKEND.lock().unwrap();
        backend.stop();
    });
    
    Ok(())
}

/// Tauri command to get backend status
#[tauri::command]
pub fn backend_status() -> Result<BackendStatus, String> {
    let backend = BACKEND.lock().unwrap();
    
    Ok(BackendStatus {
        running: backend.is_running(),
        health: backend.check_health(),
        port: 9090,
        version: "1.0.0".to_string(),
    })
}

#[derive(serde::Serialize)]
pub struct BackendStatus {
    running: bool,
    health: bool,
    port: u16,
    version: String,
}

/// Tauri command to restart backend
#[tauri::command]
pub fn restart_backend() -> Result<(), String> {
    let mut backend = BACKEND.lock().unwrap();
    backend.stop();
    thread::sleep(Duration::from_secs(1));
    backend.start()
}
