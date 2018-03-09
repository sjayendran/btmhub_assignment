var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
var passport = require('passport');
var _ = require('underscore');

router.get('/', function(req, res, next) {
  console.log("routing to home page with these user details:");
  console.log(req.user);
  console.log(req.isAuthenticated());
  const db = require('../db.js');
  db.query('SELECT * FROM chocolates', function(error, results, fields){
    if (error) throw error;

    let chocolist = [];
    if(results.length > 0){
        chocolist = results;
    }

    //console.log("thiiiis is the list of chocolates:");
    //console.log(chocolist);
    
    res.render('home', { 
      title: 'Home',
      chocolates: chocolist 
    });
    
  });
});

router.get('/cart', function(req, res, next) {
  let currentCart = req.session.cart;

  //console.log("%%%% this is the req session NOW:");
  //console.log(req.session.cart);

  const db = require('../db.js');
  db.query(`SELECT * FROM chocolates WHERE id IN (${getChocolateIDsFromCart(req.session.cart)})`, function(error, results, fields){
    if (error) throw error;

    let chocolist = [];
    if(results.length > 0){
        chocolist = results;
    }

    //console.log("thiiiis is the list of chocolates:");
    //console.log(chocolist);

    res.render('cart', { 
      title: 'Shopping Cart',
      boughtChocolates: chocolist
    });
    
  });
});

router.get('/cart/paid', function(req, res, next){
  res.render('cartPaid', { 
    title: 'Cart Paid'
  });

});

router.post('/cart/pay', function(req, res, next) {
  let finalCart = req.session.cart;

  const db = require('../db.js');

  _.each(finalCart, function(x){
    db.query(`UPDATE chocolates SET stock_left = stock_left - ${x.amount} WHERE id = ${x.chocolateID}`, function(error, results, fields){
      if (error) throw error;
      
    });
  });
  req.session.destroy();
  res.redirect('/cart/paid');
});

router.get('/cart/remove/:chocolateID/:chocoPrice/:chocoBrand/:chocoName/:source', function(req, res, next) {
  let currentCart = req.session.cart;
  let chocolate_price = req.params.chocoPrice;
  let chocolate_brand = req.params.chocoBrand;
  let chocolate_name = req.params.chocoName;
  let added_source = req.params.source;

  //let chocolate_price = getPriceOfChocolate(req.params.chocolateID);

  if(_.isUndefined(currentCart)){
    //console.log("%%% CART IS EMPTY:");
    currentCart = [{"chocolateID": req.params.chocolateID, "amount": 1, "unit_price": chocolate_price, "brand": chocolate_brand, "name": chocolate_name}];
  }
  else{
    //CART IS NOT EMPTY
    //console.log("%%%% cart is NOT empty; found this:");
    //currentCart = {"chocolateID": req.params.chocolateID, "amount": 1};
    //console.log(currentCart);
    if(!_.isEmpty(_.findWhere(currentCart, {"chocolateID": req.params.chocolateID}))){
      //found same item in cart
      //console.log("%%% found the same item in the cart!");
      //console.log("GOIGN TO INCREASE ITS COUNT:");
      let matchItem = _.where(currentCart, {chocolateID: req.params.chocolateID});
      if(matchItem[0].amount >= 1){
        matchItem[0].amount -= 1;
      }
    }
  }

  req.session.cart = currentCart;
  
  if(added_source == "cart"){
    res.redirect('/cart');
  }
  else{
    res.redirect('/');
  }
});


router.get('/cart/add/:chocolateID/:chocoPrice/:chocoBrand/:chocoName/:source', function(req, res, next) {
  let currentCart = req.session.cart;
  let chocolate_price = req.params.chocoPrice;
  let chocolate_brand = req.params.chocoBrand;
  let chocolate_name = req.params.chocoName;
  let added_source = req.params.source;

  //let chocolate_price = getPriceOfChocolate(req.params.chocolateID);

  if(_.isUndefined(currentCart)){
    //console.log("%%% CART IS EMPTY:");
    currentCart = [{"chocolateID": req.params.chocolateID, "amount": 1, "unit_price": chocolate_price, "brand": chocolate_brand, "name": chocolate_name}];
  }
  else{
    //CART IS NOT EMPTY
    //console.log("%%%% cart is NOT empty; found this:");
    //currentCart = {"chocolateID": req.params.chocolateID, "amount": 1};
    //console.log(currentCart);
    if(!_.isEmpty(_.findWhere(currentCart, {"chocolateID": req.params.chocolateID}))){
      //found same item in cart
      //console.log("%%% found the same item in the cart!");
      //console.log("GOIGN TO INCREASE ITS COUNT:");
      let matchItem = _.where(currentCart, {chocolateID: req.params.chocolateID});
      matchItem[0].amount += 1;
    }
    else{
      currentCart.push({"chocolateID": req.params.chocolateID, "amount": 1, "unit_price": chocolate_price, "brand": chocolate_brand, "name": chocolate_name});
    }
  }

  req.session.cart = currentCart;

  if(added_source == "cart"){
    res.redirect('/cart');
  }
  else{
    res.redirect('/');
  }
});

