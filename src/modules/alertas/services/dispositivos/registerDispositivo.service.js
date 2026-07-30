const db = require("../../../../database/models");

// Validator
const {
  validarRegistrarDispositivo,
} = require("../../validators/alertas/alerta.validator");

// Models
const { UsuarioDispositivo } = db;

const registerDispositivoService =
  async ({
    usuario_id,
    body,
  }) => {
    validarRegistrarDispositivo(body);

    const {
      token_fcm,
      plataforma,
      device_id = null,
      nombre_dispositivo = null,
      version_app = null,
    } = body;

    const token = token_fcm.trim();

    /*
     * El mismo token FCM no debe estar asignado
     * simultáneamente a dos usuarios.
     */
    await UsuarioDispositivo.update(
      {
        activo: false,
      },
      {
        where: {
          token_fcm: token,
        },
      }
    );

    let dispositivo = null;

    if (device_id) {
      dispositivo =
        await UsuarioDispositivo.findOne({
          where: {
            usuario_id,
            device_id,
          },
        });
    }

    if (!dispositivo) {
      dispositivo =
        await UsuarioDispositivo.findOne({
          where: {
            token_fcm: token,
          },
        });
    }

    if (dispositivo) {
      await dispositivo.update({
        usuario_id,
        token_fcm: token,
        plataforma,
        device_id,
        nombre_dispositivo,
        version_app,
        activo: true,
        fecha_ultimo_acceso:
          new Date(),
      });

      return dispositivo;
    }

    return UsuarioDispositivo.create({
      usuario_id,
      token_fcm: token,
      plataforma,
      device_id,
      nombre_dispositivo,
      version_app,
      activo: true,
      fecha_ultimo_acceso:
        new Date(),
    });
  };

module.exports = registerDispositivoService;