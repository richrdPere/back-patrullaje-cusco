// services/ocurrencias/registro/validar-datos-ocurrencia.service.js

const ORIGENES = [
    'CAMARA_VIDEO_VIGILANCIA',
    'REQUERIMIENTO_TELEFONICO',
    'PATRULLAJE',
    'OPERATIVO',
    'REDES_SOCIALES',
    'BOTON_PANICO',
    'OTRO',
];

const MODALIDADES_PATRULLAJE = [
    'INTEGRADO',
    'MUNICIPAL',
];

const TIPOS_PATRULLAJE = [
    'MOTORIZADO',
    'A_PIE',
    'BICICLETA',
    'OTRO',
];

const TURNOS = [
    'MANANA',
    'TARDE',
    'NOCHE',
];

const RESULTADOS = [
    'CONSUMADO',
    'FRUSTRADO',
    'NO_APLICA',
];

const crearError = (
    message,
    code = 'VALIDATION_ERROR',
) => {
    const error = new Error(message);

    error.statusCode = 400;
    error.code = code;

    return error;
};

const validarCoordenada = (
    value,
    min,
    max,
    nombre,
) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return;
    }

    const parsedValue = Number(value);

    if (
        !Number.isFinite(parsedValue) ||
        parsedValue < min ||
        parsedValue > max
    ) {
        throw crearError(
            `${nombre} no es válida.`,
            `${nombre.toUpperCase()}_INVALIDA`,
        );
    }
};

const validarDatosOcurrencia = ({
    data,
    modalidad,
    esBorrador = true,
}) => {
    if (!data) {
        throw crearError(
            'No se enviaron los datos de la ocurrencia.',
            'DATOS_OCURRENCIA_REQUERIDOS',
        );
    }

    // En un borrador permitimos información incompleta.
    // Sin embargo, código, sereno y estado siempre existirán.

    if (
        data.origen &&
        !ORIGENES.includes(data.origen)
    ) {
        throw crearError(
            'El origen de la ocurrencia no es válido.',
            'ORIGEN_INVALIDO',
        );
    }

    if (
        data.modalidad_patrullaje &&
        !MODALIDADES_PATRULLAJE.includes(
            data.modalidad_patrullaje,
        )
    ) {
        throw crearError(
            'La modalidad de patrullaje no es válida.',
            'MODALIDAD_PATRULLAJE_INVALIDA',
        );
    }

    if (
        data.tipo_patrullaje &&
        !TIPOS_PATRULLAJE.includes(
            data.tipo_patrullaje,
        )
    ) {
        throw crearError(
            'El tipo de patrullaje no es válido.',
            'TIPO_PATRULLAJE_INVALIDO',
        );
    }

    if (
        data.turno &&
        !TURNOS.includes(data.turno)
    ) {
        throw crearError(
            'El turno indicado no es válido.',
            'TURNO_INVALIDO',
        );
    }

    if (
        data.resultado &&
        !RESULTADOS.includes(data.resultado)
    ) {
        throw crearError(
            'El resultado indicado no es válido.',
            'RESULTADO_INVALIDO',
        );
    }

    validarCoordenada(
        data.latitud,
        -90,
        90,
        'latitud',
    );

    validarCoordenada(
        data.longitud,
        -180,
        180,
        'longitud',
    );

    if (
        data.datos_importantes &&
        data.datos_importantes.length > 140
    ) {
        throw crearError(
            'La sección datos importantes no puede superar los 140 caracteres.',
            'DATOS_IMPORTANTES_EXCEDIDOS',
        );
    }

    if (
        data.tipo_zona === 'SIN_DATO' &&
        data.nombre_zona
    ) {
        throw crearError(
            'No se debe registrar el nombre de la zona cuando el tipo es SIN_DATO.',
            'NOMBRE_ZONA_NO_PERMITIDO',
        );
    }

    if (
        modalidad.requiere_descripcion &&
        !esBorrador &&
        !String(data.datos_importantes || '').trim()
    ) {
        throw crearError(
            'La modalidad seleccionada requiere completar la sección datos importantes.',
            'DATOS_IMPORTANTES_REQUERIDOS',
        );
    }

    if (
        !esBorrador &&
        (
            data.latitud === null ||
            data.latitud === undefined ||
            data.longitud === null ||
            data.longitud === undefined
        )
    ) {
        throw crearError(
            'La ubicación es obligatoria para registrar definitivamente la ocurrencia.',
            'UBICACION_REQUERIDA',
        );
    }

    return true;
};

module.exports = validarDatosOcurrencia;