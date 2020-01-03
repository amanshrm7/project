var mongoose = require('mongoose');

var address = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        max : 25
    },
    mobileno : {
        type : Number,
        required : false
    },
    address : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('address', address);