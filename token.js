const express = require('express')
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");
//imports route
// const  recievejs = require('./routes/recieve')
const PORT = process.env.PORT;
const authRoute = require('./routes/auth');
const verify = require('./routes/varifyToken')
// const posts = require('./routes/recieve')
dotenv.config();

mongoose.connect(process.env.DB_CONNECT ,{useNewUrlParser:true, useUnifiedTopology:true},function(error){
    console.log(error);
}).then(con=>{
    app.listen(PORT || 3000, () => console.log(`server is running at ${PORT}`));
});
//middleware
app.use(cors());

app.use(express.json());

//route middleware
app.use('/api/user', authRoute);
app.use('/api/flip',authRoute );
app.use('/api/verify', verify);
//app.use('/api/user', posts);

