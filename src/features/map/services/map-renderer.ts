/*
 * Copyright (c) 2026 Yuancheng Li
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

import type { MapService } from '../../../../pkg/wasm_td_game';
import { MAP_TILE_COLORS } from '../../../constants/maps/map-visuals';

const TILE_SIZE = 1;
const TILE_HEIGHT = 0.1;

export class MapRenderer {
    private readonly group = new THREE.Group();
    private readonly geometry = new THREE.BoxGeometry(TILE_SIZE * 0.96, TILE_HEIGHT, TILE_SIZE * 0.96);
    private readonly materials: THREE.MeshStandardMaterial[];
    private readonly meshes: THREE.InstancedMesh[] = [];

    constructor(parent: THREE.Object3D, mapService: MapService) {
        const width = mapService.width();
        const height = mapService.height();
        const pathCells = mapService.get_path_cells();
        const pathIndices = new Map<string, number>();

        for (let index = 0; index < pathCells.length; index += 2) {
            pathIndices.set(`${pathCells[index]},${pathCells[index + 1]}`, index / 2);
        }

        this.materials = [
            new THREE.MeshStandardMaterial({ color: MAP_TILE_COLORS.terrain }),
            new THREE.MeshStandardMaterial({ color: MAP_TILE_COLORS.path }),
            new THREE.MeshStandardMaterial({
                color: MAP_TILE_COLORS.start,
                emissive: MAP_TILE_COLORS.startEmissive
            }),
            new THREE.MeshStandardMaterial({
                color: MAP_TILE_COLORS.end,
                emissive: MAP_TILE_COLORS.endEmissive
            })
        ];

        const tilePositions = this.materials.map(() => [] as THREE.Vector3[]);
        const finalPathIndex = pathCells.length / 2 - 1;
        for (let row = 0; row < height; row += 1) {
            for (let column = 0; column < width; column += 1) {
                const pathIndex = pathIndices.get(`${column},${row}`);
                let materialIndex = pathIndex === undefined ? 0 : 1;
                if (pathIndex === 0) {
                    materialIndex = 2;
                } else if (pathIndex === finalPathIndex) {
                    materialIndex = 3;
                }

                tilePositions[materialIndex].push(
                    new THREE.Vector3(
                        column * TILE_SIZE - ((width - 1) * TILE_SIZE) / 2,
                        -TILE_HEIGHT / 2,
                        row * TILE_SIZE - ((height - 1) * TILE_SIZE) / 2
                    )
                );
            }
        }

        const matrix = new THREE.Matrix4();
        for (let materialIndex = 0; materialIndex < this.materials.length; materialIndex += 1) {
            const positions = tilePositions[materialIndex];
            const tiles = new THREE.InstancedMesh(
                this.geometry,
                this.materials[materialIndex],
                positions.length
            );
            for (let index = 0; index < positions.length; index += 1) {
                matrix.makeTranslation(positions[index]);
                tiles.setMatrixAt(index, matrix);
            }
            tiles.instanceMatrix.needsUpdate = true;
            this.meshes.push(tiles);
            this.group.add(tiles);
        }

        parent.add(this.group);
    }

    destroy() {
        this.group.removeFromParent();
        this.group.clear();
        for (const mesh of this.meshes) {
            mesh.dispose();
        }
        this.geometry.dispose();
        for (const material of this.materials) {
            material.dispose();
        }
    }
}
