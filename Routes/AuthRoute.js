const express = require('express');

const router = express.Router();

const authController = require('../Controller/authController');
const isAuth = require('../middleware/is-auth');
router.post('/login', authController.login);
router.get('/retryLoging', isAuth, authController.retryLoging)
router.post('/signup', authController.signup)
router.post('/requestpasswordreset', authController.requestPasswordReset);
router.post('/verifytoken', authController.verifyToken );
router.post('/newpassword/:userId', authController.setNewPassword)


module.exports = router