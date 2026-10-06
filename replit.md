# Running AIcraft

AIcraft is a single-page game served from `index.html`. The **Start application** workflow runs:

```sh
python3 -m http.server 5000
```

The 3D first-person mode uses Three.js 0.160 from jsDelivr when WebGL2 is available. Browsers without WebGL2 use the built-in Canvas compatibility mode. Use WASD and the mouse on desktop; touch controls appear on phones. The fullscreen button is available on both.
