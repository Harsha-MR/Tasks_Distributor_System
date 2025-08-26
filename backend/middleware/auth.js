import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Agent from '../models/Agent.js';
import SubAgent from '../models/SubAgent.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user based on role and id
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await Admin.findById(decoded.id);
        break;
      case 'agent':
        user = await Agent.findById(decoded.id);
        break;
      case 'sub-agent':
        user = await SubAgent.findById(decoded.id);
        break;
      default:
        return res.status(401).json({ message: 'Invalid user role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 4. Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'User role is not authorized to access this route' 
      });
    }
    next();
  };
};
