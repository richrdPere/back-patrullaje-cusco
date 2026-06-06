const { Op, fn, col } = require("sequelize");
const { guardarArchivoLocal } = require("../services/storage.service");
const { uploadFileToS3, deleteFileFromS3 } = require("../services/aws-s3.service");
const db = require('../models');

const Incidencia = db.Incidencia;
const IncidenciaArchivo = db.IncidenciaArchivo;
const Usuario = db.Usuario;
const PatrullajeProgramado = db.PatrullajeProgramado;
const Zonas = db.Zonas;

// ======================================================
// 1. CREAR INCIDENCIA (CON ARCHIVOS)
// ======================================================
const registrarIncidencia = async (req, res) => {

  const t = await Incidencia.sequelize.transaction();

  try {

    console.log("JWT:", req.usuario);
    const usuario_id = req.usuario.id;

    const {
      patrullaje_id,
      tipo,
      descripcion,
      latitud,
      longitud,
      origen = "APP_MOVIL"
    } = req.body;

    console.log("📥 BODY:", req.body);
    console.log("📎 FILES:", req.files);


    console.log("patrullaje_id:", patrullaje_id);
    console.log("tipo:", typeof patrullaje_id);

    // VALIDACIONES
    if (!descripcion || !latitud || !longitud) {
      await t.rollback();

      return res.status(400).json({
        message:
          "Campos obligatorios faltantes (descripción, latitud, longitud)"
      });
    }

    // Validar coordenadas
    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);

    if (isNaN(lat) || isNaN(lng)) {
      await t.rollback();

      return res.status(400).json({
        message: "Coordenadas inválidas"
      });
    }

    // Validar patrullaje 
    let zona_id = null;

    if (patrullaje_id) {

      const patrullaje = await PatrullajeProgramado.findOne({
        where: {
          id: patrullaje_id,
          estado: {
            [Op.in]: ['ASIGNADO', 'EN_CURSO']
          }
        }
      });

      console.log(
        "PATRULLAJE JSON:",
        patrullaje ? patrullaje.toJSON() : null
      );

      console.log(
        "PATRULLAJE ZONA_ID:",
        patrullaje?.zona_id
      );

      if (!patrullaje) {
        await t.rollback();

        return res.status(404).json({
          message: "La incidencia debe estar asociada a un patrullaje activo"
        });
      }

      zona_id = patrullaje.zona_id;
    }

    // Validar zona
    const zona = await Zonas.findByPk(zona_id);
    if (!zona) {
      await t.rollback();

      return res.status(404).json({
        message: "Zona no existe"
      });
    }

    // Validar usuario
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no existe" });
    }

    // VALIDAR TIPO ENUM
    const tiposValidos = [
      "ROBO",
      "ACCIDENTE",
      "INCENDIO",
      "VIOLENCIA",
      "SOSPECHOSO",
      "OTRO"
    ];

    const tipoFinal = tiposValidos.includes(tipo) ? tipo : "OTRO";

    // CREAR INCIDENCIA
    const incidencia = await Incidencia.create(
      {
        usuario_id,
        patrullaje_id: patrullaje_id || null,
        zona_id,
        tipo: tipoFinal,
        descripcion,
        latitud: lat,
        longitud: lng,
        origen
      },
      { transaction: t }
    );

    // VALIDAR ARCHIVOS
    const archivos = Array.isArray(req.files)
      ? req.files
      : req.files
        ? Object.values(req.files).flat()
        : [];

    if (archivos.length > 5) {
      await t.rollback();
      return res.status(400).json({
        message: "Máximo 5 archivos permitidos"
      });
    }

    const getTipoArchivo = (mime) => {
      if (!mime) return "OTRO";
      if (mime.startsWith("image/")) return "IMAGEN";
      if (mime.startsWith("video/")) return "VIDEO";
      if (mime === "application/pdf") return "PDF";
      return "OTRO";
    };

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
          tipo_archivo: getTipoArchivo(file.mimetype),
          mime_type: file.mimetype,
          peso: file.size,
          sereno_id: usuario_id
        };
      });

      console.log("ARCHIVOS A BD:", archivosData);

      await IncidenciaArchivo.bulkCreate(archivosData, { transaction: t });

      // UPDATE CONTADOR REAL
      await Incidencia.update(
        { total_evidencias: archivosData.length },
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
      zona_id,
      usuario_id,
      fecha_inicio,
      fecha_fin,
      origen,
      mode = "app" // app | web
    } = req.query;

    // NORMALIZAR PAGINACIÓN
    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50); // máximo 50
    const offset = (page - 1) * limit;

    // WHERE DINÁMICO
    let where = {};

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (zona_id) where.zona_id = zona_id;
    if (usuario_id) where.usuario_id = usuario_id;
    if (origen) where.origen = origen;

    // - fechas seguras
    if (fecha_inicio && fecha_fin) {
      where.fecha_hora = {
        [Op.between]: [
          new Date(fecha_inicio),
          new Date(fecha_fin)
        ]
      };
    }

    // INCLUDE DINÁMICO
    const include = [];

    // usuario siempre útil pero liviano en app
    include.push({
      model: Usuario,
      as: "usuario",
      attributes:
        mode === "web"
          ? ["id", "nombre", "apellidos", "email", "telefono"]
          : ["id", "nombre", "apellidos"]
    });


    // - archivos SOLO en web o si se solicita explícitamente
    if (mode === "web") {
      include.push({
        model: IncidenciaArchivo,
        as: "archivos",
        where: {
          estado: "ACTIVO"
        },
        attributes: [
          "id",
          "url_archivo",
          "tipo_archivo",
          "mime_type",
          "peso"
        ]
      });
    }

    // QUERY PRINCIPAL
    const { count, rows } = await Incidencia.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [["fecha_hora", "DESC"]],
      distinct: true
    });

    // RESPONSE OPTIMIZADO
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
    const { mode = "app" } = req.query;

    // VALIDAR ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    // INCLUDE DINÁMICO
    const include = [];

    // Usuario siempre
    include.push({
      model: Usuario,
      as: "usuario",
      attributes:
        mode === "web"
          ? ["id", "nombre", "apellidos", "email", "telefono"]
          : ["id", "nombre", "apellidos"]
    });

    // Archivos SOLO en web o si se requiere detalle completo
    if (mode === "web") {
      include.push({
        model: IncidenciaArchivo,
        as: "archivos",
        attributes: [
          "id",
          "url_archivo",
          "tipo_archivo",
          "mime_type",
          "peso",
          "createdAt"
        ],
        where: {
          estado: "ACTIVO"
        },
        required: false
      });
    }

    // QUERY
    const incidencia = await Incidencia.findByPk(id, {
      include
    });

    // NOT FOUND
    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: "Incidencia no encontrada"
      });
    }

    // RESPONSE CONSISTENTE
    return res.json({
      success: true,
      data: incidencia
    });

  } catch (error) {
    console.error("❌ ERROR GET INCIDENCIA BY ID:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener incidencia",
      error: error.message
    });
  }
};

