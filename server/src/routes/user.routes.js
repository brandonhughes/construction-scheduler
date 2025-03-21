const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// Get all users - Admin and Manager only
router.get('/', authenticate, authorizeRoles('admin', 'manager'), userController.getAllUsers);

// Get user by ID - Admin, Manager and User (self only)
router.get('/:id', authenticate, (req, res, next) => {
  // Allow users to access their own profile
  if (req.user.id === req.params.id || ['admin', 'manager'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, userController.getUserById);

// Update user - Admin for any user, User for self only
router.put('/:id', authenticate, (req, res, next) => {
  // Users can only update their own info and cannot change role
  if (req.user.role !== 'admin' && (req.user.id !== req.params.id || req.body.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, userController.updateUser);

// Delete user - Admin only
router.delete('/:id', authenticate, authorizeRoles('admin'), userController.deleteUser);

// Change password - Self only or Admin
router.post('/:id/change-password', authenticate, (req, res, next) => {
  if (req.user.id === req.params.id || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, userController.changePassword);

module.exports = router;
