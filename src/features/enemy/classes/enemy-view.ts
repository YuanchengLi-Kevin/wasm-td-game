/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class EnemyView {
    private readonly parent: THREE.Object3D;
    private readonly geometry = new THREE.BoxGeometry(1, 1, 1);
    private readonly material = new THREE.MeshStandardMaterial({
        color: 0xff0044,
        emissive: 0x440011
    });
    private readonly transform = new THREE.Object3D();
    private mesh: THREE.InstancedMesh;
    private capacity = 1;
    private destroyed = false;

    constructor(parent: THREE.Object3D) {
        this.parent = parent;
        this.mesh = this.createMesh(this.capacity);
        this.parent.add(this.mesh);
    }

    update(positions: Float32Array | number[]) {
        if (this.destroyed) {
            return;
        }

        const count = positions.length / 3;
        this.ensureCapacity(count);
        for (let index = 0; index < count; index += 1) {
            const offset = index * 3;
            this.transform.position.set(
                positions[offset],
                positions[offset + 1],
                positions[offset + 2]
            );
            this.transform.updateMatrix();
            this.mesh.setMatrixAt(index, this.transform.matrix);
        }
        this.mesh.count = count;
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    private ensureCapacity(requiredCapacity: number) {
        if (requiredCapacity <= this.capacity) {
            return;
        }

        while (this.capacity < requiredCapacity) {
            this.capacity *= 2;
        }
        this.mesh.removeFromParent();
        this.mesh.dispose();
        this.mesh = this.createMesh(this.capacity);
        this.parent.add(this.mesh);
    }

    private createMesh(capacity: number): THREE.InstancedMesh {
        const mesh = new THREE.InstancedMesh(this.geometry, this.material, capacity);
        mesh.count = 0;
        mesh.frustumCulled = false;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        return mesh;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.mesh.removeFromParent();
        this.mesh.dispose();
        this.geometry.dispose();
        this.material.dispose();
    }
}
