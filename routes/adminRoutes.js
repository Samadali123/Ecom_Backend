const express = require('express');
const router = express.Router();
const {AdminIsLoggedIn} = require("../middlewares/auth.middleware");
const { adminRegister, adminLogin, adminLogout, admindashboard, forgotPassword, updatePassword, changePassword, AdminloginWithGoogle, adminloginWithGoogle } = require('../controllers/admin.controllers');


// /register 
// tested
router.post("/register",   adminRegister)

// /login 
// tested
router.post("/login", adminLogin)

//  /logout
// tested 
router.get("/logout",AdminIsLoggedIn, adminLogout)

// /forgotpassword
// tested 
router.post('/forgotpassword',  forgotPassword);

// /updatepassword/:token
// tested 
router.put('/updatepassword', updatePassword);

// /resetpassword
// tested
router.put("/resetpassword", AdminIsLoggedIn, changePassword);



module.exports = router;