const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

// Rota básica HTTP para evitar erro "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Servidor WebSocket está rodando.");
});

wss.on("connection", ws => {
  let room = null;

  ws.on("message", message => {
    try {
      const data = JSON.parse(message);
      if (data.join && typeof data.join === "string") {
        room = data.join;
        rooms[room] = rooms[room] || [];
        rooms[room].push(ws);
        console.log("Cliente entrou na sala:", room);
      } else if (room && rooms[room]) {
        rooms[room].forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (e) {
      console.error("Erro ao processar mensagem:", e);
    }
  });

  ws.on("close", () => {
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(c => c !== ws);
    }
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});