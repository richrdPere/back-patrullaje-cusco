UnidadPatrullaje.belongsToMany(
  Usuario,
  {
    through: UnidadSereno
  }
)

Usuario.belongsToMany(
  UnidadPatrullaje,
  {
    through: UnidadSereno
  }
)