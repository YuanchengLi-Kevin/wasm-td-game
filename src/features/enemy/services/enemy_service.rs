/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

use crate::core::time::FixedStepAccumulator;
use crate::features::enemy::classes::enemy::Enemy;
use crate::features::enemy::classes::enemy_config::EnemyType;
use crate::features::map::classes::game_map::GameMap;
use crate::features::map::services::map_service::MapService;

const FIXED_STEP_SECONDS: f32 = 1.0 / 60.0;
const MAX_STEPS_PER_UPDATE: u32 = 5;

#[wasm_bindgen]
pub struct EnemyService {
    enemies: Vec<Enemy>,
    next_enemy_id: u32,
    fixed_step: FixedStepAccumulator,
    map: GameMap,
}

#[wasm_bindgen]
impl EnemyService {
    #[wasm_bindgen(constructor)]
    pub fn new(map_service: &MapService) -> Self {
        Self {
            enemies: Vec::new(),
            next_enemy_id: 0,
            fixed_step: FixedStepAccumulator::new(FIXED_STEP_SECONDS, MAX_STEPS_PER_UPDATE),
            map: map_service.map().clone(),
        }
    }

    pub fn spawn_enemy(&mut self, enemy_type: EnemyType) -> u32 {
        let index = self.enemies.len() as u32;
        if let Some(start_position) = self.map.world_path().first() {
            let id = self.next_enemy_id;
            self.next_enemy_id = self.next_enemy_id.wrapping_add(1);
            self.enemies
                .push(Enemy::new(id, enemy_type, *start_position));
        }
        index
    }

    pub fn remove_enemy(&mut self, index: u32) -> bool {
        let index = index as usize;
        if index >= self.enemies.len() {
            return false;
        }

        self.enemies.remove(index);
        true
    }

    pub fn update(&mut self, delta_time: f32) {
        let step_count = self.fixed_step.advance(delta_time);
        let step_seconds = self.fixed_step.step_seconds();
        for _ in 0..step_count {
            self.simulate(step_seconds);
        }
    }

    pub fn get_positions(&self) -> Vec<f32> {
        let mut positions = Vec::with_capacity(self.enemies.len() * 3);
        for enemy in &self.enemies {
            let position = enemy.position();
            positions.extend_from_slice(&[position.x, position.y, position.z]);
        }
        positions
    }

    pub fn get_health_ratios(&self) -> Vec<f32> {
        self.enemies
            .iter()
            .map(|enemy| enemy.health() / enemy.max_health())
            .collect()
    }

    pub fn enemy_count(&self) -> u32 {
        self.enemies.len() as u32
    }
}

impl EnemyService {
    pub fn nearest_enemy_id(
        &self,
        position: &crate::core::math::Position,
        range: f32,
    ) -> Option<u32> {
        let range_squared = range * range;
        self.enemies
            .iter()
            .filter_map(|enemy| {
                let enemy_position = enemy.position();
                let delta_x = enemy_position.x - position.x;
                let delta_z = enemy_position.z - position.z;
                let distance_squared = delta_x * delta_x + delta_z * delta_z;
                (distance_squared <= range_squared).then_some((enemy.id(), distance_squared))
            })
            .min_by(|left, right| left.1.total_cmp(&right.1))
            .map(|(id, _)| id)
    }

    pub fn position_by_id(&self, id: u32) -> Option<crate::core::math::Position> {
        self.enemies
            .iter()
            .find(|enemy| enemy.id() == id)
            .map(|enemy| *enemy.position())
    }

    pub fn damage_enemy(&mut self, id: u32, damage: f32) -> bool {
        let Some(index) = self.enemies.iter().position(|enemy| enemy.id() == id) else {
            return false;
        };

        let enemy = &mut self.enemies[index];
        enemy.take_damage(damage);
        if enemy.is_defeated() {
            self.enemies.remove(index);
        }
        true
    }

    fn simulate(&mut self, step_seconds: f32) {
        let path = self.map.world_path();
        for enemy in &mut self.enemies {
            enemy.update(step_seconds, path);
        }
        self.enemies
            .retain(|enemy| !enemy.has_reached_end(path.len()));
    }
}
