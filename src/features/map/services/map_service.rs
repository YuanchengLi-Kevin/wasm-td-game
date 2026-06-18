/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen::prelude::*;

use crate::features::map::classes::game_map::GameMap;

#[wasm_bindgen]
pub struct MapService {
    map: GameMap,
}

#[wasm_bindgen]
impl MapService {
    #[wasm_bindgen(constructor)]
    pub fn new(map_json: &str) -> Result<MapService, JsValue> {
        let map = GameMap::from_json(map_json).map_err(|error| JsValue::from_str(&error))?;
        Ok(Self { map })
    }

    pub fn width(&self) -> u32 {
        self.map.width()
    }

    pub fn height(&self) -> u32 {
        self.map.height()
    }

    pub fn get_path_cells(&self) -> Vec<u32> {
        let mut cells = Vec::with_capacity(self.map.path().len() * 2);
        for position in self.map.path() {
            cells.extend_from_slice(&[position.column, position.row]);
        }
        cells
    }
}

impl MapService {
    pub fn map(&self) -> &GameMap {
        &self.map
    }
}
