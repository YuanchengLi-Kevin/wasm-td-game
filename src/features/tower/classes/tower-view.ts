/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class TowerView {
    readonly object = new THREE.Group();

    private readonly turretAssembly = new THREE.Group();
    private readonly geometries: THREE.BufferGeometry[];
    private readonly materials: THREE.Material[];

    constructor() {
        const baseGeometry = new THREE.CylinderGeometry(0.32, 0.4, 0.55, 12);
        const turretGeometry = new THREE.BoxGeometry(0.45, 0.3, 0.45);
        const barrelGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x4d6075 });
        const turretMaterial = new THREE.MeshStandardMaterial({ color: 0x77a8d8 });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.275;
        const turret = new THREE.Mesh(turretGeometry, turretMaterial);
        turret.position.y = 0.65;
        const barrel = new THREE.Mesh(barrelGeometry, turretMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.3, 0.68, 0);

        this.turretAssembly.add(turret, barrel);
        this.object.add(base, this.turretAssembly);
        this.geometries = [baseGeometry, turretGeometry, barrelGeometry];
        this.materials = [baseMaterial, turretMaterial];
    }

    setPosition(x: number, z: number) {
        this.object.position.set(x, 0, z);
    }

    setRotationY(rotationY: number) {
        this.turretAssembly.rotation.y = rotationY;
    }

    destroy() {
        this.object.removeFromParent();
        for (const geometry of this.geometries) {
            geometry.dispose();
        }
        for (const material of this.materials) {
            material.dispose();
        }
    }
}
