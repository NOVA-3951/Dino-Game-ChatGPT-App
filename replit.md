# Dino Game ChatGPT App

## Overview
An MCP (Model Context Protocol) server that provides the Chrome Dinosaur Game as an interactive widget for ChatGPT Apps. When connected to ChatGPT in Developer Mode, users can play the classic dinosaur running game directly inside their AI conversations.

## Project Architecture
```
dino-chatgpt-app/
├── server/
│   └── index.ts          # MCP server with tool handlers
├── widget/
│   ├── src/
│   │   ├── main.tsx      # React widget entry point
│   │   ├── DinoGame.tsx  # Canvas-based dinosaur game component
│   │   └── styles.css    # Widget styling
│   ├── index.html        # Widget HTML template
│   └── vite.config.js    # Vite build config for widget
├── dist/widget/          # Built widget assets
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Technology Stack
- **MCP Server**: TypeScript with @modelcontextprotocol/sdk
- **Transport**: Express.js with StreamableHTTPServerTransport
- **Widget**: React 18 with HTML5 Canvas game
- **Bundler**: Vite

## Available Tools
1. **play_dino_game** - Launches the dinosaur running game widget
   - Parameter: `difficulty` (easy/normal/hard)
2. **get_dino_tips** - Returns tips for playing the game

## How It Works
1. ChatGPT connects to this MCP server via the `/mcp` endpoint
2. When users ask to play the dinosaur game, ChatGPT calls the `play_dino_game` tool
3. The server returns the game widget with `text/html+skybridge` MIME type
4. ChatGPT renders the widget in an iframe where users can play

## Game Controls
- **SPACE** or **UP Arrow** - Jump
- **Tap** (on mobile) - Jump
- Press SPACE after game over to restart

## Running Locally
```bash
npm run dev
```
This builds the widget and starts the MCP server on port 5000.

## Endpoints
- `GET /` - Server info page
- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check

## Connect to ChatGPT
1. Enable Developer Mode in ChatGPT settings
2. Add this server's MCP endpoint URL
3. Ask ChatGPT to "play the dinosaur game"

## Recent Changes
- December 14, 2025: Built MCP server with dinosaur game widget for ChatGPT Apps
