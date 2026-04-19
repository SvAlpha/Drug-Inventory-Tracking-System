const jwt = require('jsonwebtoken');
const Headquarters = require('../models/Headquarters');
const Hospital = require('../models/Hospital');
const Vendor = require('../models/Vendor');
const AuditLog = require('../models/AuditLog');

// Map role string to the correct Mongoose model
const getModelByRole = (role) => {
  if (role === 'hq_admin')       return Headquarters;
  if (role === 'hospital_staff') return Hospital;
  if (role === 'vendor')         return Vendor;
  return null;
};

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route  POST /api/auth/register
// @access Open
const register = async (req, res) => {
  try {
    const { role, password, ...rest } = req.body;

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role specified.' });

    // Check duplicate email
    const existing = await Model.findOne({ email: rest.email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const user = await Model.create({ ...rest, passwordHash: password });

    const token = generateToken(user._id, role);
    res.status(201).json({ token, role, id: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/auth/login
// @access Open
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role specified.' });

    const user = await Model.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    // Save audit log
    await AuditLog.create({
      userId: user._id,
      userRole: role,
      action: 'LOGIN',
      description: `${role} logged in with email ${email}`
    });

    const token = generateToken(user._id, role);
    res.json({ token, role, id: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };
