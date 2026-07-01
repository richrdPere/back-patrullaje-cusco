const db = require('../../database/models');

const Persona = db.Persona;
const Usuario = db.Usuario;

module.exports = (io, socket) => {
  socket.on("tracking", async (data, callback) => {

    try {

      const userId = socket.usuario.id;

      // VALIDAR DATA
      if (data?.lat == null || data?.lng == null || data?.patrullaje_id == null) {

        if (callback) {
          callback({
            ok: false,
            error: "Datos incompletos"
          });
        }

        return;
      }

      // OBTENER USUARIO + PERSONA
      const usuario = await Usuario.findByPk(userId, {
        include: [
          {
            model: Persona,
            as: "persona"
          }
        ]
      });

      // VALIDAR
      if (!usuario) {

        if (callback) {
          callback({
            ok: false,
            error: "Usuario no encontrado"
          });
        }
        return;
      }

      // PERSONA
      const persona = usuario.persona;

      // PAYLOAD OPERACIONAL
      const payload = {
        // - USUARIO
        userId: usuario.id,
        username: usuario.username,
        correo: usuario.correo,
        roles: socket.usuario.roles || [],
        // - PERSONA / SERENO
        sereno: {
          nombres: persona?.nombres || "",
          apellidos: persona?.apellidos || "",
          documento: persona?.documento_identidad || "",
          telefono: persona?.telefono || "",
          fotoPerfil: persona?.foto_perfil || null
        },

        // - PATRULLAJE
        patrullaje: {
          id: data.patrullaje_id,
          estado: "ACTIVO"
        },
        // - GPS
        gps: {
          lat: Number(data.lat),
          lng: Number(data.lng),
          velocidad: Number(data.velocidad || 0),
          precision: Number(data.precision || 0)
        },
        // - REALTIME
        realtime: {
          online: true,
          timestamp: data.timestamp
            ? new Date(data.timestamp)
            : new Date()
        },
        // - TIPO EVENTO
        tipo: data.tipo || "TRACKING"
      };

      // EMITIR A OPERADORES
      io.to("operadores")
        .emit("tracking", payload);

      // ROOM PATRULLAJE
      socket.to(
        `patrullaje_${data.patrullaje_id}`
      ).emit("tracking", payload);

      // LOG
      console.log(
        `📍 TRACKING USER ${userId}`,
        {
          nombre:
            `${persona?.nombres} ${persona?.apellidos}`,
          patrullaje:
            data.patrullaje_id,
          lat: data.lat,
          lng: data.lng
        }
      );

      // CALLBACK
      if (callback) {
        callback({
          ok: true
        });
      }

    } catch (error) {
      console.error("❌ ERROR TRACKING:", error);

      if (callback) {
        callback({
          ok: false,
          error: "Error interno tracking"
        });
      }
    }
  });
};