const express = require("express");
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      return res.json({
        message: "User successfully registered. Now you can login",
      });
    }
    return res.status(409).json({ message: "User already exists!" });
  }
  return res
    .status(400)
    .json({ message: "Username and password are required!" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 2000);
  })
    .then((allBooks) => res.json(allBooks))
    .catch((err) => res.status(500).json({ message: "Internal server error" }));
  // res.json(books)
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const found = books[isbn];
    setTimeout(() => {
      if (found) {
        resolve(found);
      } else {
        reject(`Book not found with the given ISBN ${isbn}`);
      }
    }, 2000);
  })
    .then((book) => res.json({ [isbn]: book }))
    .catch((err) => res.status(404).json({ message: err }));

  // const isbn = req.params.isbn;
  // const book = books[isbn];
  // if (book) return res.json(book);
  // res
  //   .status(404)
  //   .json({ message: `Book not found with the given ISBN ${isbn}` });
});

const normalize = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\W_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const result = {};

    setTimeout(() => {
      for (let isbn in books) {
        if (normalize(books[isbn].author) === normalize(author)) {
          result[isbn] = books[isbn];
        }
      }

      if (Object.keys(result).length > 0) {
        resolve(result);
      } else {
        reject(`Book not found with the given author ${author}`);
      }
    }, 2000);
  })
    .then((author_books) => res.json(author_books))
    .catch((err) => res.status(404).json({ message: err }));

  // const author = req.params.author;
  // const author_books = {};

  // for (let isbn in books) {
  //   if (normalize(books[isbn]["author"]) === normalize(author)) {
  //     author_books[isbn] = books[isbn];
  //   }
  // }
  // if (author_books) return res.json(author_books);
  // res
  //   .status(404)
  //   .json({ message: `Book not found with the given author ${author}` });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    const result = {};

    setTimeout(() => {
      for (let isbn in books) {
        if (normalize(books[isbn].title) === normalize(title)) {
          result[isbn] = books[isbn];
        }
      }

      if (Object.keys(result).length > 0) {
        resolve(result);
      } else {
        reject(`Book not found with the given title ${title}`);
      }
    }, 2000);
  })
    .then((title_books) => res.json(title_books))
    .catch((err) => res.status(404).json({ message: err }));

  // const title = req.params.title;
  // const title_books = {};

  // for (let isbn in books) {
  //   if (normalize(books[isbn].title) === normalize(title)) {
  //     title_books[isbn] = books[isbn];
  //   }
  // }

  // if (Object.keys(title).length > 0) return res.json(title_books);
  // res
  //   .status(404)
  //   .json({ message: `Book not found with the given title ${title}` });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    if (Object.keys(book.reviews).length > 0) return res.json(book.reviews);
    return res
      .status(404)
      .json({ message: `No reviews found for the book with ISBN ${isbn}` });
  }
  res
    .status(404)
    .json({ message: `Book not found with the given ISBN ${isbn}` });
});

module.exports.general = public_users;
