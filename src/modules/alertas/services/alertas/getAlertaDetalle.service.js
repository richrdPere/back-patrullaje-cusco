const db = require("../../../../database/models");

// Models
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  Zonas,
  PatrullajeProgramado,
  Incidencia,
} = db;


const getAlertaDetalleService = async ({
  alerta_id,
  usuario_id,
}) => {
  const recepcion =
    await AlertaDestinatario.findOne({
      where: {
        alerta_id,
        usuario_id,
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
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
            },
            {
              model: PatrullajeProgramado,
              as: "patrullaje",
            },
            {
              model: Incidencia,
              as: "incidencia",
            },
          ],
        },
      ],
    });

  if (!recepcion) {
    throw new Error(
      "La alerta no existe o no fue enviada a este usuario"
    );
  }

  return recepcion;
};

module.exports = getAlertaDetalleService;