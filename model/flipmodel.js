const mongoose = require('mongoose');

const flipUser = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
        max: 25
    },
    lastName : {
        type : String,
        required : true,
        max: 25
    },
    gender : {
        type : String,
        required : true
    },
    email: {
        type: String,
        required : true,
        max : 25
    }
    // mobileNo : {
    //     type: Number,
    //     required : true
    // }
})
module.exports =  mongoose.model('fUser', flipUser );