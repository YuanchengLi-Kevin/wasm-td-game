/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct EnemyLogic {
    x: f32,
    y: f32,
    z: f32, // Welcome to 3D space!
}

#[wasm_bindgen]
impl EnemyLogic {
    #[wasm_bindgen(constructor)]
    pub fn new() -> EnemyLogic {
        // Start the enemy slightly elevated off the ground
        EnemyLogic { x: 0.0, y: 0.5, z: 0.0 }
    }

    // A simple method to move the enemy forward
    pub fn update(&mut self) {
        self.x += 0.01;
    }

    pub fn get_x(&self) -> f32 { self.x }
    pub fn get_y(&self) -> f32 { self.y }
    pub fn get_z(&self) -> f32 { self.z }
}
