const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
    assignSerenosController,
    getSerenosByUnidadController,
    deleteAsignacionController
} = require("../controllers/unidad_sereno.controller");

// asignar serenos
router.post("/asignar-serenos", verificarToken, assignSerenosController);

// obtener serenos de una unidad
router.get("/unidad/:unidad_id", verificarToken, getSerenosByUnidadController);

// eliminar asignacion de sereno
router.delete("/unidad/:unidad_id/usuario/:usuario_id", verificarToken, deleteAsignacionController);

module.exports = router;