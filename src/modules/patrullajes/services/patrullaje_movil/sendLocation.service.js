const db = require("../../../../database/models");

const {
    PatrullajeProgramado,
    PatrullajePersonal,
    Gps
} = db;

const sendLocationService = async (usuarioId, data) => {

    const {
        latitud,
        longitud,
        velocidad,
        precision,
        tipo
    } = data;

    // Verificar que el sereno tenga un patrullaje en curso
    const patrullaje = await PatrullajeProgramado.findOne({
        include: [
            {
                model: PatrullajePersonal,
                as: "personal",
                where: {
                    usuario_id: usuarioId,
                    tipo_personal: "SERENO"
                },
                required: true
            }
        ],
        where: {
            estado: "EN_CURSO"
        }
    });

    if (!patrullaje) {
        const error = new Error("No tienes un patrullaje en curso.");
        error.statusCode = 400;
        throw error;
    }

    // Registrar ubicación GPS
    const registro = await Gps.create({
        usuario_id: usuarioId,
        latitud,
        longitud,
        velocidad: velocidad || null,
        precision: precision || null,
        tipo: tipo || "TRACKING",
        fecha_hora: new Date()
    });

    return {
        id: registro.id,
        latitud: registro.latitud,
        longitud: registro.longitud,
        velocidad: registro.velocidad,
        precision: registro.precision,
        tipo: registro.tipo,
        fecha_hora: registro.fecha_hora
    };

};

module.exports = sendLocationService;