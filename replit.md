# Running AIcraft

AIcraft is a browser game served by the **Start application** workflow:

```sh
python3 -m http.server 5000
```

`index.html` owns the current game UI and loop. The block registry, seeded terrain, greedy chunk meshing, and IndexedDB persistence are ES modules under `src/`. Run the pure subsystem checks with `node --test tests/*.test.mjs`. The 3D first-person mode uses Three.js 0.160 from jsDelivr when WebGL2 is available; browsers without WebGL2 use Canvas compatibility mode. Use WASD and the mouse on desktop; touch controls appear on phones. The fullscreen button is available on both.
