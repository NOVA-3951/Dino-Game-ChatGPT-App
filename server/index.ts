import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { readFileSync, existsSync } from "node:fs";
import { z } from "zod";

const app = express();
const PORT = 5000;

app.use(express.json());

const server = new McpServer({
  name: "dino-game-chatgpt-app",
  version: "1.0.0",
});

function getWidgetHTML(): string {
  const jsPath = "dist/widget/dino-game.js";
  const cssPath = "dist/widget/dino-game.css";
  
  const js = existsSync(jsPath) ? readFileSync(jsPath, "utf8") : "";
  const css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  <div id="dino-root"></div>
  <script type="module">${js}</script>
</body>
</html>
  `.trim();
}

server.resource(
  "dino-game-widget",
  "ui://widget/dino-game.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/dino-game.html",
        mimeType: "text/html+skybridge",
        text: getWidgetHTML(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetCSP": {
            connect_domains: ["https://chatgpt.com"],
            resource_domains: ["https://*.oaistatic.com"],
          },
        },
      },
    ],
  })
);

server.tool(
  "play_dino_game",
  "Launch the classic Chrome dinosaur running game. Jump over cacti to score points!",
  {
    difficulty: z.enum(["easy", "normal", "hard"]).default("normal").describe("Game difficulty level"),
  },
  async ({ difficulty }) => {
    return {
      content: [
        {
          type: "text" as const,
          text: `Here's the dinosaur game! Press SPACE or tap to jump. Difficulty: ${difficulty}. The game speeds up as you score more points. Good luck!`,
        },
        {
          type: "resource" as const,
          resource: {
            uri: "ui://widget/dino-game.html",
            mimeType: "text/html+skybridge",
            text: getWidgetHTML(),
          },
        },
      ],
    };
  }
);

server.tool(
  "get_dino_tips",
  "Get tips and strategies for playing the dinosaur game",
  {},
  async () => {
    const tips = [
      "Time your jumps carefully - don't jump too early",
      "Watch for varying cactus heights",
      "The game speeds up over time, stay focused",
      "Short hops work for small cacti",
      "Practice makes perfect!",
    ];
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Here are some tips for mastering the dinosaur game:\n\n${tips.map((tip, i) => `${i + 1}. ${tip}`).join("\n")}`,
        },
      ],
    };
  }
);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

app.all("/mcp", async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "dino-game-chatgpt-app" });
});

app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dino Game ChatGPT App</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        code { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .endpoint { margin: 10px 0; padding: 12px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .dino { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="dino">🦖</div>
      <h1>Dino Game ChatGPT App</h1>
      <p>This is an MCP server that provides the Chrome Dinosaur Game as a ChatGPT App widget.</p>
      
      <h2>Endpoints</h2>
      <div class="endpoint">
        <strong>MCP:</strong> <code>/mcp</code>
      </div>
      <div class="endpoint">
        <strong>Health:</strong> <code>/health</code>
      </div>
      
      <h2>Available Tools</h2>
      <ul>
        <li><strong>play_dino_game</strong> - Launch the dinosaur running game</li>
        <li><strong>get_dino_tips</strong> - Get tips for playing the game</li>
      </ul>
      
      <h2>Connect to ChatGPT</h2>
      <p>In ChatGPT Developer Mode, add this server's MCP endpoint to play the dinosaur game inside your conversations!</p>
    </body>
    </html>
  `);
});

async function main() {
  await server.connect(transport);
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🦖 Dino Game MCP Server running at http://0.0.0.0:${PORT}`);
    console.log(`   MCP endpoint: http://0.0.0.0:${PORT}/mcp`);
    console.log(`   Health check: http://0.0.0.0:${PORT}/health`);
  });
}

main().catch(console.error);
