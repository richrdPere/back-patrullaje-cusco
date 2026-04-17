const { Server } = require("socket.io");
const { addUser, removeUser } = require("./usuariosManager");
const socketAuth = require("./middleware/socketAuth");
const registerHandlers = require("./socketManager");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware JWT
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.usuario.id;
    console.log(`🟢 Usuario conectado: ${userId} | Socket: ${socket.id}`);


    // Asociar socket al usuario
    addUser(userId, socket.id);

    socket.join(`user_${userId}`); // OPCIONAL

    //Registrar handlers (alertas, tracking, etc.)
    registerHandlers(io, socket);

    // Evento antes de desconectar (debug útil)
    socket.on("disconnecting", (reason) => {
      console.log(`⚠️ Desconectando: ${userId} | Socket: ${socket.id}`);
      console.log(`Motivo previo: ${reason}`);

      removeUser(userId, socket.id);
    });

    // Desconexión final
    socket.on("disconnect", (reason) => {
      console.log(`🔴 Usuario desconectado: ${userId} | Socket: ${socket.id}`);
      console.log(`Motivo: ${reason}`);

      removeUser(userId, socket.id);
    });
  });
};

const getIO = () => io;

module.exports = { initSocket, getIO };