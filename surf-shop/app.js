require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var engine=require('ejs-mate');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser=require('body-parser');
var passport=require('passport');
var LocalStrategy=require('passport-local')
var User=require('./models/user.js');
var mongoose=require('mongoose');
var session=require('express-session');
var methodOverride=require('method-override');
// var seedPosts=require('./seeds');
// seedPosts();

//REQUIRE ROUTES
var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
var postRouter=require('./routes/posts');
var reviewRouter=require('./routes/reviews');

var app = express();

mongoose.connect('mongodb://localhost/surf-shop-mapbox', { useNewUrlParser: true, useUnifiedTopology: true });


app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret:' This is a SeCrEt',
	resave: false,	
	saveUninitialized: true	
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){

	res.locals.currentUser=req.user;
	//set success flash message
	res.locals.success=req.session.success || ' ';
	delete req.session.success;

	//set error flash message
	res.locals.error=req.session.error || ' ';
	delete req.session.error;
	
	//continue onto next function in middleware chain.
	next();
})

//MOUNT ROUTES
app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/posts', postRouter);
app.use('/posts/:id/reviews', reviewRouter );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  req.session.error=err.message;
  res.redirect('back');
});

module.exports = app;

app.listen(3000, "localhost");
console.log("started");
