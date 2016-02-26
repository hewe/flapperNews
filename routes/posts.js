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

router.get('/:postId', function(req, res, next){
	console.log(req.method, req.url);
	console.log('get on /:postId');

	// mongoose method populate takes string of a field/fields to
	// populate, a callback function of error and the  object that
	// is trying to populate not the field being populated
	req.post.populate('comments', function (err, post) {
		if (err){
			return next(err);
		}
		res.json(post);
	});
});

router.put('/:postId/upvote', function(req, res, next){
	req.post.upvote(function(err, post){
		if (err){
			return next(err);
		}

		res.json(post);
	});
});

router.post('/:postId/comments', function(req, res, next){
	var commentObj = new Comment(req.body);
	commentObj.post = req.post;

	commentObj.save(function(err, comment){
		if (err){
			return next(err);
		}

		req.post.comments.push(commentObj);
		req.post.save(function(err, post){
			if(err){
				return next(err);
			}

			res.json(comment);
		});
	});
});

router.param('commentId', function(req, res, next, commentId){
	var query = Comment.findById(commentId);

	query.exec(function(err, comment){
		if (err){
			return next(err);
		}

		if(!comment){
			return next(new Error('can\'t find comment'));
		}

		req.comment = comment;
		return next();
	});

});

router.get('/:postId/:commentId', function(req, res, next){
	res.json(req.comment);
});

router.put('/:postId/:commentId/upvote', function(req, res, next){
	req.comment.upvote(function(err, comment){
		if (err){
			return next(err);
		}

		res.json(comment);
	});
});

module.exports = router;