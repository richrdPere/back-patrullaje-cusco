const express = require("express");
const router = express.Router();

// Middleware multer
const upload = require("../middlewares/upload");

// Controller
const {
  registrarIncidencia,
  getIncidenciasPaginated,
  getIncidenciaById,
  updateEstadoIncidencia,
  deleteIncidencia
} = require("../controllers/incidencia.controller");

// CREAR INCIDENCIA (CON ARCHIVOS) desde App
router.post(
  "/crear",
  upload.array("archivos", 5), // máximo 5 archivos
  registrarIncidencia
);

router.get("/paginado", getIncidenciasPaginated);
router.get("/detalle/:id", getIncidenciaById);
router.patch("/editar/:id/estado", updateEstadoIncidencia);
router.delete("/eliminar/:id", deleteIncidencia);

module.exports = router;