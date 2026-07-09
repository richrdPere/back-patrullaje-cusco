const getTipoArchivo = (mime) => {
    if (!mime) return "OTRO";
    if (mime.startsWith("image/")) return "IMAGEN";
    if (mime.startsWith("video/")) return "VIDEO";
    if (mime === "application/pdf") return "PDF";
    return "OTRO";
};