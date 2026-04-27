const app = require("./src/app.js");
require("dotenv").config();
const http = require("http");
// const socketIO = require("socket.io");
const { initSocket } = require("./src/socket");

// const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP encima del express
const server = http.createServer(app);

// Inicializar Socket.IO
initSocket(server);


server.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo con WebSockets en el puerto ${PORT}`);
});

