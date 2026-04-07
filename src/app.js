const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const crearGerenteSerenazgoPorDefecto = require("./utils/initAdmin");
const crearRolesPorDefecto = require("./utils/initRoles");
// const crearUsuariosPorDefecto = require("./utils/initUsuariosPorDefecto");

const router = require("./routes/index");
const db = require("./models");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//  Rutas principales de la API
//  Multer maneja los archivos directamente, no se ve afectado por los límites anteriores
app.use("/api", router);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 Conexión a la base de datos
db.sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Conexión a MySQL establecida");


     // 🔥 1. Sincronizar modelos (crea tablas si no existen)
    await db.sequelize.sync({ alter: false }); // force ó alter: true

    console.log("📦 Modelos sincronizados");

    // 🔥 2. CREAR ROLES
    await crearRolesPorDefecto();

    // 🔥 3. CREAR USUARIO
    await crearGerenteSerenazgoPorDefecto();

  })
  .catch((err) => console.error("❌ Error al conectar con MySQL:", err.message));

module.exports = app;
