const { getIO } = require("../index");

module.exports = (io, socket) => {
    socket.on("send_notification", (data) => {
        const { userId, message } = data;

        io.to(userId).emit("notificacion", message);
    });
};