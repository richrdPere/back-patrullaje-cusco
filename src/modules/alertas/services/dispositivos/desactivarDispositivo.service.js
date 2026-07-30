const db = require("../../../../database/models");

// Models
const { UsuarioDispositivo } = db;

// Services
const desactivarDispositivoService = async ({
    usuario_id,
    body = {},
}) => {
    const usuarioId = Number(usuario_id);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        throw new Error(
            "El identificador del usuario no es válido"
        );
    }

    const tokenFcm =
        typeof body.token_fcm === "string"
            ? body.token_fcm.trim()
            : "";

    const deviceId =
        typeof body.device_id === "string"
            ? body.device_id.trim()
            : "";

    if (!tokenFcm && !deviceId) {
        throw new Error(
            "Debe proporcionar el token FCM o el identificador del dispositivo"
        );
    }

    const transaction =
        await db.sequelize.transaction();

    try {
        const where = {
            usuario_id: usuarioId,
        };

        if (tokenFcm) {
            where.token_fcm = tokenFcm;
        }

        if (deviceId) {
            where.device_id = deviceId;
        }

        const dispositivo =
            await UsuarioDispositivo.findOne({
                where,
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

        if (!dispositivo) {
            throw new Error(
                "El dispositivo solicitado no se encuentra registrado para este usuario"
            );
        }

        if (!dispositivo.activo) {
            await transaction.commit();

            return {
                dispositivo,
                ya_desactivado: true,
            };
        }

        await dispositivo.update(
            {
                activo: false,
                fecha_ultimo_acceso: new Date(),
            },
            {
                transaction,
            }
        );

        await transaction.commit();

        return {
            dispositivo,
            ya_desactivado: false,
        };
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }

        throw error;
    }
};


module.exports = desactivarDispositivoService;