"use strict";

var express = require('express');
var path = require('path');
var twit = require('twit');
var sentimental = require('Sentimental');
var async = require('async');

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

  console.log("----------")

   // grade 20 tweets from today with keyword choice and call callback
  // when done
  function getAndScoreTweets(choice, callback) {
    twitter.get('search/tweets', {q: '' + choice + ' since:' + today.getFullYear() + '-' + 
      (today.getMonth() + 1) + '-' + today.getDate(), count:20}, function(err, data) {
        // perfrom sentiment analysis (see below)
      if(err) {
        console.log(err);
        callback(err.message, undefined);
        return;
      }
      var score = performAnalysis(data['statuses']);
      console.log("score:", score)
      console.log("choice:", choice)
      callback(null, score);
    });
  }
  //Grade tweets for each choice in parallel and compute winner when
  //all scores are collected
  async.map(choices, getAndScoreTweets, function(err, scores) {
    if(err) {
      console.log("Unable to score all tweets");
      res.end(JSON.stringify(err));
    }
    var highestChoice = choices[0];
    var highestScore = scores.reduce(function(prev, cur, index) { 
      if(prev < cur) {
        highestChoice = choices[index];
        return cur;
      } else {
        return prev;
      }
    });
    res.end(JSON.stringify({'score': highestScore, 'choice': highestChoice}));
  });             
})

function performAnalysis(tweetSet) {
  //set a results variable
  var results = 0;
  // iterate through the tweets, pulling the text, retweet count, and favorite count
  for(var i = 0; i < tweetSet.length; i++) {
    var tweet = tweetSet[i]['text'];
    var retweets = tweetSet[i]['retweet_count'];
    var favorites = tweetSet[i]['favorite_count'];
    // remove the hashtag from the tweet text
    tweet = tweet.replace('#', '');
    // perfrom sentiment on the text
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