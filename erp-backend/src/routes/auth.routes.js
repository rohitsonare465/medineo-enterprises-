const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getMe,
  refreshToken,
  updatePassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../middleware/validation');

// Public routes
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/password', updatePassword);

// Owner only routes
router.use(authorize('owner'));
router.post('/register', registerValidation, register);
router.route('/users')
  .get(getUsers)
  .post(registerValidation, createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
