var faker=require('faker');
var Post=require('./models/post');

async function seedPosts(){
	await Post.remove({});
		for(const i of new Array(40)){
			const post={
			title: faker.lorem.word(),
			description: faker.lorem.text(),
			author:{
				 "_id" : "5f09bd0500132e1afc83ac71",
	        	"username" : "Ian"
			}
		}
		await Post.create(post);
	}
	console.log('40 new posts');
}

module.exports=seedPosts;