// database/associations/ocurrencias-registro.associations.js

module.exports = (db) => {
  // ======================================================
  // USUARIO - OCURRENCIA
  // Sereno responsable de registrar la ocurrencia
  // ======================================================
  db.Usuario.hasMany(
    db.Ocurrencia,
    {
      foreignKey: 'sereno_id',
      as: 'ocurrencias_reportadas',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  db.Ocurrencia.belongsTo(
    db.Usuario,
    {
      foreignKey: 'sereno_id',
      as: 'sereno',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  // ======================================================
  // MODALIDAD - OCURRENCIA
  // Clasificación oficial de seis dígitos
  // ======================================================
  db.OcurrenciaModalidad.hasMany(
    db.Ocurrencia,
    {
      foreignKey: 'modalidad_id',
      as: 'ocurrencias',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  db.Ocurrencia.belongsTo(
    db.OcurrenciaModalidad,
    {
      foreignKey: 'modalidad_id',
      as: 'modalidad',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  // ======================================================
  // INCIDENCIA - OCURRENCIA
  // Relación opcional 1 a 0..1
  // ======================================================
  db.Incidencia.hasOne(
    db.Ocurrencia,
    {
      foreignKey: 'incidencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  db.Ocurrencia.belongsTo(
    db.Incidencia,
    {
      foreignKey: 'incidencia_id',
      as: 'incidencia',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );
  // ======================================================
  // PATRULLAJE PROGRAMADO - OCURRENCIA
  // Relación opcional
  // ======================================================
  db.PatrullajeProgramado.hasMany(
    db.Ocurrencia,
    {
      foreignKey: 'patrullaje_id',
      as: 'ocurrencias',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  db.Ocurrencia.belongsTo(
    db.PatrullajeProgramado,
    {
      foreignKey: 'patrullaje_id',
      as: 'patrullaje',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  // ======================================================
  // ZONA - OCURRENCIA
  // Relación opcional
  // ======================================================
  db.Zonas.hasMany(
    db.Ocurrencia,
    {
      foreignKey: 'zona_id',
      as: 'ocurrencias_registradas',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  db.Ocurrencia.belongsTo(
    db.Zonas,
    {
      foreignKey: 'zona_id',
      as: 'zonas',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  // ======================================================
  // UNIDAD - OCURRENCIA
  // Relación opcional
  // ======================================================
  db.UnidadPatrullaje.hasMany(
    db.Ocurrencia,
    {
      foreignKey: 'unidad_id',
      as: 'ocurrencias_atendidas',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  db.Ocurrencia.belongsTo(
    db.UnidadPatrullaje,
    {
      foreignKey: 'unidad_id',
      as: 'unidad',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  // ======================================================
  // OCURRENCIA - CONSECUENCIAS
  // ======================================================
  db.Ocurrencia.hasMany(
    db.OcurrenciaConsecuencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'consecuencias',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  db.OcurrenciaConsecuencia.belongsTo(
    db.Ocurrencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  // ======================================================
  // OCURRENCIA - EFECTIVOS PNP
  // ======================================================
  db.Ocurrencia.hasMany(
    db.OcurrenciaEfectivoPnp,
    {
      foreignKey: 'ocurrencia_id',
      as: 'efectivos_pnp',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  db.OcurrenciaEfectivoPnp.belongsTo(
    db.Ocurrencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  // ======================================================
  // POLICÍA - EFECTIVO PNP DE LA OCURRENCIA
  // ======================================================
  db.Policia.hasMany(
    db.OcurrenciaEfectivoPnp,
    {
      foreignKey: 'policia_id',
      as: 'ocurrencias_participadas',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  db.OcurrenciaEfectivoPnp.belongsTo(
    db.Policia,
    {
      foreignKey: 'policia_id',
      as: 'policia',

      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  );

  // ======================================================
  // OCURRENCIA - HISTORIAL
  // ======================================================
  db.Ocurrencia.hasMany(
    db.OcurrenciaHistorial,
    {
      foreignKey: 'ocurrencia_id',
      as: 'historial',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  db.OcurrenciaHistorial.belongsTo(
    db.Ocurrencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  // ======================================================
  // USUARIO - HISTORIAL DE OCURRENCIA
  // Usuario que realiza la acción
  // ======================================================
  db.Usuario.hasMany(
    db.OcurrenciaHistorial,
    {
      foreignKey: 'usuario_id',
      as: 'acciones_ocurrencias',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  db.OcurrenciaHistorial.belongsTo(
    db.Usuario,
    {
      foreignKey: 'usuario_id',
      as: 'usuario',

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  );

  // ======================================================
  // OCURRENCIA - MEDIOS EMPLEADOS
  // ======================================================
  db.Ocurrencia.hasMany(
    db.OcurrenciaMedioEmpleado,
    {
      foreignKey: 'ocurrencia_id',
      as: 'medios_empleados',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  db.OcurrenciaMedioEmpleado.belongsTo(
    db.Ocurrencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  // ======================================================
  // OCURRENCIA - PERSONAS INVOLUCRADAS
  // ======================================================
  db.Ocurrencia.hasMany(
    db.OcurrenciaPersona,
    {
      foreignKey: 'ocurrencia_id',
      as: 'personas',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );

  db.OcurrenciaPersona.belongsTo(
    db.Ocurrencia,
    {
      foreignKey: 'ocurrencia_id',
      as: 'ocurrencia',

      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  );
};