import { io } from 'socket.io-client'

let socket = null

/**
 * Lazily creates (or returns the existing) socket connection, authenticated
 * with the current JWT. Reconnection is handled by socket.io-client's
 * built-in exponential backoff — configured explicitly here rather than
 * relying on defaults, so the retry behavior is deliberate, not accidental.
 */
export function connectSocket(token) {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}
