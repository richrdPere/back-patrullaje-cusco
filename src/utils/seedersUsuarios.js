// seeders/seedUsuarios.js

const bcrypt = require("bcryptjs");

const {
  Persona,
  Usuario,
  Roles,
  UsuarioRol,
  Policia
} = require("../models");

const crearRolesBase = async () => {
  const rolesSistema = [
    "SERENO",
    "SUPERVISOR_SERENAZGO",
    "GERENTE_SERENAZGO",
    "OPERADOR",
    "CONDUCTOR",
    "POLICIA",
    "ADMIN"
  ];

  for (const nombre of rolesSistema) {
    await Roles.findOrCreate({
      where: { nombre }
    });
  }
};

const getRol = async (nombre) => {
  return await Roles.findOne({ where: { nombre } });
};

const hashPassword = async (password = "123456") => {
  return await bcrypt.hash(password, 10);
};

// ======================================================
// CREAR SERENOS
// ======================================================
const crearSerenos = async () => {
  const rolSereno = await getRol("SERENO");

  for (let i = 1; i <= 5; i++) {
    const persona = await Persona.create({
      nombres: `Sereno${i}`,
      apellidos: "Cusco",
      documento_identidad: `7000000${i}`,
      telefono: `90000000${i}`
    });

    const usuario = await Usuario.create({
      persona_id: persona.id,
      username: `sereno${i}`,
      password: await hashPassword(),
      correo: `sereno${i}@test.com`
    });

    await UsuarioRol.create({
      usuario_id: usuario.id,
      rol_id: rolSereno.id
    });
  }
};

// ======================================================
// CREAR POLICIAS (SIN USUARIO)
// ======================================================
const crearPolicias = async () => {
  for (let i = 1; i <= 5; i++) {
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
};

// ======================================================
// CREAR OPERADOR
// ======================================================
const crearOperador = async () => {
  const rolOperador = await getRol("OPERADOR");

  const persona = await Persona.create({
    nombres: "Operador",
    apellidos: "Central",
    documento_identidad: "90000001"
  });

  const usuario = await Usuario.create({
    persona_id: persona.id,
    username: "operador",
    password: await hashPassword(),
    correo: "operador@test.com"
  });

  await UsuarioRol.create({
    usuario_id: usuario.id,
    rol_id: rolOperador.id
  });
};

// ======================================================
// CREAR ADMIN
// ======================================================
const crearAdmin = async () => {
  const rolAdmin = await getRol("ADMIN");

  const persona = await Persona.create({
    nombres: "Admin",
    apellidos: "Sistema",
    documento_identidad: "99999999"
  });

  const usuario = await Usuario.create({
    persona_id: persona.id,
    username: "admin",
    password: await hashPassword("admin123"),
    correo: "admin@test.com"
  });

  await UsuarioRol.create({
    usuario_id: usuario.id,
    rol_id: rolAdmin.id
  });
};

// ======================================================
// EJECUTOR
// ======================================================
const seed = async () => {
  try {
    console.log("🌱 Iniciando seed...");

    await crearRolesBase();
    await crearSerenos();
    await crearPolicias();
    await crearOperador();
    await crearAdmin();

    console.log("✅ Seed completado correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seed();