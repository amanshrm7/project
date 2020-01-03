const mongoose = require('mongoose')
const listSchema = new mongoose.Schema({
    userId :{
        type: mongoose.Types.ObjectId,
        required: true
    },
    name :{
        type: String,
        required: true
    },
    detail:{
        type: String,
        required: false
    }
});

module.exports =  mongoose.model('list', listSchema );