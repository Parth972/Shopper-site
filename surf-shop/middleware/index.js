const User=require('../models/user');
const Review=require('../models/review');
const Post=require('../models/post');

module.exports={
	asyncErrorHandler: (fn) =>
		(req, res, next)=>{
			Promise.resolve(fn(req, res, next))
				.catch(next);
		},

		isReviewAuthor: async (req, res, next)=>{
			let review=await Review.findById(req.params.review_id);
			if(review.author.equals(req.user._id)){
				return next();
			}
			req.session.error="You aren't authorized to do that.";
			res.redirect('/');
		},

	isLoggedIn: (req, res, next)=>{
		if(req.isAuthenticated()) return next();
		req.session.error="You need to be Logged in";
		req.session.redirectTo=req.originalUrl;
		res.redirect('/login');
	},
	isAuthor: async (req, res, next)=>{
		const post=await Post.findById(req.params.id);
		if(post.author.equals(req.user._id)){
			res.locals.post=post;
			return next();
		}
		req.session.error="Access denied";
		res.redirect('back');
	},

	isValidPassword: async (req, res, next)=>{
		const { user }=await User.authenticate()(req.user.username, req.body.currentPassword);
		if(user)
		{
			res.locals.user=user;
			next();
		} else {
			req.session.error="Incorrect Password";
			return res.redirect('/profile');
		}
	},

	changePassword: async (req, res, next)=>{
		const {
			newPassword,
			passwordConfirmation
		}=req.body;
		if(newPassword && passwordConfirmation)
		{
			const { user }=res.locals;
			if(newPassword===passwordConfirmation){
				await user.setPassword(newPassword);
				next();
			} else {
				req.session.error="New Passwords must match";
				return res.redirect('/profile');
			} 
		} else {
			next();
		}
	} 
		// checkIfUserExists: async (req, res, next) =>{
		// 	let userExists=await User.findOne({'email': req.body.email});
		// 	if(userExists){
		// 		req.session.error="User with given email already registered";
		// 		return res.redirect('back');
		// 	}
		// 	next();
		// }
	
}