'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');

module.exports = function makeRouterWithSockets (io, client) {


  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT name, tweets.id, content FROM tweets INNER JOIN users ON tweets.userid = users.id', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      console.log(tweets)
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT name, tweets.id, content FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE users.name = $1', [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true, username: req.params.username });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
      client.query('SELECT name, tweets.id, content FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE tweets.id = $1', [req.params.id], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var userID = result.rows[0].id;
      console.log(userID)
      client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [userID, req.body.content], function (err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        io.sockets.emit('new_tweet', tweets);
      });
    });
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
