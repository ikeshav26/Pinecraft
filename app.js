const express = require('express');
const path=require('path');
const cookieParser=require("cookie-parser");
const logger=require('morgan')
const expressSession=require("express-session")


const indexRouter = require('./routes/index');
const userRouter=require('./routes/users');

const app = express();

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs');




app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))



app.use('/', indexRouter);




app.listen(3000);