// ======================================================
// 4. ACTUALIZAR ESTADO INCIDENCIA (CON ARCHIVOS)
// ======================================================
const updateEstadoIncidencia = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      "REPORTADO",
      "EN_PROCESO",
      "ATENDIDO",
      "CERRADO"
    ];

    // VALIDACIÓN
    if (!estado) {
      await t.rollback();

      return res.status(400).json({
        message: "El estado es obligatorio"
      });
    }

    if (!estadosPermitidos.includes(estado)) {
      await t.rollback();

      return res.status(400).json({
        message: "Estado no válido",
        estadosPermitidos
      });
    }

    const incidencia = await Incidencia.findByPk(id, {
      transaction: t
    });

    if (!incidencia) {
      await t.rollback();

      return res.status(404).json({
        message: "Incidencia no encontrada"
      });
    }

    // EVITAR UPDATE INNECESARIO
    if (incidencia.estado === estado) {

      await t.rollback();

      return res.status(400).json({
        message: `La incidencia ya se encuentra en estado ${estado}`
      });
    }

    await incidencia.update(
      { estado },
      { transaction: t }
    );

    // COMMIT
    await t.commit();

    const incidenciaActualizada = await Incidencia.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombre",
            "apellidos"
          ]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos",
          where: {
            estado: "ACTIVO"
          },
          required: false
        }
      ]
    });

    return res.status(200).json({
      message: "Estado actualizado correctamente",
      incidencia: incidenciaActualizada
    });

  } catch (error) {

    await t.rollback();

    console.error(
      "ERROR UPDATE ESTADO INCIDENCIA:",
      error
    );

    return res.status(500).json({
      message: "Error al actualizar estado de incidencia",
      error: error.message
    });
  }
};

