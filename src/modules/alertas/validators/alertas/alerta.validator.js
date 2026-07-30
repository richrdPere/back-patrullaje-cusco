const TIPOS_ALERTA = [
    "PANICO",
    "INCIDENCIA",
    "EMERGENCIA",
    "SOS",
    "INFORMATIVA",
    "PREVENTIVA",
    "CAMBIO_RUTA",
    "APOYO_REQUERIDO",
    "MENSAJE_CENTRAL",
];

const PRIORIDADES_ALERTA = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "CRITICA",
];

const RESPUESTAS_ALERTA = [
    "ACEPTADA",
    "RECHAZADA",
];

const TIPOS_CON_UBICACION_OBLIGATORIA = [
    "PANICO",
    "SOS",
    "EMERGENCIA",
    "APOYO_REQUERIDO",
];

const esNumeroValido = (value) => {
    if (value === null || value === undefined || value === "") {
        return false;
    }

    return Number.isFinite(Number(value));
};

const validarCoordenadas = ({ latitud, longitud }) => {
    if (!esNumeroValido(latitud) || !esNumeroValido(longitud)) {
        throw new Error(
            "La latitud y longitud deben ser valores numéricos válidos"
        );
    }

    const lat = Number(latitud);
    const lng = Number(longitud);

    if (lat < -90 || lat > 90) {
        throw new Error("La latitud debe estar entre -90 y 90");
    }

    if (lng < -180 || lng > 180) {
        throw new Error("La longitud debe estar entre -180 y 180");
    }
};

const validarCrearAlerta = (body = {}) => {
    const {
        titulo,
        descripcion,
        tipo,
        prioridad = "MEDIA",
        latitud,
        longitud,
        destinatarios,
        fecha_expiracion,
    } = body;

    if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
        throw new Error("El título de la alerta es obligatorio");
    }

    if (titulo.trim().length > 150) {
        throw new Error(
            "El título de la alerta no puede superar los 150 caracteres"
        );
    }

    if (
        !descripcion ||
        typeof descripcion !== "string" ||
        !descripcion.trim()
    ) {
        throw new Error("La descripción de la alerta es obligatoria");
    }

    if (!TIPOS_ALERTA.includes(tipo)) {
        throw new Error("El tipo de alerta no es válido");
    }

    if (!PRIORIDADES_ALERTA.includes(prioridad)) {
        throw new Error("La prioridad de la alerta no es válida");
    }

    if (
        !Array.isArray(destinatarios) ||
        destinatarios.length === 0
    ) {
        throw new Error(
            "Debe seleccionar al menos un destinatario"
        );
    }

    const destinatariosInvalidos = destinatarios.some(
        (usuarioId) =>
            !Number.isInteger(Number(usuarioId)) ||
            Number(usuarioId) <= 0
    );

    if (destinatariosInvalidos) {
        throw new Error(
            "La lista de destinatarios contiene identificadores inválidos"
        );
    }

    if (
        TIPOS_CON_UBICACION_OBLIGATORIA.includes(tipo)
    ) {
        validarCoordenadas({
            latitud,
            longitud,
        });
    } else {
        const tieneLatitud =
            latitud !== null &&
            latitud !== undefined &&
            latitud !== "";

        const tieneLongitud =
            longitud !== null &&
            longitud !== undefined &&
            longitud !== "";

        if (tieneLatitud !== tieneLongitud) {
            throw new Error(
                "Debe enviar latitud y longitud conjuntamente"
            );
        }

        if (tieneLatitud && tieneLongitud) {
            validarCoordenadas({
                latitud,
                longitud,
            });
        }
    }

    if (fecha_expiracion) {
        const fecha = new Date(fecha_expiracion);

        if (Number.isNaN(fecha.getTime())) {
            throw new Error(
                "La fecha de expiración no tiene un formato válido"
            );
        }

        if (fecha <= new Date()) {
            throw new Error(
                "La fecha de expiración debe ser posterior a la fecha actual"
            );
        }
    }
};

const validarRespuestaAlerta = (body = {}) => {
    const { respuesta, observacion } = body;

    if (!RESPUESTAS_ALERTA.includes(respuesta)) {
        throw new Error(
            "La respuesta debe ser ACEPTADA o RECHAZADA"
        );
    }

    if (
        observacion !== undefined &&
        observacion !== null &&
        typeof observacion !== "string"
    ) {
        throw new Error(
            "La observación debe ser una cadena de texto"
        );
    }

    if (
        respuesta === "RECHAZADA" &&
        (!observacion || !observacion.trim())
    ) {
        throw new Error(
            "Debe registrar una observación al rechazar la alerta"
        );
    }
};

const validarRegistrarDispositivo = (body = {}) => {
    const {
        token_fcm,
        plataforma,
        device_id,
    } = body;

    if (
        !token_fcm ||
        typeof token_fcm !== "string" ||
        !token_fcm.trim()
    ) {
        throw new Error("El token FCM es obligatorio");
    }

    if (!["ANDROID", "IOS"].includes(plataforma)) {
        throw new Error(
            "La plataforma debe ser ANDROID o IOS"
        );
    }

    if (
        device_id !== undefined &&
        device_id !== null &&
        typeof device_id !== "string"
    ) {
        throw new Error(
            "El identificador del dispositivo no es válido"
        );
    }
};

module.exports = {
    TIPOS_ALERTA,
    PRIORIDADES_ALERTA,
    RESPUESTAS_ALERTA,
    validarCrearAlerta,
    validarRespuestaAlerta,
    validarRegistrarDispositivo,
};