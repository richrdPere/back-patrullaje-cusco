// src/config/sequelize-cli.config.js

require('dotenv').config();

const baseConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT,

    logging: false,

    timezone: '-05:00',

    dialectOptions: {
        dateStrings: true,
        typeCast: true,
    },

    define: {
        underscored: true,
        timestamps: true,
    },
};

module.exports = {
    development: {
        ...baseConfig,
    },

    test: {
        ...baseConfig,
        database:
            process.env.DB_NAME_TEST ||
            `${process.env.DB_NAME}_test`,
    },

    production: {
        ...baseConfig,

        logging: false,

        dialectOptions:
            process.env.DB_SSL === 'true'
                ? {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                }
                : {
                    dateStrings: true,
                    typeCast: true,
                },
    },
};