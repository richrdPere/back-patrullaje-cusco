const express = require("express");
const router = express.Router();

// importar rutas
const authRoutes = require("./auth.routes");
const usuarioRoutes = require("./usuario.routes");
const zonasRoutes = require("./zonas.routes");
const gpsRoutes = require("./gps.routes");
const patrullajeProgramadoRoutes = require("./patrullaje_programado.routes");
const alertaRoutes = require("./alerta.routes");
const unidadPatrullajeRoutes = require("./unidad_patrullaje.routes");
const unidadSerenoRoutes = require("./unidad_sereno.route");
const policiasRoutes = require("./policia.routes");

// usar rutas
router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/zonas", zonasRoutes);
router.use("/gps", gpsRoutes);
router.use("/patrullaje-programado", patrullajeProgramadoRoutes);
router.use("/alertas", alertaRoutes);
router.use("/unidad-patrullaje", unidadPatrullajeRoutes);
router.use("/unidad-sereno", unidadSerenoRoutes);
router.use("/policias", policiasRoutes);

// exportar router
module.exports = router;