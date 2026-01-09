const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller');
const {authuser} = require('../middleware/auth.middleware');

router.post('/register',[
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long.'),
    body('fullName.firstName').isLength({min:3}).withMessage('First name must be at least 3 characters long.'),
],userController.registerUser);


router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
], userController.loginUser);


router.get('/profile',authuser, userController.userProfile);

router.get('/logout', authuser, userController.userLogout);


module.exports = router;