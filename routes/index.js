var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    res.render('index', { title: 'Inventario' });
  });


function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/domains/login')
}

module.exports = router;
