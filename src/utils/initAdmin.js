const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario.model");
const Roles = require("../models/roles.model");
const UsuarioRol = require("../models/usuario_role.model");

async function crearGerenteSerenazgoPorDefecto() {
  try {
    console.log("🔍 Verificando usuario por defecto con roles...");

    // --------------------------------------------------
    // 1. Verificar si el usuario ya existe
    // --------------------------------------------------
    const usuarioExistente = await Usuario.findOne({
      where: { username: "73081247" },
    });

    if (usuarioExistente) {
      console.log("✅ Usuario ya existe. No se crea otro.");
      return;
    }

    // --------------------------------------------------
    // 2. Buscar roles
    // --------------------------------------------------
    const roles = await Roles.findAll({
      where: {
        nombre: ["SERENO", "CONDUCTOR"],
      },
    });

    if (roles.length === 0) {
      console.log("❌ No existen roles en la BD");
      return;
    }

    // --------------------------------------------------
    // 3. Encriptar contraseña
    // --------------------------------------------------
    const passwordHashed = await bcrypt.hash("73081247", 12);

    // --------------------------------------------------
    // 4. Crear usuario
    // --------------------------------------------------
    const usuario = await Usuario.create({
      nombre: "Gerente",
      apellidos: "Serenazgo Cusco",
      username: "73081247",
      password: passwordHashed,
      correo: "admin@sistema.com",
      telefono: "999999999",
      documento_identidad: "00000000",
      direccion: "Municipalidad del Cusco",
      departamento: "Cusco",
      provincia: "Cusco",
      distrito: "Cusco",
      estado: true,
      foto_perfil: null,
    });

    // --------------------------------------------------
    // 5. INSERTAR EN TABLA INTERMEDIA (🔥 SIN addRols)
    // --------------------------------------------------
    const relaciones = roles.map((rol) => ({
      usuario_id: usuario.id,
      rol_id: rol.id,
    }));

    await UsuarioRol.bulkCreate(relaciones);

    console.log("🚀 Usuario con roles SERENO y CONDUCTOR creado correctamente.");
  } catch (error) {
    console.error("❌ Error creando usuario por defecto:", error.message);
  }
}




module.exports = crearGerenteSerenazgoPorDefecto

