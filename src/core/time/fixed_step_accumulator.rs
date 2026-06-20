/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

pub struct FixedStepAccumulator {
    accumulated_time: f32,
    step_seconds: f32,
    max_steps_per_update: u32,
}

impl FixedStepAccumulator {
    pub fn new(step_seconds: f32, max_steps_per_update: u32) -> Self {
        assert!(step_seconds.is_finite() && step_seconds > 0.0);
        assert!(max_steps_per_update > 0);

        Self {
            accumulated_time: 0.0,
            step_seconds,
            max_steps_per_update,
        }
    }

    pub fn advance(&mut self, delta_time: f32) -> u32 {
        let delta_time = if delta_time.is_finite() {
            delta_time.max(0.0)
        } else {
            0.0
        };
        let max_accumulated_time = self.step_seconds * self.max_steps_per_update as f32;
        self.accumulated_time = (self.accumulated_time + delta_time).min(max_accumulated_time);

        let steps = (self.accumulated_time / self.step_seconds) as u32;
        self.accumulated_time -= steps as f32 * self.step_seconds;
        steps
    }

    pub fn step_seconds(&self) -> f32 {
        self.step_seconds
    }
}
