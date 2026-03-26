const express = require('express');
const router = express.Router(); // create router instance

// install express-validator to validate data
const { body, param, validationResult } = require('express-validator');

// import books data
let { books, nextId } = require('../books');


// ---------- Validation Rules ----------

// Validate ID
const validateIDParam = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid ID')
];

// Validate book data
const validateBook = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer')
];


// ---------- Middleware to Handle Validation Errors ----------

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};


// ---------- GET All Books ----------

router.get('/', (req, res) => {
  try {
    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});


// ---------- GET Book By ID ----------

router.get('/:id', validateIDParam, handleValidationErrors, (req, res) => {

  const id = parseInt(req.params.id);

  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).send('Book not found');
  }

  res.json(book);
});


// ---------- ADD New Book ----------

router.post('/', validateBook, handleValidationErrors, (req, res) => {

  const newBook = {
    id: nextId++,
    ...req.body
  };

  books.push(newBook);

  res.status(201).json(newBook);
});


// ---------- UPDATE Book ----------

router.put('/:id', validateIDParam, validateBook, handleValidationErrors, (req, res) => {

  const id = parseInt(req.params.id);

  const index = books.findIndex(book => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const updatedBook = {
    ...books[index],
    name: req.body.name,
    author: req.body.author,
    price: req.body.price,
    quantity: req.body.quantity
  };

  books[index] = updatedBook;

  res.json(updatedBook);
});


// ---------- DELETE Book ----------

router.delete('/:id', validateIDParam, handleValidationErrors, (req, res) => {

  const id = parseInt(req.params.id);

  const index = books.findIndex(book => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  books.splice(index, 1);

  res.sendStatus(204);
});

module.exports = router;