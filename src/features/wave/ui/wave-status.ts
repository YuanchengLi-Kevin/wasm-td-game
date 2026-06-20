/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import './wave-status.css';

export class WaveStatus {
    private readonly element: HTMLDivElement;
    private readonly label: HTMLDivElement;
    private readonly progress: HTMLDivElement;
    private readonly progressFill: HTMLDivElement;
    private readonly count: HTMLDivElement;
    private lastLabel = '';
    private lastCount = '';

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'wave-status';
        this.element.setAttribute('role', 'status');

        this.label = document.createElement('div');
        this.label.className = 'wave-status__label';

        this.progress = document.createElement('div');
        this.progress.className = 'wave-status__progress';
        this.progress.setAttribute('role', 'progressbar');
        this.progress.setAttribute('aria-label', 'Wave progress');
        this.progress.setAttribute('aria-valuemin', '0');
        this.progress.setAttribute('aria-valuemax', '100');

        this.progressFill = document.createElement('div');
        this.progressFill.className = 'wave-status__progress-fill';
        this.progress.appendChild(this.progressFill);

        this.count = document.createElement('div');
        this.count.className = 'wave-status__count';

        this.element.append(this.label, this.progress, this.count);
        document.body.appendChild(this.element);
    }

    update(
        currentWaveNumber: number,
        totalWaveCount: number,
        currentWaveEnemyCount: number,
        remainingEnemyCount: number,
        isComplete: boolean
    ) {
        const resolvedEnemyCount = Math.max(currentWaveEnemyCount - remainingEnemyCount, 0);
        const progressRatio =
            currentWaveEnemyCount === 0
                ? Number(isComplete)
                : THREE.MathUtils.clamp(resolvedEnemyCount / currentWaveEnemyCount, 0, 1);

        let label = `Wave ${currentWaveNumber} / ${totalWaveCount}`;
        let count = `${resolvedEnemyCount} / ${currentWaveEnemyCount} enemies cleared`;
        if (isComplete) {
            label = 'All waves complete';
            count = `${totalWaveCount} waves cleared`;
        } else if (currentWaveNumber === 0) {
            label = 'Preparing waves';
            count = 'Waiting for the first wave';
        }

        if (label !== this.lastLabel) {
            this.label.textContent = label;
            this.lastLabel = label;
        }
        if (count !== this.lastCount) {
            this.count.textContent = count;
            this.lastCount = count;
        }

        const progressPercent = Math.round(progressRatio * 100);
        this.progressFill.style.transform = `scaleX(${progressRatio})`;
        this.progress.setAttribute('aria-valuenow', String(progressPercent));
    }
}
