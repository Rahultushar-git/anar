// server.js
const WebSocket = require('ws');
const http = require('http');

// make a simple HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// box for storing messages
let messages = [];

wss.on('connection', (ws) => {
  console.log('✅ Someone connected!');

  // send last 10 messages when someone joins
  messages.forEach(msg => {
    ws.send(msg);
  });

  // when a message comes from this user
  ws.on('message', (msg) => {
    console.log(`💬 Message: ${msg}`);

    // save it
    messages.push(msg);

    // keep only last 10
    if (messages.length > 10) {
      messages.shift(); // remove the oldest one
    }

    // send to all users
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ Someone disconnected');
  });
});

// server will listen on port 3000 (or Render’s PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
});
