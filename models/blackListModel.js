const e = require('express');
const mongoose = require('mongoose');

const blackListSchema = new mongoose.Schema({
    token : {
        type : String, 
        required : true
    },
    createddAt : {
        type : Date,
        default : Date.now,
        expires : 86400 
    }
});

const blackListModel = mongoose.model('BlackList', blackListSchema);

module.exports = blackListModel;