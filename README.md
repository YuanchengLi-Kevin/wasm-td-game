<!--
Copyright (c) 2026 Yuancheng Li
SPDX-License-Identifier: Apache-2.0
-->

# wasm-td-game

A small WebAssembly tower defense game.

Rust owns the game logic and exports it through `wasm-bindgen`. TypeScript and Three.js own the browser view and rendering.

## Rendering

Three.js uses `InstancedMesh` to render repeated map tiles, towers, enemies, and projectiles efficiently. Dynamic instances update their transformation matrices from state supplied by the Rust services, while capacity grows as needed without creating a separate mesh for every object.

## Project structure

```text
src/features/
├── environment/
│   └── services/
├── enemy/
│   ├── classes/
│   ├── services/
│   └── ui/
├── map/
│   ├── classes/
│   └── services/
└── tower/
    ├── classes/
    └── services/
```

Each feature separates its responsibilities by directory:

- `classes/` contains Rust domain models and TypeScript Three.js view objects.
- `services/` contains Rust services that coordinate game logic and TypeScript renderers that connect service state to the views.
- `ui/` contains feature-specific DOM components and styles when needed.

Feature constants and configuration are grouped under `src/constants`:

```text
src/constants/
├── enemies/
├── maps/
├── towers/
└── scene-visuals.ts
```

## Development

Install JavaScript dependencies:

```sh
npm install
```

Generate the WebAssembly package after changing Rust code:

```sh
wasm-pack build --target web
```

Start the Vite dev server:

```sh
npm run dev
```

## Testing

Run the native Rust tests:

```sh
cargo test
```

Run the WebAssembly tests in headless Chrome or Firefox:

```sh
wasm-pack test --headless --chrome
wasm-pack test --headless --firefox
```
