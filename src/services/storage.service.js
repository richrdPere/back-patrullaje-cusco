const guardarArchivoLocal = (file) => {
  return {
    url: file.path, // luego será S3 URL
    tipo: file.mimetype.startsWith("image") ? "IMAGEN" : "VIDEO"
  };
};

module.exports = {
  guardarArchivoLocal
};