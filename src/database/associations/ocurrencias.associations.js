// database/associations/ocurrencias.associations.js

module.exports = (db) => {
  // ======================================================
  // CLASIFICADOR VERSION - CATEGORÍA GENÉRICA
  // ======================================================

  db.OcurrenciaClasificadorVersion.hasMany(
    db.OcurrenciaCategoriaGenerica,
    {
      foreignKey: 'version_id',
      as: 'categorias',
    },
  );

  db.OcurrenciaCategoriaGenerica.belongsTo(
    db.OcurrenciaClasificadorVersion,
    {
      foreignKey: 'version_id',
      as: 'version',
    },
  );

  // ======================================================
  // CATEGORÍA GENÉRICA - CATEGORÍA ESPECÍFICA
  // ======================================================

  db.OcurrenciaCategoriaGenerica.hasMany(
    db.OcurrenciaCategoriaEspecifica,
    {
      foreignKey: 'categoria_generica_id',
      as: 'categorias_especificas',
    },
  );

  db.OcurrenciaCategoriaEspecifica.belongsTo(
    db.OcurrenciaCategoriaGenerica,
    {
      foreignKey: 'categoria_generica_id',
      as: 'categoria_generica',
    },
  );

  // ======================================================
  // CATEGORÍA ESPECÍFICA - MODALIDAD
  // ======================================================

  db.OcurrenciaCategoriaEspecifica.hasMany(
    db.OcurrenciaModalidad,
    {
      foreignKey: 'categoria_especifica_id',
      as: 'modalidades',
    },
  );

  db.OcurrenciaModalidad.belongsTo(
    db.OcurrenciaCategoriaEspecifica,
    {
      foreignKey: 'categoria_especifica_id',
      as: 'categoria_especifica',
    },
  );

  // ======================================================
  // MODALIDAD - REGLAS
  // ======================================================

  db.OcurrenciaModalidad.hasMany(
    db.OcurrenciaModalidadRegla,
    {
      foreignKey: 'modalidad_id',
      as: 'reglas',
    },
  );

  db.OcurrenciaModalidadRegla.belongsTo(
    db.OcurrenciaModalidad,
    {
      foreignKey: 'modalidad_id',
      as: 'modalidad',
    },
  );
};