// ======================================================
// 5. ELIMINAR INCIDENCIA (CON ARCHIVOS)
// ======================================================
const deleteIncidencia = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { id } = req.params;
    const incidencia = await Incidencia.findByPk(id, {
      transaction: t
    });

    if (!incidencia) {
      await t.rollback();
      return res.status(404).json({
        message: "Incidencia no encontrada"
      });
    }

    if (incidencia.estado === "ELIMINADO") {
      await t.rollback();
      return res.status(400).json({
        message: "La incidencia ya fue eliminada"
      });
    }

    // MARCAR EVIDENCIAS COMO ELIMINADAS
    await IncidenciaArchivo.update(
      {
        estado: "ELIMINADO"
      },
      {
        where: {
          incidencia_id: id
        },
        transaction: t
      }
    );

    // MARCAR INCIDENCIA COMO ELIMINADA
    await incidencia.update(
      { estado: "ELIMINADO" },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      message: "Incidencia eliminada correctamente"
    });

  } catch (error) {

    await t.rollback();

    console.error(
      "ERROR ELIMINANDO INCIDENCIA:",
      error
    );

    return res.status(500).json({
      message: "Error al eliminar incidencia",
      error: error.message
    });
  }
};

// ======================================================
// 6. OBTENER INCIDENCIAS CERCANAS
// ======================================================
const getIncidenciasCercanas = async (req, res) => {
  try {
    const {
      latitud,
      longitud,
      radio = 1000
    } = req.query;

    // VALIDACIONES
    if (!latitud || !longitud) {
      return res.status(400).json({
        message: "Latitud y longitud son obligatorias"
      });
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    const radioMetros = parseFloat(radio);

    // RADIO EN KM
    const radioKm = radioMetros / 1000;

    const incidencias = await Incidencia.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(`
              (
                6371 *
                acos(
                  cos(radians(${lat}))
                  * cos(radians(latitud))
                  * cos(
                      radians(longitud)
                      - radians(${lng})
                  )
                  + sin(radians(${lat}))
                  * sin(radians(latitud))
                )
              )
            `),

            "distancia"
          ]
        ]
      },

      where: {
        estado: {
          [Op.notIn]: ["ELIMINADO"]
        }
      },

      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombre",
            "apellidos"
          ]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos",
          where: {
            estado: "ACTIVO"
          },
          required: false
        }
      ],

      having: db.Sequelize.literal(
        `distancia <= ${radioKm}`
      ),

      order: [
        [db.Sequelize.literal("distancia"), "ASC"]
      ]
    });

    return res.status(200).json({
      total: incidencias.length,
      radio: radioMetros,
      data: incidencias
    });

  } catch (error) {

    console.error(
      "ERROR OBTENIENDO INCIDENCIAS CERCANAS:",
      error
    );

    return res.status(500).json({
      message: "Error al obtener incidencias cercanas",
      error: error.message
    });
  }
};

// ======================================================
// 7. OBTENER INCIDENCIAS POR PATRULLAJE
// ======================================================
const getIncidenciasByPatrullaje = async (req, res) => {
  try {

    const { patrullaje_id } = req.params;

    let {
      page = 1,
      limit = 10,
      tipo,
      estado
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // VALIDAR PATRULLAJE
    const patrullaje = await PatrullajeProgramado.findByPk(patrullaje_id);

    if (!patrullaje) {
      return res.status(404).json({
        success: false,
        message: "Patrullaje no encontrado"
      });
    }

    // FILTROS
    const where = {
      patrullaje_id,
      estado: {
        [Op.ne]: "ELIMINADO"
      }
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (estado) {
      where.estado = estado;
    }

    // CONSULTA
    const { count, rows } = await Incidencia.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [["fecha_hora", "DESC"]],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombre",
            "apellidos"
          ]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos",
          where: {
            estado: "ACTIVO"
          },
          required: false,
          attributes: [
            "id",
            "url_archivo",
            "tipo_archivo",
            "mime_type",
            "peso",
            "createdAt"
          ]
        }
      ]
    });

    // RESPONSE
    return res.status(200).json({
      success: true,
      message: "Incidencias obtenidas correctamente",

      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },

      data: rows
    });

  } catch (error) {

    console.error("ERROR GET INCIDENCIAS PATRULLAJE:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener incidencias del patrullaje",
      error: error.message
    });
  }
};

