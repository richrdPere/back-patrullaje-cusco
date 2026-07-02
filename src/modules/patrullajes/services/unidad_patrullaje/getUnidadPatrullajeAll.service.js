const db = require("../../../../database/models");

// Modelos
const { UnidadPatrullaje } = db;

const getUnidadesPAllService =
    async () => {

        const unidades =
            await UnidadPatrullaje.findAll({

                order: [
                    ["id", "ASC"]
                ]

            });

        return {
            total: unidades.length,
            unidades
        };
    }

module.exports = getUnidadesPAllService;