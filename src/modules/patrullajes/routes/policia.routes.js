

const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

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
router.post("/crear", createPoliciaController);
router.get("/todos", getPoliciasAllController);
router.get("/paginado", getPoliciasController);
router.get("/detalle/:id", getPoliciaByIdController);
router.put("/editar/:id", updatePoliciaController);
router.delete("/eliminar/:id", deletePoliciaController);

module.exports = router;