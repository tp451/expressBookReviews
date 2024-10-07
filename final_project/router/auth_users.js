const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid
const isValid = (username) => { 
    let validusers = users.filter((user) => {
        return (user.username === username);
    });
    return validusers.length > 0;
};

// Function to verify if username and password match records
const authenticatedUser = (username, password) => { 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Login failed: Username or password missing." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Login successful. Welcome back!");
    } else {
        return res.status(208).json({ message: "Login failed: Invalid username or password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];
    let review = book["reviews"];
    let qryreview = req.query.review;
    let username = req.body.username;

    if (qryreview) {
        review[username] = qryreview;
    }

    book["reviews"] = review;
    books[isbn]["reviews"] = book["reviews"];

    res.send(JSON.stringify({ review }, null, 4));
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];
    let review = book["reviews"];
    let username = req.body.username;

    if (username) {
        delete review[username];
    }

    return res.status(208).json({ message: `The review for ISBN ${isbn} by user ${username} has been removed. We’ll miss it!` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
