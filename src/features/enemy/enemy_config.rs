/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum EnemyType {
    Basic,
    Fast,
    Tank,
}

pub struct EnemyConfig {
    pub move_speed: f32,
    pub max_health: f32,
}

impl EnemyConfig {
    pub fn for_type(enemy_type: EnemyType) -> Self {
        match enemy_type {
            EnemyType::Basic => Self {
                move_speed: 5.0,
                max_health: 100.0,
            },
            EnemyType::Fast => Self {
                move_speed: 5.0,
                max_health: 60.0,
            },
            EnemyType::Tank => Self {
                move_speed: 5.0,
                max_health: 250.0,
            },
        }
    }
}
