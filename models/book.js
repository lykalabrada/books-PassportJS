let mongoose = require('mongoose');

// Book Schema
let bookSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  gist:{
    type: String,
    required: true
  }
});

let Book = module.exports = mongoose.model('Book', bookSchema);
