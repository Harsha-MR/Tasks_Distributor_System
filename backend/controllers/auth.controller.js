import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Agent from '../models/Agent.js';
import SubAgent from '../models/SubAgent.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Try to find user in all collections
    const admin = await Admin.findOne({ email }).select('+password');
    const agent = await Agent.findOne({ email }).select('+password').populate('admin', 'name email');
    const subAgent = await SubAgent.findOne({ email }).select('+password').populate('agent', 'name email');

    let user = admin || agent || subAgent;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Determine role based on collection and ensure it's set
    let userRole;
    if (admin) {
      userRole = 'admin';
    } else if (agent) {
      userRole = 'agent';
    } else if (subAgent) {
      userRole = 'subagent';
    } else {
      userRole = user.role;
    }

    // Generate token
    const token = generateToken(user._id, userRole);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole
    };

    // Add additional data based on role
    if (userRole === 'agent') {
      userData.admin = user.admin;
    } else if (userRole === 'subagent') {
      userData.agent = user.agent;
    }

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
