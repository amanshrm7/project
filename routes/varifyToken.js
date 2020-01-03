const jwt = require('jsonwebtoken');

function auth(req,res,next){
    const token = req.header('auth-header');
    if(!token) return res.status(401).send('acccess denied');

    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified;
    }catch(err){
        res.status(401).send('invalid Token');
    }
}
module.exports = auth;