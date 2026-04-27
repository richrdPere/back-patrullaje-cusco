module.exports = (io, socket) => {
  socket.on("tracking", async (data, callback) => {
    const userId = socket.usuario.id;

    if (!data || !data.lat || !data.lng) return;

    const payload = {
      userId,
      patrullajeId: data.patrullaje_id || null,
      lat: data.lat,
      lng: data.lng,
      velocidad: data.velocidad || null,
      precision: data.precision || null,
      tipo: data.tipo || "TRACKING",
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    };

    // OPCIÓN 1: SOLO A OPERADORES
    io.to("operadores").emit("tracking", payload);

    // OPCIÓN 2: TODOS LOS PATRULLEROS
    io.to("patrullaje").emit("tracking", payload);

    // OPCIÓN 3 (AVANZADO): SOLO MISMA ZONA
    // io.to(`zona-${socket.usuario.zonaId}`).emit("tracking", payload);
    // Responde al cliente

    console.log("🚨 TRACKING:", userId, payload);


    if (callback) {
      callback({ ok: true });
    }
  });
};