module.exports = (io, socket) => {
  socket.on("tracking", (data) => {
    const userId = socket.usuario.id;

    // Enviar a todos (o luego a room)
    io.emit("tracking", {
      userId,
      ...data,
    });
  });
};