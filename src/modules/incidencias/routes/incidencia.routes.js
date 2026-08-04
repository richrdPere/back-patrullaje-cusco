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


// const express = require("express");
// const router = express.Router();

// // Middleware multer S3
// const upload = require("../../../middlewares/upload-s3");
// const verificarToken = require("../../../middlewares/auth.middleware");


// // Controller
// const {
//   addArchivosIncidenciaController,
//   deleteArchivoIncidenciaController,
//   deleteIncidenciaController,
//   getArchivosByIncidenciaController,
//   getIncidenciaByIdController,
//   getIncidenciasByFechaController,
//   getIncidenciasByPatrullajeController,
//   getIncidenciasByUsuarioController,
//   getIncidenciasByZonaController,
//   getIncidenciasCercanasController,
//   getIncidenciasPaginatedController,
//   getMisIncidenciasController,
//   getResumenIncidenciasController,
//   registerIncidenciaController,
//   updateEstadoIncidenciaController,
//   updateEstadoMasivoIncidenciasController
// } = require("../controllers/incidencia.controller");

// // CREAR INCIDENCIA
// router.post(
//   "/crear",
//   verificarToken,
//   upload.array("archivos", 5),
//   registerIncidenciaController
// );

// // RUTAS FIJAS
// router.get("/paginado", verificarToken, getIncidenciasPaginatedController);
// router.get("/mis-incidencias", verificarToken, getMisIncidenciasController);
// router.get("/cercanas", verificarToken, getIncidenciasCercanasController);
// router.get("/resumen", verificarToken, getResumenIncidenciasController);
// router.get("/fecha", verificarToken, getIncidenciasByFechaController);
// router.put("/estado-masivo", verificarToken, updateEstadoMasivoIncidenciasController);

// // RUTAS POR RELACIÓN
// router.get("/usuario/:usuario_id", verificarToken, getIncidenciasByUsuarioController);
// router.get("/patrullaje/:patrullaje_id", verificarToken, getIncidenciasByPatrullajeController);
// router.get("/zona/:zona_id", verificarToken, getIncidenciasByZonaController);

// // ARCHIVOS DE INCIDENCIA
// router.post(
//   "/:id/archivos",
//   verificarToken,
//   upload.array("archivos", 5),
//   addArchivosIncidenciaController
// );

// router.get("/:id/archivos", verificarToken, getArchivosByIncidenciaController);

// router.delete(
//   "/:id/archivos/:archivo_id",
//   verificarToken,
//   deleteArchivoIncidenciaController
// );

// // CRUD POR ID
// router.get("/detalle/:id", verificarToken, getIncidenciaByIdController);
// router.patch("/editar/:id/estado", verificarToken, updateEstadoIncidenciaController);
// router.delete("/eliminar/:id", verificarToken, deleteIncidenciaController);

// module.exports = router;