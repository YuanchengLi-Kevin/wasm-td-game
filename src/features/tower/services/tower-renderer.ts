/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import { type EnemyService, type MapService, TowerService } from '../../../../pkg/wasm_td_game';
import { ProjectileView } from '../classes/projectile-view';
import { TowerView } from '../classes/tower-view';

const TILE_SIZE = 1;

export class TowerRenderer {
    private readonly service: TowerService;
    private readonly parent: THREE.Object3D;
    private readonly camera: THREE.Camera;
    private readonly inputElement: HTMLElement;
    private readonly mapWidth: number;
    private readonly mapHeight: number;
    private readonly raycaster = new THREE.Raycaster();
    private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    private readonly intersection = new THREE.Vector3();
    private readonly towerViews: TowerView[] = [];
    private readonly projectileViews: ProjectileView[] = [];
    private destroyed = false;

    constructor(
        parent: THREE.Object3D,
        mapService: MapService,
        camera: THREE.Camera,
        inputElement: HTMLElement
    ) {
        this.parent = parent;
        this.camera = camera;
        this.inputElement = inputElement;
        this.mapWidth = mapService.width();
        this.mapHeight = mapService.height();
        this.service = new TowerService(mapService);
        this.inputElement.addEventListener('pointerdown', this.handlePointerDown);
    }

    update(deltaTime: number, enemies: EnemyService) {
        if (this.destroyed) {
            return;
        }

        this.service.update(deltaTime, enemies);
        this.syncTowerViews();
        this.syncProjectileViews();
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.inputElement.removeEventListener('pointerdown', this.handlePointerDown);
        for (const view of this.towerViews) {
            view.destroy();
        }
        for (const view of this.projectileViews) {
            view.destroy();
        }
        this.towerViews.length = 0;
        this.projectileViews.length = 0;
        this.service.free();
    }

    private readonly handlePointerDown = (event: PointerEvent) => {
        if (this.destroyed || event.button !== 0) {
            return;
        }

        const bounds = this.inputElement.getBoundingClientRect();
        const pointer = new THREE.Vector2(
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
            -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        );
        this.raycaster.setFromCamera(pointer, this.camera);
        if (!this.raycaster.ray.intersectPlane(this.groundPlane, this.intersection)) {
            return;
        }

        const column = Math.round(
            this.intersection.x / TILE_SIZE + (this.mapWidth - 1) / 2
        );
        const row = Math.round(
            this.intersection.z / TILE_SIZE + (this.mapHeight - 1) / 2
        );
        if (column < 0 || row < 0 || column >= this.mapWidth || row >= this.mapHeight) {
            return;
        }

        if (this.service.place_tower(column, row)) {
            this.syncTowerViews();
        }
    };

    private syncTowerViews() {
        const positions = this.service.get_tower_positions();
        const towerCount = positions.length / 3;
        while (this.towerViews.length < towerCount) {
            const view = new TowerView();
            this.towerViews.push(view);
            this.parent.add(view.object);
        }

        for (let index = 0; index < towerCount; index += 1) {
            const offset = index * 3;
            this.towerViews[index].setPosition(positions[offset], positions[offset + 2]);
        }
    }

    private syncProjectileViews() {
        const positions = this.service.get_projectile_positions();
        const projectileCount = positions.length / 3;
        while (this.projectileViews.length < projectileCount) {
            const view = new ProjectileView();
            this.projectileViews.push(view);
            this.parent.add(view.mesh);
        }
        while (this.projectileViews.length > projectileCount) {
            this.projectileViews.pop()?.destroy();
        }

        for (let index = 0; index < projectileCount; index += 1) {
            const offset = index * 3;
            this.projectileViews[index].setPosition(
                positions[offset],
                positions[offset + 1],
                positions[offset + 2]
            );
        }
    }
}
