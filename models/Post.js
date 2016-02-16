var mongoose = require('mongoose');

// we define the schema of the Post model. Post model has title and link fields,
// and the comments field is an array of comment references. We can use the Monogoose's builtin populate() method
// to retreieve all comments that are associated to a particular post.
var PostSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	// In Mongoose, we can create relationships between different data models 
	// using the ObjectId type. The ObjectId data type refers to a 12 byte 
	// MongoDB ObjectId, which is actually what is stored in the database. The ref property tells Mongoose what type of object the ID references and enables us to retrieve both items simultaneously
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

// telling mongose that the Post model uses PostsSchema definition
mongoose.model('Post', PostSchema);

