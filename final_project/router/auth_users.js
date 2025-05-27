const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "dnson123",
    password: "dnson123456",
  },
];

const isValid = (username) => {
  // if (users.length === 0) return true;
  const username_users = users.filter((user) => user.username === username);
  return username_users.length === 0;
};

const authenticatedUser = (username, password) => {
  const user_login = users.filter(
    (user) => user.username === username && user.password === password
  );
  return user_login.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ username }, "access", {
        expiresIn: 60 * 10,
      });

      req.session.authentication = {
        accessToken,
        username,
      };

      return res.status(200).send("User successfully logged in");
    }
    return res.status(401).json({ message: "Username or password invalid!" });
  }
  return res
    .status(400)
    .json({ message: "Username and password are required!" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.user;
  const isbn = req.params.isbn;
  const review = req.body.review;
  const book = books[isbn];

  if (!book) return res.status(404).json({ message: "Book not found" });

  if (review === "") {
    // Nếu không có review gửi lên, xóa review cũ (nếu có)
    if (book.reviews[user.username]) {
      delete book.reviews[user.username];
      return res.send(`Deleted review from ${user.username} for book ${isbn}`);
    } else {
      return res.status(404).json({ message: "No review to delete" });
    }
  }

  book.reviews[user.username] = review;
  res.send(`Updated review from ${user.username} for book ${isbn}`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.user;
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.reviews[user.username]) {
    delete book.reviews[user.username];
    return res.send(`Deleted review from ${user.username} for book ${isbn}`);
  } else {
    return res.status(404).json({ message: "No review to delete" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
