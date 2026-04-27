module.exports = (io, socket) => {


  // =========================
  // ROOMS
  // =========================
  socket.on("join_patrullaje", (patrullajeId) => {
    socket.join(`patrullaje_${patrullajeId}`);
    console.log(`Usuario ${socket.usuario.id} unido a patrullaje ${patrullajeId}`);
  });

  socket.on("leave_patrullaje", (patrullajeId) => {
    socket.leave(`patrullaje_${patrullajeId}`);
  });

  // =========================
  // EVENTOS DESDE CLIENTE (SERENO)
  // =========================

  // - El sereno confirma inicio
  socket.on("iniciar_patrullaje", async ({ patrullajeId }) => {
    try {
      // aquí deberías actualizar BD
      // await Patrullaje.start(patrullajeId);

      io.to(`patrullaje_${patrullajeId}`).emit("patrullaje_iniciado", {
        patrullajeId,
        iniciadoPor: socket.usuario.id,
        fecha: new Date()
      });

    } catch (error) {
      console.error(error);
    }
  });


  // - Finalizar patrullaje (desde app)
  socket.on("finalizar_patrullaje", async ({ patrullajeId }) => {
    try {
      // await Patrullaje.finish(patrullajeId);

      io.to(`patrullaje_${patrullajeId}`).emit("patrullaje_finalizado", {
        patrullajeId,
        finalizadoPor: socket.usuario.id,
        fecha: new Date()
      });

    } catch (error) {
      console.error(error);
    }
  });

  // =========================
  // 📡 EVENTOS DESDE BACKEND (CENTRAL)
  // =========================

  // Estos no son socket.on, sino funciones auxiliares que debes
  // usar desde tus controladores

  socket.emitirNuevoPatrullaje = (serenoId, patrullaje) => {
    io.to(`user_${serenoId}`).emit("nuevo_patrullaje", patrullaje);
  };

  socket.emitirCancelacionPatrullaje = (serenoId, patrullajeId) => {
    io.to(`user_${serenoId}`).emit("patrullaje_cancelado", {
      patrullajeId
    });
  };

  socket.emitirFinalizacionForzada = (serenoId, patrullajeId) => {
    io.to(`user_${serenoId}`).emit("finalizar_patrullaje", {
      patrullajeId
    });
  };

};