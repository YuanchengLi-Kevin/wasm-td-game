/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use crate::core::math::Position;
use crate::features::enemy::enemy_config::{EnemyConfig, EnemyType};

pub struct Enemy {
    id: u32,
    position: Position,
    next_waypoint_index: usize,
    health: f32,
    config: EnemyConfig,
}

impl Enemy {
    pub fn new(id: u32, enemy_type: EnemyType, start_position: Position) -> Self {
        let config = EnemyConfig::for_type(enemy_type);
        Self {
            id,
            position: start_position,
            next_waypoint_index: 1,
            health: config.max_health,
            config,
        }
    }

    pub fn update(&mut self, delta_time: f32, path: &[Position]) {
        let mut remaining_distance = self.config.move_speed * delta_time;

        while remaining_distance > 0.0 && self.next_waypoint_index < path.len() {
            let target = path[self.next_waypoint_index];
            let delta_x = target.x - self.position.x;
            let delta_y = target.y - self.position.y;
            let delta_z = target.z - self.position.z;
            let distance = (delta_x * delta_x + delta_y * delta_y + delta_z * delta_z).sqrt();

            if distance <= remaining_distance {
                self.position = target;
                self.next_waypoint_index += 1;
                remaining_distance -= distance;
                continue;
            }

            let scale = remaining_distance / distance;
            self.move_by(delta_x * scale, delta_y * scale, delta_z * scale);
            remaining_distance = 0.0;
        }
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

    pub fn id(&self) -> u32 {
        self.id
    }

    pub fn take_damage(&mut self, damage: f32) {
        self.health = (self.health - damage.max(0.0)).max(0.0);
    }

    pub fn is_defeated(&self) -> bool {
        self.health <= 0.0
    }

    pub fn max_health(&self) -> f32 {
        self.config.max_health
    }
}
