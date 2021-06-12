const mongoose=require('mongoose');
//const passportLocalMongoose=require('passport-local-mongoose');
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
	body: String,
	rating: Number,
	author:
	{
		type:Schema.Types.ObjectId,
		ref:'User'
	}

});

//reviewSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Review', reviewSchema);