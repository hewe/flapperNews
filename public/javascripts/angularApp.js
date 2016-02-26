'use esversion:6';
//our angular app is called flapper news and requires the ui.router dependent module. So the javascript reference in html of app.js has to be after the ui.router.js file
var app = angular.module('flapperNews', ['ui.router']);

// we configure the flapper news module, we take advantage of the $stateProvider and $urlRouterProvider components via dependency injection
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	// setup our state and routing our routes with views. we setup the states and object containing the url that user puts in web browser, the templateurl which is the path to the partial template
	// html file, then controller for that state. we also setup the default route via the otherwise function of $urlRouterProvider so instead of a 404 it goes back to home state/page
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: 'partials/partial-home.html',
				controller: 'MainCtrl',
				// using the resolve property here so anything define within the resolve will get executed before the state's controller actually get instantiated
				// so for this we defined a postsArrayObj and tied a factory function that requires angular to inject the postsService then in the function we 
				// get all the posts this will make the $scope.posts object populated with posts before controller is instantiated and page will show all the existing posts
				resolve: {
					postsArrayObj: ['postsService', function(postsService){
						return postsService.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}', // The {id} is a query parameter that can be injected into the PostsCtrl by requring the $stateParams service and access it via $stateParams.id
				templateUrl: 'partials/partial-posts.html',
				controller: 'PostsCtrl',
				// using the resolve property here so anything define within the resolve will get executed before the state's controller actually get instantiated
				// so for this we defined a singlePostObj and tied a factory function that requires angular to inject the $stateParms service and postsService then 
				// in the function we get the post by id. Lastly the result of the factory function will be set on the singPostObject. The singlePostObj is cached into 
				// $scope than can be injected into the state's controller. 
				resolve: {
					singlePostObj: ['$stateParams', 'postsService', function($stateParams, postsService){
						return postsService.getPostById($stateParams.id);
					}]
				}
			});

		$urlRouterProvider.otherwise('home');
	}
]);

/**
 * the controller setup for the MainCtrl which depends on $scope variable, and the 'postsService' which is defined much below.
 * the usage of postsService here so that it postsService is instanted once and is persisted a life time of the app rather than
 * just the controller which is out of scope once the state is changed above as you see different controller for different states. 
 * the service approach can also be done with a factory. The service and factory can be reused acrossed controllers.
 * 
 * @param  {[type]} $scope                       [description]
 * @param  {String} postsService){		$scope.test [description]
 * @param  {[type]} options.author:              'Bob'         [description]
 * @param  {[type]} options.body:                'Greate       idea          but all is bad!' [description]
 * @param  {[type]} options.upvotes:             0             [description]
 * @param  {[type]} ]				}                      [description]
 * @return {[type]}                              [description]
 */
app.controller('MainCtrl', [
	'$scope',
	'postsService',
	function($scope, postsService){
		$scope.test = 'Hello World';
		$scope.posts = postsService.posts;

		$scope.addPost = function() {
			if ($scope.title){
				postsService.create({
					title: $scope.title,
					link: $scope.link
				});

				$scope.title = '';
				$scope.link = '';
			}
		};

		// $scope.upvotePost = function(post){
		// 	post.upvotes += 1;
		// };
		
		/* arror function of es6 */
		$scope.upvotePost = (post) => {
			postsService.upvote(post);
		};
	}
]);


/**
 * Post controller depends on $scope, postsService, singlePostObj variable which is injected by ui-router. The 
 * singlePostObj object is cached into the $scope by the ui-router setup of the posts state's resolve object. 
 * 
 * @param  {[type]} $scope                        [description]
 * @param  {[type]} postsService                  [description]
 * @param  {[type]} singlePostObj){		$scope.post [description]
 * @param  {String} function                      errorCallback(response){											}				);			}			$scope.body [description]
 * @return {[type]}                               [description]
 */
app.controller('PostsCtrl', [
	'$scope', 
	'postsService',
	'singlePostObj',
	function($scope, postsService, singlePostObj){
		$scope.post = singlePostObj;

		$scope.addComment = function() {
			if ($scope.body) {

				// addComment function returns a HttpPromse, must setup
				// handlers here. 
				postsService.addComment(singlePostObj, { author: 'user', body: $scope.body }).then(
					function successCallback(response){
						singlePostObj.comments.push(response.data);
					},
					function errorCallback(response){
						//doesn't need to define this but here for tutorial
					}
				);
			}
			$scope.body = '';
		};

		$scope.upvoteComment = function(comment) {

			// upvoteComment already has the handlers so no need here.
			postsService.upvoteComment(singlePostObj, comment);
		}
	}
]);


