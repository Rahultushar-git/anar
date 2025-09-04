const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Broadcast online count when someone connects
  broadcast({ type: "onlineCount", count: wss.clients.size });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      broadcast({ type: "message", alias: data.alias, text: data.text });
    } catch (err) {
      console.error("Invalid message", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Broadcast updated online count
    broadcast({ type: "onlineCount", count: wss.clients.size });
  });
});
