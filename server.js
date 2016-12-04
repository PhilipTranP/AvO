var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 5000;

// use ejs and express layouts

app.set('view engine', 'ejs');
app.use(expressLayouts);

//use body parser

app.use(bodyParser.urlencoded({ extended: true }));

var router = require ('./app/routes');
app.use('/', router);

// set static files (css and images, etc) location

app.use(express.static(__dirname + '/public'));

// start the server
app.listen(PORT, function() {
  console.log('app started on port 5000!');
});

// route our app


