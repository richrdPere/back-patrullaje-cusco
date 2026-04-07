const express = require("express");
const router = express.Router();

const {
    crearAlerta,
    listarAlertas,
    obtenerAlertaPorId,
    actualizarEstadoAlerta,
} = require("../controllers/alerta.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// ALERTAS
// ============================

router.post("/", verificarToken, crearAlerta);
router.get("/", verificarToken, listarAlertas);
router.get("/:id", verificarToken, obtenerAlertaPorId);
router.put("/:id/estado", verificarToken, actualizarEstadoAlerta);

module.exports = router;
