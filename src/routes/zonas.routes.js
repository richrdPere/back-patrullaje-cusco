const express = require("express");
const router = express.Router();

const {
    crearZona,
    listarZonas,
    obtenerZonaPorId,
    actualizarZona,
    eliminarZona,
} = require("../controllers/zonas.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// ZONAS
// ============================

router.get("/todos", verificarToken, listarZonas);
router.get("/detalle/:id", verificarToken, obtenerZonaPorId);
router.post("/crear", verificarToken, crearZona);
router.put("/editar/:id", verificarToken, actualizarZona);
router.delete("/eliminar/:id", verificarToken, eliminarZona);
// router.get("/todos", verificarToken, getAllUnidades);

module.exports = router;
