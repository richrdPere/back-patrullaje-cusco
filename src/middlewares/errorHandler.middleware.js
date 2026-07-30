const multer = require("multer");

const errorHandler = (
    error,
    req,
    res,
    next
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message:
                    "Uno de los archivos supera el tamaño permitido.",
                error:
                    "El tamaño máximo permitido es de 20 MB por archivo.",
            });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message:
                    "Se excedió la cantidad de archivos permitida.",
                error:
                    "Solo se permiten hasta 5 archivos.",
            });
        }

        return res.status(400).json({
            success: false,
            message:
                "No se pudieron procesar los archivos.",
            error: error.message,
        });
    }

    if (
        error.message ===
        "Tipo de archivo no permitido"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "El formato del archivo no está permitido.",
            error: error.message,
        });
    }

    return next(error);
};

module.exports = errorHandler;