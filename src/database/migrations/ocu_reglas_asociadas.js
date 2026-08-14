// migrations/XXXXXXXXXXXXXX-create-ocurrencia-modalidad-regla.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'OcurrenciaModalidadReglas',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        modalidad_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'OcurrenciaModalidades',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },

        clave: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },

        descripcion: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },

        parametros: {
          type: Sequelize.JSON,
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

    await queryInterface.addConstraint(
      'OcurrenciaModalidadReglas',
      {
        fields: ['modalidad_id', 'clave'],
        type: 'unique',
        name: 'uq_ocu_modalidad_regla_clave',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OcurrenciaModalidadReglas');
  },
};