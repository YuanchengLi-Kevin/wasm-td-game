/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use std::sync::OnceLock;

use serde::Deserialize;

use crate::features::enemy::classes::enemy_config::EnemyType;

const WAVE_CONFIG_JSON: &str = include_str!("../../../constants/waves/wave_config.json");

#[derive(Clone, Deserialize)]
pub struct WaveSpawnGroup {
    pub enemy_type: EnemyType,
    pub count: u32,
    pub spawn_interval_seconds: f32,
}

#[derive(Clone, Deserialize)]
pub struct WaveDefinition {
    pub groups: Vec<WaveSpawnGroup>,
}

#[derive(Deserialize)]
pub struct WaveConfig {
    pub intermission_seconds: f32,
    pub waves: Vec<WaveDefinition>,
}

pub fn wave_config() -> &'static WaveConfig {
    static CONFIG: OnceLock<WaveConfig> = OnceLock::new();
    CONFIG.get_or_init(|| {
        serde_json::from_str(WAVE_CONFIG_JSON)
            .expect("embedded wave configuration must contain valid JSON")
    })
}
