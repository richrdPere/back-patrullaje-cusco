// controllers/ocurrencias/clasificador-ocurrencias.controller.js

const {
    changeEstadoModalidadService,
    getClasificadorArbolService,
    getModalidadByCodigoService,
    getModalidadesPaginadasService,
} = require("../services/clasificadores");
/*
|--------------------------------------------------------------------------
| 1. Obtener Clasificador Paginado
|--------------------------------------------------------------------------
*/
const getClasificadorPaginadoController = async (req, res) => {
    try {
        const result = await getModalidadesPaginadasService(req.query);

        return res.status(200).json({
            success: true,
            message: 'Clasificador de ocurrencias obtenido correctamente.',
            data: result,
        });
    } catch (error) {
        console.error('Error al obtener el clasificador:', error,);

        return res.status(500).json({
            success: false,
            message: 'No se pudo obtener el clasificador de ocurrencias.',
            error: error.message,
        });
    }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener Clasificador Arbol
|--------------------------------------------------------------------------
*/
const getClasificadorArbolController = async (req, res) => {
    try {
        const soloActivos = req.query.solo_activos !== 'false';

        const clasificador = await getClasificadorArbolService({ soloActivos, });

        return res.status(200).json({
            success: true,
            message: 'Árbol del clasificador obtenido correctamente.',
            data: clasificador,
        });
    } catch (error) {
        console.error(
            'Error al obtener el árbol del clasificador:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'No se pudo obtener el árbol del clasificador.',
            error: error.message,
        });
    }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Modalidad por Codigo
|--------------------------------------------------------------------------
*/
const getModalidadByCodigoController = async (req, res) => {
    try {
        const { codigo } = req.params;

        if (!/^\d{6}$/.test(codigo)) {
            return res.status(400).json({
                success: false,
                message:
                    'El código debe contener exactamente seis dígitos.',
            });
        }

        const modalidad = await getModalidadByCodigoService(codigo);

        if (!modalidad) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el código de ocurrencia solicitado.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Código de ocurrencia obtenido correctamente.',
            data: modalidad,
        });
    } catch (error) {
        console.error('Error al consultar la modalidad:', error);

        return res.status(500).json({
            success: false,
            message: 'No se pudo obtener el código de ocurrencia.',
            error: error.message,
        });
    }
};
/*
|--------------------------------------------------------------------------
| 4. Cambiar Estado Modalidad
|--------------------------------------------------------------------------
*/
const changeEstadoModalidadController = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (typeof estado !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'El campo estado debe ser booleano.',
            });
        }

        const modalidad = await changeEstadoModalidadService(id, estado);

        if (!modalidad) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el código de ocurrencia.',
            });
        }

        return res.status(200).json({
            success: true,
            message: estado
                ? 'Código de ocurrencia activado correctamente.'
                : 'Código de ocurrencia desactivado correctamente.',
            data: modalidad,
        });
    } catch (error) {
        console.error('Error al cambiar el estado:', error);

        return res.status(500).json({
            success: false,
            message: 'No se pudo cambiar el estado del código.',
            error: error.message,
        });
    }
};

module.exports = {
    changeEstadoModalidadController,
    getClasificadorArbolController,
    getClasificadorPaginadoController,
    getModalidadByCodigoController,
};