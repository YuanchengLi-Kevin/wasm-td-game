/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use std::sync::OnceLock;

use serde::Deserialize;

const TOWER_CONFIG_JSON: &str = include_str!("../../constants/towers/tower_config.json");

#[derive(Clone, Copy, Deserialize)]
pub struct TowerConfig {
    pub attack_range: f32,
    pub attack_cooldown_seconds: f32,
    pub projectile_damage: f32,
    pub projectile_speed: f32,
    pub projectile_height: f32,
}

#[derive(Deserialize)]
struct TowerConfigs {
    basic: TowerConfig,
}

pub fn basic_tower_config() -> TowerConfig {
    tower_configs().basic
}

fn tower_configs() -> &'static TowerConfigs {
    static CONFIGS: OnceLock<TowerConfigs> = OnceLock::new();
    CONFIGS.get_or_init(|| {
        serde_json::from_str(TOWER_CONFIG_JSON)
            .expect("embedded tower configuration must contain valid JSON")
    })
}
