import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

let socketInstance = null  // singleton — one connection per session

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    // Reuse existing connection if already open
    if (socketInstance?.connected) {
      socketRef.current = socketInstance
      return
    }

    // Get JWT token from cookie via /auth/me — we need it for socket auth
    // We store it in memory when user logs in
    const token = localStorage.getItem('socket_token')

    socketInstance = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      auth:              { token },
      withCredentials:   true,
      transports:        ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () =>
      console.log('Socket connected:', socketInstance.id))
    socketInstance.on('connect_error', (err) =>
      console.error('Socket error:', err.message))

    return () => {
      // Don't disconnect on component unmount — keep singleton alive
    }
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