import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // checking session on load

  // On app load, check if user is already logged in (cookie still valid)
  useEffect(() => {
  api.get('/auth/me')
    .then(res =>{
      setUser(res.data.user)
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        setUser(null) // not logged in
      } else {
        console.error(err)
      }
    })
    .finally(() => setLoading(false))
}, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setUser(res.data.user)
    if (res.data.token) localStorage.setItem('socket_token', res.data.token)
    return res.data.user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)