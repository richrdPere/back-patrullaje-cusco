const registerIncidenciaService = require("./registrarIncidencia.service");
const getIncidenciasPaginatedService = require("./getIncidenciasPaginated.service");
const getIncidenciaByIdService = require("./getIncidenciaById.service");
const updateEstadoIncidenciaService = require("./updateEstadoIncidencia.service");
const deleteIncidenciaService = require("./deleteIncidencia.service");
const getIncidenciasByUsuarioService = require("./getIncidenciaByUsuario.service");
const getMisIncidenciasService = require("./getMisIncidencias.service");
const getIncidenciasByPatrullajeService = require("./getIncidenciasByPatrullaje.service");
const getIncidenciasByZonaService = require("./getIncidenciasByZona.service");
const getIncidenciasCercanasService = require("./getIncidenciasCercanas.service")
const addArchivosIncidenciaService = require("./addArchivosIncidencia.service");
const deleteArchivoIncidenciaService = require("./deleteArchivoIncidencia.service");
const getArchivosByIncidenciaService = require("./getArchivosByIncidencia.service");
const getResumenIncidenciasService = require("./getResumenIncidencias.service");
const getIncidenciasByFechaService = require("./getIncidenciasByFecha.service")
const updateEstadoMasivoIncidenciasService = require("./updateEstadoMasivoIncidencias.service");


module.exports = {
    registerIncidenciaService,
    getIncidenciasPaginatedService,
    getIncidenciaByIdService,
    updateEstadoIncidenciaService,
    deleteIncidenciaService,
    getIncidenciasByUsuarioService,
    getMisIncidenciasService,
    getIncidenciasByPatrullajeService,
    getIncidenciasByZonaService,
    getIncidenciasCercanasService,
    addArchivosIncidenciaService,
    deleteArchivoIncidenciaService,
    getArchivosByIncidenciaService,
    getResumenIncidenciasService,
    getIncidenciasByFechaService,
    updateEstadoMasivoIncidenciasService
}