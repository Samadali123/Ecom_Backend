
// require("dotenv").config({ path: "./.env" });
// const express = require('express');
// const app = express();
// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
// const usersRoutes = require("./routes/userRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const productRoutes = require("./routes/productRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// const wishlistRoutes =  require("./routes/wishlistRoutes");
// const orderRoutes = require("./routes/orderRoutes")
// const dashboardRoutes = require("./routes/dashboardRoutes")
// const cors = require("cors");
// const helmet = require("helmet")
// const passport = require("passport")
// const session = require("express-session")

// // Set up a database connection
// require("./config/db.config").DbConnection();

// // CORS middleware for apis access.
// app.use(cors()); 

// // Logger middleware
// app.use(logger('tiny'));

// //secure http headers
// app.use(helmet());

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Cookie parser
// app.use(cookieParser());

// // Session setup (required for passport)
// app.use(
//     session({
//       secret: process.env.SESSION_SECRET, 
//       resave: false,
//       saveUninitialized: false,
//     })
//   );
  
// // Initialize passport for authentication
// app.use(passport.initialize());
// app.use(passport.session());

// require("./config/google.auth"); 

// // Base URI for user routes
// app.use(`/Ecommerce/users/user`, usersRoutes);

// // Base URI for admin routes
// app.use("/Ecommerce/admins/admin", adminRoutes);

// // Base URI for product routes
// app.use('/Ecommerce/products', productRoutes);

// // Base URI for cart routes
// app.use('/Ecommerce/users/user/cart', cartRoutes);

// // Base URI for wishlist routes
// app.use("/Ecommerce/user/wishlist", wishlistRoutes)

// // Base URI for order routes
// app.use("/Ecommerce/order", orderRoutes)

// // Base URI for dashboard routes
// app.use("/Ecommerce/dashboard", dashboardRoutes)

// // Catch-all route for unknown paths
// app.all('*', (req, res) => {
//     res.status(404).json({ success: false, message: `${req.url} not found` });
// });

// // Start server
// const PORT = process.env.PORT || 8080; 
// app.listen(PORT, () => {
//     console.log(`Server started running on port ${PORT}`);
// });



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

// Import routes
const usersRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const googleRoutes = require("./routes/googleRoutes")


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

//Google Authentication configuration 
require("./config/google.auth")


// Set up route prefixes
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
