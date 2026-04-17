module.exports = (io, socket) => {
  socket.on("join_patrullaje", (patrullajeId) => {
    socket.join(`patrullaje_${patrullajeId}`);
    console.log(`Usuario ${socket.usuario.id} unido a patrullaje ${patrullajeId}`);
  });

  socket.on("leave_patrullaje", (patrullajeId) => {
    socket.leave(`patrullaje_${patrullajeId}`);
  });
};