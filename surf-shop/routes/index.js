var express = require('express');
var router = express.Router({mergeParams:true});
var passport=require('passport');
var { postRegister, postLogin, getLogout, getLogin, getRegister, getProfile, updateProfile, getForgotPw, putForgotPw, getReset, putReset }=require('../controllers/index');
var { asyncErrorHandler, isValidPassword, changePassword ,isLoggedIn }=require('../middleware/index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', getRegister);

router.post('/register', asyncErrorHandler(postRegister));

router.get('/login', getLogin);

router.post('/login', asyncErrorHandler(postLogin));

router.get('/logout', getLogout);

router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

router.put('/profile', isLoggedIn, asyncErrorHandler(isValidPassword), asyncErrorHandler(changePassword), asyncErrorHandler(updateProfile));

router.get('/forgot-password', getForgotPw);

router.put('/forgot-password', asyncErrorHandler(putForgotPw));

router.get('/reset/:token', asyncErrorHandler(getReset));

router.put('/reset/:token', asyncErrorHandler(putReset));

module.exports = router;
