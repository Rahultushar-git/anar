const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

// Store last 20 chat messages
let messageHistory = [];

function broadcast(data, exclude = null) {
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send chat history to the new client
  if (messageHistory.length > 0) {
    ws.send(JSON.stringify({ type: "history", messages: messageHistory }));
  }

  // Broadcast online count
  broadcast({ type: "onlineCount", count: wss.clients.size });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Handle WebRTC signaling
      if (["offer", "answer", "candidate"].includes(data.type)) {
        broadcast(data, ws);
      } 
      // Handle chat messages
      else if (data.type === "message") {
        const chatMsg = { type: "message", alias: data.alias, text: data.text };

        // Save to history
        messageHistory.push(chatMsg);
        if (messageHistory.length > 20) {
          messageHistory.shift(); // keep only last 20
        }

        // Broadcast message
        broadcast(chatMsg);
      }
    } catch (err) {
      console.error("Invalid message", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    broadcast({ type: "onlineCount", count: wss.clients.size });
  });
});
