// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// Requiring our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// Our scraping tools
var request = require('request');
var cheerio = require('cheerio');

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Serve static content for the app from the "public" directory
app.use(express.static('public'));

// Set up Dynamic Port
var PORT = process.env.PORT || 3000;

var databaseUri = 'mongodb://localhost/mongo-scraper';

if(process.env.MONGODB_URI){
	mongoose.connect(process.env.MONGODB_URI);
} else{
	mongoose.connect(databaseUri);
}

var db = mongoose.connection;

db.on('error', function(error){
	console.log('Mongoose Error: ', error);
});

db.once('open', function(){
	console.log("Connected successful");
});

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res){
	Article.find({}, function(error, doc){
		if(error){
			console.log(error);
		} else{
			res.render('index', {articleList : doc})
		}
	});
});

app.get('/scrape', function(req, res){
	request('https://www.recode.net/trending/', function(error, response, html){
		var $ = cheerio.load(html);
		var results = [];

		$('div.c-entry-box__body').each(function(i, element){
			var title = $(this).children('h2').text();
			var description = $(this).children('p').first().text();
			var link = $('h2').children('a').attr('href');

			results.push({
				title: title,
				description: description,
				link: link,
				saved: false
			});
		});
		console.log(results);
		res.render('index', {articleList: results});
	});
});

app.post("/deleteArticle/:id", function(req, res){
	Article.findOneAndUpdate({"_id": req.params.id}, {"saved": false})
	.exec(function(err, doc){
		if(error){
			console.log(error);
		}else{
			res.redirect("/saved");
		}
	});
});

app.post("/saveArticle/:id", function(req, res){
  Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true})
  .exec(function(err, doc){
  if (error) {
    console.log(error);
  }
  else {
    console.log(doc);
  }
  });
});

app.get("/saved", function(req, res){
	Article.find({}, function(error, doc){
		if(error){
			console.log(error);
		}else{
			console.log("app.get saved");
			var hbsObject = {
				entry: doc
			};
			res.render("saved", hbsObject);
		}
	});
});

app.listen(PORT, function(){
	console.log("Listening on port: " + PORT);
});