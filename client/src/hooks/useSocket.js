import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

let socketInstance = null

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    if (socketInstance?.connected) {
      socketRef.current = socketInstance
      return
    }

    // No token needed — cookie is sent automatically with withCredentials
    socketInstance = io(
      import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
      {
        withCredentials: true,   // sends the HTTP-only cookie automatically
        transports: ['websocket', 'polling'],
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    )

    socketRef.current = socketInstance

    socketInstance.on('connect', () =>
      console.log('Socket connected:', socketInstance.id))
    socketInstance.on('connect_error', (err) =>
      console.error('Socket error:', err.message))

    return () => {}
  }, [user])

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler)
  }, [])

  return { socket: socketRef.current, emit, on, off }
}