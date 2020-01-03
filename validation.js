const joi = require('joi');

const registerFunction = (data)=>{
    const schema ={
        name : joi.string().min(6).required(),
        email : joi.string().email().required(),
        password : joi.string().min(6).required()
    };
    return joi.validate(data,schema)
}
const loginFunction = (data)=>{
    const schema ={
        email : joi.string().email().required(),
        password : joi.string().min(6).required()
    };
    return joi.validate(data,schema)
}
module.exports.registerFunction = registerFunction;
module.exports.loginFunction = loginFunction;