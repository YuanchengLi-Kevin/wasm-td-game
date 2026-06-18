/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use serde::Deserialize;

use crate::core::math::Position;
use crate::features::map::classes::grid_position::GridPosition;

const TILE_SIZE: f32 = 1.0;
const ENEMY_HEIGHT: f32 = 0.5;

#[derive(Deserialize)]
struct MapDefinition {
    width: u32,
    height: u32,
    path: Vec<[u32; 2]>,
}

#[derive(Clone)]
pub struct GameMap {
    width: u32,
    height: u32,
    path: Vec<GridPosition>,
    world_path: Vec<Position>,
}

impl GameMap {
    pub fn from_json(map_json: &str) -> Result<Self, String> {
        let definition: MapDefinition = serde_json::from_str(map_json)
            .map_err(|error| format!("map must contain valid JSON: {error}"))?;
        Self::validate_definition(&definition).map_err(str::to_owned)?;

        let width = definition.width;
        let height = definition.height;
        let path: Vec<GridPosition> = definition
            .path
            .iter()
            .map(|position| GridPosition::new(position[0], position[1]))
            .collect();
        let world_path = path
            .iter()
            .map(|position| Self::to_world_position(width, height, *position))
            .collect();

        Ok(Self {
            width,
            height,
            path,
            world_path,
        })
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn path(&self) -> &[GridPosition] {
        &self.path
    }

    pub fn world_path(&self) -> &[Position] {
        &self.world_path
    }

    fn to_world_position(width: u32, height: u32, position: GridPosition) -> Position {
        let x_offset = (width.saturating_sub(1) as f32 * TILE_SIZE) / 2.0;
        let z_offset = (height.saturating_sub(1) as f32 * TILE_SIZE) / 2.0;

        Position::new(
            position.column as f32 * TILE_SIZE - x_offset,
            ENEMY_HEIGHT,
            position.row as f32 * TILE_SIZE - z_offset,
        )
    }

    fn validate_definition(definition: &MapDefinition) -> Result<(), &'static str> {
        if definition.width == 0 || definition.height == 0 {
            return Err("map dimensions must be greater than zero");
        }
        if definition.path.len() < 2 {
            return Err("map path must contain a start and end point");
        }

        for position in &definition.path {
            if position[0] >= definition.width || position[1] >= definition.height {
                return Err("map path must remain inside the grid");
            }
        }

        for positions in definition.path.windows(2) {
            let column_distance = positions[0][0].abs_diff(positions[1][0]);
            let row_distance = positions[0][1].abs_diff(positions[1][1]);
            if column_distance + row_distance != 1 {
                return Err("map path points must be orthogonally adjacent");
            }
        }

        Ok(())
    }
}
