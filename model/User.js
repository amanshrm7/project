const mongoose = require('mongoose')
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true,
        max: 25
    },
    email: {
        type: String,
        required:true,
        max: 255
    },
    password: {
        type:String,
        required:true,
        max:255
    },
    resetPasswordToken: {
        type:String,
        required:false,
        max:255 
    },
    resetPasswordExpires: {
       type: Date,
       required:false,
    }
});

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('user', userSchema);
