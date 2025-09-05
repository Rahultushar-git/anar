const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let waitingQueue = []; // store waiting clients

function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function pairUsers() {
  while (waitingQueue.length >= 2) {
    const a = waitingQueue.shift();
    const b = waitingQueue.shift();
    if (!a || !b) continue;

    a.partner = b;
    b.partner = a;

    send(a, { type: "match", initiator: true });
    send(b, { type: "match", initiator: false });
  }
}

wss.on("connection", (ws) => {
  console.log("New user connected");

  waitingQueue.push(ws);
  send(ws, { type: "waiting" });
  pairUsers();

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "next") {
        const partner = ws.partner;
        if (partner) {
          send(partner, { type: "partner-left" });
          partner.partner = null;
          waitingQueue.push(partner);
        }
        ws.partner = null;
        waitingQueue.push(ws);
        send(ws, { type: "waiting" });
        pairUsers();
        return;
      }

      if (["offer", "answer", "candidate"].includes(data.type)) {
        if (ws.partner) send(ws.partner, data);
      }
    } catch (err) {
      console.error("Invalid message:", err);
    }
  });

  ws.on("close", () => {
    console.log("User disconnected");
    const partner = ws.partner;
    if (partner) {
      send(partner, { type: "partner-left" });
      partner.partner = null;
      waitingQueue.push(partner);
      pairUsers();
    }
    waitingQueue = waitingQueue.filter((u) => u !== ws);
  });
});
