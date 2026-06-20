/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

use wasm_bindgen_test::*;
use wasm_td_game::core::math::Position;
use wasm_td_game::core::time::FixedStepAccumulator;
use wasm_td_game::features::map::classes::game_map::GameMap;
use wasm_td_game::features::map::classes::grid_position::GridPosition;
use wasm_td_game::features::tower::classes::projectile::Projectile;

wasm_bindgen_test_configure!(run_in_browser);

fn assert_approximately_equal(actual: f32, expected: f32) {
    assert!((actual - expected).abs() < f32::EPSILON);
}

#[wasm_bindgen_test]
fn parses_map_and_converts_grid_positions_to_world_positions() {
    let map = GameMap::from_json(
        r#"{
            "width": 3,
            "height": 2,
            "path": [[0, 0], [1, 0], [2, 0], [2, 1]]
        }"#,
    )
    .expect("the map definition should be valid");

    assert_eq!(map.width(), 3);
    assert_eq!(map.height(), 2);
    assert!(map.contains(GridPosition::new(2, 1)));
    assert!(!map.contains(GridPosition::new(3, 1)));
    assert!(map.is_path_cell(GridPosition::new(1, 0)));

    let world_position = map.world_position(GridPosition::new(0, 0));
    assert_approximately_equal(world_position.x, -1.0);
    assert_approximately_equal(world_position.y, 0.5);
    assert_approximately_equal(world_position.z, -0.5);
}

#[wasm_bindgen_test]
fn accumulates_partial_steps_and_limits_large_updates() {
    let mut accumulator = FixedStepAccumulator::new(0.25, 3);

    assert_eq!(accumulator.advance(0.1), 0);
    assert_eq!(accumulator.advance(0.15), 1);
    assert_eq!(accumulator.advance(10.0), 3);
    assert_eq!(accumulator.advance(f32::NAN), 0);
}

#[wasm_bindgen_test]
fn moves_projectile_toward_target_and_reports_arrival() {
    let mut projectile = Projectile::new(Position::new(0.0, 0.0, 0.0), 42);
    let target = Position::new(3.0, 0.0, 4.0);

    assert_eq!(projectile.target_id(), 42);
    assert!(!projectile.move_toward(target, 2.5));

    let halfway_position = projectile.position();
    assert_approximately_equal(halfway_position.x, 1.5);
    assert_approximately_equal(halfway_position.z, 2.0);

    assert!(projectile.move_toward(target, 2.5));
    let final_position = projectile.position();
    assert_approximately_equal(final_position.x, target.x);
    assert_approximately_equal(final_position.y, target.y);
    assert_approximately_equal(final_position.z, target.z);
}
