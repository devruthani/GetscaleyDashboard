/**
 * Example Socket Handler
 * 
 * This file demonstrates how to structure socket event listeners and emitters.
 * Keeping handlers separate allows for better organization and testing.
 * 
 * @param {import('socket.io').Server} io - Global IO instance (for broadcasting)
 * @param {import('socket.io').Socket} socket - Individual socket connection
 */
export function exampleHandler(io, socket) {
  // Listen for a specific event from the client
  socket.on('ping', (data) => {
    // Log the received data
    // logger.info(`Received ping from ${socket.id}:`, data);

    // Emit a response back to the specific client
    socket.emit('pong', { message: 'Hello from server!', received: data })
  })

  // Example of joining a room (useful for chat, notifications, etc.)
  socket.on('join_room', (roomName) => {
    socket.join(roomName)
    socket.to(roomName).emit('user_joined', { userId: socket.id, room: roomName })
  })

  // Example of broadcasting to all clients
  // io.emit('announcement', { message: 'Server is going down for maintenance' });
}
