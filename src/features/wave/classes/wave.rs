/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use crate::features::enemy::classes::enemy_config::EnemyType;
use crate::features::wave::classes::wave_config::{WaveDefinition, WaveSpawnGroup};

pub struct Wave {
    groups: Vec<WaveSpawnGroup>,
    group_index: usize,
    remaining_in_group: u32,
    time_until_next_spawn: f32,
}

impl Wave {
    pub fn new(definition: WaveDefinition) -> Self {
        let remaining_in_group = definition.groups.first().map_or(0, |group| group.count);
        let mut wave = Self {
            groups: definition.groups,
            group_index: 0,
            remaining_in_group,
            time_until_next_spawn: 0.0,
        };
        wave.skip_empty_groups();
        wave
    }

    pub fn update(&mut self, delta_time: f32) -> Vec<EnemyType> {
        if !delta_time.is_finite() || delta_time < 0.0 || self.is_finished_spawning() {
            return Vec::new();
        }

        let mut elapsed = delta_time;
        let mut spawned_enemies = Vec::new();
        while !self.is_finished_spawning() && elapsed >= self.time_until_next_spawn {
            elapsed -= self.time_until_next_spawn;

            let group = &self.groups[self.group_index];
            spawned_enemies.push(group.enemy_type);
            self.remaining_in_group -= 1;
            self.time_until_next_spawn = group.spawn_interval_seconds.max(0.0);

            if self.remaining_in_group == 0 {
                self.group_index += 1;
                self.skip_empty_groups();
            }
        }

        if !self.is_finished_spawning() {
            self.time_until_next_spawn -= elapsed;
        }
        spawned_enemies
    }

    pub fn is_finished_spawning(&self) -> bool {
        self.group_index >= self.groups.len()
    }

    pub fn remaining_enemy_count(&self) -> u32 {
        if self.is_finished_spawning() {
            return 0;
        }

        self.remaining_in_group
            + self.groups[self.group_index + 1..]
                .iter()
                .map(|group| group.count)
                .sum::<u32>()
    }

    pub fn total_enemy_count(&self) -> u32 {
        self.groups.iter().map(|group| group.count).sum()
    }

    fn skip_empty_groups(&mut self) {
        while self.group_index < self.groups.len() && self.remaining_in_group == 0 {
            self.group_index += 1;
            self.remaining_in_group = self
                .groups
                .get(self.group_index)
                .map_or(0, |group| group.count);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn group(enemy_type: EnemyType, count: u32, interval: f32) -> WaveSpawnGroup {
        WaveSpawnGroup {
            enemy_type,
            count,
            spawn_interval_seconds: interval,
        }
    }

    #[test]
    fn spawns_groups_in_order_at_their_configured_intervals() {
        let mut wave = Wave::new(WaveDefinition {
            groups: vec![
                group(EnemyType::Basic, 2, 1.0),
                group(EnemyType::Fast, 1, 0.5),
            ],
        });

        assert_eq!(wave.update(0.0), vec![EnemyType::Basic]);
        assert_eq!(wave.total_enemy_count(), 3);
        assert!(wave.update(0.5).is_empty());
        assert_eq!(wave.update(0.5), vec![EnemyType::Basic]);
        assert_eq!(wave.update(1.0), vec![EnemyType::Fast]);
        assert!(wave.is_finished_spawning());
        assert_eq!(wave.remaining_enemy_count(), 0);
    }

    #[test]
    fn skips_empty_groups() {
        let mut wave = Wave::new(WaveDefinition {
            groups: vec![
                group(EnemyType::Basic, 0, 1.0),
                group(EnemyType::Tank, 1, 1.0),
            ],
        });

        assert_eq!(wave.remaining_enemy_count(), 1);
        assert_eq!(wave.update(0.0), vec![EnemyType::Tank]);
        assert!(wave.is_finished_spawning());
    }
}
