const bcrypt = require("bcryptjs");

const db = require('../models');

const Persona = db.Persona;
const Usuario = db.Usuario;
const Roles = db.Roles;
const UsuarioRol = db.UsuarioRol;
const Policia = db.Policia;


async function initUsuariosSistema() {
  try {
    console.log("🔍 Inicializando usuarios del sistema...");

    // --------------------------------------------------
    // 1. Verificar si ya existen usuarios
    // --------------------------------------------------
    const countUsuarios = await Usuario.count();
    if (countUsuarios > 0) {
      console.log("⚠️ Ya existen usuarios, se omite inicialización");
      return;
    }

    // --------------------------------------------------
    // 2. Obtener roles
    // --------------------------------------------------
    const roles = await Roles.findAll();
    const mapRoles = {};
    roles.forEach(r => mapRoles[r.nombre] = r);

    // console.log("ROLES EN BD:", roles.map(r => r.nombre));

    const hashPassword = async (pass = "123456") =>
      await bcrypt.hash(pass, 10);

    // ==================================================
    // 🔹 3. CREAR SERENOS
    // ==================================================
    for (let i = 1; i <= 3; i++) {
      const persona = await Persona.create({
        nombres: `Sereno${i}`,
        apellidos: "Cusco",
        documento_identidad: `7308125${i}`,
        telefono: `90000000${i}`
      });

      const usuario = await Usuario.create({
        persona_id: persona.id,
        username: `7308125${i}`,
        password: await hashPassword(`7308125${i}`, 12),
        correo: `sereno${i}@test.com`
      });

      await UsuarioRol.create({
        usuario_id: usuario.id,
        rol_id: mapRoles["SERENO"].id
      });
    }

    // ==================================================
    // 🔹 4. CREAR POLICIAS (SIN USUARIO)
    // ==================================================
    for (let i = 1; i <= 3; i++) {
      const persona = await Persona.create({
        nombres: `Policia${i}`,
        apellidos: "Peru",
        documento_identidad: `8000000${i}`
      });

      await Policia.create({
        persona_id: persona.id,
        grado: "Suboficial",
        comisaria: "Cusco Centro",
        codigo_institucional: `POL-${i}`
      });
    }

    // ==================================================
    // 🔹 5. CREAR OPERADOR
    // ==================================================
    const personaOperador = await Persona.create({
      nombres: "Operador",
      apellidos: "Central",
      documento_identidad: "73081240"
    });

    const usuarioOperador = await Usuario.create({
      persona_id: personaOperador.id,
      username: "73081240",
      password: await hashPassword("73081240", 12),
      correo: "operador@test.com"
    });

    await UsuarioRol.create({
      usuario_id: usuarioOperador.id,
      rol_id: mapRoles["OPERADOR"].id
    });

    // ==================================================
    // 🔹 6. CREAR ADMIN
    // ==================================================
    const personaAdmin = await Persona.create({
      nombres: "Admin",
      apellidos: "Sistema",
      documento_identidad: "73081247"
    });

    const usuarioAdmin = await Usuario.create({
      persona_id: personaAdmin.id,
      username: "73081247",
      password: await hashPassword("73081247", 12),
      correo: "admin@test.com"
    });

    await UsuarioRol.create({
      usuario_id: usuarioAdmin.id,
      rol_id: mapRoles["ADMIN"].id
    });

    console.log("🚀 Usuarios iniciales creados correctamente");

  } catch (error) {
    console.error("❌ Error inicializando usuarios:", error.message);
  }
}

module.exports = initUsuariosSistema;


