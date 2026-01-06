import { Server } from 'socket.io'
import { config } from '../config/config.js'
import { logger } from '../logging/logger.js'
import { exampleHandler } from './handlers/exampleHandler.js'

/**
 * Initialize Socket.io server
 * @param {import('http').Server} httpServer - The HTTP server instance
 * @returns {Server} The initialized Socket.io server instance
 */
export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.socket.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: config.socket.pingTimeout,
    pingInterval: config.socket.pingInterval,
  })

  // Middleware for authentication (Example: JWT verification)
  io.use((socket, next) => {
    // In a real app, you would verify the token here
    // const token = socket.handshake.auth.token;
    // verify(token)...
    logger.info(`Socket connection attempt: ${socket.id}`)
    next()
  })

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    // Attach handlers
    // Handlers help organize socket logic into separate files
    exampleHandler(io, socket)

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, Reason: ${reason}`)
    })
  })

  return io
}
