/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

use crate::core::time::FixedStepAccumulator;
use crate::features::enemy::services::enemy_service::EnemyService;
use crate::features::wave::classes::wave::Wave;
use crate::features::wave::classes::wave_config::{WaveDefinition, wave_config};

const FIXED_STEP_SECONDS: f32 = 1.0 / 60.0;
const MAX_STEPS_PER_UPDATE: u32 = 5;

#[wasm_bindgen]
pub struct WaveService {
    definitions: Vec<WaveDefinition>,
    active_wave: Option<Wave>,
    active_wave_number: u32,
    next_wave_index: usize,
    intermission_seconds: f32,
    intermission_remaining: f32,
    fixed_step: FixedStepAccumulator,
    current_wave_enemy_count: u32,
}

#[wasm_bindgen]
impl WaveService {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let config = wave_config();
        Self {
            definitions: config.waves.clone(),
            active_wave: None,
            active_wave_number: 0,
            next_wave_index: 0,
            intermission_seconds: config.intermission_seconds.max(0.0),
            intermission_remaining: 0.0,
            fixed_step: FixedStepAccumulator::new(FIXED_STEP_SECONDS, MAX_STEPS_PER_UPDATE),
            current_wave_enemy_count: 0,
        }
    }

    pub fn update(&mut self, delta_time: f32, enemies: &mut EnemyService) {
        let step_count = self.fixed_step.advance(delta_time);
        let step_seconds = self.fixed_step.step_seconds();
        for _ in 0..step_count {
            self.simulate(step_seconds, enemies);
        }
    }

    pub fn current_wave_number(&self) -> u32 {
        self.active_wave_number
    }

    pub fn total_wave_count(&self) -> u32 {
        self.definitions.len() as u32
    }

    pub fn remaining_spawn_count(&self) -> u32 {
        self.active_wave
            .as_ref()
            .map_or(0, Wave::remaining_enemy_count)
    }

    pub fn current_wave_enemy_count(&self) -> u32 {
        self.current_wave_enemy_count
    }

    pub fn remaining_enemy_count(&self, enemies: &EnemyService) -> u32 {
        self.remaining_spawn_count()
            .saturating_add(enemies.enemy_count())
    }

    pub fn is_complete(&self) -> bool {
        self.next_wave_index >= self.definitions.len() && self.active_wave.is_none()
    }
}

impl Default for WaveService {
    fn default() -> Self {
        Self::new()
    }
}

impl WaveService {
    fn simulate(&mut self, step_seconds: f32, enemies: &mut EnemyService) {
        if self.is_complete() {
            return;
        }

        if self
            .active_wave
            .as_ref()
            .is_some_and(|wave| wave.is_finished_spawning())
            && enemies.enemy_count() == 0
        {
            self.active_wave = None;
            self.intermission_remaining = self.intermission_seconds;
        }

        let mut wave_delta_time = step_seconds;
        if self.active_wave.is_none() {
            if self.next_wave_index >= self.definitions.len() {
                return;
            }

            if self.intermission_remaining > wave_delta_time {
                self.intermission_remaining -= wave_delta_time;
                return;
            }

            wave_delta_time -= self.intermission_remaining;
            self.intermission_remaining = 0.0;
            self.start_next_wave();
        }

        if let Some(wave) = &mut self.active_wave {
            for enemy_type in wave.update(wave_delta_time) {
                enemies.spawn_enemy(enemy_type);
            }
        }
    }

    fn start_next_wave(&mut self) {
        let definition = self.definitions[self.next_wave_index].clone();
        self.next_wave_index += 1;
        self.active_wave_number = self.next_wave_index as u32;
        let wave = Wave::new(definition);
        self.current_wave_enemy_count = wave.total_enemy_count();
        self.active_wave = Some(wave);
    }
}
