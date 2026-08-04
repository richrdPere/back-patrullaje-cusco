const {
  Server
} = require("socket.io");

const {
  addUser,
  removeUser,
  getUserSockets
} = require(
  "./usuariosManager"
);

const socketAuth =
  require(
    "./middleware/socketAuth"
  );

const registerHandlers =
  require(
    "./socketManager"
  );

let io;

const initSocket = server => {
  io = new Server(
    server,
    {
      cors: {
        origin: "*",
        methods: [
          "GET",
          "POST",
          "PATCH"
        ]
      }
    }
  );

  io.use(socketAuth);

  io.on(
    "connection",
    socket => {
      const userId =
        Number(
          socket.usuario.id
        );

      const rolesRaw =
        Array.isArray(
          socket.usuario?.roles
        )
          ? socket.usuario.roles
          : [];

      const roles =
        rolesRaw
          .map(rol =>
            typeof rol === "string"
              ? rol
              : rol?.nombre
          )
          .filter(Boolean);

      console.log(
        `🟢 Usuario conectado: ${userId} | Socket: ${socket.id}`
      );

      console.log(
        "USUARIO SOCKET:",
        socket.usuario
      );

      // Registrar primero la conexión
      addUser(
        userId,
        socket.id
      );

      // Rooms personales
      socket.join(
        `usuario:${userId}`
      );

      socket.join(
        `user_${userId}`
      );

      // Usuarios de central
      const rolesCentral = [
        "ADMIN",
        "OPERADOR",
        "SUPERVISOR_SERENAZGO",
        "GERENTE_SERENAZGO"
      ];

      const esUsuarioCentral =
        roles.some(rol =>
          rolesCentral.includes(rol)
        );

      if (esUsuarioCentral) {
        socket.join(
          "operadores"
        );

        socket.join(
          "central_tracking"
        );

        console.log(
          `👮 Usuario ${userId} unido a operadores y central_tracking`
        );
      }

      // Serenos
      const esSereno =
        roles.includes("SERENO") ||
        roles.includes("CONDUCTOR");

      if (esSereno) {
        socket.join(
          "serenos"
        );

        console.log(
          `🚓 Sereno ${userId} unido a room serenos`
        );
      }

      // Registrar handlers
      registerHandlers(
        io,
        socket
      );

      socket.on(
        "disconnecting",
        reason => {
          console.log(
            `⚠️ Desconectando: ${userId} | Socket: ${socket.id}`
          );

          console.log(
            `Motivo previo: ${reason}`
          );
        }
      );

      socket.on(
        "disconnect",
        reason => {
          console.log(
            `🔴 Usuario desconectado: ${userId} | Socket: ${socket.id}`
          );

          console.log(
            `Motivo: ${reason}`
          );

          removeUser(
            userId,
            socket.id
          );

          const socketsRestantes =
            getUserSockets(
              userId
            );

          if (
            !socketsRestantes ||
            socketsRestantes.size === 0
          ) {
            io.to(
              "central_tracking"
            ).emit(
              "tracking:sereno-offline",
              {
                usuarioId:
                  userId,

                realtime: {
                  online:
                    false,

                  timestamp:
                    new Date()
                      .toISOString()
                }
              }
            );
          }
        }
      );
    }
  );
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO
};
