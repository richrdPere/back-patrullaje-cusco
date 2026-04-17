
const usuarios = new Map();

const addUser = (userId, socketId) => {
    if (!usuarios.has(userId)) {
        usuarios.set(userId, new Set());
    }
    usuarios.get(userId).add(socketId);
};

const removeUser = (userId, socketId) => {
    if (usuarios.has(userId)) {
        const sockets = usuarios.get(userId);
        sockets.delete(socketId);
        if (sockets.size === 0) usuarios.delete(userId);
    }
};

const getUserSockets = (userId) => usuarios.get(userId);

const emitToUser = (io, userId, event, data) => {
    const sockets = usuarios.get(userId);

    if (sockets) {
        sockets.forEach((socketId) => {
            io.to(socketId).emit(event, data);
        });
    }
};

module.exports = { addUser, removeUser, getUserSockets, emitToUser };