const User=require('../models/user');
const Post=require('../models/post');
const passport=require('passport');
const util=require('util');
var crypto=require('crypto');
var sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


module.exports={

	getRegister(req, res, next)
	{
		res.render('register', {title: 'Register', username:'', email:''});
	},
	async postRegister(req, res, next){

		try{
			const user=await User.register(new User(req.body), req.body.password);
			//eval(require('locus'));
			req.login(user, function(err){
				if(err) return next(err);
				req.session.success=`Welcome, ${user.username} !`;
				res.redirect('/');
			});
		} catch(err) {
			const { username, email }=req.body;
			let error=err.message;
			if(error.includes('duplicate') && error.includes('index: email_1 dup key')){
				error="A user with the given Email already registered.";
			}
			res.render('register', {title: 'Register', username, email, error });
		}

		 // const newUser=({
		 // 	username: req.body.username,
		 // 	email: req.body.email,
		 // 	image: req.body.image
		 // });
		 // let user=await User.register(newUser, req.body.password);
		 // req.login(user, function(err){
		 // 	if(err)
		 // 	{
		 // 		return next(err);
		 // 	}
		 // 	req.session.success=`Welcome ${user.username} !`;
		 // 	res.redirect("/");
		 // });
		},

	getLogin(req, res, next){
			if(req.isAuthenticated()) return res.redirect('/')
			res.render('login', {title: 'Login'});
		},
	async postLogin(req, res, next){

	 	// passport.authenticate('local', 
	 	// 	{ successRedirect:'/', 
	 	// 	failureRedirect:'/login'
	 	// })(req, res, next);

	 	const { username, password }=req.body;
	 	const { user, error }=await User.authenticate()(username, password);
	 	if(!user && error) return next(error);
	 	req.login(user, function(err){
	 		if(err) return next(err);
	 		req.session.success=`Welcome back, ${username} !`;
	 		const redirectUrl=req.session.redirectTo || '/';
	 		delete req.session.redirectTo;
	 		res.redirect(redirectUrl);
	 	});

	 },
	 getLogout(req, res, next)
	 {
	   	req.logout();
  		res.redirect("/");
	 },
	 async getProfile(req, res, next)
	 {
	 	const posts=await Post.find().where('author').equals(req.user._id).limit(10).exec();
	 	//OR const posts=await Post.find().where('author').equals(req.user._id).limit(10).populate('author').exec();
	 	res.render('profile', {posts});
	 },
	 async updateProfile(req, res, next)
	 {
	 	const { username, email }=req.body;
	 	const { user }=res.locals;
	 	if(username) user.username=username;
	 	if(email) user.email=email;
	 	await user.save();
	 	const login=util.promisify(req.login.bind(req));
	 	await login(user);
	 	req.session.success="Profile Updated Successfully";
	 	res.redirect('/profile');
	 },
	 getForgotPw(req, res, next){
	 	res.render('users/forgot');
	 },
	 async putForgotPw(req, res, next){

	 	const token=await crypto.randomBytes(20).toString('hex');
	 	const { email }=req.body;

		//eval(require('locus'));
	 	const user=await User.findOne({ email });
	 	//eval(require('locus'));
	 	if(!user)
	 	{

	 		req.session.error="No account with that email";
	 		return res.redirect('/forgot-password');
	 	}

	 	user.resetPasswordToken=token;
	 	user.resetPasswordExpires=Date.now() + 3600000;
	 	await user.save();
	 	console.log(user);
	 	const msg = {
		  to: email,
		  from: 'parthshah590@gmail.com', 
		  subject: 'Forgot Password/Reset',
		      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/			/g, ''),
		  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		};
		console.log("before sendgrid0");
		sgMail
		  .send(msg, (error, result) => {
		    if (error) {
		      console.log(error);
		    }
		    else {
				console.log("after sendgrid0");
				req.session.success=`An email has been sent to ${email} with further instructions.`
				res.redirect('/forgot-password');
		    }
		  });

	},

	 async getReset(req, res, next){
	 	const { token }=req.params;
	 	const user=await User.findOne({
	 		resetPasswordToken: token,
	 		resetPasswordExpires: { $gt: Date.now() }
	 	});

	 	if(!user)
	 	{
	 		req.session.error="Password reset token invalid/expired.";
	 		return res.redirect('/forgot-password');
	 	}
	 	res.render('users/reset', { token });
	 },

	 async putRequest(req, res, next){
	 	
	 	const { token }=req.params;
	 	const user=await User.findOne({
	 		resetPasswordToken: token,
	 		resetPasswordExpires: { $gt: Date.now() }
	 	});
	 	// console.log(resetPasswordToken);
	 	// console.log(resetPasswordExpirest);
	 	if(!user)
	 	{
	 		// console.log("user");
	 		// console.log(user);
	 		req.session.error="Password reset token invalid/expired.";
	 		return res.redirect('/forgot-password');
	 	}
	 	//console.log("proper");
	 	if(req.body.password===req.body.confirm)
	 	{
	 		await user.setPassword(req.body.passsword);
	 		user.resetPasswordExpires=null;
	 		user.resetPasswordToken=null;
	 		await user.save();
	 		const login=util.promisify(req.login.bind(req));
	 		await login(user);
	 	} else {
	 		req.session.error="Passwords do not match.";
	 		return res.redirect(`/reset/${token}`);
	 	}
	 	const msg = {
		  to: user.email,
		  from: 'parthshah590@gmail.com', // Use the email address or domain you verified above
		  subject: 'Password Changed.',
		      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/			/g, ''),
		  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		};
		await sgMail(msg);
		req.session.success="Password Updated";
		res.redirect("/");

	 }
}