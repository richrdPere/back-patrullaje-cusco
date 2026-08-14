// services/ocurrencias/reglas/
// validar-reglas-condicionales.service.js

const crearError = (
    message,
    code,
) => {
    const error = new Error(message);

    error.statusCode = 422;
    error.code = code;

    return error;
};

const obtenerParametros = (regla) => {
    if (!regla.parametros) {
        return {};
    }

    if (
        typeof regla.parametros === 'object'
    ) {
        return regla.parametros;
    }

    try {
        return JSON.parse(regla.parametros);
    } catch {
        return {};
    }
};

const validarReglasCondicionales = ({ modalidad, data }) => {
    const reglas = modalidad.reglas || [];

    // =====================================================
    // SIN DATO - NOMBRE DE ZONA
    // =====================================================
    if (
        data.tipo_zona === 'SIN_DATO' &&
        String(data.nombre_zona || '').trim()
    ) {
        throw crearError(
            'No se puede registrar el nombre de la zona cuando el tipo de zona es SIN_DATO.',
            'NOMBRE_ZONA_NO_PERMITIDO',
        );
    }

    // =====================================================
    // RESULTADO
    // =====================================================
    const resultadosPermitidos = [
        'CONSUMADO',
        'FRUSTRADO',
        'NO_APLICA',
    ];

    if (
        data.resultado &&
        !resultadosPermitidos.includes(
            data.resultado,
        )
    ) {
        throw crearError(
            'El resultado de la ocurrencia no es válido.',
            'RESULTADO_INVALIDO',
        );
    }

    // =====================================================
    // CONSECUENCIAS
    // =====================================================
    const consecuencias =
        data.consecuencias || [];

    if (!Array.isArray(consecuencias)) {
        throw crearError(
            'El campo consecuencias debe ser un arreglo.',
            'CONSECUENCIAS_FORMATO_INVALIDO',
        );
    }

    const tiposConsecuencia = new Set();

    for (const consecuencia of consecuencias) {
        if (
            tiposConsecuencia.has(
                consecuencia.tipo,
            )
        ) {
            throw crearError(
                `La consecuencia ${consecuencia.tipo} se encuentra duplicada.`,
                'CONSECUENCIA_DUPLICADA',
            );
        }

        tiposConsecuencia.add(
            consecuencia.tipo,
        );

        if (
            consecuencia.tipo === 'OTRO' &&
            !String(
                consecuencia.descripcion || '',
            ).trim()
        ) {
            throw crearError(
                'La descripción es obligatoria para la consecuencia OTRO.',
                'DESCRIPCION_CONSECUENCIA_REQUERIDA',
            );
        }
    }

    // =====================================================
    // MEDIOS EMPLEADOS
    // =====================================================
    const medios =
        data.medios_empleados || [];

    if (!Array.isArray(medios)) {
        throw crearError(
            'El campo medios_empleados debe ser un arreglo.',
            'MEDIOS_FORMATO_INVALIDO',
        );
    }

    const tiposMedios = new Set();

    for (const medio of medios) {
        if (tiposMedios.has(medio.tipo)) {
            throw crearError(
                `El medio empleado ${medio.tipo} se encuentra duplicado.`,
                'MEDIO_EMPLEADO_DUPLICADO',
            );
        }

        tiposMedios.add(medio.tipo);

        if (
            medio.tipo === 'OTRO' &&
            !String(
                medio.descripcion || '',
            ).trim()
        ) {
            throw crearError(
                'La descripción es obligatoria para el medio empleado OTRO.',
                'DESCRIPCION_MEDIO_REQUERIDA',
            );
        }
    }

    // =====================================================
    // MEDIO EXCLUSIVO: HABILIDAD
    // =====================================================
    const reglaMedioExclusivo =
        reglas.find(
            (regla) =>
                regla.clave ===
                'MEDIO_EXCLUSIVO',
        );

    if (reglaMedioExclusivo) {
        const parametros =
            obtenerParametros(
                reglaMedioExclusivo,
            );

        const permitidos =
            parametros.medios_permitidos || [];

        const mediosNoPermitidos =
            medios.filter(
                (medio) =>
                    !permitidos.includes(
                        medio.tipo,
                    ),
            );

        if (mediosNoPermitidos.length > 0) {
            throw crearError(
                `Para el código ${modalidad.codigo} solo se permiten los medios: ${permitidos.join(', ')}.`,
                'MEDIO_EMPLEADO_NO_PERMITIDO',
            );
        }
    }

    return true;
};

module.exports = validarReglasCondicionales;