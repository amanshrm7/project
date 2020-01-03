const mongoose = require('mongoose');

const pand = new mongoose.Schema({
    panNo : {
        type : Number,
        required : true
    },
    name : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model('pan',pand);