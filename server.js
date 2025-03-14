require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const {logger} = require('./middleWare/logEvents'); //loggerとlogEventsの2つをmodule.exportsでexportしている。その内の1つを呼び出しているから、{}が必要
const errorHandler = require('./middleWare/errorHandler');
const verifyJWT = require('./middleWare/verifyJWT');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleWare/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//Connect to mongoDB
connectDB();

// custom middleWare logger 一番上に書く
app.use(logger);

// handle options credentials check - before CORS!
//and fetch cookies credentials requirement
app.use(credentials);

//Cors Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleWare to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// built-in middleWare for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// serve static files
app.use(express.static(path.join(__dirname, '/public')));
app.use('/subdir', express.static(path.join(__dirname, '/public'))); // subdirにもpublicを使用するように伝えるコード。これによってpublicディレクトリの中にあるcssも使える

// routes
app.use('/', require('./routes/root'));
app.use('/subdir', require('./routes/subdir')); // '/subdir'にきたrequestはこのコードが代わりにpathをrequireしてくれるから、'^/$|/ index(.html)?'のように書く必要がなくなる。
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT); // このコードより下のコードに影響を与えるから、関係のないものはここより上に位置させる
app.use('/employees', require('./routes/api/employees'));
app.use('/users', require('./routes/api/users'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ err: "404 Not Found"});
    } else {
        res.type('txt').send({ err: "404 Not Found"});
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})