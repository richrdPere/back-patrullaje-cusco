const express = require("express");
const router = express.Router();

// MIDDLEWARES
const upload = require("../../../middlewares/upload-s3");

const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// CONTROLLERS
const {
  // Registro
  registerIncidenciaController,

  // Consultas generales
  getIncidenciasPaginatedController,
  getIncidenciaByIdController,
  getResumenIncidenciasController,
  getIncidenciasByFechaController,

  // Consultas por usuario y relaciones
  getMisIncidenciasController,
  getIncidenciasByUsuarioController,
  getIncidenciasByPatrullajeController,
  getIncidenciasByZonaController,
  getIncidenciasCercanasController,

  // Estados
  updateEstadoIncidenciaController,
  updateEstadoMasivoIncidenciasController,

  // Archivos
  addArchivosIncidenciaController,
  deleteArchivoIncidenciaController,
  getArchivosByIncidenciaController,

  // Eliminación
  deleteIncidenciaController,
} = require(
  "../controllers/incidencia.controller"
);

// =====================================================
// 1. RUTAS COMPARTIDAS: WEB Y MÓVIL
// =====================================================
router.post("/crear", upload.array("archivos", 5), registerIncidenciaController);
router.get("/detalle/:id", getIncidenciaByIdController);

// =====================================================
// 2. RUTAS PRINCIPALES PARA MÓVIL
// =====================================================
router.get("/mis-incidencias", getMisIncidenciasController);
router.get("/cercanas", getIncidenciasCercanasController);

// =====================================================
// 3. RUTAS PRINCIPALES PARA WEB
// =====================================================
router.get("/paginado", getIncidenciasPaginatedController);
router.get("/resumen", getResumenIncidenciasController);
router.get("/fecha", getIncidenciasByFechaController);
router.patch("/editar/:id/estado", updateEstadoIncidenciaController);
router.put("/estado-masivo", updateEstadoMasivoIncidenciasController);
router.delete("/eliminar/:id", deleteIncidenciaController);

// =====================================================
// 4. CONSULTAS POR RELACIÓN
// WEB Y MÓVIL
// =====================================================
router.get("/usuario/:usuario_id", getIncidenciasByUsuarioController);
router.get("/patrullaje/:patrullaje_id", getIncidenciasByPatrullajeController);
router.get("/zona/:zona_id", getIncidenciasByZonaController);

// =====================================================
// 5. ARCHIVOS DE INCIDENCIA
// WEB Y MÓVIL
// =====================================================
router.post("/:id/archivos", upload.array("archivos", 5), addArchivosIncidenciaController);
router.get("/:id/archivos", getArchivosByIncidenciaController);
router.delete("/:id/archivos/:archivo_id", deleteArchivoIncidenciaController);

module.exports = router;

