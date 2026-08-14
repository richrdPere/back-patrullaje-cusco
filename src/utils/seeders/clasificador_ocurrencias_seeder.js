// seeders/XXXXXXXXXXXXXX-seed-clasificador-ocurrencias.js

'use strict';

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        await queryInterface.bulkInsert(
            'OcurrenciaClasificadorVersiones',
            [
                {
                    nombre:
                        'Clasificador Estandarizado de Ocurrencias 2024',
                    resolucion: 'RM N.° 0427-2024-IN',
                    descripcion:
                        'Clasificador Estandarizado de Ocurrencias para el Servicio de Serenazgo Municipal.',
                    fecha_publicacion: '2024-04-05',
                    vigencia_desde: '2024-04-05',
                    vigencia_hasta: null,
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
            ],
        );

        const [versiones] = await queryInterface.sequelize.query(`
      SELECT id
      FROM OcurrenciaClasificadorVersiones
      WHERE resolucion = 'RM N.° 0427-2024-IN'
      LIMIT 1
    `);

        const versionId = versiones[0].id;

        await queryInterface.bulkInsert(
            'OcurrenciaCategoriasGenericas',
            [
                {
                    version_id: versionId,
                    codigo: '01',
                    nombre:
                        'Emisión de alertas tempranas en apoyo a la PNP, en actividades presuntamente delictivas',
                    descripcion: null,
                    orden: 1,
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
            ],
        );

        const [genericas] =
            await queryInterface.sequelize.query(`
        SELECT id
        FROM OcurrenciaCategoriasGenericas
        WHERE version_id = ${versionId}
          AND codigo = '01'
        LIMIT 1
      `);

        const categoriaGenericaId = genericas[0].id;

        await queryInterface.bulkInsert(
            'OcurrenciaCategoriasEspecificas',
            [
                {
                    categoria_generica_id:
                        categoriaGenericaId,
                    codigo: '0103',
                    nombre:
                        'Presuntas actividades contra el patrimonio',
                    descripcion: null,
                    orden: 3,
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
            ],
        );

        const [especificas] =
            await queryInterface.sequelize.query(`
        SELECT id
        FROM OcurrenciaCategoriasEspecificas
        WHERE categoria_generica_id = ${categoriaGenericaId}
          AND codigo = '0103'
        LIMIT 1
      `);

        const categoriaEspecificaId = especificas[0].id;

        await queryInterface.bulkInsert(
            'OcurrenciaModalidades',
            [
                {
                    categoria_especifica_id:
                        categoriaEspecificaId,
                    codigo: '010301',
                    nombre:
                        'Presunto robo a personas',
                    descripcion:
                        'Celulares, mochilas, carteras, billeteras, relojes, joyas y otros.',
                    requiere_autor: true,
                    requiere_victima: true,
                    requiere_conductor: false,
                    requiere_datos_pnp: false,
                    requiere_descripcion: false,
                    orden: 1,
                    vigencia_desde: '2024-04-05',
                    vigencia_hasta: null,
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
                {
                    categoria_especifica_id:
                        categoriaEspecificaId,
                    codigo: '010309',
                    nombre:
                        'Presunto hurto a personas',
                    descripcion:
                        'Celulares, mochilas, carteras, billeteras, relojes, joyas y otros.',
                    requiere_autor: true,
                    requiere_victima: true,
                    requiere_conductor: false,
                    requiere_datos_pnp: false,
                    requiere_descripcion: false,
                    orden: 9,
                    vigencia_desde: '2024-04-05',
                    vigencia_hasta: null,
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
            ],
        );

        const [modalidades] =
            await queryInterface.sequelize.query(`
        SELECT id
        FROM OcurrenciaModalidades
        WHERE codigo = '010309'
        LIMIT 1
      `);

        await queryInterface.bulkInsert(
            'OcurrenciaModalidadReglas',
            [
                {
                    modalidad_id: modalidades[0].id,
                    clave: 'MEDIO_EXCLUSIVO',
                    descripcion:
                        'Solo debe habilitarse el medio empleado HABILIDAD.',
                    parametros: JSON.stringify({
                        medios_permitidos: ['HABILIDAD'],
                    }),
                    estado: true,
                    created_at: now,
                    updated_at: now,
                },
            ],
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            'OcurrenciaModalidadReglas',
            null,
            {},
        );

        await queryInterface.bulkDelete(
            'OcurrenciaModalidades',
            null,
            {},
        );

        await queryInterface.bulkDelete(
            'OcurrenciaCategoriasEspecificas',
            null,
            {},
        );

        await queryInterface.bulkDelete(
            'OcurrenciaCategoriasGenericas',
            null,
            {},
        );

        await queryInterface.bulkDelete(
            'OcurrenciaClasificadorVersiones',
            {
                resolucion: 'RM N.° 0427-2024-IN',
            },
            {},
        );
    },
};