var express = require('express');
var router = express.Router({mergeParams: true});
const { asyncErrorHandler, isReviewAuthor }=require('../middleware/index');
var { reviewCreate, reviewUpdate, reviewDestroy }=require('../controllers/reviews');


/* GET reviews /posts/:id/reviews/ page. */


router.post('/', asyncErrorHandler(reviewCreate));

// router.get('/:review_id/edit', function(req, res, next) {
//   res.send("/Edit reviews");
// });

router.put('/:review_id', isReviewAuthor ,asyncErrorHandler(reviewUpdate));

router.delete('/:review_id',isReviewAuthor ,asyncErrorHandler(reviewDestroy));

module.exports = router;
