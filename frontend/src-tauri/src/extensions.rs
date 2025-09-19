use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::fs;
use reqwest;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub repository: String,
    pub icon: Option<String>,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub enabled: bool,
    pub installed: bool,
    pub path: Option<PathBuf>,
    pub dependencies: Vec<String>,
    pub permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub main: String,
    pub icon: Option<String>,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub contributes: ExtensionContributions,
    pub dependencies: HashMap<String, String>,
    pub permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionContributions {
    pub commands: Vec<ExtensionCommand>,
    pub views: Vec<ExtensionView>,
    pub menus: Vec<ExtensionMenu>,
    pub themes: Vec<ExtensionTheme>,
    pub languages: Vec<ExtensionLanguage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionCommand {
    pub id: String,
    pub title: String,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub keybinding: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionView {
    pub id: String,
    pub name: String,
    pub location: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionMenu {
    pub id: String,
    pub label: String,
    pub command: String,
    pub location: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionTheme {
    pub id: String,
    pub label: String,
    pub path: String,
    pub dark: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionLanguage {
    pub id: String,
    pub extensions: Vec<String>,
    pub aliases: Vec<String>,
    pub configuration: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceExtension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub downloads: u64,
    pub rating: f64,
    pub reviews: u32,
    pub verified: bool,
    pub trending: bool,
    pub featured: bool,
}

pub struct ExtensionManager {
    extensions_dir: PathBuf,
    installed_extensions: HashMap<String, Extension>,
    marketplace_cache: HashMap<String, MarketplaceExtension>,
    registry_url: String,
}

impl ExtensionManager {
    pub fn new() -> Self {
        let extensions_dir = dirs::config_dir()
            .map(|d| d.join("devops-unity-ide").join("extensions"))
            .unwrap_or_else(|| PathBuf::from("./extensions"));

        // Create extensions directory if it doesn't exist
        fs::create_dir_all(&extensions_dir).ok();

        ExtensionManager {
            extensions_dir,
            installed_extensions: HashMap::new(),
            marketplace_cache: HashMap::new(),
            registry_url: "https://extensions.devops-unity.io".to_string(),
        }
    }

    pub async fn load_installed_extensions(&mut self) -> Result<()> {
        let entries = fs::read_dir(&self.extensions_dir)?;
        
        for entry in entries {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                if let Ok(manifest) = self.load_manifest(&path).await {
                    let extension = Extension {
                        id: manifest.id.clone(),
                        name: manifest.name,
                        version: manifest.version,
                        description: manifest.description,
                        author: manifest.author,
                        repository: String::new(),
                        icon: manifest.icon,
                        categories: manifest.categories,
                        keywords: manifest.keywords,
                        enabled: true,
                        installed: true,
                        path: Some(path),
                        dependencies: manifest.dependencies.keys().cloned().collect(),
                        permissions: manifest.permissions,
                    };
                    
                    self.installed_extensions.insert(manifest.id, extension);
                }
            }
        }

        Ok(())
    }

    pub async fn search_marketplace(&mut self, query: &str) -> Result<Vec<MarketplaceExtension>> {
        let url = format!("{}/api/search?q={}", self.registry_url, query);
        let response = reqwest::get(&url).await?;
        let extensions: Vec<MarketplaceExtension> = response.json().await?;
        
        // Cache the results
        for ext in &extensions {
            self.marketplace_cache.insert(ext.id.clone(), ext.clone());
        }
        
        Ok(extensions)
    }

    pub async fn get_featured_extensions(&mut self) -> Result<Vec<MarketplaceExtension>> {
        let url = format!("{}/api/featured", self.registry_url);
        let response = reqwest::get(&url).await?;
        let extensions: Vec<MarketplaceExtension> = response.json().await?;
        
        Ok(extensions)
    }

    pub async fn install(&mut self, extension_id: &str) -> Result<()> {
        // Download extension from marketplace
        let download_url = format!("{}/api/download/{}", self.registry_url, extension_id);
        let response = reqwest::get(&download_url).await?;
        let bytes = response.bytes().await?;
        
        // Save to temp file
        let temp_path = self.extensions_dir.join(format!("{}.tmp.zip", extension_id));
        fs::write(&temp_path, bytes)?;
        
        // Extract to extensions directory
        let target_dir = self.extensions_dir.join(extension_id);
        self.extract_extension(&temp_path, &target_dir)?;
        
        // Load the extension
        if let Ok(manifest) = self.load_manifest(&target_dir).await {
            let extension = Extension {
                id: manifest.id.clone(),
                name: manifest.name,
                version: manifest.version,
                description: manifest.description,
                author: manifest.author,
                repository: String::new(),
                icon: manifest.icon,
                categories: manifest.categories,
                keywords: manifest.keywords,
                enabled: true,
                installed: true,
                path: Some(target_dir),
                dependencies: manifest.dependencies.keys().cloned().collect(),
                permissions: manifest.permissions,
            };
            
            self.installed_extensions.insert(manifest.id, extension);
        }
        
        // Clean up temp file
        fs::remove_file(temp_path).ok();
        
        Ok(())
    }

    pub async fn uninstall(&mut self, extension_id: &str) -> Result<()> {
        if let Some(extension) = self.installed_extensions.remove(extension_id) {
            if let Some(path) = extension.path {
                fs::remove_dir_all(path)?;
            }
        }
        
        Ok(())
    }

    pub async fn enable(&mut self, extension_id: &str) -> Result<()> {
        if let Some(extension) = self.installed_extensions.get_mut(extension_id) {
            extension.enabled = true;
            self.activate_extension(extension_id).await?;
        }
        
        Ok(())
    }

    pub async fn disable(&mut self, extension_id: &str) -> Result<()> {
        if let Some(extension) = self.installed_extensions.get_mut(extension_id) {
            extension.enabled = false;
            self.deactivate_extension(extension_id).await?;
        }
        
        Ok(())
    }

    pub async fn update(&mut self, extension_id: &str) -> Result<()> {
        // Check for updates
        let url = format!("{}/api/extension/{}/latest", self.registry_url, extension_id);
        let response = reqwest::get(&url).await?;
        let latest_version: String = response.text().await?;
        
        if let Some(extension) = self.installed_extensions.get(extension_id) {
            if extension.version != latest_version {
                // Uninstall old version
                self.uninstall(extension_id).await?;
                // Install new version
                self.install(extension_id).await?;
            }
        }
        
        Ok(())
    }

    pub fn list_installed(&self) -> Vec<Extension> {
        self.installed_extensions.values().cloned().collect()
    }

    pub fn get_extension(&self, extension_id: &str) -> Option<&Extension> {
        self.installed_extensions.get(extension_id)
    }

    async fn load_manifest(&self, extension_path: &Path) -> Result<ExtensionManifest> {
        let manifest_path = extension_path.join("manifest.json");
        let content = fs::read_to_string(manifest_path)?;
        let manifest: ExtensionManifest = serde_json::from_str(&content)?;
        
        Ok(manifest)
    }

    fn extract_extension(&self, _archive_path: &Path, target_dir: &Path) -> Result<()> {
        // Extract ZIP archive
        // This would use a ZIP library to extract the archive
        fs::create_dir_all(target_dir)?;
        
        // Placeholder for actual extraction logic
        Ok(())
    }

    async fn activate_extension(&self, _extension_id: &str) -> Result<()> {
        // Load and activate the extension
        // This would execute the extension's activation code
        Ok(())
    }

    async fn deactivate_extension(&self, _extension_id: &str) -> Result<()> {
        // Deactivate the extension
        // This would execute the extension's deactivation code
        Ok(())
    }

    pub async fn check_updates(&mut self) -> Result<Vec<String>> {
        let mut updates_available = Vec::new();
        
        for (id, extension) in &self.installed_extensions {
            let url = format!("{}/api/extension/{}/latest", self.registry_url, id);
            if let Ok(response) = reqwest::get(&url).await {
                if let Ok(latest_version) = response.text().await {
                    if extension.version != latest_version {
                        updates_available.push(id.clone());
                    }
                }
            }
        }
        
        Ok(updates_available)
    }

    pub async fn get_extension_settings(&self, extension_id: &str) -> Result<HashMap<String, serde_json::Value>> {
        if let Some(extension) = self.installed_extensions.get(extension_id) {
            if let Some(path) = &extension.path {
                let settings_path = path.join("settings.json");
                if settings_path.exists() {
                    let content = fs::read_to_string(settings_path)?;
                    let settings: HashMap<String, serde_json::Value> = serde_json::from_str(&content)?;
                    return Ok(settings);
                }
            }
        }
        
        Ok(HashMap::new())
    }

    pub async fn save_extension_settings(&self, extension_id: &str, settings: HashMap<String, serde_json::Value>) -> Result<()> {
        if let Some(extension) = self.installed_extensions.get(extension_id) {
            if let Some(path) = &extension.path {
                let settings_path = path.join("settings.json");
                let content = serde_json::to_string_pretty(&settings)?;
                fs::write(settings_path, content)?;
            }
        }
        
        Ok(())
    }
}
