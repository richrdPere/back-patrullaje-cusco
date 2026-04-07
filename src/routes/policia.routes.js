const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/rol.middleware");

// Controllers
const {
    newPolicia,
    getAllPolicias,
    getPoliciasPaginated,
    getPoliciaById,
    updatePolicia,
    deletePolicia
} = require("../controllers/policia.controller");

// ==========================
// RUTAS POLICIAS
// ==========================
router.post("/crear", verificarToken, newPolicia);
router.get("/todos", verificarToken, getAllPolicias);
router.get("/paginado", verificarToken, getPoliciasPaginated);
router.get("/detalle/:id", verificarToken, getPoliciaById);
router.put("/editar/:id", verificarToken, updatePolicia);
router.delete("/eliminar/:id", verificarToken, deletePolicia);

module.exports = router;