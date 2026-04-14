const multer = require("multer");
const path = require("path");

// =========================
// CONFIGURACIÓN DE STORAGE
// =========================
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/incidencias/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, nombre + ext);
  }

});

// =========================
// FILTRO DE ARCHIVOS
// =========================
const fileFilter = (req, file, cb) => {

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/quicktime"
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

// =========================
// CONFIG FINAL
// =========================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

module.exports = upload;