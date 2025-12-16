export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('join_dashboard', () => {
      socket.join('dashboard');
    });
  });
}
