const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const captainSchema = new mongoose.Schema({
    fullName : {
        firstName : {
            type : String,
            required : true,
            minlength : [3, 'First name must be at least 3 characters long']
        },
        lastName : {
            type : String,
            minlength : [3, 'Last name must be at least 3 characters long']
        }
    },
    email : {
        type : String,
        required : true,
        unique : true,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        required : true,
        minlength : [6, 'Password must be at least 6 characters long']
    },
    socketId : {
        type : String
    },
    status : {
        type : String,
        enum : ['available', 'unavailable', 'on-trip'],
    },
    location : {
        lat : {
            type : Number
        },
        lng : {
            type : Number
        }
    },
    vehical : {
        color : {
            type : String,
            required : true
        },
        plateNo : {
            type : String, 
            required : true,
            minlength : [3, 'Plate number must be at least 3 characters long']
        },
        capacity : {
            type : Number,
            required : true,
            min : [1, 'Capacity must be at least 1']
        },
        vehicalType : {
            type : String,
            required : true,
            enum : ['auto', 'bike', 'activa', 'car']
        }
    }
})

captainSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id : this._id}, process.env.JWT_SECRET_KEY, {expiresIn : '7d'});
    return token;
}

captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

captainSchema.methods.comaprePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;