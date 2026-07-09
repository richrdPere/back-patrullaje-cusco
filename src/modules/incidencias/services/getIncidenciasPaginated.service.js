const { Op } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo,
  PatrullajeProgramado,
  Usuario,
  Zonas
} = db;

/*
|--------------------------------------------------------------------------
| Listar Incidencias Paginadas
|--------------------------------------------------------------------------
*/
const getIncidenciasPaginatedService = async ({
  query,
  usuarioAuthId = null,
}) => {
  let {
    page = 1,
    limit = 10,
    tipo,
    estado,
    zona_id,
    usuario_id,
    patrullaje_id,
    fecha_inicio,
    fecha_fin,
    origen,
    mode = "app", // app | web
  } = query;

  page = Math.max(parseInt(page), 1);
  limit = Math.min(Math.max(parseInt(limit), 1), 50);

  const offset = (page - 1) * limit;

  const where = {};

  if (tipo) where.tipo = tipo;
  if (estado) where.estado = estado;
  if (zona_id) where.zona_id = zona_id;
  if (patrullaje_id) where.patrullaje_id = patrullaje_id;
  if (origen) where.origen = origen;

  /*
  |--------------------------------------------------------------------------
  | Filtro por usuario
  |--------------------------------------------------------------------------
  | - Web: puede consultar por usuario_id desde query.
  | - App: por defecto lista incidencias del usuario autenticado.
  |--------------------------------------------------------------------------
  */
  if (mode === "web") {
    if (usuario_id) where.usuario_id = usuario_id;
  } else {
    where.usuario_id = usuario_id || usuarioAuthId;
  }

  /*
  |--------------------------------------------------------------------------
  | Filtro por rango de fechas
  |--------------------------------------------------------------------------
  */
  if (fecha_inicio && fecha_fin) {
    where.fecha_hora = {
      [Op.between]: [
        new Date(fecha_inicio),
        new Date(fecha_fin),
      ],
    };
  }

  const include = [
    {
      model: Usuario,
      as: "usuario",
      attributes:
        mode === "web"
          ? ["id", "nombre", "apellidos", "email", "telefono"]
          : ["id", "nombre", "apellidos"],
    },
    {
      model: Zonas,
      as: "zona",
      attributes: ["id", "nombre"],
    },
    {
      model: PatrullajeProgramado,
      as: "patrullaje",
      attributes: ["id", "fecha_inicio", "fecha_fin", "estado"],
      required: false,
    },
  ];

  if (mode === "web") {
    include.push({
      model: IncidenciaArchivo,
      as: "archivos",
      required: false,
      where: {
        estado: "ACTIVO",
      },
      attributes: [
        "id",
        "url_archivo",
        "tipo_archivo",
        "mime_type",
        "peso",
      ],
    });
  }

  const { count, rows } = await Incidencia.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [["fecha_hora", "DESC"]],
    distinct: true,
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows,
  };
};

module.exports = getIncidenciasPaginatedService;