const db = require('../../database/models');
const { Op } = require("sequelize");
const {
  getConnectedUserIds,
  isUserConnected,
} = require("../usuariosManager");

// Utils
const { calculateDistanceBetweenPoints } = require("../../utils/distance.helper");

// Modelos
const {
  PatrullajeGps,
  PatrullajePersonal,
  PatrullajeProgramado,
  Persona,
  Roles,
  Usuario,
} = db;

// Handler
module.exports = (io, socket) => {

  socket.on(
    "tracking:unirse-central",
    async (_, callback) => {
      try {
        const usuarioId =
          socket.usuario?.id;

        if (!usuarioId) {
          throw new Error(
            "Usuario no autenticado."
          );
        }

        // ==========================================
        // 1. NORMALIZAR ROLES
        // ==========================================

        const rolesSocket =
          Array.isArray(
            socket.usuario?.roles
          )
            ? socket.usuario.roles
            : [];

        const nombresRoles =
          rolesSocket
            .map(rol =>
              typeof rol === "string"
                ? rol
                : rol?.nombre
            )
            .filter(Boolean);

        const rolesPermitidos = [
          "ADMIN",
          "OPERADOR",
          "SUPERVISOR_SERENAZGO",
          "GERENTE_SERENAZGO"
        ];

        const autorizado =
          nombresRoles.some(rol =>
            rolesPermitidos.includes(rol)
          );

        if (!autorizado) {
          throw new Error(
            "No tiene permisos para visualizar el tracking."
          );
        }

        // ==========================================
        // 2. UNIR A CENTRAL TRACKING
        // ==========================================

        await socket.join(
          "central_tracking"
        );

        console.log(
          `🗺️ Usuario ${usuarioId} unido a central_tracking`
        );

        // ==========================================
        // 3. OBTENER USUARIOS CONECTADOS
        // ==========================================

        const usuariosConectados =
          getConnectedUserIds();

        if (
          usuariosConectados.length === 0
        ) {
          const respuesta = {
            success: true,
            message:
              "Conectado al tracking central.",
            data: {
              cantidad: 0,
              serenos: []
            }
          };

          socket.emit(
            "tracking:serenos-conectados",
            respuesta.data
          );

          if (
            typeof callback === "function"
          ) {
            callback(respuesta);
          }

          return;
        }

        // ==========================================
        // 4. BUSCAR SERENOS CON PATRULLAJE ACTIVO
        // ==========================================

        const personalActivo =
          await PatrullajePersonal.findAll({
            where: {
              usuario_id: {
                [Op.in]:
                  usuariosConectados
              },

              tipo_personal:
                "SERENO",

              estado: {
                [Op.in]: [
                  "ACEPTADO",
                  "EN_SERVICIO"
                ]
              }
            },

            attributes: [
              "id",
              "usuario_id",
              "patrullaje_id",
              "tipo_personal",
              "estado"
            ],

            include: [
              {
                model:
                  PatrullajeProgramado,

                as: "patrullaje",

                required: true,

                where: {
                  estado:
                    "EN_CURSO"
                },

                attributes: [
                  "id",
                  "estado"
                ]
              },

              {
                model:
                  Usuario,

                as: "usuario",

                required: true,

                attributes: [
                  "id",
                  "username",
                  "correo"
                ],

                include: [
                  {
                    model:
                      Persona,

                    as: "persona",

                    required: true,

                    attributes: [
                      "nombres",
                      "apellidos",
                      "documento_identidad",
                      "telefono",
                      "foto_perfil"
                    ]
                  },

                  {
                    model:
                      Roles,

                    as: "roles",

                    required: false,

                    attributes: [
                      "id",
                      "nombre"
                    ],

                    through: {
                      attributes: []
                    }
                  }
                ]
              }
            ]
          });

        // ==========================================
        // 5. CONSTRUIR RESPUESTA
        // ==========================================
        const serenos = personalActivo.map(
          personal => {

            const usuario = personal.usuario;
            const persona = usuario?.persona;
            const nombres = persona?.nombres?.trim() ?? "";
            const apellidos = persona?.apellidos?.trim() ?? "";
            const nombreCompleto = [
              nombres,
              apellidos
            ]
              .filter(Boolean)
              .join(" ");

            const roles =
              Array.isArray(
                usuario?.roles
              )
                ? usuario.roles
                  .map(rol =>
                    rol.nombre
                  )
                  .filter(Boolean)
                : [];

            return {
              usuarioId: usuario.id,
              username: usuario.username,
              correo: usuario.correo ?? null,
              roles,
              sereno: {
                nombres,
                apellidos,
                nombreCompleto,
                documento: persona?.documento_identidad ?? null,
                telefono: persona?.telefono ?? null,
                fotoPerfil: persona?.foto_perfil ?? null
              },

              patrullaje: {
                id: personal.patrullaje.id,
                estado: personal.patrullaje.estado
              },

              personal: {
                id: personal.id,
                estado: personal.estado
              },

              realtime: {
                online:
                  isUserConnected(
                    usuario.id
                  ),

                timestamp:
                  new Date()
                    .toISOString()
              }
            };
          }
        );

        const dataRespuesta = {
          cantidad:
            serenos.length,

          serenos
        };

        // ==========================================
        // 6. ENVIAR SOLO AL SOCKET SOLICITANTE
        // ==========================================
        socket.emit(
          "tracking:serenos-conectados",
          dataRespuesta
        );

        if (
          typeof callback === "function"
        ) {
          callback({
            success: true,
            message:
              "Conectado al tracking central.",
            data:
              dataRespuesta
          });
        }

        console.log(
          "👮 Serenos conectados con patrullaje:",
          dataRespuesta.cantidad
        );
      } catch (error) {
        console.error(
          "❌ Error uniéndose a central_tracking:",
          error
        );

        if (
          typeof callback === "function"
        ) {
          callback({
            success: false,
            message:
              error.message
          });
        }
      }
    }
  );

  socket.on("tracking", async (data, callback) => {

    console.log(
      "🟢 TRACKING LISTENER NUEVO EJECUTADO",
      {
        socketId: socket.id,
        usuarioId: socket.usuario?.id,
        data,
        callbackDisponible:
          typeof callback === "function",
      },
    );

    try {
      const {
        patrullajeId,
        latitud,
        longitud,
        velocidad,
        precision,
        fechaHora,
        tipo,
      } = data ?? {};

      // ==========================================
      // 1. VALIDAR USUARIO AUTENTICADO
      // ==========================================
      const usuarioId = socket.usuario?.id;

      if (!usuarioId) {
        throw new Error(
          "No se pudo identificar al usuario autenticado.",
        );
      }

      // ==========================================
      // 2. VALIDACIONES BÁSICAS
      // ==========================================
      if (!patrullajeId) {
        throw new Error("El patrullajeId es obligatorio.");
      }

      const latitude = Number(latitud);
      const longitude = Number(longitud);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Las coordenadas no son válidas.");
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error("La latitud está fuera del rango permitido.");
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error("La longitud está fuera del rango permitido.");
      }

      // ==========================================
      // 3. NORMALIZAR DATOS GPS
      // ==========================================
      const velocidadNumero = Number(velocidad);
      const precisionNumero = Number(precision);

      const velocidadGps =
        velocidad !== null &&
          velocidad !== undefined &&
          Number.isFinite(velocidadNumero) &&
          velocidadNumero >= 0
          ? velocidadNumero
          : null;

      const precisionGps =
        precision !== null &&
          precision !== undefined &&
          Number.isFinite(precisionNumero) &&
          precisionNumero >= 0
          ? precisionNumero
          : null;

      // ==========================================
      // 4. NORMALIZAR FECHA
      // ==========================================

      let fechaUbicacion = new Date();

      if (fechaHora) {
        const fechaRecibida = new Date(fechaHora);

        if (!Number.isNaN(fechaRecibida.getTime())) {
          fechaUbicacion = fechaRecibida;
        }
      }

      // ==========================================
      // 5. NORMALIZAR TIPO
      // ==========================================

      const tiposPermitidos = [
        "TRACKING",
        "EMERGENCIA",
        "MANUAL",
      ];

      const tipoGps = tiposPermitidos.includes(tipo)
        ? tipo
        : "TRACKING";

      // ==========================================
      // 6. VALIDAR PATRULLAJE ACTIVO
      // ==========================================
      const patrullaje = await PatrullajeProgramado.findOne({
        where: {
          id: patrullajeId,
          estado: "EN_CURSO",
        },
        attributes: ["id", "estado"],
      });

      if (!patrullaje) {
        throw new Error(
          "El patrullaje no existe o no se encuentra en curso.",
        );
      }

      // ==========================================
      // 7. VALIDAR SERENO ASIGNADO
      // ==========================================
      const personal = await PatrullajePersonal.findOne({
        where: {
          patrullaje_id: patrullajeId,
          usuario_id: usuarioId,
          tipo_personal: "SERENO",
          estado: {
            [Op.in]: ["ACEPTADO", "EN_SERVICIO"],
          },
        },
        attributes: [
          "id",
          "usuario_id",
          "tipo_personal",
          "estado",
        ],
      });

      if (!personal) {
        throw new Error(
          "El usuario no está autorizado para registrar ubicaciones en este patrullaje.",
        );
      }

      // ==========================================
      // 8. OBTENER USUARIO, PERSONA Y ROLES
      // ==========================================
      const usuario = await Usuario.findByPk(
        usuarioId,
        {
          attributes: [
            "id",
            "username",
            "correo",
          ],
          include: [
            {
              model: Persona,
              as: "persona",
              required: true,
              attributes: [
                "nombres",
                "apellidos",
                "documento_identidad",
                "telefono",
                "foto_perfil",
              ],
            },
            {
              model: Roles,
              as: "roles",
              required: false,
              attributes: [
                "id",
                "nombre",
              ],
              through: {
                attributes: [],
              },
            },
          ],
        },
      );

      if (!usuario) {
        throw new Error(
          "No se encontraron los datos del sereno.",
        );
      }

      // ==========================================
      // 9. BUSCAR ÚLTIMO PUNTO DEL PATRULLAJE
      // ==========================================
      const ultimoPunto = await PatrullajeGps.findOne({
        where: {
          patrullaje_id: patrullajeId,
          usuario_id: usuarioId,
        },
        order: [["fecha_hora", "DESC"]],
      });

      if (ultimoPunto) {
        const distanciaDesdeUltimoPunto =
          calculateDistanceBetweenPoints(
            ultimoPunto.latitud,
            ultimoPunto.longitud,
            latitude,
            longitude,
          );

        const milisegundosTranscurridos =
          new Date().getTime() -
          new Date(ultimoPunto.fecha_hora).getTime();

        const segundosTranscurridos =
          milisegundosTranscurridos / 1000;

        const esPuntoDuplicado =
          distanciaDesdeUltimoPunto < 3 &&
          segundosTranscurridos < 10;

        if (esPuntoDuplicado) {
          if (typeof callback === "function") {
            callback({
              success: true,
              message: "Ubicación omitida por no existir desplazamiento significativo.",
              data: null,
            });
          }

          return;
        }
      }

      // ==========================================
      // 10. GUARDAR PUNTO GPS
      // ==========================================
      const puntoGps =
        await PatrullajeGps.create({
          patrullaje_id: patrullajeId,
          latitud: latitude,
          longitud: longitude,
          velocidad: velocidadGps,
          precision: precisionGps,
          fecha_hora: fechaUbicacion,
          tipo: tipoGps,
          usuario_id: usuarioId,
        });

      // ==========================================
      // 11. CONSTRUIR PAYLOAD
      // ==========================================

      const persona = usuario.persona;
      const nombres = persona?.nombres?.trim() ?? "";
      const apellidos = persona?.apellidos?.trim() ?? "";

      const nombreCompleto = [
        nombres,
        apellidos,
      ]
        .filter(Boolean)
        .join(" ");

      const roles = Array.isArray(usuario.roles)
        ? usuario.roles
          .map((rol) => rol.nombre)
          .filter(Boolean)
        : [];

      const trackingPayload = {
        id: puntoGps.id,

        // USUARIO
        usuarioId: usuario.id,
        username: usuario.username,
        correo: usuario.correo ?? null,
        roles,

        // SERENO
        sereno: {
          nombres,
          apellidos,
          nombreCompleto,
          documento:
            persona?.documento_identidad ?? null,
          telefono:
            persona?.telefono ?? null,
          fotoPerfil:
            persona?.foto_perfil ?? null,
        },

        // PATRULLAJE
        patrullaje: {
          id: patrullaje.id,
          estado: patrullaje.estado,
        },

        // GPS
        gps: {
          lat: Number(puntoGps.latitud),
          lng: Number(puntoGps.longitud),
          velocidad:
            puntoGps.velocidad !== null
              ? Number(puntoGps.velocidad)
              : null,
          precision:
            puntoGps.precision !== null
              ? Number(puntoGps.precision)
              : null,
        },

        // TIEMPO REAL
        realtime: {
          online: true,
          timestamp:
            puntoGps.fecha_hora instanceof Date
              ? puntoGps.fecha_hora.toISOString()
              : new Date(
                puntoGps.fecha_hora,
              ).toISOString(),
        },

        // EVENTO
        tipo: puntoGps.tipo,
      };

      console.log(
        "🟢 TRACKING PAYLOAD CONSTRUIDO",
        trackingPayload,
      );

      // ==========================================
      // 12. EMITIR AL PATRULLAJE
      // ==========================================
      io.to(
        "central_tracking"
      ).emit(
        "tracking:sereno-online",
        {
          usuarioId: trackingPayload.usuarioId,
          username: trackingPayload.username,
          correo: trackingPayload.correo,
          roles: trackingPayload.roles,
          sereno: trackingPayload.sereno,
          patrullaje: trackingPayload.patrullaje,
          realtime: {
            online: true,
            timestamp: trackingPayload.realtime.timestamp
          }
        }
      );

      io.to(
        `patrullaje_${patrullajeId}`,
      ).emit(
        "tracking_actualizado",
        trackingPayload,
      );

      // ==========================================
      // 13. EMITIR A LA CENTRAL
      // ==========================================

      io.to("central_tracking").emit(
        "tracking_actualizado",
        trackingPayload,
      );

      // ==========================================
      // 14. RESPONDER AL MÓVIL
      // ==========================================

      if (typeof callback === "function") {
        callback({
          success: true,
          message:
            "Ubicación registrada correctamente.",
          data: trackingPayload,
        });
      }

    } catch (error) {
      console.error("Error registrando tracking:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: error.message,
        });
      } else {
        socket.emit("tracking_error", {
          message: error.message,
        });
      }
    }
  });
};