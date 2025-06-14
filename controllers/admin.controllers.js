
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const secretKey = process.env.JWT_SECRET_KEY;
const nodemailer  = require("nodemailer")
const crypto = require("crypto");

// regitser account 
exports.adminRegister = async (req, res) => {
    try {
        const { username, email, password} = req.body;

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(403).json({ success: false, message: "Admin already registered" });
        }
      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!secretKey) {
            // throw new Error('JWT_SECRET_KEY environment variable is not set');
            return res.status(403).json({ success: false, message:  "Invalid  jwt secret key" });

        }

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: true
        });

        const token = jwt.sign({ email: newUser.email, userid: newUser._id, isAdmin: newUser.isAdmin },
            secretKey, { algorithm: 'HS256', expiresIn: '1h' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
         
        res.status(200).json({ success: true, newUser, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// login with email and password
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(403).json({ success: false, message: "Please fill the details" });
    }
    
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Admin not registered, please register to login" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ email: user.email, userid: user._id, isAdmin: user.isAdmin }, secretKey, { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ success: true, user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// login with google authorization
exports.adminloginWithGoogle = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        if (!username) {
            return res.status(403).json({ success: false, message: "Username is not provided" });
        }

        if (!email) {
            return res.status(403).json({ success: false, message: "Email is not provided" });
        }

        // Check if a user exists with the provided email
        let user = await userModel.findOne({ email });
        
        if (!user) {
            // Register new user
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(process.env.PASSWORD, salt); // Use a placeholder password

            user = await userModel.create({
                username,
                email,
                password,
                isAdmin: true
            });

            // Create a token for the new user
            const token = jwt.sign(
                { email: user.email, userid: user._id, isAdmin: user.isAdmin },
                secretKey,
                { expiresIn: '1h' }
            );

            // Set the token in a cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return res.status(200).json({ success: true, user, token });
        } else {
            // If user exists, check if the username matches
            if (user.username === username && user.email === email) {
                // Create a token for the existing user
                const token = jwt.sign(
                    { email: user.email, userid: user._id, isAdmin: user.isAdmin },
                    secretKey,
                    { expiresIn: '1h' }
                );

                // Set the token in a cookie
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                return res.status(200).json({ success: true, user, token });
            } else {
                return res.status(403).json({ success: false, message: "Username does not match the email" });
            }
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// admin logout
exports.adminLogout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
     res.status(error.status).json({success:false, message : error.message})
  }
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// admin forgot password send link 
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(403).json({ success: false, message: 'Please enter your email address.' });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User with this email does not exist.' });
        }

        // Generate reset token and expiration
        const token = crypto.randomBytes(32).toString('hex');
        const expireDate = Date.now() + 2 * 60 * 1000; // 2 minutes from now

        // Save reset token and expiration to user record
        user.resetPasswordToken = token;
        user.resetPasswordExpire = expireDate;
        await user.save();

        // Construct reset link
        // const resetLink = `http://localhost:5173/updatepassword/${token}`;
        const resetLink = `${req.protocol}://${req.get('host')}/updatepassword/${token}`;
        // Set up email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `
                <html>
                <body>
                    <p>Dear User,</p>
                    <p>We received a request to reset your Apnamart password,please click the link below to reset your password:</p>
                    <p><a href="${resetLink}" style="color: #007bff; font-weight: bold;">Reset your password</a></p>
                    <p>This link will expire in 2 minutes. If you did not request this change, please ignore this email.</p>
                    <p>Best regards,<br>Apnamart Support Team</p>
                </body>
                </html>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
        }
    }
};

//
exports.updatePassword = async (req, res) => {

    const { password, confirmPassword, token } = req.body || req.query;

    try {
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }

        // Find user by reset token and check token expiration
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Hash the new password and update user record
        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {

        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};

// change password for admin user account
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userid; // Assuming user ID is attached to req.user

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    try {
        // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect, forgot your password' });
        }

        // Hash new password and update user record
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully.' });

    } catch (error) {
        // Check if headers have already been sent
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


