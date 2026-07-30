const db = require("../../../../database/models");

// Validator
const {
  validarCrearAlerta,
} = require("../../validators/alertas/alerta.validator");

// Socket handler
const {
  emitirAlertaPorSocket,
} = require("../../../../socket/services/alerta_socket.service");

// Modelos
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  PatrullajeProgramado,
  Zonas,
  Incidencia
} = db;

// Service
const createAlertaService = async ({
  emisor_id,
  body,
}) => {
  validarCrearAlerta(body);

  const {
    titulo,
    descripcion,
    tipo,
    prioridad = "MEDIA",
    patrullaje_id = null,
    zona_id = null,
    incidencia_id = null,
    latitud = null,
    longitud = null,
    requiere_confirmacion = false,
    fecha_expiracion = null,
    destinatarios,
  } = body;

  const destinatariosUnicos =
    normalizarDestinatarios(destinatarios);

  if (destinatariosUnicos.length === 0) {
    throw new Error(
      "Debe seleccionar al menos un destinatario"
    );
  }

  const transaction =
    await db.sequelize.transaction();

  try {
    // ======================================================
    // VALIDAR EMISOR
    // ======================================================
    const emisor = await Usuario.findByPk(
      emisor_id,
      {
        transaction,
      }
    );

    if (!emisor) {
      throw new Error(
        "El usuario emisor no existe"
      );
    }

    // ======================================================
    // VALIDAR DESTINATARIOS
    // ======================================================
    const usuariosDestinatarios =
      await Usuario.findAll({
        where: {
          id: destinatariosUnicos,
        },
        attributes: [
          "id",
          "estado",
        ],
        transaction,
      });

    if (
      usuariosDestinatarios.length !==
      destinatariosUnicos.length
    ) {
      throw new Error(
        "Uno o más usuarios destinatarios no existen"
      );
    }

    const destinatariosInactivos =
      usuariosDestinatarios.filter(
        (usuario) =>
          usuario.estado !== true
      );

    if (
      destinatariosInactivos.length > 0
    ) {
      throw new Error(
        "Uno o más destinatarios se encuentran inactivos"
      );
    }

    // ======================================================
    // VALIDAR PATRULLAJE
    // ======================================================
    if (patrullaje_id !== null) {
      const patrullaje =
        await PatrullajeProgramado.findByPk(
          patrullaje_id,
          {
            transaction,
          }
        );

      if (!patrullaje) {
        throw new Error(
          "El patrullaje relacionado no existe"
        );
      }
    }

    // ======================================================
    // VALIDAR ZONA
    // ======================================================
    if (zona_id !== null) {
      const zona = await Zonas.findByPk(
        zona_id,
        {
          transaction,
        }
      );

      if (!zona) {
        throw new Error(
          "La zona relacionada no existe"
        );
      }
    }

    // ======================================================
    // VALIDAR INCIDENCIA
    // ======================================================
    if (incidencia_id !== null) {
      const incidencia =
        await Incidencia.findByPk(
          incidencia_id,
          {
            transaction,
          }
        );

      if (!incidencia) {
        throw new Error(
          "La incidencia relacionada no existe"
        );
      }
    }

    // ======================================================
    // CREAR ALERTA
    // ======================================================
    const alerta = await Alerta.create(
      {
        emisor_id,
        patrullaje_id,
        zona_id,
        incidencia_id,

        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        prioridad,

        latitud,
        longitud,

        requiere_confirmacion:
          Boolean(
            requiere_confirmacion
          ),

        fecha_expiracion,

        estado: "PENDIENTE",
      },
      {
        transaction,
      }
    );

    // ======================================================
    // CREAR DESTINATARIOS
    // ======================================================
    await AlertaDestinatario.bulkCreate(
      destinatariosUnicos.map(
        (usuario_id) => ({
          alerta_id: alerta.id,
          usuario_id,
          estado: "PENDIENTE",
        })
      ),
      {
        transaction,
      }
    );

    await transaction.commit();

    // ======================================================
    // RECUPERAR ALERTA COMPLETA
    // ======================================================
    const alertaCreada =
      await Alerta.findByPk(
        alerta.id,
        {
          include: [
            {
              model: Usuario,
              as: "emisor",
              attributes: [
                "id",
                "username",
                "correo",
              ],
            },
            {
              model: Zonas,
              as: "zona",
              required: false,
            },
            {
              model:
                PatrullajeProgramado,
              as: "patrullaje",
              required: false,
            },
            {
              model: Incidencia,
              as: "incidencia",
              required: false,
            },
            {
              model:
                AlertaDestinatario,
              as: "destinatarios",
              include: [
                {
                  model: Usuario,
                  as: "destinatario",
                  attributes: [
                    "id",
                    "username",
                    "correo",
                  ],
                },
              ],
            },
          ],
        }
      );

    if (!alertaCreada) {
      throw new Error(
        "La alerta fue creada, pero no pudo recuperarse"
      );
    }

    // ======================================================
    // EMITIR POR SOCKET.IO
    // ======================================================
    emitirAlertaPorSocket({
      alerta: alertaCreada,
      destinatariosIds:
        destinatariosUnicos,
    });

    return alertaCreada;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

module.exports = createAlertaService;