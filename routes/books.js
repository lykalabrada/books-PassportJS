const express = require('express');
const router = express.Router();

// Bring in Book Model
let Book = require('../models/book')
// User models
let User = require('../models/user')

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_book',  {
    title:'Add Book'
  });
});

// Add Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('gist', 'Gist is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_book', {
      title:'Add Book',
      errors:errors
    });
  } else {
    let book = new Book();
    book.title = req.body.title;
    book.author = req.user._id;
    book.gist = req.body.gist;
    book.save(function(err){
      if(err) {
        console.log(err);
        return;
      }
      else {
        req.flash('success','Book Added');
        res.redirect('/');
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Book.findById(req.params.id, function(err, book){
    if(book.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_book', {
      title:'Edit Book',
      book:book
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let book = {};
  book.title = req.body.title;
  book.author = req.body.author;
  book.gist = req.body.gist;

  let query = {_id:req.params.id};

  Book.update(query, book, function(err){
    if(err) {
      console.log(err);
      return;
    }
    else {
      req.flash('success', 'Book Updated!');
      res.redirect('/');
    }
  });
  return;
});

// Delete a Book
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id};

  Book.findById(req.params.id, function(err, book){
    if(book.author != req.user._id){
      res.status(500).send();
    } else {
      Book.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

// Get Single Book
router.get('/:id', function(req, res){
  Book.findById(req.params.id, function(err, book){
    User.findById(book.author, function(err, user){
      res.render('book', {
        book:book,
        author: user.name
      });
    });

  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
