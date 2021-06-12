const Post=require('../models/post');
const Review=require('../models/review');

module.exports={

	async reviewCreate(req, res, next)
	{

		let post=await Post.findById(req.params.id).populate('reviews').exec();
		//TO DISALLOW USER TO ADD MORE THAN ONE REVIEW.
		let haveReceived=post.reviews.filter(review=>{
			return review.author.equals(req.user._id);
		}).length;
		//FILTER IS USED TO ACCESS EACH REVIEW OF REVIEWS ARRAY

		if(haveReceived){
			req.session.error="You can't add more than one review."
			return res.redirect(`/posts/${post.id}`);
		}

		console.log(post);
		req.body.review.author=req.user._id;
		let review=await Review.create(req.body.review);
		console.log(review);
		post.reviews.push(review);
		post.save();
		console.log(post);
		req.session.success="Review added Successfully.";
		res.redirect('/posts/'+req.params.id);

	},
	async reviewUpdate(req, res, next)
	{
		await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
		req.session.success="Review Updated.";
		res.redirect(`/posts/${req.params.id}`);

	},
	async reviewDestroy(req, res, next)
	{
		await Post.findByIdAndUpdate(req.params.id, {
			$pull: { reviews: req.params.review_id }
		});
		await Review.findByIdAndRemove(req.params.review_id);
		req.session.success="Review Deleted Successfully.";
		res.redirect('/posts/'+req.params.id);		
	}
}