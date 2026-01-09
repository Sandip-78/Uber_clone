const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const captainController = require('../controllers/captain.contoller');
const {authCaptain} = require('../middleware/auth.middleware');

router.post('/register',[
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('fullName.firstName').isLength({min:3}).withMessage('First name must be at least 3 characters long.'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long.') ,
    body('vehical.color').notEmpty().withMessage('Vehicle color is required.'),
    body('vehical.plateNo').isLength({min:3}).withMessage('Plate number must be at least 3 characters long.'),
    body('vehical.capacity').isInt({min:1}).withMessage('Capacity must be at least 1.'),
    body('vehical.vehicalType').isIn(['auto', 'bike', 'activa', 'car']).withMessage('Vehicle type is required.')
] ,captainController.captainRegister); 

router.post('/login',[
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long.')
], captainController.captainLogin);

router.get('/profile', authCaptain,captainController.captainProfile);

router.get('/logout', authCaptain, captainController.captainLogout);

module.exports = router;

