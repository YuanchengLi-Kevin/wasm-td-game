/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import { SKY_GRADIENT } from '../../../constants/scene-visuals';

const TEXTURE_SIZE = 1024;

export function createSkyBackground(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Unable to create the sky background canvas.');
    }

    const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE);
    gradient.addColorStop(0, SKY_GRADIENT.zenith);
    gradient.addColorStop(0.62, SKY_GRADIENT.horizon);
    gradient.addColorStop(1, SKY_GRADIENT.lowerHorizon);
    context.fillStyle = gradient;
    context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
