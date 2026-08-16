const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers

// - Alertas
const {
    createAlertaController,

    // Sereno
    getAlertaDetalleController,
    getMisAlertasController,
    getMisAlertasResumenController,
    marcarAtendidaController,
    marcarLeidaController,
    marcarRecibidaController,
    responderAlertaController,

    // Central / Supervisor
    getAlertasEmitidasController,
    getAlertaDestinatariosController,
    cancelarAlertaController,
} = require("../controllers/alerta.controller");

// - Dispositivos
const {
    registerDispositivoController,
    desactivarDispositivoController
} = require("../controllers/dispositivo.controller");



// ============================
// ALERTAS
// ============================

// - DISPOSITIVOS
router.post("/dispositivos/register", registerDispositivoController);
router.patch("/dispositivos/desactivar", desactivarDispositivoController);

// - CENTRAL / SUPERVISOR
router.post("/create", createAlertaController);
router.get("/emitidas", getAlertasEmitidasController);
router.get("/:id/destinatarios", getAlertaDestinatariosController);
router.patch("/:id/cancelar", cancelarAlertaController);

// - SERENO 
router.get("/mis-alertas", getMisAlertasController);
router.get("/mis-alertas/resumen", getMisAlertasResumenController);
router.patch("/:id/recibida", marcarRecibidaController);
router.patch("/:id/leida", marcarLeidaController);
router.patch("/:id/responder", responderAlertaController);
router.patch("/:id/atendida", marcarAtendidaController);

router.get("/:id", getAlertaDetalleController);


module.exports = router;
