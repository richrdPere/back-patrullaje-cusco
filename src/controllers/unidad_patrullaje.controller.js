const UnidadPatrullaje = require("../models/unidad_patrullaje.model");


// ======================================================
// 1. CREAR UNIDAD
// ======================================================
const crearUnidad = async (req, res) => {
  try {

    //const codigo = await generarCodigoUnidad();

    // const nuevaUnidad = await UnidadPatrullaje.create({
    //   ...req.body,
    //   // codigo
    // });

    const nuevaUnidad = await UnidadPatrullaje.create(req.body);

    res.status(201).json(nuevaUnidad);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear unidad', error });
  }
};


// ======================================================
// 2. LISTAR UNIDADES - PAGINADO
// ======================================================
const obtenerUnidades = async (req, res) => {
  try {

    const { page = 1, limit = 10, filtros } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let where = {};
    let filtrosObj = {};

    // Si vienen filtros
    if (filtros) {

      filtrosObj = typeof filtros === 'string'
        ? JSON.parse(filtros)
        : filtros;

      if (filtrosObj.placa) {
        where.placa = {
          [Op.like]: `%${filtrosObj.placa}%`
        };
      }

      if (filtrosObj.descripcion) {
        where.descripcion = {
          [Op.like]: `%${filtrosObj.descripcion}%`
        };
      }
    }

    const { count, rows } = await UnidadPatrullaje.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
      data: rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener unidades'
    });

  }
};


// ======================================================
// 3. OBTENER UNA UNIDAD
// ======================================================
const obtenerUnidadPorId = async (req, res) => {

  const { id } = req.params;

  try {

    const unidad = await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
      return res.status(404).json({ mensaje: 'Unidad no encontrada' });
    }

    res.json(unidad);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener unidad' });
  }
};


// ======================================================
// 4. ACTUALIZAR UNIDAD
// ======================================================
const actualizarUnidad = async (req, res) => {

  const { id } = req.params;

  try {

    const unidad = await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
      return res.status(404).json({ mensaje: 'Unidad no encontrada' });
    }

    await unidad.update(req.body);

    res.json(unidad);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar unidad' });
  }
};

// ======================================================
// 5. ELIMINAR UNIDAD
// ======================================================
const eliminarUnidad = async (req, res) => {

  const { id } = req.params;

  try {

    const unidad = await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
      return res.status(404).json({ mensaje: 'Unidad no encontrada' });
    }

    await unidad.destroy();

    res.json({ mensaje: 'Unidad eliminada correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar unidad' });
  }

};

// ======================================================
// 6. OBTENER ULTIMO CODIGO
// ======================================================
const generarCodigoUnidad = async () => {

  const ultimaUnidad = await UnidadPatrullaje.findOne({
    order: [['id', 'DESC']]
  });

  let siguienteNumero = 1;

  if (ultimaUnidad && ultimaUnidad.codigo) {

    const numeroActual = parseInt(ultimaUnidad.codigo.split('-')[1]);
    siguienteNumero = numeroActual + 1;

  }

  const codigo = `UP-${String(siguienteNumero).padStart(4, '0')}`;

  return codigo;
};


const obtenerSiguienteCodigo = async (req, res) => {

  try {

    const codigo = await generarCodigoUnidad();

    res.json({
      codigo
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener código'
    });

  }

};

// ======================================================
// 7. OBTENER TODAS LAS UNIDADES
// ======================================================
const getAllUnidades = async (req, res) => {

  try {

    const unidades = await UnidadPatrullaje.findAll({
      order: [["id", "ASC"]]
    });

    return res.status(200).json({
      ok: true,
      total: unidades.length,
      unidades
    });

  } catch (error) {

    console.error("Error al obtener unidades:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener las unidades de patrullaje",
      error: error.message
    });

  }

};
module.exports = {
  crearUnidad,
  obtenerUnidades,
  obtenerUnidadPorId,
  actualizarUnidad,
  eliminarUnidad,
  obtenerSiguienteCodigo,
  getAllUnidades

}