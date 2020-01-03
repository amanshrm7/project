const router = require('express').Router();
const User = require('../model/User');
const {registerFunction,loginFunction} = require('../validation')
const bcrypt = require('bcryptjs')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
var async = require('async');
const env = require('dotenv').config();
const cors = require("cors");
var passport = require("passport");
const List = require('../model/details')
const flip = require('../model/flipmodel')
const address = require('../model/address')
const pan = require('../model/pan')

router.post('/register', async (req,res)=>{

    //Error in registring
    const {error} = registerFunction(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    //iF the user already exist
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exist');

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);

    //create new user
    const user = new User({
        name : req.body.name,
        email: req.body.email,
        password : hashPassword
    });
    try{
        const savedUser = await user.save();
        res.send({user: user._id});
    }catch(err){

        res.status(400).send(err);
    }
});


router.post('/login', async (req,res)=>{
    //data validate
    const {error} = loginFunction(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json({'message':'email dosnt exist'})
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) res.status(400).json({'message':'invalid password'});

    //create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    //res.header('auth-token',token).send(token);

    res.json({"token":token});
})


router.get('/check', async (req,res)=>{
  const alreadyExist = await User.findOne({email: req.query.email});
  return res.status(400).send({exists:alreadyExist?true:false});
})

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err,user) {
        if (!user) {
          return res.json({'error':'No account with that email address exists.'});
          // return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "smtp.office365.com",
        secureConnection: false,
        port: 587,
        tls: {
        ciphers:'SSLv3'
        },
        auth: {
        user: "aman.sharma@primussoft.com",
        pass: "Gaw39517@"
        }
        })
      var mailOptions = {
        to: user.email,
        from: 'aman.sharma@primussoft.com',
        cc:"amanshrm74@gmail.com",
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        process.env.FE_URL+ '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        res.send('mail sent')
        // req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    // res.redirect('/forgot');
    res.send('error');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.json({'error':"denied"})
    }
    return res.json({'accepted':'in reset page'});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
        if (!user) {
          return res.status('error').json('token has expired');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // user.save(function(err) {
            //   req.logIn(user, function(err) {
            //     done(err, user);
            //   });
            // })
            console.log('password reseted')
            return res.send('password reseted');
          })
        } else {
          return res.json('error','password do not match.');
      }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "smtp.office365.com",
        secureConnection: false,
        port: 587,
        tls: {
        ciphers:'SSLv3'
        },
        auth: {
        user: "aman.sharma@primussoft.com",
        pass: "Gaw39517@"
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'aman.sharma@primussoft.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        return res.send('user password has been changed');
      });
    }
  ], function(err) {
    res.send('all done');
  });
});

router.get('/list', async (res)=>{
  const user = await List.find({}); 
  res.json({user})
})
router.post('/list',async(req,res)=>{
  const user = new List({
    userId : req.body.userId,
    name: req.body.name,
    detail : req.body.details
  });
  try{
    const savedUser = await user.save();
    res.json({'message':'posted'});
}catch(err){
    res.status(400).json({'error':'error occured'});
}
})
router.put('/list/:id', async(req,res)=>{
  var body = req.body
  List.findOneAndUpdate({_id:req.path.id}, body, {upsert: false}, function(err, doc) {
    if (err) return res.status(500).json({err})
    return res.json({"message":'Succesfully saved.'});
});
})
router.delete('/list/:id', async(req,res)=>{
  List.deleteOne({ _id: req.path.id }, function(err) {
    const message={};
    if (!err) {
      message.type = 'updated!';
    }
    else {
        message.type = 'error';
    }
    return res.json(message)
  });
})
//-------------------------------------------//
router. post('/profile', async(req,res)=>{
  var information = new flip({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    gender : req.body.gender,
    email : req.body.email
    // mobile : req.body.mobileNo
  })
  try{
    const saveInfo = await information.save();
    res.json({"message":"information saved"});
  }catch{
    res.status(500).json({"message":"unable to save"});
  }
})
router.get('/profile', async(req,res)=>{
  const user = await flip.find({}); 
  res.json({user})
})
router.get('/profile/:id', async(req,res)=>{
  const user = await flip.find({_id:req.path.id})
  res.json({user})
})
router.put('profile/:id', async(req,res)=>{
  const body = req.body
  flip.findByIdAndUpdate({_id:req.path.id},body,{upsert: false},function(err,doc){
     if(err) return res.status(500).json({err})
     return res.json({"message":"successfully updated"})
  })
})
router.delete('/profile/:id', async(req,res)=>{
  List.deleteOne({ _id: req.path.id }, function(err) {
    const message={};
    if (!err) {
      message.type = 'updated!';
    }
    else {
        message.type = 'error';
    }
    return res.json(message)
  });
})
//-------------------------------------------//
router.post('/address', async(req,res)=>{
  var adrs = new address({
    name : req.body.name,
    // number : req.body.mobileNo,
    address : req.body.address
  }) 
  try{
    const addsave = await adrs.save();
    res.json({"message":"address saved"})
  }catch{
    res.status(500).json({"message":"address not saved"});
  }
})
router.get('/address', async(req,res)=>{
  const user = await address.find({}); 
  res.json({user})
})
router.get('/address/:id', async(req,res)=>{
  const user = await flip.find({_id:req.path.id})
  res.json({user})
})
router.put('/address/:id', async(req,res)=>{
  const body = req.body
  flip.findByIdAndUpdate({_id:req.path.id},body,{upsert: false},function(err,doc){
    if(err) return res.status(500).json({err})
    return res.json({"message":"succesfully updated"})
  })
})
router.delete('/address/:id', async(req,res)=>{
  List.deleteOne({ _id: req.path.id }, function(err) {
    const message={};
    if (!err) {
      message.type = 'updated!';
    }
    else {
        message.type = 'error';
    }
    return res.json(message)
  });
})
//-------------------------------------------//
router.post('/paninfo', async(req,res)=>{
  var paninfo = new pan({
    pannumber : req.body.panNo,
    name : req.body.name
  })
  try{
    const savepan = await paninfo.save();
    res.json({"message":"information saved"});
  }catch{
    res.status(500).json({"message":"pan not saved"});
  }
})
router.get('/paninfo', async(req,res)=>{
  const user = await pan.find({}); 
  res.json({user})
})
router.get('/paninfo/:id', async(req,res)=>{
  const user = await flip.find({_id:req.path.id})
  res.json({user})
})
router.put('/paninfo/:id', async(req,res)=>{
  const body = req.body
  flip.findByIdAndUpdate({_id:req.path.id},body,{upsert: false},function(err,doc){
    if(err) return res.status(500).json({err})
    return res.json({"message":"succesfully updated"})
  })
})
router.delete('/paninfo/:id', async(req,res)=>{
  List.deleteOne({ _id: req.path.id }, function(err) {
    const message={};
    if (!err) {
      message.type = 'updated!';
    }
    else {
        message.type = 'error';
    }
    return res.json(message)
  });
})
//----------------------------------------------//
module.exports = router;
// + user.email +
