const multer = require("multer");
const path = require("path");

// ======================================================
// CONFIGURACIÓN
// ======================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILES = 5;

// ======================================================
// STORAGE EN MEMORIA
// ======================================================

const storage = multer.memoryStorage();

// ======================================================
// TIPOS PERMITIDOS
// ======================================================

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".mp4",
  ".mov",
];

const allowedMimeTypes = [
  // Imágenes
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",

  // Videos
  "video/mp4",
  "video/quicktime",
];

// ======================================================
// FILTRO
// ======================================================

const fileFilter = (req, file, cb) => {
  console.log("\n========== ARCHIVO RECIBIDO ==========");
  console.log("Nombre :", file.originalname);
  console.log("MIME   :", file.mimetype);
  console.log("Tamaño :", file.size);
  console.log("======================================");

  const extension = path.extname(file.originalname).toLowerCase();

  const validExtension = allowedExtensions.includes(extension);
  const validMime = allowedMimeTypes.includes(file.mimetype);

  if (!validExtension) {
    return cb(
      new Error(
        `La extensión ${extension} no está permitida.`
      ),
      false
    );
  }

  if (!validMime) {
    return cb(
      new Error(
        `El tipo MIME ${file.mimetype} no está permitido.`
      ),
      false
    );
  }

  cb(null, true);
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

module.exports = upload;