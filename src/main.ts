/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import init, { MapService } from '../pkg/wasm_td_game';
import defaultMapJson from './constants/maps/default_map.json?raw';
import { EnemyRenderer } from './features/enemy/services/enemy-renderer';
import { createSkyBackground } from './features/environment/services/sky-background';
import { MapRenderer } from './features/map/services/map-renderer';
import { TowerRenderer } from './features/tower/services/tower-renderer';

async function setup() {
    await init();

    const scene = new THREE.Scene();
    scene.background = createSkyBackground();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 9, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const mapService = new MapService(defaultMapJson);
    new MapRenderer(scene, mapService);
    const enemies = new EnemyRenderer(scene, mapService);
    const towers = new TowerRenderer(scene, mapService, camera, renderer.domElement);
    const timer = new THREE.Timer();
    timer.connect(document);

    function animate(timestamp: number) {
        requestAnimationFrame(animate);

        timer.update(timestamp);
        const deltaTime = timer.getDelta();
        towers.update(deltaTime, enemies.enemyService);
        enemies.update(deltaTime);

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}

setup();
