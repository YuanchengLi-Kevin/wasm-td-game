/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class TowerView {
    private readonly baseGeometry = new THREE.CylinderGeometry(0.32, 0.4, 0.55, 12);
    private readonly turretGeometry = new THREE.BoxGeometry(0.45, 0.3, 0.45);
    private readonly barrelGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8);
    private readonly baseMaterial = new THREE.MeshStandardMaterial({ color: 0x4d6075 });
    private readonly turretMaterial = new THREE.MeshStandardMaterial({ color: 0x77a8d8 });
    private readonly root = new THREE.Object3D();
    private readonly base = new THREE.Object3D();
    private readonly turret = new THREE.Object3D();
    private readonly barrel = new THREE.Object3D();
    private readonly parent: THREE.Object3D;
    private baseInstances: THREE.InstancedMesh;
    private turretInstances: THREE.InstancedMesh;
    private barrelInstances: THREE.InstancedMesh;
    private capacity = 1;

    constructor(parent: THREE.Object3D) {
        this.parent = parent;
        this.base.position.y = 0.275;
        this.turret.position.y = 0.65;
        this.barrel.position.set(0.3, 0.68, 0);
        this.barrel.rotation.z = Math.PI / 2;
        this.root.add(this.base, this.turret, this.barrel);
        [this.baseInstances, this.turretInstances, this.barrelInstances] =
            this.createMeshes(this.capacity);
        this.parent.add(this.baseInstances, this.turretInstances, this.barrelInstances);
    }

    update(positions: Float32Array | number[], rotations: Float32Array | number[]) {
        const count = positions.length / 3;
        this.ensureCapacity(count);
        for (let index = 0; index < count; index += 1) {
            const offset = index * 3;
            this.root.position.set(positions[offset], 0, positions[offset + 2]);
            this.root.rotation.y = rotations[index];
            this.root.updateMatrixWorld(true);
            this.baseInstances.setMatrixAt(index, this.base.matrixWorld);
            this.turretInstances.setMatrixAt(index, this.turret.matrixWorld);
            this.barrelInstances.setMatrixAt(index, this.barrel.matrixWorld);
        }
        for (const mesh of [this.baseInstances, this.turretInstances, this.barrelInstances]) {
            mesh.count = count;
            mesh.instanceMatrix.needsUpdate = true;
        }
    }

    private ensureCapacity(requiredCapacity: number) {
        if (requiredCapacity <= this.capacity) {
            return;
        }

        while (this.capacity < requiredCapacity) {
            this.capacity *= 2;
        }
        this.removeMeshes();
        [this.baseInstances, this.turretInstances, this.barrelInstances] =
            this.createMeshes(this.capacity);
        this.parent.add(this.baseInstances, this.turretInstances, this.barrelInstances);
    }

    private createMeshes(capacity: number): [THREE.InstancedMesh, THREE.InstancedMesh, THREE.InstancedMesh] {
        const meshes: [THREE.InstancedMesh, THREE.InstancedMesh, THREE.InstancedMesh] = [
            new THREE.InstancedMesh(this.baseGeometry, this.baseMaterial, capacity),
            new THREE.InstancedMesh(this.turretGeometry, this.turretMaterial, capacity),
            new THREE.InstancedMesh(this.barrelGeometry, this.turretMaterial, capacity)
        ];
        for (const mesh of meshes) {
            mesh.count = 0;
            mesh.frustumCulled = false;
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        }
        return meshes;
    }

    private removeMeshes() {
        this.baseInstances.removeFromParent();
        this.turretInstances.removeFromParent();
        this.barrelInstances.removeFromParent();
        this.baseInstances.dispose();
        this.turretInstances.dispose();
        this.barrelInstances.dispose();
    }

    destroy() {
        this.removeMeshes();
        this.baseGeometry.dispose();
        this.turretGeometry.dispose();
        this.barrelGeometry.dispose();
        this.baseMaterial.dispose();
        this.turretMaterial.dispose();
    }
}