// ======================================================
// 8. OBTENER INCIDENCIAS POR SERENO
// ======================================================
const getIncidenciasByUsuario = async (req, res) => {
  try {

    const { usuario_id } = req.params;

    let {
      page = 1,
      limit = 10,
      tipo,
      estado,
      patrullaje_id,
      fecha_inicio,
      fecha_fin
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // ==========================
    // VALIDAR USUARIO
    // ==========================
    const usuario = await Usuario.findByPk(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // ==========================
    // FILTROS
    // ==========================
    const where = {
      usuario_id,
      estado: {
        [Op.ne]: "ELIMINADO"
      }
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (estado) {
      where.estado = estado;
    }

    if (patrullaje_id) {
      where.patrullaje_id = patrullaje_id;
    }

    if (fecha_inicio && fecha_fin) {
      where.fecha_hora = {
        [Op.between]: [
          new Date(fecha_inicio),
          new Date(fecha_fin)
        ]
      };
    }

    // ==========================
    // CONSULTA
    // ==========================
    const { count, rows } = await Incidencia.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [["fecha_hora", "DESC"]],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombre",
            "apellidos"
          ]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos",
          where: {
            estado: "ACTIVO"
          },
          required: false,
          attributes: [
            "id",
            "url_archivo",
            "tipo_archivo",
            "mime_type",
            "peso",
            "createdAt"
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias del usuario obtenidas correctamente",

      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },

      data: rows
    });

  } catch (error) {

    console.error("ERROR GET INCIDENCIAS USUARIO:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener incidencias del usuario",
      error: error.message
    });
  }
};

// ======================================================
// 9. OBTENER EVIDENCIAS DE UNA INCIDENCIA
// ======================================================
const getEvidenciasByIncidencia = async (req, res) => {
  try {
    const { incidencia_id } = req.params;
    let {
      page = 1,
      limit = 20,
      tipo_archivo
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const incidencia = await Incidencia.findOne({
      where: {
        id: incidencia_id,
        estado: {
          [Op.ne]: "ELIMINADO"
        }
      }
    });

    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: "Incidencia no encontrada"
      });
    }

    const where = {
      incidencia_id,
      estado: "ACTIVO"
    };

    if (tipo_archivo) {
      where.tipo_archivo = tipo_archivo;
    }

    const { count, rows } =
      await IncidenciaArchivo.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]]
      });

    return res.status(200).json({
      success: true,
      message: "Evidencias obtenidas correctamente",

      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },

      data: rows
    });

  } catch (error) {

    console.error("ERROR GET EVIDENCIAS:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener evidencias",
      error: error.message
    });
  }
};

