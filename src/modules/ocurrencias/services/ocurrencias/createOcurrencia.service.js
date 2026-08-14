const db = require('../../../../database/models');
const { UniqueConstraintError } = require('sequelize');

// Modelos
const {
  sequelize,
  Ocurrencia,
  OcurrenciaPersona,
  OcurrenciaConsecuencia,
  OcurrenciaMedioEmpleado,
  OcurrenciaEfectivoPnp,
  OcurrenciaHistorial,
} = db;

// Validators
const {
  validarDatosOcurrencia,
  validarModalidadActiva,
  validarReferenciasOcurrencia,
} = require("../../validations/ocurrencias");

// Otros Services
const getOcurrenciaById = require('./getOcurrenciaById.service');

// - 1. Correlativo
const generarNumeroOcurrencia = require('./correlativo/generateNumeroOcurrencia.service');

// - 2. Personas
const {
  calcularResumenPersonas,
  validarPersonaOcurrencia
} = require("./personas");

// - 3. Registro
const {
  registrarEfectivosPnp,
  registrarPersonasOcurrencia,
  registrarResultadoMedios,
  relacionarIncidenciaOcurrencia,
} = require("./registro");


// - 4. Regla
const {
  validarReglasCondicionales,
  validarReglasPersonas,
} = require('./reglas');


// Utils
const limpiarTexto = (value) => {
  if (value === undefined || value === null) return null;
  const texto = String(value).trim();
  return texto || null;
};

const enteroOpcional = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const booleano = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  return value === true || value === 1 || value === '1' || value === 'true';
};

const crearError = (message, statusCode, code, details = undefined) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details !== undefined) error.details = details;
  return error;
};

const normalizarNumeroGenerado = (resultado) => {
  if (typeof resultado === 'string') return resultado;

  return resultado?.numero_ocurrencia
    || resultado?.numero
    || resultado?.codigo
    || null;
};

/**
 * RF-BE-OC-02, 03, 04, 05, 06, 07 y 08.
 *
 * Regla de cardinalidad aplicada:
 *   una incidencia puede tener como máximo una ocurrencia.
 *
 * Todo se registra en una única transacción. El índice UNIQUE de
 * ocurrencias.incidencia_id debe mantenerse como protección final.
 */
