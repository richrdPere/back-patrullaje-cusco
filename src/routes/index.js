const express = require("express");
const router = express.Router();

// importar rutas
const alertaRoutes = require("../modules/alertas/routes/alerta.routes");
const authRoutes = require("../modules/auth/routes/auth.routes");
const dashboardRoutes = require("../modules/dashboard/routes/dashboard.routes");
const historialRoutes = require("../modules/historial/routes/historial.routes");
const incidenciasRoutes = require("../modules/incidencias/routes/incidencia.routes");
const movilesRoutes = require("../modules/patrullajes/routes/patrullaje_movil.routes");
const patrullajeProgramadoRoutes = require("../modules/patrullajes/routes/patrullaje_programado.routes");
const policiasRoutes = require("../modules/patrullajes/routes/policia.routes");
const profileRoutes = require("../modules/auth/routes/profile.routes");
const unidadPatrullajeRoutes = require("../modules/patrullajes/routes/unidad_patrullaje.routes");
const unidadSerenoRoutes = require("../modules/patrullajes/routes/unidad_sereno.routes");
const usuarioRoutes = require("../modules/usuarios/routes/usuarios.route");
const zonasRoutes = require("../modules/zonas/routes/zonas.route");
const reportesRoutes = require("../modules/reportes/routes/reportes.routes");
const clasificadoresRoutes = require("../modules/ocurrencias/routes/clasificador.routes");
const gpsPatrullajeRoutes = require("./gps_patrullaje.routes");
const gpsRoutes = require("./gps.routes");


// usar rutas
router.use("/alertas", alertaRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/gps", gpsRoutes);
router.use("/historial", historialRoutes);
router.use("/incidencias", incidenciasRoutes);
router.use("/moviles", movilesRoutes);
router.use("/patrullaje-gps", gpsPatrullajeRoutes);
router.use("/patrullaje-programado", patrullajeProgramadoRoutes);
router.use("/policias", policiasRoutes);
router.use("/profile", profileRoutes);
router.use("/unidad-patrullaje", unidadPatrullajeRoutes);
router.use("/unidad-sereno", unidadSerenoRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/zonas", zonasRoutes);
router.use("/reportes", reportesRoutes);
router.use("/clasificadores", clasificadoresRoutes);

// exportar router
module.exports = router;