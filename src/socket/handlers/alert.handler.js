module.exports = (io, socket) => {
  socket.on("alerta_sereno", async (data, callback) => {
    const userId = socket.usuario.id;

    const payload = {
      userId,
      ...data,
      timestamp: new Date(),
    };

    console.log("🚨 ALERTA:", userId, payload);

    // Opcional guardar en BD

    io.emit("alerta_sereno", payload);

    // Responde al cliente
    callback({ ok: true });
  });
};