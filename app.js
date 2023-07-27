if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();

}


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');


const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const campgroundsRoutes = require('./Routes/campgrounds');
const reviewsRoutes = require('./Routes/reviews');
const usersRoutes = require('./Routes/users');
const { func } = require('joi');

const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
const store = new MongoDBStore({
    url:dbUrl,
    secret:'thisisasecret',
    touchAfter:24*60*60
})

store.on('error',function(e){
    console.log("Session Store Error",e);
})

const sessionConfig = {
    store:store,
    name:'session',
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true, 
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
    
};
app.use(session(sessionConfig))
// mongoose.connect(dbUrl)
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Mongo Connection Open !!")
    })
    .catch((err) => {
        console.log("Oh no Mongo Error");
        console.log(err);
    })

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(mongoSanitize({
    replaceWith: '_'
  }
));
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddhks1nqp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(express.static(path.join(__dirname, 'public')))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})

app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', usersRoutes)



app.get('/', (req, res) => {
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong'
    res.status(statusCode).render('error', { err })
    // res.send("Error")
})

app.listen(3000, () => {
    console.log("Listening at port 3000");
})