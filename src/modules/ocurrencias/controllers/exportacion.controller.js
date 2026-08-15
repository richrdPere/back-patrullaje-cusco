const {
    generarOcurrenciaJson,
    generarOcurrenciaPdf,
    generarOcurrenciasCsvService,
    generarOcurrenciasXlsx,
    getOcurrenciasExportablesService,
} = require("../services/ocurrencias/exportacion");

// Service
const {
    
}
/*
|--------------------------------------------------------------------------
| 1. Exportar Ocurrencias
|--------------------------------------------------------------------------
*/
const obtenerRoles = (usuario) =>
    usuario.roles ??
    usuario.rol ??
    usuario.role;

const exportarOcurrenciaController = async (
    req,
    res,
) => {
    try {
        const formato = String(
            req.query.formato || 'pdf',
        ).toLowerCase();

        if (!['pdf', 'json'].includes(formato)) {
            return res.status(400).json({
                success: false,
                message:
                    'El formato debe ser PDF o JSON.',
                code: 'FORMATO_NO_SOPORTADO',
            });
        }

        const ocurrencia = await getOcurrenciaById(
            req.params.id,
            {
                usuarioId: req.usuario.id,
                roles: obtenerRoles(req.usuario),
            },
        );

        const persona =
            req.usuario.persona;

        const generadoPor = [
            persona?.nombres,
            persona?.apellidos,
        ]
            .filter(Boolean)
            .join(' ')
            .trim() || `Usuario ${req.usuario.id}`;

        const nombreArchivo =
            ocurrencia.numero_ocurrencia ||
            `ocurrencia-${ocurrencia.id}`;

        if (formato === 'json') {
            const documento =
                generarOcurrenciaJson(
                    ocurrencia,
                    {
                        generadoPor,
                    },
                );

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${nombreArchivo}.json"`,
            );

            return res
                .status(200)
                .type('application/json')
                .send(
                    JSON.stringify(
                        documento,
                        null,
                        2,
                    ),
                );
        }

        const pdf = await generarOcurrenciaPdf(
            ocurrencia,
            {
                generadoPor,
            },
        );

        res.setHeader(
            'Content-Type',
            'application/pdf',
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${nombreArchivo}.pdf"`,
        );

        res.setHeader(
            'Content-Length',
            pdf.length,
        );

        return res.status(200).send(pdf);
    } catch (error) {
        console.error(
            'Error al generar formato de ocurrencia:',
            error,
        );

        const statusCode =
            error.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            message: 'No se pudo generar el formato de ocurrencia.',
            error: error.message
        });
    }
};


module.exports = {
    exportarOcurrenciaController,
};