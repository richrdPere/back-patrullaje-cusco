const db = require('../../database/models');
const { Op } = require("sequelize");

const { startPatrullajeService, endPatrullajeService } = require("../../modules/patrullajes/services/patrullaje_movil")

const { calculateDistanceBetweenPoints } = require("../../utils/distance.helper");

const PatrullajeProgramado = db.PatrullajeProgramado;
const PatrullajePersonal = db.PatrullajePersonal;
const PatrullajeGps = db.PatrullajeGps;

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

// FUNCIONES
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

  // ==========================================
  // INICIAR PATRULLAJE
  // ==========================================
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

      if (typeof callback === "function") {
        callback({
          success: true,
          message: "Patrullaje iniciado correctamente.",
          data: payload,
        });
      }

    } catch (error) {
      console.error(error);
      if (typeof callback === "function") {
        callback({
          success: false,
          message: error.message,
        });
      } else {
        socket.emit("patrullaje_error", {
          message: error.message,
        });
      }
    }
  });

  // ==========================================
  // TRACKING GPS
  // ==========================================
  // - Guardar puntos posicionales del tracking (desde app)
  // socket.on("tracking", async (data, callback) => {

  //   console.log(
  //     "🟢 TRACKING LISTENER NUEVO EJECUTADO",
  //     {
  //       socketId: socket.id,
  //       usuarioId: socket.usuario?.id,
  //       data,
  //       callbackDisponible:
  //         typeof callback === "function",
  //     },
  //   );

  //   try {
  //     const {
  //       patrullajeId,
  //       latitud,
  //       longitud,
  //       velocidad,
  //       precision,
  //       fechaHora,
  //       tipo,
  //     } = data;


  //     // - VALIDACIONES BÁSICAS
  //     if (!patrullajeId) {
  //       throw new Error("El patrullajeId es obligatorio.");
  //     }

  //     const latitude = Number(latitud);
  //     const longitude = Number(longitud);

  //     if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
  //       throw new Error("Las coordenadas no son válidas.");
  //     }

  //     if (latitude < -90 || latitude > 90) {
  //       throw new Error("La latitud está fuera del rango permitido.");
  //     }

  //     if (longitude < -180 || longitude > 180) {
  //       throw new Error("La longitud está fuera del rango permitido.");
  //     }

  //     // - VALIDAR PATRULLAJE ACTIVO
  //     const patrullaje = await PatrullajeProgramado.findOne({
  //       where: {
  //         id: patrullajeId,
  //         estado: "EN_CURSO",
  //       },
  //       attributes: ["id", "estado"],
  //     });

  //     if (!patrullaje) {
  //       throw new Error(
  //         "El patrullaje no existe o no se encuentra en curso.",
  //       );
  //     }

  //     // - VALIDAR QUE EL SERENO ESTÉ ASIGNADO
  //     const personal = await PatrullajePersonal.findOne({
  //       where: {
  //         patrullaje_id: patrullajeId,
  //         usuario_id: socket.usuario.id,
  //         tipo_personal: "SERENO",
  //         estado: {
  //           [Op.in]: ["ACEPTADO", "EN_SERVICIO"],
  //         },
  //       },
  //       attributes: ["id"],
  //     });

  //     if (!personal) {
  //       throw new Error(
  //         "El usuario no está autorizado para registrar ubicaciones en este patrullaje.",
  //       );
  //     }

  //     // - OBTENER EL ULTIMO PUNTO
  //     const ultimoPunto = await PatrullajeGps.findOne({
  //       where: {
  //         patrullaje_id: patrullajeId,
  //       },
  //       order: [["fecha_hora", "DESC"]],
  //     });

  //     if (ultimoPunto) {
  //       const distanciaDesdeUltimoPunto =
  //         calculateDistanceBetweenPoints(
  //           ultimoPunto.latitud,
  //           ultimoPunto.longitud,
  //           latitude,
  //           longitude,
  //         );

  //       const milisegundosTranscurridos =
  //         new Date().getTime() -
  //         new Date(ultimoPunto.fecha_hora).getTime();

  //       const segundosTranscurridos =
  //         milisegundosTranscurridos / 1000;

  //       const esPuntoDuplicado =
  //         distanciaDesdeUltimoPunto < 3 &&
  //         segundosTranscurridos < 10;

  //       if (esPuntoDuplicado) {
  //         if (typeof callback === "function") {
  //           callback({
  //             success: true,
  //             message: "Ubicación omitida por no existir desplazamiento significativo.",
  //             data: null,
  //           });
  //         }

  //         return;
  //       }
  //     }

  //     const tipoGps = [
  //       "TRACKING",
  //       "EMERGENCIA",
  //       "MANUAL",
  //     ].includes(tipo)
  //       ? tipo
  //       : "TRACKING";

  //     // ==========================================
  //     // GUARDAR EL PUNTO GPS
  //     // ==========================================
  //     const puntoGps = await PatrullajeGps.create({
  //       patrullaje_id: patrullajeId,
  //       latitud: latitude,
  //       longitud: longitude,
  //       velocidad:
  //         velocidad !== null && velocidad !== undefined
  //           ? Number(velocidad)
  //           : null,
  //       precision:
  //         precision !== null && precision !== undefined
  //           ? Number(precision)
  //           : null,
  //       fecha_hora: fechaHora ? new Date(fechaHora) : new Date(),
  //       tipo: tipoGps,
  //     });

  //     const trackingPayload = {
  //       id: puntoGps.id,
  //       patrullajeId: puntoGps.patrullaje_id,
  //       usuarioId: socket.usuario.id,
  //       latitud: Number(puntoGps.latitud),
  //       longitud: Number(puntoGps.longitud),
  //       velocidad: puntoGps.velocidad,
  //       precision: puntoGps.precision,
  //       fechaHora: puntoGps.fecha_hora,
  //       tipo: puntoGps.tipo,
  //     };

  //     // ==========================================
  //     // RETRANSMITIR A LA CENTRAL
  //     // ==========================================
  //     io.to(`patrullaje_${patrullajeId}`).emit(
  //       "tracking_actualizado",
  //       trackingPayload,
  //     );

  //     if (typeof callback === "function") {
  //       callback({
  //         success: true,
  //         message: "Ubicación registrada correctamente.",
  //         data: trackingPayload,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error registrando tracking:", error);

  //     if (typeof callback === "function") {
  //       callback({
  //         success: false,
  //         message: error.message,
  //       });
  //     } else {
  //       socket.emit("tracking_error", {
  //         message: error.message,
  //       });
  //     }
  //   }
  // });

  // ==========================================
  // FINALIZAR PATRULLAJE
  // ==========================================
  // - Finalizar patrullaje (desde app)
  socket.on("finalizar_patrullaje", async ({
    patrullajeId,
    observacionFinal,
  },
    callback,) => {
    try {

      const patrullaje = await endPatrullajeService(
        patrullajeId,
        socket.usuario.id,
        observacionFinal,
      );

      const payload = mapPatrullaje(patrullaje);

      io.to(`patrullaje_${patrullajeId}`).emit(
        "patrullaje_actualizado",
        payload,
      );

      if (typeof callback === "function") {
        callback({
          success: true,
          message: "Patrullaje finalizado correctamente.",
          data: payload,
        });
      }
    } catch (error) {
      console.error("Error finalizando patrullaje:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: error.message,
        });
      } else {
        socket.emit("patrullaje_error", {
          message: error.message,
        });
      }
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