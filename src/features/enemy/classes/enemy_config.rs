/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use std::sync::OnceLock;

use serde::Deserialize;
use wasm_bindgen::prelude::*;

const ENEMY_CONFIG_JSON: &str = include_str!("../../../constants/enemies/enemy_config.json");

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum EnemyType {
    Basic,
    Fast,
    Tank,
}

#[derive(Clone, Copy, Deserialize)]
pub struct EnemyConfig {
    pub move_speed: f32,
    pub max_health: f32,
}

#[derive(Deserialize)]
struct EnemyConfigs {
    basic: EnemyConfig,
    fast: EnemyConfig,
    tank: EnemyConfig,
}

impl EnemyConfig {
    pub fn for_type(enemy_type: EnemyType) -> Self {
        let configs = enemy_configs();
        match enemy_type {
            EnemyType::Basic => configs.basic,
            EnemyType::Fast => configs.fast,
            EnemyType::Tank => configs.tank,
        }
    }
}

fn enemy_configs() -> &'static EnemyConfigs {
    static CONFIGS: OnceLock<EnemyConfigs> = OnceLock::new();
    CONFIGS.get_or_init(|| {
        serde_json::from_str(ENEMY_CONFIG_JSON)
            .expect("embedded enemy configuration must contain valid JSON")
    })
}
