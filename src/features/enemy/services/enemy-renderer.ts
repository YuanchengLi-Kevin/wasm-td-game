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
    private readonly camera: THREE.Camera;
    private readonly canvas: HTMLCanvasElement;
    private readonly view: EnemyView;
    private readonly healthBars: EnemyHealthBar[] = [];
    private destroyed = false;

    constructor(
        parent: THREE.Object3D,
        mapService: MapService,
        camera: THREE.Camera,
        canvas: HTMLCanvasElement
    ) {
        this.camera = camera;
        this.canvas = canvas;
        this.enemyService = new EnemyService(mapService);
        this.view = new EnemyView(parent);
    }

    spawn(enemyType: EnemyType = EnemyType.Basic): number {
        if (this.destroyed) {
            throw new Error('Cannot spawn an enemy after the renderer is destroyed.');
        }

        const index = this.enemyService.spawn_enemy(enemyType);
        this.healthBars.push(new EnemyHealthBar());
        return index;
    }

    remove(index: number): boolean {
        if (this.destroyed || !this.enemyService.remove_enemy(index)) {
            return false;
        }

        const [healthBar] = this.healthBars.splice(index, 1);
        healthBar.destroy();
        return true;
    }

    update(deltaTime: number) {
        if (this.destroyed) {
            return;
        }

        this.enemyService.update(deltaTime);
        this.syncHealthBars();
        const positions = this.enemyService.get_positions();
        const healthRatios = this.enemyService.get_health_ratios();
        this.view.update(positions);
        this.camera.updateMatrixWorld();

        for (let index = 0; index < this.healthBars.length; index += 1) {
            const offset = index * 3;
            this.healthBars[index].update(
                healthRatios[index],
                positions[offset],
                positions[offset + 1],
                positions[offset + 2],
                this.camera,
                this.canvas
            );
        }
    }

    private syncHealthBars() {
        const enemyCount = this.enemyService.enemy_count();
        while (this.healthBars.length < enemyCount) {
            this.healthBars.push(new EnemyHealthBar());
        }
        while (this.healthBars.length > enemyCount) {
            this.healthBars.pop()?.destroy();
        }
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.view.destroy();
        for (const healthBar of this.healthBars) {
            healthBar.destroy();
        }
        this.healthBars.length = 0;
        this.enemyService.free();
    }
}