app.service('postsService', ['$http', function($http){
	this.posts = [];

	this.getAll = function(){

		// using arrow function for success callback so i can still
		// reference this.posts and it will be the postsService's
		// posts object
		var posts = $http.get('/posts').success((posts) => {
			angular.copy(posts, this.posts);
		});

		return posts;
	};

	this.create = function(post){
		var post = $http.post('/posts', post).success((postCreated) => {
			this.posts.push(postCreated);
		});
	};

	this.upvote = function(post){
		// using string literals to place the post id as part of route url
		var putUrl = `posts/${post._id}/upvote`;
		
		// $http.* method returns a promise which you can call then on
		// and specify the handlers for the case the promise is  in pending
		// state, fulfilled, rejected.
		$http.put(putUrl).then(
			function successCallBack(response){
				post.upvotes += 1;
			},
			function errorCallback(response){

			}
		);
	};

	this.getPostById = function(postId){
		var retVal = $http.get(`posts/${postId}`).then(
			(response) => {
				return response.data;
			},
			(response) => {

			}
		);

		return retVal;
	};

	// the addComment function returns a HttpPromise, so the caller
	// can call 'then' on the promise and setup success and error 
	// handler
	this.addComment = function(post, comment){
		return $http.post(`/posts/${post._id}/comments`, comment);
	};

	this.upvoteComment = function(post, comment){
		$http.put(`/posts/${post._id}/${comment._id}/upvote`).then(
			(response) => {
				comment.upvotes = response.data.upvotes;
			},
			(response) => {

			}
		);
	}
}]);

/**
 * Post controller depends on $scope, $stateParams variable which is injected by ui-router and the postsService
 * $stateParams variable has 'id' property because thats how we specified in our route above
 * @param  {[type]} $scope                       [description]
 * @param  {[type]} $stateParams                 [description]
 * @param  {[type]} postsService){		$scope.post [description]
 * @return {[type]}                              [description]
 */
app.controller('PostsCtrlOld', [
	'$scope', 
	'$stateParams', 
	'postsService',
	function($scope, $stateParams, postsService){
		$scope.post = postsService.posts[$stateParams.id];

		$scope.addComment = function() {
			if ($scope.body) {
				$scope.post.comments.push(
					{ author: 'user', body: $scope.body, upvotes: 0}
				);
			}
			$scope.body = '';
		};
	}
]);

// This controller saves the data within itself which is not good
// because data saved inside a controller is not exposed to other
// controllers for sharing data and harder to unit test
// when the controller goes out of scope, we lose the data
// that data cannot be easily accessed from other controllers or directives
// the data is difficult to mock, which is important when writing automated tests
// app.controller('MainCtrl', [
// 	'$scope', 
// 	function($scope){
// 		$scope.test = 'Hello World';
// 		$scope.posts = [
// 			{title: 'post 1', upvotes: 5},
// 			{title: 'post 2', upvotes: 2},
// 			{title: 'post 3', upvotes: 15},
// 			{title: 'post 4', upvotes: 9},
// 			{title: 'post 5', upvotes: 4},	
// 		];
// 		$scope.addPost = function() {
// 			if ($scope.title){
// 				$scope.posts.push({
// 					title  : $scope.title, 
// 					upvotes: 0,
// 					link   : $scope.link
// 				});
// 				$scope.title = '';
// 				$scope.link = '';
// 			}
// 		}
// 		$scope.upvotePost = function(post){
// 			post.upvotes += 1;
// 		}
// 	}
// ]);

/**
 * this is a angular controller that is attached to the myApp module
 * it setsup some controllers that respond to adding post button and 
 * the increment up votes button. 
 * It depends on $scope angular variable and the posts factory/servie
 * to be injected for the controller constructor function as it takes
 * them in the controller functions parameters.
 * 
 * @param  {[type]} $scope                [description]
 * @param  {String} posts){		$scope.test [description]
 * @return {[type]}                       [description]
 */

/**
 * this is a angular service/factory that is created only once per module
 * so this can be shared among controllers by depedency injection like 
 * injecting the $scope variable.
 * 
 * this is a posts factory/service because it is named as posts. it 
 * exposes an object that contains posts array, so the requiring method
 * can call directly into the posts array.
 * 
 * @param  {Object} ){		var o             [description]
 * @return {[type]}          [description]
 */
app.factory('postsFactory', [
	function(){
		var o = {
			posts: []
		};
		return o;
	}
]);