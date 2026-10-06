 PlayField AI — What Should We Play?

Hacktoberfest “Touch Grass” project: upload a photo of a field or court, and an **open AI model in your browser** recommends a sport, then sends you outside to play.

## What it does

1. Upload or capture a photo of a ground, court, or outdoor space.
2. CLIP (`Xenova/clip-vit-base-patch32`) runs locally in the browser with Transformers.js.
3. The app shows the best sport, a confidence score, a short reason, and a play challenge.

No paid AI API. Photos stay on your device.

## How to run

You need [Node.js](https://nodejs.org/) installed.

```bash
npm start
```

Open http://localhost:3000

First Analyze click downloads the open model (needs internet once). After that it is cached.

## Stack

- HTML, CSS, JavaScript
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- Open vision model: [Xenova/clip-vit-base-patch32](https://huggingface.co/Xenova/clip-vit-base-patch32)

## License

MIT
