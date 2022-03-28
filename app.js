if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Database Connected");
    })
    .catch(err => {
        console.log('Connection Error');
        console.log(err);
    });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));     

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(mongoSanitize());

// MVC -> all our model are in models directory, templates in views directory , Main logic in controller directory

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // if this flag is true means our cookie cant be accessed by client side scripts,and browser will not reveal the cookie to a third-party
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // we are setting the expiration date for cookie
        maxAge: 1000 * 60 * 60 * 24 * 7 // maxAge for the cookie
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize()); //It is a middle-ware that initialises Passport.
app.use(passport.session()); // acts as a middleware to alter the req object and change the 'user' value that is currently the session id.
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // this is use to add user into session
passport.deserializeUser(User.deserializeUser()); // this is use to remove user from the session

app.use((req, res, next) => {
    if (!['/login', '/', '/register'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentPath = req.originalUrl;
    res.locals.moment = require('moment');
    res.locals.currentUser = req.user; // req.user store the information about current user
    res.locals.success = req.flash('success'); // local variables are available for templates
    res.locals.error = req.flash('error');
    return next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({
        email: 'chetan@gmail.com',
        username: 'chetan'
    });
    // The register method also save the user into our database
    const newUser = await User.register(user, 'chetan'); // it will register the user with a hash password and also ensure that username is unique
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong!";
    if (!err.statusCode) err.statusCode = 500;
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})
