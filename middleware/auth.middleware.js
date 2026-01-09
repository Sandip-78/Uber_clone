const blackListModel = require('../models/blackListModel');
const captainModel = require('../models/captain.Model');
const userModel = require('../models/user_model');
const jwt = require('jsonwebtoken');

const authuser = async (req,res,next) => {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({message : "Unauthorized"});
    }

    const isblackListed = await blackListModel.findOne({token: token});

    if(isblackListed){
        return res.status(401).json({message : "Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await userModel.findById(decoded._id);

        req.user = user;
        return next();

    }catch(err){
        return res.status(401).json({message : "Unauthorized"});
    }
}

const authCaptain = async (req,res,next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message : "Unauthorized"});
    }

    const isblackListed = await blackListModel.findOne({token: token});

    if(isblackListed){
        return res.status(401).json({message : "Unauthorized"});
    }


    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const captain = await captainModel.findById(decoded._id);

        req.captain = captain;
        return next();

    }catch(err){
        return res.status(401).json({message : "Unauthorized"});
    }

}

module.exports = {authuser, authCaptain};