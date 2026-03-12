# Nuwa Face Search

A minimal, Nuwa-inspired face search web app. Upload a photo to detect faces and run a search (demo uses mock results).

## Features

- **Face upload** — Drag & drop or click to add a photo
- **Face detection** — Uses face-api.js (TensorFlow.js) to validate a face is present
- **Search UI** — Simulated search with mock results grid
- **Responsive** — Works on desktop and mobile

## Run locally

Open `index.html` in a browser, or serve with a local server:

```bash
npx serve .
```

Models load from CDN. No build step or API keys required.

## Extending

To connect a real face search API:

1. Replace `generateMockResults()` in `app.js` with your API call
2. Swap `detectFace()` for your provider's detection if needed
3. Add auth/API keys via environment variables

## Tech

- HTML / CSS / vanilla JS
- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection
- [TensorFlow.js](https://www.tensorflow.org/js) (dependency of face-api)
