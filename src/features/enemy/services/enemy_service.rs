/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

use crate::core::time::FixedStepAccumulator;
use crate::features::enemy::classes::enemy::Enemy;
use crate::features::enemy::enemy_config::EnemyType;
use crate::features::map::classes::game_map::GameMap;
use crate::features::map::services::map_service::MapService;

const SPAWN_INTERVAL: f32 = 1.0;
const FIXED_STEP_SECONDS: f32 = 1.0 / 60.0;
const MAX_STEPS_PER_UPDATE: u32 = 5;

#[wasm_bindgen]
pub struct EnemyService {
    enemies: Vec<Enemy>,
    spawn_timer: f32,
    fixed_step: FixedStepAccumulator,
    map: GameMap,
}

#[wasm_bindgen]
impl EnemyService {
    #[wasm_bindgen(constructor)]
    pub fn new(map_service: &MapService) -> Self {
        Self {
            enemies: Vec::new(),
            spawn_timer: 0.0,
            fixed_step: FixedStepAccumulator::new(
                FIXED_STEP_SECONDS,
                MAX_STEPS_PER_UPDATE,
            ),
            map: map_service.map().clone(),
        }
    }

    pub fn spawn_enemy(&mut self, enemy_type: EnemyType) -> u32 {
        let index = self.enemies.len() as u32;
        if let Some(start_position) = self.map.world_path().first() {
            self.enemies.push(Enemy::new(enemy_type, *start_position));
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

    pub fn enemy_count(&self) -> u32 {
        self.enemies.len() as u32
    }
}

impl EnemyService {
    fn simulate(&mut self, step_seconds: f32) {
        self.spawn_timer += step_seconds;
        while self.spawn_timer >= SPAWN_INTERVAL {
            self.spawn_enemy(EnemyType::Basic);
            self.spawn_timer -= SPAWN_INTERVAL;
        }

        let path = self.map.world_path();
        for enemy in &mut self.enemies {
            enemy.update(step_seconds, path);
        }
    }
}
