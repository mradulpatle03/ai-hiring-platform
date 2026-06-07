import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  })
  res.status(statusCode).json({ success: true, user })
}

export const register = async (req, res) => {
  const { name, email, password, role, company } = req.body
  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ message: 'Email already in use' })

  const user = await User.create({ name, email, password, role, company })
  sendTokenResponse(user, 201, res)
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' })

  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' })

  sendTokenResponse(user, 200, res)
}

export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ success: true, message: 'Logged out' })
}

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}