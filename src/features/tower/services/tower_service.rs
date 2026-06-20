/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

use crate::core::time::FixedStepAccumulator;
use crate::features::enemy::services::enemy_service::EnemyService;
use crate::features::map::classes::game_map::GameMap;
use crate::features::map::classes::grid_position::GridPosition;
use crate::features::map::services::map_service::MapService;
use crate::features::tower::classes::projectile::Projectile;
use crate::features::tower::classes::tower::Tower;
use crate::features::tower::tower_config::basic_tower_config;

const FIXED_STEP_SECONDS: f32 = 1.0 / 60.0;
const MAX_STEPS_PER_UPDATE: u32 = 5;

#[wasm_bindgen]
pub struct TowerService {
    towers: Vec<Tower>,
    projectiles: Vec<Projectile>,
    fixed_step: FixedStepAccumulator,
    map: GameMap,
}

#[wasm_bindgen]
impl TowerService {
    #[wasm_bindgen(constructor)]
    pub fn new(map_service: &MapService) -> Self {
        Self {
            towers: Vec::new(),
            projectiles: Vec::new(),
            fixed_step: FixedStepAccumulator::new(FIXED_STEP_SECONDS, MAX_STEPS_PER_UPDATE),
            map: map_service.map().clone(),
        }
    }

    pub fn place_tower(&mut self, column: u32, row: u32) -> bool {
        let grid_position = GridPosition::new(column, row);
        if !self.map.contains(grid_position)
            || self.map.is_path_cell(grid_position)
            || self
                .towers
                .iter()
                .any(|tower| tower.grid_position() == grid_position)
        {
            return false;
        }

        let mut position = self.map.world_position(grid_position);
        position.y = basic_tower_config().projectile_height;
        self.towers.push(Tower::new(grid_position, position));
        true
    }

    pub fn update(&mut self, delta_time: f32, enemies: &mut EnemyService) {
        let step_count = self.fixed_step.advance(delta_time);
        let step_seconds = self.fixed_step.step_seconds();
        for _ in 0..step_count {
            self.simulate(step_seconds, enemies);
        }
    }

    pub fn get_tower_positions(&self) -> Vec<f32> {
        Self::collect_positions(self.towers.iter().map(Tower::position))
    }

    pub fn get_tower_rotations(&self) -> Vec<f32> {
        self.towers.iter().map(Tower::rotation_y).collect()
    }

    pub fn get_projectile_positions(&self) -> Vec<f32> {
        Self::collect_positions(self.projectiles.iter().map(Projectile::position))
    }
}

impl TowerService {
    fn simulate(&mut self, step_seconds: f32, enemies: &mut EnemyService) {
        let config = basic_tower_config();
        for tower in &mut self.towers {
            tower.tick_cooldown(step_seconds);
            if !tower.is_ready() {
                continue;
            }

            if let Some(target_id) =
                enemies.nearest_enemy_id(&tower.position(), config.attack_range)
            {
                let Some(target_position) = enemies.position_by_id(target_id) else {
                    continue;
                };
                tower.face_toward(target_position);
                self.projectiles
                    .push(Projectile::new(tower.position(), target_id));
                tower.reset_cooldown(config.attack_cooldown_seconds);
            }
        }

        let mut index = 0;
        while index < self.projectiles.len() {
            let target_id = self.projectiles[index].target_id();
            let Some(target_position) = enemies.position_by_id(target_id) else {
                self.projectiles.remove(index);
                continue;
            };

            let hit_target = self.projectiles[index]
                .move_toward(target_position, config.projectile_speed * step_seconds);
            if hit_target {
                enemies.damage_enemy(target_id, config.projectile_damage);
                self.projectiles.remove(index);
            } else {
                index += 1;
            }
        }
    }

    fn collect_positions(positions: impl Iterator<Item = crate::core::math::Position>) -> Vec<f32> {
        let mut result = Vec::new();
        for position in positions {
            result.extend_from_slice(&[position.x, position.y, position.z]);
        }
        result
    }
}
