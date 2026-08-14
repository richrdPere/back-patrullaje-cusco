// migrations/XXXXXXXXXXXXXX-create-ocurrencia-modalidad.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'OcurrenciaModalidades',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        categoria_especifica_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'OcurrenciaCategoriasEspecificas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },

        codigo: {
          type: Sequelize.STRING(6),
          allowNull: false,
          unique: true,
        },

        nombre: {
          type: Sequelize.STRING(700),
          allowNull: false,
        },

        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        requiere_autor: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        requiere_victima: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        requiere_conductor: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        requiere_datos_pnp: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        requiere_descripcion: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        orden: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },

        vigencia_desde: {
          type: Sequelize.DATEONLY,
          allowNull: true,
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

    await queryInterface.addIndex('OcurrenciaModalidades', ['codigo'], {
      unique: true,
      name: 'uq_ocu_modalidad_codigo',
    });

    await queryInterface.addIndex('OcurrenciaModalidades', ['nombre'], {
      name: 'idx_ocu_modalidad_nombre',
    });

    await queryInterface.addIndex(
      'OcurrenciaModalidades',
      ['categoria_especifica_id', 'estado'],
      {
        name: 'idx_ocu_modalidad_especifica_estado',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OcurrenciaModalidades');
  },
};