// SERVICES
const crearOcurrencia = async ({ serenoId, data = {} }) => {
  const parsedSerenoId = Number(serenoId);

  if (!Number.isInteger(parsedSerenoId) || parsedSerenoId <= 0) {
    throw crearError(
      'No se pudo identificar al sereno autenticado.',
      401,
      'SERENO_NO_IDENTIFICADO',
    );
  }

  const transaction = await sequelize.transaction();

  try {
    const incidenciaId = enteroOpcional(data.incidencia_id);
    const patrullajeId = enteroOpcional(data.patrullaje_id);

    // 1. La modalidad y toda su jerarquía deben estar activas.
    const modalidad = await validarModalidadActiva(
      limpiarTexto(data.codigo_ocurrencia),
      { transaction },
    );

    // 2. Verifica existencia, pertenencia al sereno y referencias opcionales.
    await validarReferenciasOcurrencia({
      incidenciaId,
      patrullajeId,
      serenoId: parsedSerenoId,
      transaction,
    });

    // 3. Prevalidación de la relación 1:1. Esta consulta permite responder con
    // un error claro. El índice UNIQUE sigue siendo la garantía ante concurrencia.
    if (incidenciaId !== null) {
      const ocurrenciaExistente = await Ocurrencia.findOne({
        where: { incidencia_id: incidenciaId },
        attributes: ['id', 'numero_ocurrencia', 'estado', 'incidencia_id'],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (ocurrenciaExistente) {
        throw crearError(
          'La incidencia seleccionada ya tiene una ocurrencia.',
          409,
          'INCIDENCIA_CON_OCURRENCIA',
          {
            ocurrencia_id: ocurrenciaExistente.id,
            numero_ocurrencia: ocurrenciaExistente.numero_ocurrencia,
            estado: ocurrenciaExistente.estado,
          },
        );
      }
    }

    const estado = 'BORRADOR';

    validarDatosOcurrencia({
      data,
      modalidad,
      esBorrador: true,
    });

    // 4. El correlativo se consume dentro de la misma transacción.
    // Si tu servicio recibe argumentos posicionales, reemplaza esta llamada por:
    // generarNumeroOcurrencia(transaction, data.fecha_ocurrencia || new Date()).
    const correlativo = await generarNumeroOcurrencia({
      transaction,
      // RF-BE-OC-03: el año corresponde al registro, no a la fecha del hecho.
      fechaRegistro: new Date(),
    });

    const numeroOcurrencia = normalizarNumeroGenerado(correlativo);

    if (!numeroOcurrencia) {
      throw crearError(
        'El servicio de correlativo no devolvió un número de ocurrencia válido.',
        500,
        'CORRELATIVO_INVALIDO',
      );
    }

    const ocurrencia = await Ocurrencia.create(
      {
        numero_ocurrencia: numeroOcurrencia,
        uuid_cliente: limpiarTexto(data.uuid_cliente),
        sereno_id: parsedSerenoId,
        modalidad_id: modalidad.id,
        incidencia_id: incidenciaId,
        patrullaje_id: patrullajeId,
        zona_id: enteroOpcional(data.zona_id),
        unidad_id: enteroOpcional(data.unidad_id),

        origen: data.origen || null,
        origen_otro: data.origen === 'OTRO'
          ? limpiarTexto(data.origen_otro)
          : null,
        modalidad_patrullaje: data.modalidad_patrullaje || null,
        tipo_patrullaje: data.tipo_patrullaje || null,
        tipo_patrullaje_otro: data.tipo_patrullaje === 'OTRO'
          ? limpiarTexto(data.tipo_patrullaje_otro)
          : null,
        turno: data.turno || null,
        placa_vehiculo: limpiarTexto(data.placa_vehiculo),
        tipo_vehiculo: data.tipo_vehiculo || null,

        fecha_ocurrencia: data.fecha_ocurrencia || null,
        hora_alerta: data.hora_alerta || null,
        hora_llegada: data.hora_llegada || null,
        hora_repliegue: data.hora_repliegue || null,
        resultado: data.resultado || null,
        relacion_victima_victimario:
          data.relacion_victima_victimario || null,

        tipo_lugar: data.tipo_lugar || null,
        tipo_via: data.tipo_via || null,
        direccion: limpiarTexto(data.direccion),
        referencia: limpiarTexto(data.referencia),
        manzana: limpiarTexto(data.manzana),
        lote: limpiarTexto(data.lote),
        tipo_zona: data.tipo_zona || null,
        nombre_zona: data.tipo_zona === 'SIN_DATO'
          ? null
          : limpiarTexto(data.nombre_zona),
        sector_patrullaje: limpiarTexto(data.sector_patrullaje),
        latitud: enteroOpcional(data.latitud),
        longitud: enteroOpcional(data.longitud),
        datos_importantes: limpiarTexto(data.datos_importantes),
        estado,
      },
      { transaction },
    );

    // 5. Personas involucradas.
    if (Array.isArray(data.personas) && data.personas.length > 0) {
      const personas = data.personas.map((persona, index) => ({
        ocurrencia_id: ocurrencia.id,
        orden: persona.orden ?? index + 1,
        tipo_persona: persona.tipo_persona,
        identificado: booleano(persona.identificado),
        documento_identidad: limpiarTexto(persona.documento_identidad),
        nombres_apellidos: limpiarTexto(persona.nombres_apellidos),
        genero: persona.genero || null,
        edad: enteroOpcional(persona.edad),
        edad_es_aproximada: booleano(
          persona.edad_es_aproximada,
          persona.edad_aproximada !== undefined
          && persona.edad_aproximada !== null,
        ),
        placa: limpiarTexto(persona.placa),
        caracteristicas_fisicas: limpiarTexto(
          persona.caracteristicas_fisicas,
        ),
        es_comunidad: booleano(persona.es_comunidad),
        fuente: persona.fuente || 'DIRECTA',
        observacion: limpiarTexto(persona.observacion),
        estado: true,
      }));

      await OcurrenciaPersona.bulkCreate(personas, {
        transaction,
        validate: true,
      });
    }

    // 6. Consecuencias múltiples.
    if (Array.isArray(data.consecuencias) && data.consecuencias.length > 0) {
      await OcurrenciaConsecuencia.bulkCreate(
        data.consecuencias.map((item) => ({
          ocurrencia_id: ocurrencia.id,
          tipo: item.tipo,
          descripcion: limpiarTexto(item.descripcion),
          estado: true,
        })),
        { transaction, validate: true },
      );
    }

    // 7. Medios empleados múltiples.
    if (
      Array.isArray(data.medios_empleados)
      && data.medios_empleados.length > 0
    ) {
      await OcurrenciaMedioEmpleado.bulkCreate(
        data.medios_empleados.map((item) => ({
          ocurrencia_id: ocurrencia.id,
          tipo: item.tipo,
          descripcion: limpiarTexto(item.descripcion),
          estado: true,
        })),
        { transaction, validate: true },
      );
    }

    // 8. Efectivos PNP catalogados o manuales.
    if (Array.isArray(data.efectivos_pnp) && data.efectivos_pnp.length > 0) {
      const efectivos = data.efectivos_pnp.map((efectivo) => {
        const policiaId = enteroOpcional(efectivo.policia_id);
        const fuenteRegistro = policiaId === null ? 'MANUAL' : 'CATALOGO';

        return {
          ocurrencia_id: ocurrencia.id,
          policia_id: policiaId,
          apellidos: limpiarTexto(efectivo.apellidos),
          nombres: limpiarTexto(efectivo.nombres),
          grado: limpiarTexto(efectivo.grado),
          comisaria: limpiarTexto(efectivo.comisaria),
          codigo_institucional: limpiarTexto(efectivo.codigo_institucional),
          fuente_registro: fuenteRegistro,
          tipo_participacion: efectivo.tipo_participacion || null,
          tipo_participacion_otro:
            efectivo.tipo_participacion === 'OTRO'
              ? limpiarTexto(efectivo.tipo_participacion_otro)
              : null,
          observacion: limpiarTexto(efectivo.observacion),
          estado: true,
        };
      });

      await OcurrenciaEfectivoPnp.bulkCreate(efectivos, {
        transaction,
        validate: true,
      });
    }

    // 9. Historial inicial.
    await OcurrenciaHistorial.create(
      {
        ocurrencia_id: ocurrencia.id,
        usuario_id: parsedSerenoId,
        estado_anterior: null,
        estado_nuevo: estado,
        accion: 'CREACION',
        comentario: 'La ocurrencia fue creada como borrador.',
      },
      { transaction },
    );

    await transaction.commit();
    return getOcurrenciaById(ocurrencia.id);
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();

    // Protección frente a dos solicitudes concurrentes. La comprobación previa
    // mejora el mensaje, pero el índice UNIQUE es la garantía definitiva.
    if (
      error instanceof UniqueConstraintError
      && (
        error.fields?.incidencia_id
        || error.fields?.uq_ocurrencia_incidencia
        || error.parent?.sqlMessage?.includes('uq_ocurrencia_incidencia')
      )
    ) {
      const existente = data.incidencia_id
        ? await Ocurrencia.findOne({
          where: { incidencia_id: Number(data.incidencia_id) },
          attributes: ['id', 'numero_ocurrencia', 'estado'],
        })
        : null;

      throw crearError(
        'La incidencia seleccionada ya tiene una ocurrencia.',
        409,
        'INCIDENCIA_CON_OCURRENCIA',
        existente
          ? {
            ocurrencia_id: existente.id,
            numero_ocurrencia: existente.numero_ocurrencia,
            estado: existente.estado,
          }
          : undefined,
      );
    }

    throw error;
  }
};
module.exports = crearOcurrencia;