/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import { EnemyLogic } from '../../../pkg/wasm_td_game';

export class EnemyView {
    mesh: THREE.Mesh;
    logic: EnemyLogic;

    constructor() {
        this.logic = new EnemyLogic();

        // 1. Create a minimalist 3D geometric shape (a glowing red cube)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0044,
            emissive: 0x440011 // Gives it a slight inner glow
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.updatePosition();
    }

    // Called every frame by the main game loop
    update() {
        this.logic.update(); // Tell Rust to do the math
        this.updatePosition(); // Read the new math
    }

    private updatePosition() {
        this.mesh.position.set(
            this.logic.get_x(),
            this.logic.get_y(),
            this.logic.get_z()
        );
    }
}
