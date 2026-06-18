/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class EnemyView {
    readonly mesh: THREE.Mesh;

    private readonly geometry: THREE.BoxGeometry;
    private readonly material: THREE.MeshStandardMaterial;
    private destroyed = false;

    constructor() {
        // 1. Create a minimalist 3D geometric shape (a glowing red cube)
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xff0044,
            emissive: 0x440011 // Gives it a slight inner glow
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    setPosition(x: number, y: number, z: number) {
        if (this.destroyed) {
            return;
        }

        this.mesh.position.set(x, y, z);
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.mesh.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
    }
}
