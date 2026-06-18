/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

#[derive(Clone, Copy)]
pub struct GridPosition {
    pub column: u32,
    pub row: u32,
}

impl GridPosition {
    pub const fn new(column: u32, row: u32) -> Self {
        Self { column, row }
    }
}
