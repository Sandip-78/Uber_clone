const blackListModel = require('../models/blackListModel');
const userModel = require('../models/user_model');
const {validationResult} = require('express-validator');


const registerUser = async (req,res,next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors : errors.array()});
    }

    const {fullName, email, password} = req.body;

    if(!fullName.firstName || !email || !password){
        return res.status(400).json({message: 'All fields are required.'});
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        fullName : {
            firstName : fullName.firstName,
            lastName : fullName.lastName
        },
        email,
        password : hashedPassword 
    })

    const token = user.generateAuthToken();

    res.status(201).json({user,token});

}

const loginUser = async (req,res,next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
          return res.status(422).json({errors : errors.array()});
    }

    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({message : 'Invalid email or password'});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message : 'Invalid email or password'});
    }

    const token = user.generateAuthToken();

    res.status(200).json({user, token});
}

const userProfile = async (req,res,next) => {
    return res.status(200).json({user : req.user});
}

const userLogout = async (req,res,next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    
    await blackListModel.create({token: token});
    
    return res.status(200).json({message : "Logged out successfully"});
}

module.exports = {
    registerUser, loginUser, userProfile, userLogout
}