var express = require('express');  
var router = express.Router(); 
var app = require('../app'); 
var nonce = require('nonce')();
var base62= require('base62');
var url = require('url');
var uuid = require('node-uuid');

console.log("index.js running");
module.exports = router;

/* GET home page. */

router.get('/', function(req, res, next) {
  var db = app.get('mongo');                   //must align with app.set name
  res.render('index', { title: 'URL Smallifier' });
});



// index.jade needs a form to submit a URL for shortening
router.post('/', function(req, res) {
  var db = app.get('mongo');                   //must align with app.set name
  var collection = db.collection('urldb');

  var urlToShorten = req.body.userURL;  
  console.log("userURL is " + urlToShorten);

//// add http  
  var http = /http:\/\/*/;
  var https = /https:\/\/*/;
  if (http.test(urlToShorten) )
    {  //console.log("found http:// therefore DID NOT ADD");
    }
  else if (https.test(urlToShorten) )
    {// found https so OK
    }
  else { urlToShorten = "http://" + urlToShorten;
//     console.log("added http://");
//     console.log(urlToShorten + " is urlToShorten after adding http://");
    };
//// end add http

    var shortUrl =  uuid.v4().substring(0,7);  //better one time code
//  var shortUrl = base62.encode(nonce());
  console.log("shortUrl is " + shortUrl);

  collection.insert({'bigURL': urlToShorten, 'smallURL': shortUrl, 'clicks': 0 }, 
  	function(err, docs) {
  	 collection.count(function(err,count){console.log("count = %s",count); });

  res.redirect('/info/' + shortUrl);
  });
});

router.get('/info/:shortUrl', function(req, res) {
  var db = app.get('mongo');                   //must align with app.set name
  var collection = db.collection('urldb'),     // use urldb
    shortUrl = req.params.shortUrl;            //
    
    console.log( req.params.shortUrl + " is req.params.shortUrl ");

  collection.find({'smallURL': shortUrl}, function(err, result) {
  	result.toArray(function(err, url)  {
  		console.log("preparing to render "+ url[0]);
  		  		console.log( url[0]);
  		res.render('info', {url: url[0]}); 

  		console.log("inside info/:shortUrl   " + url[0]);
 		 })
  });
});

router.get('/:shortUrl', function(req, res) {
  var db = app.get('mongo');                   //must align with app.set name
  var collection = db.collection('urldb');
  var  shortUrl = req.params.shortUrl;

    collection.findAndModify({'smallURL': shortUrl}, [], { $inc: {'clicks': 1} } ,function(err, url)
     {
       	res.redirect(url.bigURL);     
  	});
});

//  "<a href= " url.bigURL "> url.smallURL </a>