router.get('/seller', authenticationMiddleware(), function(req, res, next) {
  const db = require('../db.js');
  db.query('SELECT * FROM chocolates', function(error, results, fields){
    if (error) throw error;

    let chocolist = [];
    if(results.length > 0){
        chocolist = results;
    }

    res.render('sellerHome', { 
      title: 'Seller Home',
      chocolates: chocolist
    });
    
  });
});

router.get('/seller/add', authenticationMiddleware(), function(req, res, next) {
  res.render('sellerAdd', { title: 'Add New Chocolate' });
});

router.post('/seller/add', function(req, res, next) {
  req.checkBody('chocolateName', "Chocolate Name cannot be empty.").notEmpty();
  req.checkBody('chocolateBrand', "Chocolate Brand cannot be empty.").notEmpty();
  req.checkBody('chocolateCountry', "Country of origin cannot be empty.").notEmpty();
  req.checkBody('cocoaContent', "Cocoa content cannot be empty.").notEmpty();
  req.checkBody('cocoaContent', "Cocoa content must be a number.").isFloat();
  req.checkBody('alcoholContent', "Alcohol content cannot be empty.").notEmpty();
  req.checkBody('alcoholContent', "Alcohol content must be a number.").isFloat();
  req.checkBody('weight', 'Weight cannot be empty!').notEmpty();
  req.checkBody('weight', 'Weight must be a number!').isFloat();
  req.checkBody('unitPrice', 'Unit price cannot be empty!').notEmpty();
  req.checkBody('unitPrice', 'Unit price must be a number!').isFloat();
  req.checkBody('stockLeft', 'Stock left cannot be empty!').notEmpty();
  req.checkBody('stockLeft', 'Stock left must be a number!').isInt();
    
  const errors = req.validationErrors();

  if(errors){
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('sellerAdd', { 
      title: 'Chocolate Addition Error',
      errors: errors
    });
  }
  else{
    const chocolateName = req.body.chocolateName;
    const chocolateBrand = req.body.chocolateBrand;
    const chocolateCountry = req.body.chocolateCountry;
    const cocoaContent = req.body.cocoaContent;
    const alcoholContent = req.body.alcoholContent;
    const weight = req.body.weight;
    const unitPrice = req.body.unitPrice;
    const stockLeft = req.body.stockLeft;
    
    const db = require('../db.js');

    db.query('INSERT INTO chocolates (name, brand, origin_country, cocoa_content, alcohol_content, weight, unit_price, stock_left) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [chocolateName, chocolateBrand, chocolateCountry, cocoaContent, alcoholContent, weight, unitPrice, stockLeft], function(error, results, fields){
      if (error) throw error;
      
      res.redirect('/seller');
    });
  }  
});

router.get('/seller/edit/:chocolateID', authenticationMiddleware(), function(req, res, next) {
  let selectedChocID = req.params.chocolateID;

  const db = require('../db.js');
  db.query('SELECT * FROM chocolates WHERE id = ?', [selectedChocID], function(error, results, fields){
    if (error) throw error;

    let thisChocolate = null;
    if(results.length > 0){
      thisChocolate = results[0];
      res.render('sellerEdit', { 
        title: 'Seller Edit',
        selectedChocolate: thisChocolate
      });
    }    
  });
  
  //res.render('sellerAdd', { title: 'Add New Chocolate' });
});

router.get('/seller/delete/:chocolateID', authenticationMiddleware(), function(req, res, next) {
  let selectedChocID = req.params.chocolateID;

  const db = require('../db.js');
  db.query(`DELETE FROM chocolates WHERE id = ${selectedChocID}`, function(error, results, fields){
    if (error) throw error;

    res.redirect('/seller');
  });
  
  //res.render('sellerAdd', { title: 'Add New Chocolate' });
});

