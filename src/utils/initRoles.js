const Roles = require("../models/roles.model");

async function crearRolesPorDefecto() {
  try {
    console.log("🔍 Verificando roles por defecto...");

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
      const [rol, created] = await Roles.findOrCreate({
        where: { nombre },
        defaults: { nombre },
      });

      if (created) {
        console.log(`✅ Rol creado: ${nombre}`);
      } else {
        console.log(`✔️ Rol ya existe: ${nombre}`);
      }
    }

    console.log("🚀 Roles verificados correctamente.");
  } catch (error) {
    console.error("❌ Error creando roles:", error.message);
  }
}

module.exports = crearRolesPorDefecto;