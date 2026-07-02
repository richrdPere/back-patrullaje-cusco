const express = require("express");
const router = express.Router();

// Middleware multer S3
const upload = require("../middlewares/upload-s3");
const verificarToken = require("../middlewares/auth.middleware");


// Controller
const {
  registrarIncidencia,
  getIncidenciasPaginated,
  getIncidenciaById,
  updateEstadoIncidencia,
  deleteIncidencia,
  getIncidenciasByPatrullaje,
  getIncidenciasByUsuario,
  getEvidenciasByIncidencia,
  addEvidenciasToIncidencia,
  removeEvidenciaFromIncidencia,
  getDashboardIncidencias,
  getMapaIncidenciasActivas
} = require("../controllers/incidencia.controller");

// CREAR INCIDENCIA (CON ARCHIVOS) desde App
router.post("/crear",
  upload.array("archivos", 5), // máximo 5 archivos
  verificarToken,
  registrarIncidencia);

router.get("/paginado", verificarToken, getIncidenciasPaginated);
router.get("/detalle/:id", verificarToken, getIncidenciaById);
router.patch("/editar/:id/estado", verificarToken, updateEstadoIncidencia);
router.delete("/eliminar/:id", verificarToken, deleteIncidencia);
router.get("/patrullaje/:patrullaje_id", verificarToken, getIncidenciasByPatrullaje);
router.get("/usuario/:usuario_id", verificarToken, getIncidenciasByUsuario);
router.get("/:incidencia_id/evidencias", verificarToken, getEvidenciasByIncidencia);
router.post("/:incidencia_id/evidencias", verificarToken, upload.array("archivos", 5), addEvidenciasToIncidencia);
router.delete("/evidencias/:evidencia_id", verificarToken, removeEvidenciaFromIncidencia);
router.get("/dashboard/resumen", verificarToken, getDashboardIncidencias);
router.get("/mapa/activas", verificarToken, getMapaIncidenciasActivas);

module.exports = router;