router.post('/seller/edit/:chocolateID', function(req, res, next) {
  let selectedChocID = req.params.chocolateID;

  req.checkBody('chocolateName', "Chocolate Name cannot be empty.").notEmpty();
  req.checkBody('chocolateBrand', "Chocolate Brand cannot be empty.").notEmpty();
  req.checkBody('chocolateCountry', "Country of origin cannot be empty.").notEmpty();
  req.checkBody('cocoaContent', "Cocoa content cannot be empty.").notEmpty();
  req.checkBody('cocoaContent', "Cocoa content must be a number.").isFloat();
  req.checkBody('alcoholContent', "Alcohol content cannot be empty.").notEmpty();
  req.checkBody('alcoholContent', "Alcohol content must be a number.").isFloat();
  req.checkBody('weight', 'Weight cannot be empty!').notEmpty();
  req.checkBody('weight', 'Weight must be a number!').isFloat();
  req.checkBody('unitPrice', 'Unit price cannot be empty!').notEmpty();
  req.checkBody('unitPrice', 'Unit price must be a number!').isFloat();
  req.checkBody('stockLeft', 'Stock left cannot be empty!').notEmpty();
  req.checkBody('stockLeft', 'Stock left must be a number!').isInt();
    
  const errors = req.validationErrors();

  if(errors){
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('sellerAdd', { 
      title: 'Chocolate Addition Error',
      errors: errors
    });
  }
  else{
    const chocolateName = req.body.chocolateName;
    const chocolateBrand = req.body.chocolateBrand;
    const chocolateCountry = req.body.chocolateCountry;
    const cocoaContent = req.body.cocoaContent;
    const alcoholContent = req.body.alcoholContent;
    const weight = req.body.weight;
    const unitPrice = req.body.unitPrice;
    const stockLeft = req.body.stockLeft;
    
    const db = require('../db.js');

    db.query('UPDATE chocolates SET name = ?, brand = ?, origin_country = ?, cocoa_content = ?, alcohol_content = ?, weight = ?, unit_price = ?, stock_left = ? WHERE id = ?', [chocolateName, chocolateBrand, chocolateCountry, cocoaContent, alcoholContent, weight, unitPrice, stockLeft, selectedChocID], function(error, results, fields){
      if (error) throw error;
      
      res.redirect('/seller');
    });
  }  
});

router.get('/login', alreadyLoggedin(), function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/seller',
  failureRedirect: '/login'
}));

router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registration' });
});

router.post('/register', function(req, res, next) {
  req.checkBody('sellerName', "Name cannot be empty.").notEmpty();
  req.checkBody('sellerPassportNo', "Passport Number cannot be empty.").notEmpty();
  req.checkBody('sellerCountry', "Country cannot be empty.").notEmpty();
  req.checkBody('sellerContactNumber', "Contact number cannot be empty.").notEmpty();
  req.checkBody('sellerEmail', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('password', "Password cannot be empty.").notEmpty();
  req.checkBody('password', 'Password must be between 6-40 characters long.').len(6, 40);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
    
  const errors = req.validationErrors();

  if(errors){
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('register', { 
      title: 'Registration Error',
      errors: errors
    });
  }
  else{
    const sellerName = req.body.sellerName;
    const sellerPassportNo = req.body.sellerPassportNo;
    const sellerCountry = req.body.sellerCountry;
    const sellerContactNumber = req.body.sellerContactNumber;
    const sellerEmail = req.body.sellerEmail;
    const username = req.body.username;
    const password = req.body.password;
    const passwordMatch = req.body.passwordMatch;
    const db = require('../db.js');

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB. 
            db.query('INSERT INTO sellers (name, passport, country, contact_number, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [sellerName, sellerPassportNo, sellerCountry, sellerContactNumber, sellerEmail, username, hash], function(error, results, fields){
              if (error) throw error;
              
              db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
                if (error) throw error;

                const user_id = results[0];
                console.log('after succcessful registration; this is the result:');
                console.log(user_id);
                req.login(user_id, function(err){
                  res.redirect('/');
                });
              });
            });
        });
    });
  }  
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

function getChocolateIDsFromCart(cart){
  let chocIDs = [];

  //console.log("%%% GOING TO GET choco ids from this cart:");
  //console.log(cart);
  _.each(cart, function(x){
    //console.log("%%% pushing choco ID:");
    //console.log(x.chocolateID);
    chocIDs.push(x.chocolateID);
  });

  //console.log("%%% this i sthe final choco ID list");
  //console.log(chocIDs);

  return chocIDs;
}

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login');
	}
}

function alreadyLoggedin () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

      if (req.isAuthenticated()){
        res.redirect('/');
      }
      else{
        return next();
      }
	}
}

module.exports = router;
