const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth.middleware");


const {
    asignarSerenos,
    obtenerSerenosUnidad,
    eliminarAsignacion
} = require("../controllers/unidad_sereno.controller");

// asignar serenos
router.post("/asignar-serenos", verificarToken, asignarSerenos);

// obtener serenos de una unidad
router.get("/unidad/:unidad_id", verificarToken, obtenerSerenosUnidad);

// eliminar asignacion de sereno
router.delete("/unidad/:unidad_id/usuario/:usuario_id", verificarToken, eliminarAsignacion);

module.exports = router;