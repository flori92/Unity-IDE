use std::path::PathBuf;
use anyhow::Result;
// use serde::{Serialize, Deserialize};

pub fn get_config_dir() -> Result<PathBuf> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not find config directory"))?
        .join("devops-unity-ide");
    
    std::fs::create_dir_all(&config_dir)?;
    Ok(config_dir)
}

pub fn get_data_dir() -> Result<PathBuf> {
    let data_dir = dirs::data_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not find data directory"))?
        .join("devops-unity-ide");
    
    std::fs::create_dir_all(&data_dir)?;
    Ok(data_dir)
}

pub fn get_cache_dir() -> Result<PathBuf> {
    let cache_dir = dirs::cache_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not find cache directory"))?
        .join("devops-unity-ide");
    
    std::fs::create_dir_all(&cache_dir)?;
    Ok(cache_dir)
}
