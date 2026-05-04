const db = require('../../models');

const PatrullajeProgramado = db.PatrullajeProgramado;
const PatrullajePersonal = db.PatrullajePersonal;

const mapPatrullaje = (p) => ({
  id: p.id,
  fecha: p.fecha,
  hora_inicio: p.hora_inicio,
  hora_fin: p.hora_fin,
  estado: p.estado,
  zona: {
    nombre: p.zona?.nombre,
    descripcion: p.zona?.descripcion,
    riesgo: p.zona?.riesgo,
    coordenadas: p.zona?.coordenadas ?? [],
  },
  unidad: {
    codigo: p.unidad?.codigo,
    tipo: p.unidad?.tipo,
    placa: p.unidad?.placa,
  },
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

      // 1. VALIDAR QUE EL USUARIO PERTENECE AL PATRULLAJE
      const asignado = await PatrullajePersonal.findOne({
        where: {
          patrullaje_id: patrullajeId,
          personal_id: socket.usuario.id,
          tipo_personal: "SERENO"
        }
      });

      if (!asignado) {
        return socket.emit("error", {
          message: "No estás asignado a este patrullaje"
        });
      }

      // 2. ACTUALIZAR ESTADO EN BD
      await PatrullajeProgramado.update(
        { estado: "EN_PROCESO" },
        { where: { id: patrullajeId } }
      );

      // 3. UNIR AL ROOM
      socket.join(`patrullaje_${patrullajeId}`);

      // 4. EMITIR A TODOS LOS PARTICIPANTES
      io.to(`patrullaje_${patrullajeId}`).emit("patrullaje_iniciado", {
        patrullajeId,
        iniciadoPor: socket.usuario.id,
        fecha: new Date()
      });

    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Error al iniciar patrullaje" });
    }
  });


  // - Finalizar patrullaje (desde app)
  socket.on("finalizar_patrullaje", async ({ patrullajeId }) => {
    try {
      // validar
      const asignado = await PatrullajePersonal.findOne({
        where: {
          patrullaje_id: patrullajeId,
          personal_id: socket.usuario.id,
          tipo_personal: "SERENO"
        }
      });

      if (!asignado) {
        return socket.emit("error", { message: "No autorizado" });
      }

      // actualizar BD
      await PatrullajeProgramado.update(
        { estado: "FINALIZADO" },
        { where: { id: patrullajeId } }
      );

      // emitir
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