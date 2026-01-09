const captainModel = require('../models/captain.Model')
const {validationResult} = require('express-validator')
const blackListModel = require('../models/blackListModel');

const captainRegister = async (req,res) => {

    const errors = validationResult(req);

    try{
        if(!errors.isEmpty()){
        return res.status(422).json({errors : errors.array()});
    }

    const {fullName,email,password,vehical} = req.body;

    if(!fullName.firstName || !email || !password || !vehical){
        return res.status(400).json({message : 'All fileds are requried'});
    }

    const isExsist = await captainModel.findOne({email});
    if(isExsist) {
        return res.status(400).json({message : "Captain is already registered"});
    } 

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainModel.create({
        fullName : {
            firstName : fullName.firstName,
            lastName : fullName.lastName
        },
        email,
        password : hashedPassword,
        vehical : {
            color : vehical.color,
            plateNo : vehical.plateNo,
            capacity : vehical.capacity,
            vehicalType : vehical.vehicalType
        }
        
    })

    const token = captain.generateAuthToken();

    res.status(201).json({captain,token});
    }
    catch(err){
        console.log(err);
    }
}

const captainLogin = async (req,res,next) => {

    const errors = validationResult(req);
    try{
        if(!errors.isEmpty())
        return res.status(422).json({errors : errors.array()});

        const {email,password} = req.body;

        const captain = await captainModel.findOne({email}).select('+password');

        if(!captain){
            return res.status(400).json({message : "Invalid email or password"});
        }

        const isMatch = await captain.comaprePassword(password);

        if(!isMatch){
            return res.status(400).json({message : "Invalid email or password"});
        }

        const token = captain.generateAuthToken();
        res.cookie('token',token);
        res.status(200).json({captain, token});
    }
    catch(err){
        console.log(err);
    }

}

const captainProfile = async (req,res) => {
    return res.status(200).json({captain : req.captain});
}

const captainLogout = async (req,res) => {
    res.clearCookie('token');
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    await blackListModel.create({token: token});
    
    return res.status(200).json({message : "Logged out successfully"});
}



module.exports = {
    captainRegister,captainLogin, captainLogout, captainProfile
}