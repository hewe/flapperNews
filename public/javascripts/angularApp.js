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
				// so for this we defined a postsPropmise which is a function that requires angular to inject the postsService then in the function we get all the posts
				// this will make the $scope.posts object populated with posts before controller is instantiated and page will show all the existing posts
				resolve: {
					postsPromise: ['postsService', function(postsService){
						return postsService.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}', // The {id} is a query parameter that can be injected into the PostsCtrl by requring the $stateParams service and access it via $stateParams.id
				templateUrl: 'partials/partial-posts.html',
				controller: 'PostsCtrl',
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
				$scope.posts.push({
					title  : $scope.title, 
					upvotes: 0,
					link   : $scope.link,
					comments : [
						{ author: 'Joe', body: 'Cool post!', upvotes: 0 },
						{ author: 'Bob', body: 'Greate idea but all is bad!', upvotes: 0 },
					]
				});
				$scope.title = '';
				$scope.link = '';
			}
		};

		// $scope.incrementUpvotes = function(post){
		// 	post.upvotes += 1;
		// };
		
		/* arror function of es6 */
		$scope.incrementUpvotes = (post) => {
			post.upvotes += 1;
		};
	}
]);


/**
 * Post controller depends on $scope, $stateParams variable which is injected by ui-router and the postsService
 * $stateParams variable has 'id' property because thats how we specified in our route above
 * @param  {[type]} $scope                       [description]
 * @param  {[type]} $stateParams                 [description]
 * @param  {[type]} postsService){		$scope.post [description]
 * @return {[type]}                              [description]
 */
app.controller('PostsCtrl', [
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
}]);


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
// 		$scope.incrementUpvotes = function(post){
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