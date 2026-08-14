// // migrations/XXXXXXXXXXXXXX-create-ocurrencia-categoria-especifica.js

// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable(
//       'OcurrenciaCategoriasEspecificas',
//       {
//         id: {
//           type: Sequelize.INTEGER.UNSIGNED,
//           autoIncrement: true,
//           primaryKey: true,
//           allowNull: false,
//         },

//         categoria_generica_id: {
//           type: Sequelize.INTEGER.UNSIGNED,
//           allowNull: false,
//           references: {
//             model: 'OcurrenciaCategoriasGenericas',
//             key: 'id',
//           },
//           onUpdate: 'CASCADE',
//           onDelete: 'RESTRICT',
//         },

//         codigo: {
//           type: Sequelize.STRING(4),
//           allowNull: false,
//         },

//         nombre: {
//           type: Sequelize.STRING(500),
//           allowNull: false,
//         },

//         descripcion: {
//           type: Sequelize.TEXT,
//           allowNull: true,
//         },

//         orden: {
//           type: Sequelize.INTEGER.UNSIGNED,
//           allowNull: false,
//           defaultValue: 0,
//         },

//         estado: {
//           type: Sequelize.BOOLEAN,
//           allowNull: false,
//           defaultValue: true,
//         },

//         created_at: {
//           type: Sequelize.DATE,
//           allowNull: false,
//         },

//         updated_at: {
//           type: Sequelize.DATE,
//           allowNull: false,
//         },
//       },
//       {
//         charset: 'utf8mb4',
//         collate: 'utf8mb4_unicode_ci',
//       },
//     );

//     await queryInterface.addConstraint(
//       'OcurrenciaCategoriasEspecificas',
//       {
//         fields: ['categoria_generica_id', 'codigo'],
//         type: 'unique',
//         name: 'uq_ocu_especifica_generica_codigo',
//       },
//     );

//     await queryInterface.addIndex(
//       'OcurrenciaCategoriasEspecificas',
//       ['codigo'],
//       {
//         name: 'idx_ocu_especifica_codigo',
//       },
//     );
//   },

//   async down(queryInterface) {
//     await queryInterface.dropTable('OcurrenciaCategoriasEspecificas');
//   },
// };