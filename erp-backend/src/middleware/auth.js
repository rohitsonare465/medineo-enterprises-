const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { PERMISSIONS } = require('../config/constants');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Check if password was changed after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'Password recently changed. Please log in again.'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize by role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check specific permission
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to perform this action`
      });
    }
    next();
  };
};

// Check multiple permissions (any)
exports.hasAnyPermission = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to perform this action`
      });
    }
    next();
  };
};

// Check multiple permissions (all)
exports.hasAllPermissions = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: `You don't have all required permissions to perform this action`
      });
    }
    next();
  };
};
