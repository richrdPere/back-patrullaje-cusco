"use strict";

const clasificador = require("./data/clasificador-ocurrencias.json");

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const transaction = await sequelize.transaction();

    try {
      const now = new Date();
      const { version, categorias } = clasificador;

      const [versionRows] = await sequelize.query(
        `SELECT id FROM ocurrencia_clasificador_versiones WHERE resolucion = :resolucion LIMIT 1`,
        { replacements: { resolucion: version.resolucion }, transaction },
      );

      let versionId;
      if (versionRows.length) {
        versionId = versionRows[0].id;
        await queryInterface.bulkUpdate(
          "ocurrencia_clasificador_versiones",
          { ...version, updated_at: now },
          { id: versionId },
          { transaction },
        );
      } else {
        await queryInterface.bulkInsert(
          "ocurrencia_clasificador_versiones",
          [{ ...version, created_at: now, updated_at: now }],
          { transaction },
        );
        const [created] = await sequelize.query(
          `SELECT id FROM ocurrencia_clasificador_versiones WHERE resolucion = :resolucion LIMIT 1`,
          { replacements: { resolucion: version.resolucion }, transaction },
        );
        versionId = created[0].id;
      }

      for (const categoria of categorias) {
        const { categorias_especificas, ...genericaData } = categoria;
        const [gRows] = await sequelize.query(
          `SELECT id FROM ocurrencia_categorias_genericas WHERE version_id = :versionId AND codigo = :codigo LIMIT 1`,
          { replacements: { versionId, codigo: genericaData.codigo }, transaction },
        );
        let genericaId;
        if (gRows.length) {
          genericaId = gRows[0].id;
          await queryInterface.bulkUpdate("ocurrencia_categorias_genericas", { ...genericaData, updated_at: now }, { id: genericaId }, { transaction });
        } else {
          await queryInterface.bulkInsert("ocurrencia_categorias_genericas", [{ ...genericaData, version_id: versionId, created_at: now, updated_at: now }], { transaction });
          const [created] = await sequelize.query(
            `SELECT id FROM ocurrencia_categorias_genericas WHERE version_id = :versionId AND codigo = :codigo LIMIT 1`,
            { replacements: { versionId, codigo: genericaData.codigo }, transaction },
          );
          genericaId = created[0].id;
        }

        for (const especifica of categorias_especificas) {
          const { modalidades, ...especificaData } = especifica;
          const [eRows] = await sequelize.query(
            `SELECT id FROM ocurrencia_categorias_especificas WHERE categoria_generica_id = :genericaId AND codigo = :codigo LIMIT 1`,
            { replacements: { genericaId, codigo: especificaData.codigo }, transaction },
          );
          let especificaId;
          if (eRows.length) {
            especificaId = eRows[0].id;
            await queryInterface.bulkUpdate("ocurrencia_categorias_especificas", { ...especificaData, updated_at: now }, { id: especificaId }, { transaction });
          } else {
            await queryInterface.bulkInsert("ocurrencia_categorias_especificas", [{ ...especificaData, categoria_generica_id: genericaId, created_at: now, updated_at: now }], { transaction });
            const [created] = await sequelize.query(
              `SELECT id FROM ocurrencia_categorias_especificas WHERE categoria_generica_id = :genericaId AND codigo = :codigo LIMIT 1`,
              { replacements: { genericaId, codigo: especificaData.codigo }, transaction },
            );
            especificaId = created[0].id;
          }

          for (const modalidad of modalidades) {
            const { reglas, ...modalidadData } = modalidad;
            const [mRows] = await sequelize.query(
              `SELECT id FROM ocurrencia_modalidades WHERE codigo = :codigo LIMIT 1`,
              { replacements: { codigo: modalidadData.codigo }, transaction },
            );
            let modalidadId;
            if (mRows.length) {
              modalidadId = mRows[0].id;
              await queryInterface.bulkUpdate("ocurrencia_modalidades", { ...modalidadData, categoria_especifica_id: especificaId, updated_at: now }, { id: modalidadId }, { transaction });
            } else {
              await queryInterface.bulkInsert("ocurrencia_modalidades", [{ ...modalidadData, categoria_especifica_id: especificaId, created_at: now, updated_at: now }], { transaction });
              const [created] = await sequelize.query(
                `SELECT id FROM ocurrencia_modalidades WHERE codigo = :codigo LIMIT 1`,
                { replacements: { codigo: modalidadData.codigo }, transaction },
              );
              modalidadId = created[0].id;
            }

            for (const regla of reglas) {
              const reglaData = { ...regla, parametros: JSON.stringify(regla.parametros) };
              const [rRows] = await sequelize.query(
                `SELECT id FROM ocurrencia_modalidad_reglas WHERE modalidad_id = :modalidadId AND clave = :clave LIMIT 1`,
                { replacements: { modalidadId, clave: regla.clave }, transaction },
              );
              if (rRows.length) {
                await queryInterface.bulkUpdate("ocurrencia_modalidad_reglas", { ...reglaData, updated_at: now }, { id: rRows[0].id }, { transaction });
              } else {
                await queryInterface.bulkInsert("ocurrencia_modalidad_reglas", [{ ...reglaData, modalidad_id: modalidadId, created_at: now, updated_at: now }], { transaction });
              }
            }
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const transaction = await sequelize.transaction();
    try {
      const [versions] = await sequelize.query(
        `SELECT id FROM ocurrencia_clasificador_versiones WHERE resolucion = :resolucion LIMIT 1`,
        { replacements: { resolucion: clasificador.version.resolucion }, transaction },
      );
      if (versions.length) {
        const versionId = versions[0].id;
        await sequelize.query(
          `UPDATE ocurrencia_modalidad_reglas r
             INNER JOIN ocurrencia_modalidades m ON m.id = r.modalidad_id
             INNER JOIN ocurrencia_categorias_especificas e ON e.id = m.categoria_especifica_id
             INNER JOIN ocurrencia_categorias_genericas g ON g.id = e.categoria_generica_id
           SET r.estado = 0, r.updated_at = :now
           WHERE g.version_id = :versionId`,
          { replacements: { versionId, now: new Date() }, transaction },
        );
        await sequelize.query(
          `UPDATE ocurrencia_modalidades m
             INNER JOIN ocurrencia_categorias_especificas e ON e.id = m.categoria_especifica_id
             INNER JOIN ocurrencia_categorias_genericas g ON g.id = e.categoria_generica_id
           SET m.estado = 0, m.updated_at = :now
           WHERE g.version_id = :versionId`,
          { replacements: { versionId, now: new Date() }, transaction },
        );
        await sequelize.query(
          `UPDATE ocurrencia_categorias_especificas e
             INNER JOIN ocurrencia_categorias_genericas g ON g.id = e.categoria_generica_id
           SET e.estado = 0, e.updated_at = :now
           WHERE g.version_id = :versionId`,
          { replacements: { versionId, now: new Date() }, transaction },
        );
        await queryInterface.bulkUpdate("ocurrencia_categorias_genericas", { estado: false, updated_at: new Date() }, { version_id: versionId }, { transaction });
        await queryInterface.bulkUpdate("ocurrencia_clasificador_versiones", { estado: false, updated_at: new Date() }, { id: versionId }, { transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};