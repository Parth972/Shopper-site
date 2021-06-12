const mongoose=require('mongoose');
//const passportLocalMongoose=require('passport-local-mongoose');
const Schema=mongoose.Schema;
const Review=require('./review');
const mongoosePaginate=require('mongoose-paginate');

const postSchema=new Schema({
	title: String,
	price: String,
	description: String,
	images:[ { url: String, public_id: String } ],
	location: String,
	coordinates: Array,
	author:
	{
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	reviews:[
		{
			type: Schema.Types.ObjectId,
			ref:'Review'
		}
	]

});

postSchema.plugin(mongoosePaginate);

//THIS IS A PRE HOOK MIDDLEWARE.
//WHENEVER WE DELETE A POST, THE REVIEWS ASSOCIATED WITH THE POST GETS DELETED FROM UI, BUT REMAINS IN THE REVIEWS DATABASE, HENCE WASTING SPACE.
//THIS MIDDLEWARE WILL BE CALLED BEFORE THE POST ITSELF GETS DELETED.
postSchema.pre('remove', async function(){
	await Review.remove({
		_id: {
			$in: this.reviews
		}
	});
});

//postSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Post', postSchema);