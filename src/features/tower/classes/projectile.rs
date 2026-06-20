/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use crate::core::math::Position;

pub struct Projectile {
    position: Position,
    target_id: u32,
}

impl Projectile {
    pub fn new(position: Position, target_id: u32) -> Self {
        Self {
            position,
            target_id,
        }
    }

    pub fn position(&self) -> Position {
        self.position
    }

    pub fn target_id(&self) -> u32 {
        self.target_id
    }

    pub fn move_toward(&mut self, target: Position, distance: f32) -> bool {
        let delta_x = target.x - self.position.x;
        let delta_y = target.y - self.position.y;
        let delta_z = target.z - self.position.z;
        let target_distance = (delta_x * delta_x + delta_y * delta_y + delta_z * delta_z).sqrt();

        if target_distance <= distance {
            self.position = target;
            return true;
        }

        let scale = distance / target_distance;
        self.position
            .translate(delta_x * scale, delta_y * scale, delta_z * scale);
        false
    }
}
