import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protect = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'Not authenticated' })

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)
  if (!req.user) return res.status(401).json({ message: 'User not found' })
  next()
}

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Access denied' })
  next()
}