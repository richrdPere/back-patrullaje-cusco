const db = require('../../database/models');
const { startPatrullajeService, endPatrullajeService } = require("../../modules/patrullajes/services/patrullaje_movil")

const PatrullajeProgramado = db.PatrullajeProgramado;
const PatrullajePersonal = db.PatrullajePersonal;

const mapPatrullaje = (p) => ({
  id: p.id,
  estado: p.estado,
  fecha: p.fecha,
  hora_inicio: p.hora_inicio,
  hora_fin: p.hora_fin,
  descripcion: p.descripcion,
  zona: {
    nombre: p.zona?.nombre,
    descripcion: p.zona?.descripcion,
    riesgo: p.zona?.riesgo,
    coordenadas: p.zona?.coordenadas ?? []
  },
  unidad: {
    codigo: p.unidad?.codigo,
    tipo: p.unidad?.tipo,
    placa: p.unidad?.placa
  }
});

module.exports = (io, socket) => {


  // =========================
  // ROOMS
  // =========================
  socket.on("join_patrullaje", ({ patrullajeId }) => {
    socket.join(`patrullaje_${patrullajeId}`);
    console.log(`Usuario ${socket.usuario.id} unido a patrullaje ${patrullajeId}`);
  });

  socket.on("leave_patrullaje", ({ patrullajeId }) => {
    socket.leave(`patrullaje_${patrullajeId}`);
  });

  // =========================
  // EVENTOS DESDE CLIENTE (SERENO)
  // =========================

  // - El sereno confirma inicio
  socket.on("iniciar_patrullaje", async ({ patrullajeId }) => {
    try {

      const patrullaje =
        await startPatrullajeService(
          patrullajeId,
          socket.usuario.id
        );

      // 3. EVENTO ÚNICO
      io.to(`patrullaje_${patrullajeId}`).emit(
        "patrullaje_actualizado",
        mapPatrullaje(patrullaje)
      );

    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Error al iniciar patrullaje" });
    }
  });


  // - Finalizar patrullaje (desde app)
  socket.on("finalizar_patrullaje", async ({ patrullajeId }) => {
    try {
     
      const patrullaje =
        await endPatrullajeService(
          patrullajeId,
          socket.usuario.id
        );

      io.to(`patrullaje_${patrullajeId}`).emit(
        "patrullaje_actualizado",
        mapPatrullaje(patrullaje)
      );

    } catch (error) {
      console.error(error);
    }
  });

  // =========================
  // 📡 EVENTOS DESDE BACKEND (CENTRAL)
  // =========================

  // Estos no son socket.on, sino funciones auxiliares que debes
  // usar desde tus controladores

  socket.emitirNuevoPatrullaje = async (serenoId, patrullaje) => {
    console.log("📡 ENVIANDO PATRULLAJE COMPLETO:", patrullaje);
    io.to(`user_${serenoId}`).emit("nuevo_patrullaje", patrullaje);
  };

  socket.emitirCancelacionPatrullaje = (serenoId, patrullajeId) => {
    io.to(`user_${serenoId}`).emit("patrullaje_cancelado", {
      patrullajeId
    });
  };

  // socket.emitirFinalizacionForzada = (serenoId, patrullajeId) => {
  //   io.to(`user_${serenoId}`).emit("finalizar_patrullaje", {
  //     patrullajeId
  //   });
  // };

};