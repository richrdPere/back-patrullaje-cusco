const express = require("express");
const router = express.Router();

// Middleware multer S3
const upload = require("../../../middlewares/upload-s3");
const verificarToken = require("../../../middlewares/auth.middleware");


// Controller
const {
  registerIncidenciaController,
  getIncidenciasPaginatedController,
  getIncidenciaByIdController,
  updateEstadoIncidenciaController,
  deleteIncidenciaController,
  getIncidenciasByUsuarioController,
  getMisIncidenciasController,
  getIncidenciasByPatrullajeController,
  getIncidenciasByZonaController,
  getIncidenciasCercanasController,
  addArchivosIncidenciaController,
  deleteArchivoIncidenciaController,
  getArchivosByIncidenciaController,
  getResumenIncidenciasController,
  getIncidenciasByFechaController,
  updateEstadoMasivoIncidenciasController
} = require("../controllers/incidencia.controller");

// CREAR INCIDENCIA
router.post(
  "/crear",
  verificarToken,
  upload.array("archivos", 5),
  registerIncidenciaController
);

// RUTAS FIJAS
router.get("/paginado", verificarToken, getIncidenciasPaginatedController);
router.get("/mis-incidencias", verificarToken, getMisIncidenciasController);
router.get("/cercanas", verificarToken, getIncidenciasCercanasController);
router.get("/resumen", verificarToken, getResumenIncidenciasController);
router.get("/fecha", verificarToken, getIncidenciasByFechaController);
router.put("/estado-masivo", verificarToken, updateEstadoMasivoIncidenciasController);

// RUTAS POR RELACIÓN
router.get("/usuario/:usuario_id", verificarToken, getIncidenciasByUsuarioController);
router.get("/patrullaje/:patrullaje_id", verificarToken, getIncidenciasByPatrullajeController);
router.get("/zona/:zona_id", verificarToken, getIncidenciasByZonaController);

// ARCHIVOS DE INCIDENCIA
router.post(
  "/:id/archivos",
  verificarToken,
  upload.array("archivos", 5),
  addArchivosIncidenciaController
);

router.get("/:id/archivos", verificarToken, getArchivosByIncidenciaController);

router.delete(
  "/:id/archivos/:archivo_id",
  verificarToken,
  deleteArchivoIncidenciaController
);

// CRUD POR ID
router.get("/detalle/:id", verificarToken, getIncidenciaByIdController);
router.patch("/editar/:id/estado", verificarToken, updateEstadoIncidenciaController);
router.delete("/eliminar/:id", verificarToken, deleteIncidenciaController);

module.exports = router;