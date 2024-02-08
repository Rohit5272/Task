const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const passportConfig = require('./config.js/passport')

// Database connection
const mongoose = require('mongoose');
const DBURL = "mongodb://0.0.0.0:27017/DB";
mongoose
  .connect(DBURL)
  .then(() => console.log("Connected to the Database"))
  .catch((err) => console.log("cannot connect database" + err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Passport Configuration
passportConfig(passport);

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.get('/',(req,res) => res.send('Hello World'));

app.listen(3000,() => console.log('server is running on portr 3000'));