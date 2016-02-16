var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// getting Post and Comment model definintion two different ways. first
// is availabe through the mongoose object/module. second is available
// because the app.js file requires('./models') into the models object 
// and the ./models/index.js file exports model definition of Post and
// comment so here we can say var Comment = models.Comment; we will 
// later on then can use this model definition to create objects via
// var postObject = new Post(..);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// list out posts along with associated comments. we use express router 
// and define the get route on /posts url and its request handler which 
// takes a request, response, and next object. The request handler use 
// the Post mongoose model to get all entries of posts back. if error,
// then we call the next callback method and we give it the erroro, 
// otherwise we send back the posts in json format.
router.get('/', function(req, res, next){
	Post.find(function(err, posts){
		if(err) { 
			return next(err); 
		}

		res.json(posts);
	});
});

// a http post handler for the/posts route to add new posts. inside the 
// request handler we create a new post object using the new Post(..);
// syntax because Post model definition is gotten above. then we 
// call postObject.save(function(err, post){..}) to savev to mongodb
// and return the object back in json.
router.post('/', function(req, res, next){
	var postObj = new Post(req.body);
	
	postObj.save(function(err, post){
		if (err){
			return next(err);
		}

		res.json(postObj);
	});
});

router.param('postId', function(req, res, next, postId){
	console.log(req.method, req.url);
	console.log('logged on the param middleware');

	var query = Post.findById(postId);

	query.exec(function (err, post){
		if (err) {
			return next(err);
		}

		if (!post) {
			return next(new Error('can\'t find post'));
		}

		req.post = post;
		return next();
	});
});

router.get('/:postId', function(req, res){
	console.log(req.method, req.url);
	console.log('get on /:postId');
	res.json(req.post);
});

module.exports = router;