/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import './enemy-health-bar.css';

const HEALTH_BAR_HEIGHT_OFFSET = 0.85;

export class EnemyHealthBar {
    private readonly element: HTMLDivElement;
    private readonly fill: HTMLDivElement;
    private readonly screenPosition = new THREE.Vector3();
    private destroyed = false;

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'enemy-health-bar';
        this.element.setAttribute('role', 'meter');
        this.element.setAttribute('aria-label', 'Enemy health');
        this.element.setAttribute('aria-valuemin', '0');
        this.element.setAttribute('aria-valuemax', '100');

        this.fill = document.createElement('div');
        this.fill.className = 'enemy-health-bar__fill';
        this.element.appendChild(this.fill);
        document.body.appendChild(this.element);
    }

    update(
        healthRatio: number,
        enemy: THREE.Object3D,
        camera: THREE.Camera,
        canvas: HTMLCanvasElement
    ) {
        if (this.destroyed) {
            return;
        }

        const ratio = THREE.MathUtils.clamp(healthRatio, 0, 1);
        this.fill.style.transform = `scaleX(${ratio})`;
        this.element.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));

        enemy.getWorldPosition(this.screenPosition);
        this.screenPosition.y += HEALTH_BAR_HEIGHT_OFFSET;
        this.screenPosition.project(camera);

        const isVisible =
            this.screenPosition.z >= -1 &&
            this.screenPosition.z <= 1 &&
            this.screenPosition.x >= -1 &&
            this.screenPosition.x <= 1 &&
            this.screenPosition.y >= -1 &&
            this.screenPosition.y <= 1;
        this.element.hidden = !isVisible;
        if (!isVisible) {
            return;
        }

        const bounds = canvas.getBoundingClientRect();
        const x = bounds.left + (this.screenPosition.x + 1) * bounds.width * 0.5;
        const y = bounds.top + (1 - this.screenPosition.y) * bounds.height * 0.5;
        this.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.element.remove();
    }
}
