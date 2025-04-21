# Custom Video Player

A responsive and accessible video player built with **Vue 3**, **Vite**, and **TypeScript**. Features include custom chapter navigation, playback controls, keyboard accessibility, and adaptive UI using SCSS.

🌐 **Live Demo**  
[Click here to view the deployed app](https://custom-video-player-7f60a.web.app)

---

## Features

-  Play / Pause / Replay functionality  
- Volume and mute controls with tooltip feedback  
- Chapter navigation (Next / Previous)  
- Skip forward/backward by seconds  
- Playback speed adjustment  
- Fullscreen toggle  
- Closed captions support  
- Accessibility: ARIA roles, keyboard navigation, screen-reader friendly  
- Styled with SCSS and responsive media queries  
- Built with `lucide-vue-next` for icon consistency

---

## 📁 Project Structure

- `src/components/` – All UI and logic split into reusable components  
- `src/composables/` – Logic extracted into composables like `usePlayerMeta.ts`  
- `src/assets/styles/` – SCSS partials and variables  
- `src/utilities/` – Helpers like `formatTime()`  

---

## Setup

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Preview Production

```sh
npm run preview
```

## Environment Variables

Create a .env file in the project root with the following content:

```sh
VITE_VIDEO_BASE=https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com
VITE_VIDEO_PATH=/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9
```