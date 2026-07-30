const { Op } = require('sequelize');
const db = require("../../../database/models");

// Modelos
const {
    PatrullajeProgramado,
    Incidencia,
    Alerta
} = db;

const getResumenOperativoService = async () => {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const [
        patrullajesProgramados,
        patrullajesAsignados,
        patrullajesEnCurso,
        patrullajesFinalizadosHoy,

        incidenciasHoy,
        incidenciasReportadas,
        incidenciasEnProceso,
        incidenciasAtendidas,
        incidenciasRecientes,

        alertasPendientes,
        alertasCriticas,
        alertasAtendidasHoy,
        alertasRecientes
    ] = await Promise.all([
        PatrullajeProgramado.count({
            where: { estado: 'PROGRAMADO' }
        }),

        PatrullajeProgramado.count({
            where: { estado: 'ASIGNADO' }
        }),

        PatrullajeProgramado.count({
            where: { estado: 'EN_CURSO' }
        }),

        PatrullajeProgramado.count({
            where: {
                estado: 'FINALIZADO',
                updatedAt: {
                    [Op.between]: [inicioDia, finDia]
                }
            }
        }),

        Incidencia.count({
            where: {
                createdAt: {
                    [Op.between]: [inicioDia, finDia]
                },
                estado: {
                    [Op.ne]: 'ELIMINADO'
                }
            }
        }),

        Incidencia.count({
            where: { estado: 'REPORTADO' }
        }),

        Incidencia.count({
            where: { estado: 'EN_PROCESO' }
        }),

        Incidencia.count({
            where: {
                estado: 'ATENDIDO',
                updatedAt: {
                    [Op.between]: [inicioDia, finDia]
                }
            }
        }),

        Incidencia.findAll({
            where: {
                estado: {
                    [Op.ne]: 'ELIMINADO'
                }
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        }),

        Alerta.count({
            where: { estado: 'PENDIENTE' }
        }),

        Alerta.count({
            where: {
                // prioridad: 'ALTA',
                estado: 'PENDIENTE'
            }
        }),

        Alerta.count({
            where: {
                estado: 'ATENDIDA',
                updatedAt: {
                    [Op.between]: [inicioDia, finDia]
                }
            }
        }),

        Alerta.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        })
    ]);

    return {
        patrullajes: {
            programados: patrullajesProgramados,
            asignados: patrullajesAsignados,
            en_curso: patrullajesEnCurso,
            finalizados_hoy: patrullajesFinalizadosHoy
        },

        incidencias: {
            total_hoy: incidenciasHoy,
            reportadas: incidenciasReportadas,
            en_proceso: incidenciasEnProceso,
            atendidas: incidenciasAtendidas,
            recientes: incidenciasRecientes
        },

        alertas: {
            pendientes: alertasPendientes,
            criticas: alertasCriticas,
            atendidas_hoy: alertasAtendidasHoy,
            recientes: alertasRecientes
        },

        ultima_actualizacion: new Date()
    };
};

module.exports = getResumenOperativoService