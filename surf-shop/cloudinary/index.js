const crypto=require('crypto');

const cloudinary=require('cloudinary');
cloudinary.config({
	cloud_name:'dup7ploir',
	api_key:'745483714695237',
	api_secret: process.env.CLOUDINARY_SECRET
});