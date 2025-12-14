# DinoChat - ChatGPT-Style Dinosaur Game App

## Overview
A ChatGPT-style chat application that lets users play the Chrome offline dinosaur game inside the chat interface. Built with React and Vite.

## Project Architecture
- **Frontend**: React 18 with Vite
- **Styling**: CSS with ChatGPT-like dark theme
- **Game**: Custom HTML5 Canvas dinosaur game implementation

## Key Files
- `src/App.jsx` - Main chat interface with message handling
- `src/components/DinoGame.jsx` - Canvas-based dinosaur game component
- `src/App.css` - ChatGPT-style dark theme styling
- `vite.config.js` - Vite configuration with host settings

## How to Play
1. Type "play" or "start game" in the chat
2. Press SPACE or tap to make the dino jump
3. Avoid cacti to increase your score
4. High scores are saved to localStorage

## Running the App
```bash
npm run dev
```
The app runs on port 5000.

## Recent Changes
- December 14, 2025: Initial build with chat interface and dinosaur game
