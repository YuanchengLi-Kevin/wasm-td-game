<!--
Copyright (c) 2026 Yuancheng Li
SPDX-License-Identifier: Apache-2.0
-->

# wasm-td-game

A small WebAssembly tower defense game.

Rust owns the game logic and exports it through `wasm-bindgen`. TypeScript and Three.js own the browser view and rendering.

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

