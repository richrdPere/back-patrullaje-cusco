const { Op } = require("sequelize");
const { uploadFileToS3, deleteFileFromS3 } = require("../../../services/aws-s3.service")

// Modelos
const db = require("../../../database/models");

const { sequelize, Incidencia, IncidenciaArchivo, PatrullajeProgramado, Usuario, Zonas } = db;

// Helpers
const tiposValidos = [
  "ROBO",
  "ACCIDENTE",
  "INCENDIO",
  "VIOLENCIA",
  "SOSPECHOSO",
  "OTRO",
];

const getTipoArchivo = (mime) => {
  if (!mime) return "OTRO";
  if (mime.startsWith("image/")) return "IMAGEN";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime === "application/pdf") return "PDF";
  return "OTRO";
};

const normalizarArchivos = (files) => {
  if (Array.isArray(files)) return files;
  if (files) return Object.values(files).flat();
  return [];
};


// SERVICE
const registrarIncidenciaService = async ({ usuario_id, body, files }) => {
  const t = await sequelize.transaction();

  try {
    const {
      patrullaje_id,
      tipo,
      descripcion,
      latitud,
      longitud,
      origen = "APP_MOVIL",
    } = body;

    if (!descripcion || !latitud || !longitud) {
      const error = new Error(
        "Campos obligatorios faltantes (descripción, latitud, longitud)"
      );
      error.statusCode = 400;
      throw error;
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);

    if (isNaN(lat) || isNaN(lng)) {
      const error = new Error("Coordenadas inválidas");
      error.statusCode = 400;
      throw error;
    }

    let zona_id = null;
    let patrullajeIdFinal = patrullaje_id || null;

    if (patrullajeIdFinal) {
      const patrullaje = await PatrullajeProgramado.findOne({
        where: {
          id: patrullajeIdFinal,
          estado: {
            [Op.in]: ["ASIGNADO", "EN_CURSO"],
          },
        },
      });

      if (!patrullaje) {
        const error = new Error(
          "La incidencia debe estar asociada a un patrullaje activo"
        );
        error.statusCode = 404;
        throw error;
      }

      zona_id = patrullaje.zona_id;
    }

    const zona = await Zonas.findByPk(zona_id);

    if (!zona) {
      const error = new Error("Zona no existe");
      error.statusCode = 404;
      throw error;
    }

    const usuario = await Usuario.findByPk(usuario_id);

    if (!usuario) {
      const error = new Error("Usuario no existe");
      error.statusCode = 404;
      throw error;
    }

    const tipoFinal = tiposValidos.includes(tipo) ? tipo : "OTRO";

    const archivos = normalizarArchivos(files);

    if (archivos.length > 5) {
      const error = new Error("Máximo 5 archivos permitidos");
      error.statusCode = 400;
      throw error;
    }

    const incidencia = await Incidencia.create(
      {
        usuario_id,
        patrullaje_id: patrullajeIdFinal,
        zona_id,
        tipo: tipoFinal,
        descripcion,
        latitud: lat,
        longitud: lng,
        origen,
      },
      { transaction: t }
    );

    let archivosData = [];

    if (archivos.length > 0) {
      const uploadPromises = archivos.map((file) =>
        uploadFileToS3({
          file,
          categoria: "incidencias",
          entidadId: incidencia.id,
          serenoId: usuario_id,
        })
      );

      const resultados = await Promise.all(uploadPromises);

      archivosData = resultados.map((result, index) => {
        const file = archivos[index];

        return {
          incidencia_id: incidencia.id,
          url_archivo: result.url,
          key_s3: result.key,
          tipo_archivo: getTipoArchivo(file.mimetype),
          mime_type: file.mimetype,
          peso: file.size,
          sereno_id: usuario_id,
        };
      });

      await IncidenciaArchivo.bulkCreate(archivosData, { transaction: t });

      await Incidencia.update(
        { total_evidencias: archivosData.length },
        {
          where: { id: incidencia.id },
          transaction: t,
        }
      );

      incidencia.total_evidencias = archivosData.length;
    }

    await t.commit();

    return {
      message: "Incidencia registrada correctamente",
      incidencia,
      archivos: archivosData,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = registrarIncidenciaService;
