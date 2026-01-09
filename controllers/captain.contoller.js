const captainModel = require('../models/captain.Model')
const {validationResult} = require('express-validator')

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

module.exports = {
    captainRegister
}