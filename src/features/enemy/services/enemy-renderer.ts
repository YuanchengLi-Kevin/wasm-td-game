/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import { EnemyService, EnemyType, type MapService } from '../../../../pkg/wasm_td_game';
import { EnemyView } from '../classes/enemy-view';
import { EnemyHealthBar } from '../ui/enemy-health-bar';

export class EnemyRenderer {
    readonly enemyService: EnemyService;
    private readonly parent: THREE.Object3D;
    private readonly camera: THREE.Camera;
    private readonly canvas: HTMLCanvasElement;
    private readonly views: EnemyView[] = [];
    private readonly healthBars: EnemyHealthBar[] = [];
    private destroyed = false;

    constructor(
        parent: THREE.Object3D,
        mapService: MapService,
        camera: THREE.Camera,
        canvas: HTMLCanvasElement
    ) {
        this.parent = parent;
        this.camera = camera;
        this.canvas = canvas;
        this.enemyService = new EnemyService(mapService);
    }

    spawn(enemyType: EnemyType = EnemyType.Basic): number {
        if (this.destroyed) {
            throw new Error('Cannot spawn an enemy after the renderer is destroyed.');
        }

        const index = this.enemyService.spawn_enemy(enemyType);
        const view = new EnemyView();
        this.views.push(view);
        this.healthBars.push(new EnemyHealthBar());
        this.parent.add(view.mesh);
        return index;
    }

    remove(index: number): boolean {
        if (this.destroyed || !this.enemyService.remove_enemy(index)) {
            return false;
        }

        const [view] = this.views.splice(index, 1);
        const [healthBar] = this.healthBars.splice(index, 1);
        view.destroy();
        healthBar.destroy();
        return true;
    }

    update(deltaTime: number) {
        if (this.destroyed) {
            return;
        }

        this.enemyService.update(deltaTime);
        this.syncViewCount();
        const positions = this.enemyService.get_positions();
        const healthRatios = this.enemyService.get_health_ratios();
        this.camera.updateMatrixWorld();

        for (let index = 0; index < this.views.length; index += 1) {
            const offset = index * 3;
            const view = this.views[index];
            view.setPosition(
                positions[offset],
                positions[offset + 1],
                positions[offset + 2]
            );
            this.healthBars[index].update(
                healthRatios[index],
                view.mesh,
                this.camera,
                this.canvas
            );
        }
    }

    private syncViewCount() {
        const enemyCount = this.enemyService.enemy_count();
        while (this.views.length < enemyCount) {
            const view = new EnemyView();
            this.views.push(view);
            this.healthBars.push(new EnemyHealthBar());
            this.parent.add(view.mesh);
        }
        while (this.views.length > enemyCount) {
            this.views.pop()?.destroy();
            this.healthBars.pop()?.destroy();
        }
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        for (const view of this.views) {
            view.destroy();
        }
        for (const healthBar of this.healthBars) {
            healthBar.destroy();
        }
        this.views.length = 0;
        this.healthBars.length = 0;
        this.enemyService.free();
    }
}
