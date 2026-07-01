const { Op } = require("sequelize");

const {
    Incidencia,
    IncidenciaArchivo,
    PatrullajeProgramado,
    Usuario,
    Zonas
} = require("../../../database/models");

// const uploadFileToS3 = require("../../../utils/uploadFileToS3");
const { uploadFileToS3, deleteFileFromS3 } = require("../../../services/aws-s3.service")

class IncidenciaService {
    async registrarIncidencia({ usuarioId, body, files }) {
        const t = await Incidencia.sequelize.transaction();

        try {

            const {
                patrullaje_id,
                tipo,
                descripcion,
                latitud,
                longitud,
                origen = "APP_MOVIL"
            } = body;

            // VALIDACIONES
            if (!descripcion || !latitud || !longitud) {
                throw {
                    status: 400,
                    message: "Campos obligatorios faltantes."
                };
            }

            const lat = parseFloat(latitud);
            const lng = parseFloat(longitud);

            if (isNaN(lat) || isNaN(lng)) {
                throw {
                    status: 400,
                    message: "Coordenadas inválidas."
                };
            }

            let zona_id = null;

            if (patrullaje_id) {

                const patrullaje = await PatrullajeProgramado.findOne({
                    where: {
                        id: patrullaje_id,
                        estado: {
                            [Op.in]: ["ASIGNADO", "EN_CURSO"]
                        }
                    }
                });

                if (!patrullaje) {
                    throw {
                        status: 404,
                        message: "La incidencia debe pertenecer a un patrullaje activo."
                    };
                }

                zona_id = patrullaje.zona_id;
            }

            const zona = await Zonas.findByPk(zona_id);

            if (!zona) {
                throw {
                    status: 404,
                    message: "Zona no encontrada."
                };
            }

            const usuario = await Usuario.findByPk(usuarioId);

            if (!usuario) {
                throw {
                    status: 404,
                    message: "Usuario no encontrado."
                };
            }

            const tiposValidos = [
                "ROBO",
                "ACCIDENTE",
                "INCENDIO",
                "VIOLENCIA",
                "SOSPECHOSO",
                "OTRO"
            ];

            const incidencia = await Incidencia.create({
                usuario_id: usuarioId,
                patrullaje_id: patrullaje_id || null,
                zona_id,
                tipo: tiposValidos.includes(tipo) ? tipo : "OTRO",
                descripcion,
                latitud: lat,
                longitud: lng,
                origen
            }, {
                transaction: t
            });

            const archivos = Array.isArray(files)
                ? files
                : files
                    ? Object.values(files).flat()
                    : [];

            if (archivos.length > 5) {
                throw {
                    status: 400,
                    message: "Máximo 5 archivos."
                };
            }

            let archivosData = [];

            if (archivos.length) {

                const uploads = await Promise.all(

                    archivos.map(file =>
                        uploadFileToS3({
                            file,
                            categoria: "incidencias",
                            entidadId: incidencia.id,
                            serenoId: usuarioId
                        })
                    )

                );

                archivosData = uploads.map((upload, index) => {

                    const file = archivos[index];

                    return {

                        incidencia_id: incidencia.id,
                        url_archivo: upload.url,
                        key_s3: upload.key,
                        tipo_archivo: this.obtenerTipoArchivo(file.mimetype),
                        mime_type: file.mimetype,
                        peso: file.size,
                        sereno_id: usuarioId

                    };

                });

                await IncidenciaArchivo.bulkCreate(
                    archivosData,
                    { transaction: t }
                );

                await incidencia.update(
                    {
                        total_evidencias: archivosData.length
                    },
                    {
                        transaction: t
                    }
                );
            }
            await t.commit();

            return {
                incidencia,
                archivos: archivosData
            };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    obtenerTipoArchivo(mime) {

        if (!mime) return "OTRO";

        if (mime.startsWith("image/"))
            return "IMAGEN";

        if (mime.startsWith("video/"))
            return "VIDEO";

        if (mime === "application/pdf")
            return "PDF";

        return "OTRO";
    }
}

module.exports = new IncidenciaService();