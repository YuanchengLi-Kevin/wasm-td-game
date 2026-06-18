/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use crate::core::math::Position;

use crate::features::enemy::enemy_config::{EnemyConfig, EnemyType};

pub struct Enemy {
    position: Position,
    health: f32,
    config: EnemyConfig,
}

impl Enemy {
    pub fn new(enemy_type: EnemyType) -> Self {
        let config = EnemyConfig::for_type(enemy_type);
        Self {
            position: Position::new(0.0, 0.5, 0.0),
            health: config.max_health,
            config,
        }
    }

    pub fn update(&mut self, delta_time: f32) {
        self.move_by(self.config.move_speed * delta_time, 0.0, 0.0);
    }

    pub fn move_by(&mut self, delta_x: f32, delta_y: f32, delta_z: f32) {
        self.position.translate(delta_x, delta_y, delta_z);
    }

    pub fn position(&self) -> &Position {
        &self.position
    }

    pub fn health(&self) -> f32 {
        self.health
    }

    pub fn max_health(&self) -> f32 {
        self.config.max_health
    }
}
