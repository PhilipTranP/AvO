'use strict';

var express = require('express');
var path = require('path');
var twit = require('twit');
var sentimental = require('Sentimental');

var router = express.Router();

module.exports = router;

router.get('/', function(req, res){
	res.render('pages/index');
});

router.get('/about', function(req, res) {
	res.render('pages/about');
});

router.get('/contact', function(req, res){
	res.render('pages/contact');
});

router.post('/contact');

router.post('/search', function(req, res) {
  // grab the request from the client
  var choices = JSON.parse(req.body.choices);
  // grab the current date
  var today = new Date();
  // establish the twitter config (grab your keys at dev.twitter.com)
  var twitter = new twit({
    consumer_key: 'ZeLRdDOKnlfrtAwMyq3TWwhMX',
    consumer_secret: 'uFUj7JVybYTLajzFZ3nyTMNd3mKiWTkfYt49QyZ6N4wkh7JZd0',
    access_token: '2273705648-vYO2MwOtX2583AJUmqjIYELHQWmVwAsBxDqBuJW',
    access_token_secret: 'VjIIOb1IeZQpUJZdoLZBcHh9X8NBD5iMHJk3xWsY23Fwu',

  });
  // set highest score
  var highestScore = -Infinity;
  // set highest choice
  var highestChoice = null;
  // create new array
  var array = [];
  // set score
  var score = 0;
  console.log("----------")

  // iterate through the choices array from the request
  for(var i = 0; i < choices.length; i++) {
    (function(i) {
    // add choice to new array
    array.push(choices[i])
    // grad 20 tweets from today
    twitter.get('search/tweets', {q: '' + choices[i] + ' since:' + today.getFullYear() + '-' +
      (today.getMonth() + 1) + '-' + today.getDate(), count:20}, function(err, data) {
        // perform sentiment analysis
        score = performAnalysis(data['statuses']);
        function performAnalysis(tweetSet) {
		  //set a results variable
		  var results = 0;
		  // iterate through the tweets, pulling the text, retweet count, and favorite count
		  for(var i = 0; i < tweetSet.length; i++) {
		    var tweet = tweetSet[i]['text'];
		    var retweets = tweetSet[i]['retweet_count'];
		    var favorites = tweetSet[i]['favorite_count'];
		    // remove the hastag from the tweet text
		    tweet = tweet.replace('#', '');
		    // perform sentiment on the text
		    var score = sentimental.analyze(tweet)['score'];
		    // calculate score
		    results += score;
		    if(score > 0){
		      if(retweets > 0) {
		        results += (Math.log(retweets)/Math.log(2));
		      }
		      if(favorites > 0) {
		        results += (Math.log(favorites)/Math.log(2));
		      }
		    }
		    else if(score < 0){
		      if(retweets > 0) {
		        results -= (Math.log(retweets)/Math.log(2));
		      }
		      if(favorites > 0) {
		        results -= (Math.log(favorites)/Math.log(2));
		      }
		    }
		    else {
		      results += 0;
		    }
		  }
		  // return score
		  results = results / tweetSet.length;
		  return results
		}
        console.log("score:", score)
        console.log("choice:", choices[i])
        //  determine winner
        if(score > highestScore) {
          highestScore = score;
          highestChoice = choices[i];
          console.log("winner:",choices[i])
        }
        console.log("")
      });
    })(i)
  }
  // send response back to the server side; why the need for the timeout?
  setTimeout(function() { res.end(JSON.stringify({'score': highestScore, 'choice': highestChoice})) }, 5000);
});