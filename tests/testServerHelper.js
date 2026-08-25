const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSocketHandlers = require('../server/socket/socketHandlers');

function createTestServer() {
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  setupSocketHandlers(io);

  return new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      const url = `http://localhost:${port}`;
      resolve({
        server,
        io,
        url,
        close: () =>
          new Promise((res) => {
            io.close();
            server.close(res);
          })
      });
    });
  });
}

module.exports = { createTestServer };
