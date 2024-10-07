const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Setting up session for customer routes
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware for customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "Authentication failed: Invalid token." });
            }
        });
    } else {
        return res.status(403).json({ message: "Authentication failed: User not logged in." });
    }
});

const PORT = 5000;

// Registering customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Starting the server
app.listen(PORT, () => console.log("Server is up and running on port " + PORT));
