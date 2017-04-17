var express = require('express');
var app     = express();
var path = require('path');
var server = require('http').Server(app);
var bodyParser = require('body-parser');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname,'views/')));
app.use(express.static(path.join(__dirname,'/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//webservice mock for login
app.post('/login', function(req, res){
	var auth  =  req.body;
	//dummmy user test:test
	if(auth.user=="test" && auth.password=="test"){
		//dummy token from db for success
		res.status(200).json({status:'LOGGEDIN',token:'dummy'})
	}else{
		//dummy error
		res.status(403).json({status:'AUTHERR'})
	}
});

//middleware to check cross origin and authentication token verification
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
})

//main route to render app login necessary so after middleware
app.get('/', function(req, res){
	res.render('index');
});

server.listen('5003');
console.log('Server running on port 5003');
exports = module.exports = app; 	