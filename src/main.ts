/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import init, { MapService, WaveService } from '../pkg/wasm_td_game';
import { CAMERA_VIEW_HEIGHT, CAMERA_VIEW_WIDTH } from './constants/camera/camera-config';
import defaultMapJson from './constants/maps/default_map.json?raw';
import { EnemyRenderer } from './features/enemy/services/enemy-renderer';
import { createSkyBackground } from './features/environment/services/sky-background';
import { MapRenderer } from './features/map/services/map-renderer';
import { TowerRenderer } from './features/tower/services/tower-renderer';
import { WaveStatus } from './features/wave/ui/wave-status';

async function setup() {
    await init();

    const scene = new THREE.Scene();
    scene.background = createSkyBackground();

    const camera = new THREE.OrthographicCamera();
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(renderer.domElement);

    function resize() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const halfHeight = Math.max(CAMERA_VIEW_HEIGHT / 2, CAMERA_VIEW_WIDTH / (2 * aspectRatio));
        const halfWidth = halfHeight * aspectRatio;

        camera.left = -halfWidth;
        camera.right = halfWidth;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resize);
    resize();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const mapService = new MapService(defaultMapJson);
    new MapRenderer(scene, mapService);
    const enemies = new EnemyRenderer(scene, mapService, camera, renderer.domElement);
    const towers = new TowerRenderer(scene, mapService, camera, renderer.domElement);
    const waves = new WaveService();
    const waveStatus = new WaveStatus();
    const timer = new THREE.Timer();
    timer.connect(document);

    function animate(timestamp: number) {
        requestAnimationFrame(animate);

        timer.update(timestamp);
        const deltaTime = timer.getDelta();
        waves.update(deltaTime, enemies.enemyService);
        towers.update(deltaTime, enemies.enemyService);
        enemies.update(deltaTime);
        waveStatus.update(
            waves.current_wave_number(),
            waves.total_wave_count(),
            waves.current_wave_enemy_count(),
            waves.remaining_enemy_count(enemies.enemyService),
            waves.is_complete()
        );

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}

setup();
