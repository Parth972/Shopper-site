const Post=require('../models/post');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient=mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

const cloudinary=require('cloudinary');
cloudinary.config({
	cloud_name:'dup7ploir',
	api_key:'745483714695237',
	api_secret: process.env.CLOUDINARY_SECRET
});

module.exports={
	async postIndex(req, res, next)
	{
		let posts=await Post.paginate({}, {
			page: req.query.page || 1,
			limit: 10
		});
		posts.page=Number(posts.page);
		res.render('posts/index', {posts: posts});
	},
	postNew(req, res, next)
	{
		res.render('posts/new');
	},
	async postCreate(req, res, next)
	{

		req.body.post.images=[];
		for(const file of req.files)
		{
			let image=await cloudinary.v2.uploader.upload(file.path);
			req.body.post.images.push({
				url: image.secure_url,
				public_id: image.public_id
			});
		}

		let response=await geocodingClient.forwardGeocode({
			query: req.body.post.location,
		  	limit: 1
		})
		.send();
		req.body.post.coordinates=response.body.features[0].geometry.coordinates;
		req.body.post.author=req.user._id;
		let post=await Post.create(req.body.post);
		console.log(post);
		console.log(post.coordinates);
		req.session.success="Post creation Successful.";
		res.redirect('/posts/'+ post._id);
		//CAN USE res.redirect(`/posts/${ post.id }`);
	},
	async postShow(req, res, next) {
		let post = await Post.findById(req.params.id).populate({
			path: 'reviews',
			options: { sort: { '_id': -1 } },
			populate: {
				path: 'author',
				model: 'User'
			}
		});
		res.render('posts/show', { post });
	},
	async postEdit(req, res, next)
	{
		let post=await Post.findById(req.params.id);
		res.render('posts/edit', {post});
	},
	async postUpdate(req, res, next)
	{

		//handle deletion of existing images

		let post=await Post.findById(req.params.id);

		if(req.body.deleteImages && req.body.deleteImages.length)
		{	
			let deleteImages=req.body.deleteImages;
			for(const public_id of deleteImages)
			{
				await cloudinary.v2.uploader.destroy(public_id);
				for(const image of post.images)
				{
					if(image.public_id===public_id)
					{
						let index=post.images.indexOf(image);
						post.images.splice(index, 1);
					}
				}
			}
		}
		//handle upload of new images

		if(req.files)
		{
			for(const file of req.files)
			{
				let image=await cloudinary.v2.uploader.upload(file.path);
				post.images.push({
					url: image.secure_url,
					public_id: image.public_id
				});
			}		
		}

		if(req.body.post.location !== post.location)
		{
				let response=await geocodingClient.forwardGeocode({
				query: req.body.post.location,
		  		limit: 1
			})
			.send();
			post.coordinates=response.body.features[0].geometry.coordinates;
			post.location=req.body.post.location;
		}

		post.title=req.body.post.title;
		post.description=req.body.post.description;
		post.price=req.body.post.price;
		post.location=req.body.post.location;
		post.save();

		res.redirect(`/posts/${post.id}`);
	},
	async postDestroy(req, res, next)
	{
		let post=await Post.findById(req.params.id);
		for(const images of post.images)
		{
			await cloudinary.v2.uploader.destroy(images.public_id);
		}

		//BEFORE THE POST GETS DELETED, THE REVIEWS IN THE UI WILL DISAPPEAR, BUT REMAIN IN DB.
		//SEE MIDDLEWARE PRESENT IN POST MODEL FOR DETAIL.

		await post.remove();

		res.redirect("/posts");
	}
}