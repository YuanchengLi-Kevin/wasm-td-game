/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import init from '../pkg/wasm_td_game';
import { EnemyView } from './features/enemy/enemy-view';

async function setup() {
    // 1. Initialize WebAssembly
    await init();

    // 2. Setup Three.js World
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Dark minimalist background

    // 3. Setup Camera (looking down at an angle)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    // 4. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 5. Add Lighting (Crucial for 3D, otherwise everything is black)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // 6. Initialize our Feature
    const enemy = new EnemyView();
    scene.add(enemy.mesh);

    // 7. The Game Loop
    function animate() {
        requestAnimationFrame(animate);

        enemy.update(); // Moves the enemy via Rust logic
        
        renderer.render(scene, camera);
    }
    animate();
}

setup();
