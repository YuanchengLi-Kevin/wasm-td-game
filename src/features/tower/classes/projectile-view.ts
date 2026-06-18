/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class ProjectileView {
    readonly mesh: THREE.Mesh;

    private readonly geometry = new THREE.SphereGeometry(0.1, 8, 8);
    private readonly material = new THREE.MeshStandardMaterial({
        color: 0xffdc62,
        emissive: 0x8a5a00,
        emissiveIntensity: 1.5
    });

    constructor() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    setPosition(x: number, y: number, z: number) {
        this.mesh.position.set(x, y, z);
    }

    destroy() {
        this.mesh.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
    }
}
