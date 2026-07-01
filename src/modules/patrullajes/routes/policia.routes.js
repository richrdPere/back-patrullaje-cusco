

const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
    createPoliciaController,
    getPoliciasController,
    getPoliciasAllController,
    getPoliciaByIdController,
    updatePoliciaController,
    deletePoliciaController
} = require("../controllers/policia.controller");

// ==========================
// RUTAS POLICIAS
// ==========================
router.post("/crear", verificarToken, createPoliciaController);
router.get("/todos", verificarToken, getPoliciasAllController);
router.get("/paginado", verificarToken, getPoliciasController);
router.get("/detalle/:id", verificarToken, getPoliciaByIdController);
router.put("/editar/:id", verificarToken, updatePoliciaController);
router.delete("/eliminar/:id", verificarToken, deletePoliciaController);

module.exports = router;