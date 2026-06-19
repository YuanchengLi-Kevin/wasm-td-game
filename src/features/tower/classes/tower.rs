/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use crate::core::math::Position;
use crate::features::map::classes::grid_position::GridPosition;

pub struct Tower {
    grid_position: GridPosition,
    position: Position,
    rotation_y: f32,
    cooldown_remaining: f32,
}

impl Tower {
    pub fn new(grid_position: GridPosition, position: Position) -> Self {
        Self {
            grid_position,
            position,
            rotation_y: 0.0,
            cooldown_remaining: 0.0,
        }
    }

    pub fn grid_position(&self) -> GridPosition {
        self.grid_position
    }

    pub fn position(&self) -> Position {
        self.position
    }

    pub fn rotation_y(&self) -> f32 {
        self.rotation_y
    }

    pub fn face_toward(&mut self, target: Position) {
        let delta_x = target.x - self.position.x;
        let delta_z = target.z - self.position.z;
        if delta_x != 0.0 || delta_z != 0.0 {
            self.rotation_y = (-delta_z).atan2(delta_x);
        }
    }

    pub fn tick_cooldown(&mut self, delta_time: f32) {
        self.cooldown_remaining = (self.cooldown_remaining - delta_time).max(0.0);
    }

    pub fn is_ready(&self) -> bool {
        self.cooldown_remaining <= 0.0
    }

    pub fn reset_cooldown(&mut self, cooldown_seconds: f32) {
        self.cooldown_remaining = cooldown_seconds;
    }
}
