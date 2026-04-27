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

  // 🔍 DEBUG COMPLETO
  console.log("📂 Archivo recibido:");
  console.log("👉 Nombre:", file.originalname);
  console.log("👉 MIME:", file.mimetype);
  console.log("👉 EXT:", path.extname(file.originalname));

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/heic",       // agregado
    "image/heif",       // agregado
    "video/mp4",
    "video/quicktime",
    "video/x-matroska"  // opcional (algunos Android)
  ];

  const extensionesPermitidas = [
    ".jpg",
    ".jpeg",
    ".png",
    ".heic",
    ".heif",
    ".mp4",
    ".mov"
  ];

  const mimeValido = tiposPermitidos.includes(file.mimetype);
  const extValida = extensionesPermitidas.includes(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeValido || extValida) {
    console.log("✅ Archivo permitido");
    cb(null, true);
  } else {
    console.log("❌ Archivo rechazado");
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