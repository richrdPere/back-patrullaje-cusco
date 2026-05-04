const multer = require("multer");
const path = require("path");

// =========================
// STORAGE EN MEMORIA
// =========================
const storage = multer.memoryStorage();

// =========================
// FILTRO DE ARCHIVOS
// =========================
const fileFilter = (req, file, cb) => {

  console.log("📂 Archivo recibido:");
  console.log("👉 Nombre:", file.originalname);
  console.log("👉 MIME:", file.mimetype);
  console.log("👉 EXT:", path.extname(file.originalname));

  const extensionesPermitidas = [
    ".jpg", ".jpeg", ".png", ".heic", ".heif",
    ".mp4", ".mov"
  ];

  const extValida = extensionesPermitidas.includes(
    path.extname(file.originalname).toLowerCase()
  );

  if (extValida) {
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
    fileSize: 20 * 1024 * 1024
  }
});

module.exports = upload;