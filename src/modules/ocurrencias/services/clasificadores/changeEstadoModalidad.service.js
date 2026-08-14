// services/ocurrencias/clasificador/cambiar-estado-modalidad.service.js

const db = require('../../../../database/models');

// Modelos
const {
  OcurrenciaModalidad,
} = db;

// Service
const getModalidadByCodigo = require('./getModalidadByCodigo.service');


// SERVICES
const changeEstadoModalidad = async (
  id,
  estado,
) => {
  const modalidadId = Number(id);

  if (
    !Number.isInteger(modalidadId) ||
    modalidadId <= 0
  ) {
    const error = new Error(
      'El identificador de la modalidad no es válido.',
    );

    error.statusCode = 400;
    throw error;
  }

  if (typeof estado !== 'boolean') {
    const error = new Error(
      'El estado debe ser un valor booleano.',
    );

    error.statusCode = 400;
    throw error;
  }

  const modalidad =
    await OcurrenciaModalidad.findByPk(
      modalidadId,
    );

  if (!modalidad) {
    return null;
  }

  if (modalidad.estado !== estado) {
    await modalidad.update({
      estado,
    });
  }

  return getModalidadByCodigo(
    modalidad.codigo,
    {
      soloActivas: false,
      incluirReglas: true,
    },
  );
};

module.exports = changeEstadoModalidad;