// ======================================================
// 10. AGREGAR EVIDENCIAS A UNA INCIDENCIA
// ======================================================
const addEvidenciasToIncidencia = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { incidencia_id } = req.params;

    // VALIDAR INCIDENCIA
    const incidencia = await Incidencia.findOne({
      where: {
        id: incidencia_id,
        estado: {
          [Op.ne]: "ELIMINADO"
        }
      },
      transaction: t
    });

    if (!incidencia) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Incidencia no encontrada"
      });
    }

    const archivos = Array.isArray(req.files)
      ? req.files
      : [];

    if (archivos.length === 0) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "No se recibieron archivos"
      });
    }

    const evidenciasActuales = await IncidenciaArchivo.count({
      where: {
        incidencia_id,
        estado: "ACTIVO"
      },
      transaction: t
    });

    if ((evidenciasActuales + archivos.length) > 5) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Máximo 5 evidencias por incidencia"
      });
    }

    const getTipoArchivo = (mime) => {
      if (mime.startsWith("image/")) return "IMAGEN";
      if (mime.startsWith("video/")) return "VIDEO";
      if (mime === "application/pdf") return "PDF";
      return "OTRO";
    };

    const uploadPromises = archivos.map(file =>
      uploadFileToS3({
        file,
        categoria: "incidencias",
        entidadId: incidencia.id,
        serenoId: incidencia.usuario_id
      })
    );

    const resultados = await Promise.all(uploadPromises);

    const evidencias = resultados.map((result, index) => {

      const file = archivos[index];

      return {
        incidencia_id: incidencia.id,
        url_archivo: result.url,
        key_s3: result.key,
        tipo_archivo: getTipoArchivo(file.mimetype),
        mime_type: file.mimetype,
        peso: file.size,
        sereno_id: incidencia.usuario_id
      };
    });

    await IncidenciaArchivo.bulkCreate(
      evidencias,
      { transaction: t }
    );

    await incidencia.update({
      total_evidencias:
        evidenciasActuales + evidencias.length
    }, {
      transaction: t
    });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Evidencias agregadas correctamente",
      data: evidencias
    });

  } catch (error) {

    await t.rollback();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al agregar evidencias",
      error: error.message
    });
  }
};

// ======================================================
// 11. REMOVER EVIDENCIAS DE UNA INCIDENCIA
// ======================================================
const removeEvidenciaFromIncidencia = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { evidencia_id } = req.params;

    const evidencia = await IncidenciaArchivo.findOne({
      where: {
        id: evidencia_id,
        estado: "ACTIVO"
      },
      transaction: t
    });

    if (!evidencia) {

      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Evidencia no encontrada"
      });
    }

    // ELIMINAR DE S3
    try {
      await deleteFileFromS3(
        evidencia.key_s3
      );
    } catch (err) {

      console.error(
        "Error eliminando archivo S3:",
        err
      );
    }

    // ELIMINACIÓN LÓGICA
    await evidencia.update({
      estado: "ELIMINADO"
    }, {
      transaction: t
    });

    const totalActivos =
      await IncidenciaArchivo.count({
        where: {
          incidencia_id:
            evidencia.incidencia_id,
          estado: "ACTIVO"
        },
        transaction: t
      });

    await Incidencia.update({
      total_evidencias: totalActivos
    }, {
      where: {
        id: evidencia.incidencia_id
      },
      transaction: t
    });

    // COMMIT
    await t.commit();

    return res.status(200).json({
      success: true,
      message:
        "Evidencia eliminada correctamente"
    });

  } catch (error) {
    await t.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Error al eliminar evidencia",
      error: error.message
    });
  }
};

