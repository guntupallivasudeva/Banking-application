import Joi from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Joi schema for input validation (same rules as previous GraphQL schema)
const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const signup = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = new User(req.body);
    await user.save();
    // Return basic public fields
    return res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    return res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8d' });

    // Return token and sanitized user
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    return res.json({ token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

export const adminLogin = async (req, res) => {
  // Reuse login logic but enforce admin role
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admin only.' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8d' });
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    return res.json({ token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Admin login failed: ' + err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const input = req.body;

  // Ensure authenticated
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  // Only the owner or an admin can update
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access. You can only update your own profile.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, input, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    const safeUser = { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role };
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user: ' + err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  // Only the owner or an admin can delete
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access. You can only delete your own profile.' });
  }

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
};
