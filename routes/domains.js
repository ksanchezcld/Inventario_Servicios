var express = require('express');
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = express.Router();

var Domain = require('../models/domain');
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/domain-register', function(req, res, next){
  res.render('domain-register', {title: 'Registro Dominios'})
});

router.get('/signup', function(req, res, next){
  res.render('signup', {title: 'Registro Usuarios'})
});

router.get('/login', function(req, res, next){
  res.render('login', {title: 'Login'});
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/domains/login', failureFlash: 'Nombre de usuario o password invalido'}),
  function(req, res){
    req.flash('success', 'Se ha logeado correctamente');
    res.redirect('/');
  });

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user)
      }else{
        return done(null, false, {message: 'Invalid Password'});  
      }
    });
  });
}));

router.post('/domain-register', function(req, res, next){
  var domain_name = req.body.domain_name;
  var adquisition_date = req.body.adquisition_date;
  var expiration_date = req.body.expiration_date;
  var adquisition_period = req.body.adquisition_period; // Adquisition Period = 1yr., 2yr.
  var registered_email = req.body.registered_email;
  var invoice_number = req.body.invoice_number;

  // Form Validator
  req.checkBody('domain_name', 'El nombre de dominio es requerido').notEmpty();
  req.checkBody('adquisition_date', 'La fecha de compra es requerida').notEmpty();
  req.checkBody('expiration_date', 'La fecha de expiracion es requerida').notEmpty();
  req.checkBody('adquisition_period', 'El periodo de vigencia es requerido').notEmpty();
  req.checkBody('invoice_number', 'El numero de factura es requerido').notEmpty();
  //req.checkBody('email', 'El email no es valido').isEmail();

  var errors = req.validationErrors();
  if(errors){
    res.render('domain-register', {
      errors: errors
    });
  } else {
    var newDomain = new Domain({
      domain_name: domain_name,
      adquisition_date: adquisition_date,
      expiration_date: expiration_date,
      adquisition_period: adquisition_period,
      registered_email: registered_email,
      invoice_number: invoice_number
      //AUTORENEW: ON (CHECKBOX)
      //Price $14.99/yr.
    });
    Domain.createDomain(newDomain, function(err, domain){
      if(err) throw err;
      console.log(domain);
    });
    req.flash('success', 'La informacion de dominio se ha registrado correctamente')
    res.location('/');
    res.redirect('/');
  }
});

router.post('/signup', upload.single('profileimage'), function(req, res, next){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.pasword;

  if(req.file){
    console.log('Uploading File....');
    var profileimage = req.file.filename;
  } else {
    console.log('No File Uploaded...');
    var profileimage = 'noimage.jpg';
  }

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if(errors){
    res.render('signup', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success', 'El usuario se ha registrado, ahora puedes hacer login')
    res.location('/');
    res.redirect('/');
  }

});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'La sesion ha sido cerrada');
  res.redirect('/domains/login')
})

module.exports = router;