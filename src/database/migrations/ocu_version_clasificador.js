// migrations/XXXXXXXXXXXXXX-create-ocurrencia-clasificador-version.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'OcurrenciaClasificadorVersiones',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        nombre: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },

        resolucion: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },

        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        fecha_publicacion: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },

        vigencia_desde: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },

        vigencia_hasta: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },

        estado: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OcurrenciaClasificadorVersiones');
  },
};