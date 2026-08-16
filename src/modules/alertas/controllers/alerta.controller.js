const {
  createAlertaService,
  getAlertaDetalleService,
  getMisAlertasService,
  marcarAlertaAtendidaService,
  responderAlertaService,
  updateRecepcionAlertaService,
  getMisAlertasResumenService,
  getAlertasEmitidasService,
  getAlertaDestinatariosService,
  cancelarAlertaService

} = require("../services/alertas");

/*
|--------------------------------------------------------------------------
| 1. Crear alerta
|--------------------------------------------------------------------------
*/
const createAlertaController = async (req, res) => {
  try {
    const emisor_id = req.usuario.id;

    const alerta =
      await createAlertaService({
        emisor_id,
        body: req.body,
      });

    return res.status(201).json({
      success: true,
      message:
        "Alerta creada correctamente",
      data: alerta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo crear la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener mis alertas
|--------------------------------------------------------------------------
*/
const getMisAlertasController = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado =
      await getMisAlertasService({
        usuario_id,
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        prioridad: req.query.prioridad,
        tipo: req.query.tipo,
        no_leidas: req.query.no_leidas,
      });

    return res.status(200).json({
      success: true,
      message:
        "Alertas obtenidas correctamente",
      data: resultado,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudieron obtener las alertas",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener detalle de una alerta
|--------------------------------------------------------------------------
*/
const getAlertaDetalleController = async (
  req,
  res
) => {
  try {
    const usuario_id = req.usuario.id;
    const alerta_id = Number(req.params.id);

    if (
      !Number.isInteger(alerta_id) ||
      alerta_id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El identificador de la alerta no es válido",
      });
    }

    const alerta =
      await getAlertaDetalleService({
        alerta_id,
        usuario_id,
      });

    return res.status(200).json({
      success: true,
      message: "Detalle de alerta obtenido correctamente",
      data: alerta,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "No se pudo obtener el detalle de la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Marcar alerta recibida
|--------------------------------------------------------------------------
*/
const marcarRecibidaController = async (
  req,
  res
) => {
  try {
    const alerta =
      await updateRecepcionAlertaService({
        alerta_id: Number(req.params.id),
        usuario_id: req.usuario.id,
        nuevo_estado: "RECIBIDA",
      });

    return res.status(200).json({
      success: true,
      message: "Alerta marcada como recibida",
      data: alerta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo actualizar la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 5. Marcar alerta leida
|--------------------------------------------------------------------------
*/
const marcarLeidaController = async (req, res) => {
  try {
    const alerta =
      await updateRecepcionAlertaService({
        alerta_id: Number(req.params.id),
        usuario_id: req.usuario.id,
        nuevo_estado: "LEIDA",
      });

    return res.status(200).json({
      success: true,
      message: "Alerta marcada como leída",
      data: alerta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo actualizar la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 6. Responder alerta 
|--------------------------------------------------------------------------
*/
const responderAlertaController = async (
  req,
  res
) => {
  try {
    const alerta =
      await responderAlertaService({
        alerta_id: Number(req.params.id),
        usuario_id: req.usuario.id,
        body: req.body,
      });

    return res.status(200).json({
      success: true,
      message: "Respuesta registrada correctamente",
      data: alerta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo responder la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 7. Marcar alerta atendida
|--------------------------------------------------------------------------
*/
const marcarAtendidaController = async (
  req,
  res
) => {
  try {
    const alerta =
      await marcarAlertaAtendidaService({
        alerta_id: Number(req.params.id),
        usuario_id: req.usuario.id,
        observacion: req.body.observacion,
      });

    return res.status(200).json({
      success: true,
      message: "Alerta marcada como atendida",
      data: alerta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo completar la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 8. Marcar alerta atendida
|--------------------------------------------------------------------------
*/
const getMisAlertasResumenController = async (
  req,
  res
) => {
  try {
    const usuario_id = req.usuario.id;

    const resumen = await getMisAlertasResumenService({ usuario_id, });

    return res.status(200).json({
      success: true,
      message: "Resumen de alertas obtenido correctamente",
      data: resumen,
    });
  } catch (error) {
    console.error("Error al obtener resumen de alertas:", error);

    return res.status(400).json({
      success: false,
      message: "No se pudo obtener el resumen de alertas",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 9. Obtener alertas emitidas
|--------------------------------------------------------------------------
*/
const getAlertasEmitidasController = async (
  req,
  res
) => {
  try {
    const usuario_id = req.usuario.id;

    const rol =
      req.usuario.rol ||
      req.usuario.role ||
      req.usuario.nombre_rol;

    const resultado =
      await getAlertasEmitidasService({
        usuario_id,
        rol,
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        tipo: req.query.tipo,
        prioridad: req.query.prioridad,
        zona_id: req.query.zona_id,
        patrullaje_id: req.query.patrullaje_id,
        requiere_confirmacion: req.query.requiere_confirmacion,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        search: req.query.search,
        incluir_todas: req.query.incluir_todas,
      });

    return res.status(200).json({
      success: true,
      message: "Alertas emitidas obtenidas correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("Error al obtener alertas emitidas:", error);

    return res.status(400).json({
      success: false,
      message: "No se pudieron obtener las alertas emitidas",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 10. Obtener alertas destinatarios
|--------------------------------------------------------------------------
*/
const getAlertaDestinatariosController = async (
  req,
  res
) => {
  try {
    const alerta_id = Number(
      req.params.id
    );

    const usuario_id = req.usuario.id;

    const rol =
      req.usuario.rol ||
      req.usuario.role ||
      req.usuario.nombre_rol;

    const resultado =
      await getAlertaDestinatariosService({
        alerta_id,
        usuario_id,
        rol,
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        search: req.query.search,
      });

    return res.status(200).json({
      success: true,
      message: "Destinatarios de la alerta obtenidos correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("Error al obtener destinatarios de la alerta:", error);

    const erroresNoEncontrado = [
      "La alerta solicitada no existe",
    ];

    const erroresPermisos = [
      "No tiene permisos para consultar los destinatarios de esta alerta",
    ];

    if (
      erroresNoEncontrado.includes(
        error.message
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "No se pudo obtener los destinatarios de la alerta",
        error: error.message,
      });
    }

    if (
      erroresPermisos.includes(
        error.message
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "No tiene autorización para consultar esta alerta",
        error: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No se pudieron obtener los destinatarios de la alerta",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 11. Cancelar alerta
|--------------------------------------------------------------------------
*/
const cancelarAlertaController = async (
  req,
  res
) => {
  try {
    const alerta_id = Number(
      req.params.id
    );

    const usuario_id =
      req.usuario.id;

    const rol =
      req.usuario.rol ||
      req.usuario.role ||
      req.usuario.nombre_rol;

    const resultado =
      await cancelarAlertaService({
        alerta_id,
        usuario_id,
        rol,
        body: req.body,
      });

    return res.status(200).json({
      success: true,
      message: resultado.ya_cancelada
        ? "La alerta ya se encontraba cancelada"
        : "Alerta cancelada correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("Error al cancelar alerta:", error);

    if (error.message === "La alerta solicitada no existe") {
      return res.status(404).json({
        success: false,
        message:
          "No se pudo cancelar la alerta",
        error: error.message,
      });
    }

    if (error.message === "No tiene permisos para cancelar esta alerta") {
      return res.status(403).json({
        success: false,
        message: "No tiene autorización para cancelar esta alerta",
        error: error.message,
      });
    }

    if (
      [
        "No es posible cancelar una alerta que ya fue atendida",
        "No es posible cancelar una alerta expirada",
      ].includes(error.message)
    ) {
      return res.status(409).json({
        success: false,
        message: "La alerta no puede ser cancelada en su estado actual",
        error: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No se pudo cancelar la alerta",
      error: error.message,
    });
  }
};

module.exports = {
  createAlertaController,
  getMisAlertasController,
  getAlertaDetalleController,
  marcarRecibidaController,
  marcarLeidaController,
  responderAlertaController,
  marcarAtendidaController,
  getMisAlertasResumenController,
  getAlertasEmitidasController,
  getAlertaDestinatariosController,
  cancelarAlertaController
};