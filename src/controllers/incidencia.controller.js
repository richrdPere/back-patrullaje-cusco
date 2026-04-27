const { Op } = require("sequelize");
const { guardarArchivoLocal } = require("../services/storage.service");
const { uploadFileToS3, deleteFileFromS3 } = require("../services/aws-s3.service");
const db = require('../models');

const Incidencia = db.Incidencia;
const IncidenciaArchivo = db.IncidenciaArchivo;
const Usuario = db.Usuario;
const PatrullajeProgramado = db.PatrullajeProgramado;

// ======================================================
// 1. CREAR INCIDENCIA (CON ARCHIVOS)
// ======================================================
const registrarIncidencia = async (req, res) => {

  const t = await Incidencia.sequelize.transaction();

  try {

    const {
      usuario_id,
      patrullaje_id,
      tipo,
      descripcion,
      latitud,
      longitud
    } = req.body;

    console.log("📥 BODY:", req.body);
    console.log("📎 FILES:", req.files);

    // VALIDACIONES
    if (!usuario_id || !descripcion || !latitud || !longitud) {
      return res.status(400).json({
        message: "Campos obligatorios faltantes"
      });
    }

    // Validar usuario
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    // Validar patrullaje (opcional)
    if (patrullaje_id) {
      const patrullaje = await PatrullajeProgramado.findByPk(patrullaje_id);
      if (!patrullaje) {
        return res.status(404).json({ message: "Patrullaje no existe" });
      }
    }

    // CREAR INCIDENCIA
    const incidencia = await Incidencia.create({
      usuario_id,
      patrullaje_id,
      tipo,
      descripcion,
      latitud,
      longitud
    }, { transaction: t });

    // VALIDAR ARCHIVOS
    const archivos = req.files || [];

    if (archivos.length > 5) {
      return res.status(400).json({
        message: "Máximo 5 archivos permitidos"
      });
    }

    // SUBIR ARCHIVOS A S3
    let archivosData = [];

    if (archivos.length > 0) {

      const uploadPromises = archivos.map(file =>
        uploadFileToS3({
          file,
          categoria: "incidencias",
          entidadId: incidencia.id,
          serenoId: usuario_id // aquí usas el usuario como sereno
        })
      );

      const resultados = await Promise.all(uploadPromises);

      archivosData = resultados.map((result, index) => {

        const file = archivos[index];

        console.log("Subido a S3:", result.url);

        return {
          incidencia_id: incidencia.id,
          url_archivo: result.url,
          key_s3: result.key,
          tipo_archivo: file.mimetype.startsWith("image")
            ? "IMAGEN"
            : file.mimetype.startsWith("video")
              ? "VIDEO"
              : file.mimetype === "application/pdf"
                ? "PDF"
                : "OTRO",
          mime_type: file.mimetype,
          peso: file.size,
          sereno_id: usuario_id
        };
      });

      console.log("ARCHIVOS A BD:", archivosData);

      await IncidenciaArchivo.bulkCreate(archivosData, { transaction: t });

      await Incidencia.update(
        { total_evidencias: archivos.length },
        { where: { id: incidencia.id }, transaction: t }
      );
    }

    // COMMIT
    await t.commit();

    res.status(201).json({
      message: "Incidencia registrada correctamente",
      incidencia,
      archivos: archivosData
    });

  } catch (error) {
    console.error("ERROR DETALLADO:", error);
    await t.rollback();

    res.status(500).json({
      message: "Error al registrar incidencia",
      error: error.message
    });
  }
};

// ======================================================
// 2. LISTAR INCIDENCIA (CON ARCHIVOS) + PAGINADO
// ======================================================
const getIncidenciasPaginated = async (req, res) => {
  try {

    let {
      page = 1,
      limit = 10,
      tipo,
      estado,
      fecha_inicio,
      fecha_fin
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let where = {};

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    if (fecha_inicio && fecha_fin) {
      where.fecha_hora = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    const { count, rows } = await Incidencia.findAndCountAll({
      where,
      limit,
      offset,
      order: [["fecha_hora", "DESC"]],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "apellidos"]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos"
        }
      ],
      distinct: true
    });

    res.json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar incidencias",
      error: error.message
    });
  }
};

// ======================================================
// 3. INCIDENCIA POR ID (CON ARCHIVOS)
// ======================================================
const getIncidenciaById = async (req, res) => {
  try {

    const { id } = req.params;

    const incidencia = await Incidencia.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "apellidos"]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos"
        }
      ]
    });

    if (!incidencia) {
      return res.status(404).json({
        message: "Incidencia no encontrada"
      });
    }

    res.json(incidencia);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener incidencia",
      error: error.message
    });
  }
};

// ======================================================
// 4. ACTUALIZAR ESTADO INCIDENCIA (CON ARCHIVOS)
// ======================================================
const updateEstadoIncidencia = async (req, res) => {
  try {

    const { id } = req.params;
    const { estado } = req.body;

    const incidencia = await Incidencia.findByPk(id);

    if (!incidencia) {
      return res.status(404).json({
        message: "Incidencia no encontrada"
      });
    }

    await incidencia.update({ estado });

    res.json({
      message: "Estado actualizado",
      incidencia
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar estado",
      error: error.message
    });
  }
};

// ======================================================
// 5. ELIMINAR INCIDENCIA (CON ARCHIVOS)
// ======================================================
const deleteIncidencia = async (req, res) => {

  const t = await Incidencia.sequelize.transaction();

  try {

    const { id } = req.params;

    const incidencia = await Incidencia.findByPk(id);

    if (!incidencia) {
      return res.status(404).json({
        message: "Incidencia no encontrada"
      });
    }

    // 1. OBTENER ARCHIVOS
    const archivos = await IncidenciaArchivo.findAll({
      where: { incidencia_id: id },
      transaction: t
    });

    console.log("Archivos encontrados:", archivos.length);

    // 2. ELIMINAR EN S3
    const deletePromises = archivos.map(file =>
      deleteFileFromS3(file.key_s3)
    );

    await Promise.all(deletePromises);

    // 3. ELIMINAR EN BD
    await IncidenciaArchivo.destroy({
      where: { incidencia_id: id },
      transaction: t
    });

    // 4. ELIMINAR INCIDENCIA
    await incidencia.destroy({ transaction: t });

    await t.commit();

    res.json({
      message: "Incidencia y evidencias eliminadas correctamente"
    });

  } catch (error) {

    await t.rollback();

    console.error("ERROR ELIMINANDO:", error);

    res.status(500).json({
      message: "Error al eliminar incidencia",
      error: error.message
    });
  }
};

module.exports = {
  registrarIncidencia,
  getIncidenciasPaginated,
  getIncidenciaById,
  updateEstadoIncidencia,
  deleteIncidencia
};