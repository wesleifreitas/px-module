// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	} else {
		next();
	}
};

app.use(allowCrossDomain)

var port = process.env.PORT || 8080; // set our port

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/myDatabase'); // connect to our database
var User = require('./app/model/user');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({
		message: 'hooray! welcome to our api!'
	});
});

router.route('/dataGenerator')

.post(function(req, res) {
	for (var i = 1000 - 1; i >= 0; i--) {
		var user = new User();
		user.nome = 'Nome ' + Math.floor((Math.random() * 100000) + 1);
		user.cpf = Math.floor((Math.random() * 10000000000) + 1000000000);
		user.data = new Date();
		user.bateria = Math.floor((Math.random() * 4) + 1);
		user.status = Math.floor((Math.random() * 2));

		user.save(function(err) {
			if (err)
				res.send(err);
		});
	};

	res.json({
		message: 'Dados gerados com sucesso :)'
	});
});

// on routes that end in /users
// ----------------------------------------------------
router.route('/users/:rowFrom/:rowTo')

// create a user (accessed at POST http://localhost:8080/users)
.post(function(req, res) {

	var user = new User(); // create a new instance of the User model
	user.nome = req.body.nome; // set the users name (comes from the request)
	user.cpf = req.body.cpf;
	user.data = new Date();
	user.bateria = req.body.bateria;
	user.status = req.body.status;

	user.save(function(err) {
		if (err)
			res.send(err);

		res.json({
			message: 'User created!'
		});
	});


})

// get all the users (accessed at GET http://localhost:8080/api/users)
.get(function(req, res) {

	var recordCount;
	User.count({}, function(err, count) {
		if (err) {
			return handleError(err)
		};
		recordCount = count;
	});

	var rowFrom = parseInt(req.params.rowFrom) || 0;
	var rowTo = parseInt(req.params.rowTo) || recordCount;

	console.info('req.body', req.body);

	User.find(function(err, users) {
		if (err)
			res.send(err);

		var response = {
			recordCount: recordCount,
			rowFrom: rowFrom,
			rowTo: rowTo,
			query: users
		}

		res.json(response);
	}).skip(rowFrom).limit(rowTo);
});

// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id')

// get the user with that id
.get(function(req, res) {
	User.findById(req.params.user_id, function(err, user) {
		if (err)
			res.send(err);
		res.json(user);
	});
})

// update the user with this id
.put(function(req, res) {
	User.findById(req.params.user_id, function(err, user) {

		if (err)
			res.send(err);

		user.name = req.body.name;
		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({
				message: 'User updated!'
			});
		});

	});
})

// delete the user with this id
.delete(function(req, res) {
	User.remove({
		_id: req.params.user_id
	}, function(err, user) {
		if (err)
			res.send(err);

		res.json({
			message: 'Successfully deleted'
		});
	});
});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);