// ======================================================
// 12. DASHBOARD DE INCIDENCIAS
// ======================================================
const getDashboardIncidencias = async (req, res) => {
  try {

    const hoy = new Date();

    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      0,
      0,
      0
    );

    const finDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      23,
      59,
      59
    );

    const inicioSemana = new Date(hoy);

    inicioSemana.setDate(
      hoy.getDate() - hoy.getDay()
    );

    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );

    // TOTALES GENERALES
    const totalIncidencias =
      await Incidencia.count({
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          }
        }
      });

    const reportadas =
      await Incidencia.count({
        where: {
          estado: "REPORTADO"
        }
      });

    const enProceso =
      await Incidencia.count({
        where: {
          estado: "EN_PROCESO"
        }
      });

    const atendidas =
      await Incidencia.count({
        where: {
          estado: "ATENDIDO"
        }
      });

    const cerradas =
      await Incidencia.count({
        where: {
          estado: "CERRADO"
        }
      });

    // TEMPORALES
    const incidenciasHoy =
      await Incidencia.count({
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          },
          fecha_hora: {
            [Op.between]: [
              inicioDia,
              finDia
            ]
          }
        }
      });

    const incidenciasSemana =
      await Incidencia.count({
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          },
          fecha_hora: {
            [Op.gte]: inicioSemana
          }
        }
      });

    const incidenciasMes =
      await Incidencia.count({
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          },
          fecha_hora: {
            [Op.gte]: inicioMes
          }
        }
      });

    // EVIDENCIAS
    const totalEvidencias =
      await IncidenciaArchivo.count({
        where: {
          estado: "ACTIVO"
        }
      });

    const imagenes =
      await IncidenciaArchivo.count({
        where: {
          estado: "ACTIVO",
          tipo_archivo: "IMAGEN"
        }
      });

    const videos =
      await IncidenciaArchivo.count({
        where: {
          estado: "ACTIVO",
          tipo_archivo: "VIDEO"
        }
      });

    // DISTRIBUCIÓN POR TIPO
    const incidenciasPorTipo =
      await Incidencia.findAll({
        attributes: [
          "tipo",
          [
            fn("COUNT", col("id")),
            "total"
          ]
        ],
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          }
        },
        group: ["tipo"]
      });

    // ÚLTIMAS INCIDENCIAS
    const ultimasIncidencias =
      await Incidencia.findAll({
        where: {
          estado: {
            [Op.ne]: "ELIMINADO"
          }
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: [
              "id",
              "nombre",
              "apellidos"
            ]
          }
        ],
        order: [
          ["fecha_hora", "DESC"]
        ],
        limit: 10
      });

    // RESPONSE
    return res.status(200).json({
      success: true,

      resumen: {
        totalIncidencias,
        reportadas,
        enProceso,
        atendidas,
        cerradas
      },

      temporal: {
        incidenciasHoy,
        incidenciasSemana,
        incidenciasMes
      },

      evidencias: {
        totalEvidencias,
        imagenes,
        videos
      },

      incidenciasPorTipo,

      ultimasIncidencias
    });

  } catch (error) {

    console.error(
      "ERROR DASHBOARD INCIDENCIAS:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error al obtener dashboard de incidencias",
      error: error.message
    });
  }
};

// ======================================================
// 13. MAPA DE INCIDENCIAS ACTIVAS
// ======================================================
const getMapaIncidenciasActivas = async (req, res) => {
  try {

    const { estado, tipo, zona_id } = req.query;

    const where = {};

    // Solo incidencias visibles
    where.estado = estado
      ? estado
      : {
        [Op.in]: [
          "REPORTADO",
          "EN_PROCESO"
        ]
      };

    if (tipo) {
      where.tipo = tipo;
    }

    if (zona_id) {
      where.zona_id = zona_id;
    }

    const incidencias = await Incidencia.findAll({
      where,

      attributes: [
        "id",
        "tipo",
        "descripcion",
        "latitud",
        "longitud",
        "estado",
        "fecha_hora",
        "total_evidencias",
        "zona_id"
      ],

      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombre",
            "apellidos"
          ]
        },

        {
          model: IncidenciaArchivo,
          as: "archivos",
          attributes: [
            "id",
            "url_archivo",
            "tipo_archivo"
          ],
          where: {
            estado: "ACTIVO"
          },
          required: false
        }
      ],

      order: [
        ["fecha_hora", "DESC"]
      ]
    });

    const markers = incidencias.map((incidencia) => ({
      id: incidencia.id,
      tipo: incidencia.tipo,
      descripcion: incidencia.descripcion,
      estado: incidencia.estado,
      fecha_hora: incidencia.fecha_hora,
      latitud: Number(incidencia.latitud),
      longitud: Number(incidencia.longitud),
      total_evidencias: incidencia.total_evidencias,
      zona_id: incidencia.zona_id,
      usuario: incidencia.usuario,
      thumbnail:
        incidencia.archivos?.length > 0
          ? incidencia.archivos[0].url_archivo
          : null
    }));

    return res.status(200).json({
      total: markers.length,
      data: markers
    });

  } catch (error) {

    console.error("ERROR MAPA INCIDENCIAS:", error);

    return res.status(500).json({
      message: "Error al obtener incidencias para mapa",
      error: error.message
    });
  }
};

module.exports = {
  registrarIncidencia,
  getIncidenciasPaginated,
  getIncidenciaById,
  updateEstadoIncidencia,
  deleteIncidencia,
  getIncidenciasCercanas,
  getIncidenciasByPatrullaje,
  getIncidenciasByUsuario,
  getEvidenciasByIncidencia,
  addEvidenciasToIncidencia,
  removeEvidenciaFromIncidencia,
  getDashboardIncidencias,
  getMapaIncidenciasActivas,

};