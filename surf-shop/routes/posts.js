var express = require('express');
var router = express.Router();
const multer=require('multer');
const upload=multer({'dest': 'uploads/'});
const { asyncErrorHandler, isLoggedIn, isAuthor }=require('../middleware/index');
const { postIndex, postNew, postCreate, postShow, postEdit, postUpdate, postDestroy }=require('../controllers/posts');

/* GET posts page. */
router.get('/', asyncErrorHandler(postIndex));

router.post('/', isLoggedIn ,upload.array('images', 4), asyncErrorHandler(postCreate));

router.get('/new',isLoggedIn, postNew);

router.get('/:id', asyncErrorHandler(postShow));

router.get('/:id/edit',isLoggedIn ,asyncErrorHandler(isAuthor), asyncErrorHandler(postEdit));

router.put('/:id',isLoggedIn ,asyncErrorHandler(isAuthor), upload.array('images', 4), asyncErrorHandler(postUpdate));

router.delete('/:id',isLoggedIn ,asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));
module.exports = router;
