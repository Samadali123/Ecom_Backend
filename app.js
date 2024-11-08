
// Load environment variables
require("dotenv").config({ path: "./.env" });

// Import dependencies
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const path = require("path");


// Import routes
const usersRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const googleRoutes = require("./routes/googleRoutes")
const homeRoute = require("./routes/home.Route")


// Database connection
require("./config/db.config").DbConnection();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for API access
app.use(logger('tiny')); // Logger middleware
app.use(helmet()); // Secure HTTP headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Cookie parser


// Session setup (required for passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//Google Authentication configuration 
require("./config/google.auth")

// Set up route prefixes
app.use("/", homeRoute);
app.use(`/Ecommerce/users/user`, usersRoutes);
app.use("/Ecommerce/admins/admin", adminRoutes);
app.use('/Ecommerce/products', productRoutes);
app.use('/Ecommerce/users/user/cart', cartRoutes);
app.use("/Ecommerce/user/wishlist", wishlistRoutes);
app.use("/Ecommerce/order", orderRoutes);
app.use("/Ecommerce/dashboard", dashboardRoutes);
app.use("/Ecommerce", googleRoutes)


// Catch-all route for unknown paths
app.all('*', (req, res) => {
    res.status(404).json({ success: false, message: `${req.url} not found` });
});

// Start server
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`Server started running on port ${PORT}`);
});
