
const usuarios = new Map();

/**
 * Agrega un socket a un usuario.
 */
const addUser = (userId, socketId) => {
    if (!usuarios.has(userId)) {
        usuarios.set(userId, new Set());
    }
    usuarios.get(userId).add(socketId);
};

/**
 * Elimina un socket de un usuario.
 */
const removeUser = (userId, socketId) => {
    if (usuarios.has(userId)) {
        const sockets = usuarios.get(userId);
        sockets.delete(socketId);
        if (sockets.size === 0) usuarios.delete(userId);
    }
};

/**
 * Devuelve los sockets activos de un usuario.
 */
const getUserSockets = (userId) => { return usuarios.get(Number(userId)); };

/**
 * Verifica si un usuario tiene al menos un socket conectado.
 */
const isUserConnected = (userId) => {
    const sockets = usuarios.get(
        Number(userId)
    );

    return Boolean(
        sockets &&
        sockets.size > 0
    );
};

/**
 * Devuelve los IDs de todos los usuarios que tienen al menos un socket conectado.
 */
const getConnectedUserIds = () => {
    return Array.from(
        usuarios.keys()
    );
};

/**
 * Cantidad de usuarios distintos conectados.
 */
const getConnectedUsersCount = () => {
    return usuarios.size;
};

/**
 * Emitir evento a todos los sockets
 * de un usuario.
 */
const emitToUser = (io, userId, event, data) => {
    const sockets = usuarios.get(
        Number(userId)
    );

    if (!sockets) {
        return;
    }

    sockets.forEach(socketId => {
        io.to(socketId).emit(
            event,
            data
        );
    });
};

module.exports = {
    addUser,
    removeUser,
    getUserSockets,
    isUserConnected,
    getConnectedUserIds,
    getConnectedUsersCount,
    emitToUser
};