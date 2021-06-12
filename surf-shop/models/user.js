const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
	email: { type: String, unique: true, required: true },
	image: String,
	passwordResetToken: String,
	passwordResetExpires: Date
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User', userSchema);