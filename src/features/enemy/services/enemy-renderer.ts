/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import { EnemyService, EnemyType, type MapService } from '../../../../pkg/wasm_td_game';
import { EnemyView } from '../classes/enemy-view';

export class EnemyRenderer {
    private readonly service: EnemyService;
    private readonly parent: THREE.Object3D;
    private readonly views: EnemyView[] = [];
    private destroyed = false;

    constructor(parent: THREE.Object3D, mapService: MapService) {
        this.parent = parent;
        this.service = new EnemyService(mapService);
    }

    spawn(enemyType: EnemyType = EnemyType.Basic): number {
        if (this.destroyed) {
            throw new Error('Cannot spawn an enemy after the renderer is destroyed.');
        }

        const index = this.service.spawn_enemy(enemyType);
        const view = new EnemyView();
        this.views.push(view);
        this.parent.add(view.mesh);
        return index;
    }

    remove(index: number): boolean {
        if (this.destroyed || !this.service.remove_enemy(index)) {
            return false;
        }

        const [view] = this.views.splice(index, 1);
        view.destroy();
        return true;
    }

    update(deltaTime: number) {
        if (this.destroyed) {
            return;
        }

        this.service.update(deltaTime);
        this.syncViewCount();
        const positions = this.service.get_positions();

        for (let index = 0; index < this.views.length; index += 1) {
            const offset = index * 3;
            this.views[index].setPosition(
                positions[offset],
                positions[offset + 1],
                positions[offset + 2]
            );
        }
    }

    private syncViewCount() {
        const enemyCount = this.service.enemy_count();
        while (this.views.length < enemyCount) {
            const view = new EnemyView();
            this.views.push(view);
            this.parent.add(view.mesh);
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
        this.views.length = 0;
        this.service.free();
    }
}
