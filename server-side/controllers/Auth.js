const axios = require("axios");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');  // Import UUID v4 for generating unique tokens



const User = require("../models/Users");
const ResetToken = require('../models/ResetToken.js');  // Import your model

const LoginActivity = require("../models/LoginActivity.js");

const UAParser = require('ua-parser-js');

const getLocationFromGeoJS = async (ip) => {
  try {
    const response = await axios.get(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location from GeoJS:', error);
    return null;
  }
};



exports.loginUser = async (req, res) => {
  try {
    // Update the user's last active time
    await User.findByIdAndUpdate(
      req.user.id,
      { lastActive: new Date() },
      { new: true }
    );

    const updatedUser = await User.findById(req.user.id)
      .select("-password")
      .populate("addresses")
      .populate("orders")
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the device info from the User-Agent header
    const parser = new UAParser();
    const parsedUA = parser.setUA(req.headers['user-agent']).getResult();
    const os = parsedUA?.os?.name || 'Unknown OS';
    const browser = parsedUA?.browser?.name || 'Unknown Browser';
    const device = `${os} (${browser})`;

    // Get the IP address from the request
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const publicIP = ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;
    console.log('IP address: ' + ip);

    // Get the location based on the IP address
    const location = await getLocationFromGeoJS(ip);
    console.log("---location----", location);

    const loginActivity = new LoginActivity({
      user: req.user.id,
      activityType: 'Login',
      ip: ip,
      device: device,
      location: location ? `${location.city}, ${location.region}, ${location.country}` : 'Location Unavailable',
      timestamp: new Date(),
    });

    // Save the login activity
    await loginActivity.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match." });
    }

    // Fetch user from session
    const user = req.user;
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.lastActive = new Date();
    await user.save();


    // Log activity (optional)
    const parser = new UAParser();
    const parsedUA = parser.setUA(req.headers['user-agent']).getResult();
    const device = `${parsedUA?.os?.name || 'Unknown OS'} (${parsedUA?.browser?.name || 'Unknown Browser'})`;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const location = await getLocationFromGeoJS(ip);

    const loginActivity = new LoginActivity({
      user: user._id,
      activityType: 'Password Change',
      ip,
      device,
      location: location ? `${location.city}, ${location.region}, ${location.country}` : 'Location Unavailable',
      timestamp: new Date(),
    });

    // console.log("Login Activity ",  loginActivity);

      await loginActivity.save();//actually saving the password changing activity...
      res.status(200).json({ message: "Password changed successfully. Please log in again." });
    
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//forgot password...
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, 
  },
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log(email);

  // Find the user by email
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: 'User not found.' });  // Sending JSON with message
  }

  // Generate a reset token using UUID
  const resetToken = uuidv4();  

  const expires = Date.now() + 3600000;  // 1 hour expiration

  // Save the reset token to the database
  const newResetToken = new ResetToken({
    email: user.email,
    token: resetToken,
    expires: expires,
  });

  await newResetToken.save();

  // Generate the reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send the reset password email
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error:', err);
      return res.status(500).json({ message: 'Error sending email' });  // Sending JSON with message
    }
    res.status(200).json({ message: 'Password reset email sent' });  // Sending JSON with message
  });
};



exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log(token, newPassword);
  
  try {
    // Find the reset token from the database
    const resetRequest = await ResetToken.findOne({ token });

    if (!resetRequest) {
      return res.status(400).json({
        message: 'Invalid or expired token.'
      });
    }

    if (Date.now() > resetRequest.expires) {
      return res.status(400).json({
        message: 'Token has expired.'
      });
    }

    const user = await User.findOne({ email: resetRequest.email });

    if (!user) {
      return res.status(400).json({
        message: 'User not found.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    await user.save();
    await ResetToken.deleteOne({ token });
    
        // Log activity (optional)
        const parser = new UAParser();
        const parsedUA = parser.setUA(req.headers['user-agent']).getResult();
        const device = `${parsedUA?.os?.name || 'Unknown OS'} (${parsedUA?.browser?.name || 'Unknown Browser'})`;
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        const location = await getLocationFromGeoJS(ip);
    
        const loginActivity = new LoginActivity({
          user: user._id,
          activityType: 'Reset Password',
          ip,
          device,
          location: location ? `${location.city}, ${location.region}, ${location.country}` : 'Location Unavailable',
          timestamp: new Date(),
        });
    
        // console.log("Login Activity ",  loginActivity);
    
          await loginActivity.save();

    res.status(200).json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Something went wrong. Please try again later.'
    });
  }
};





// logout
exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Session destruction failed" });
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.json("Logged out");
    });
  });
};

exports.loggedUser = async (req, res) => {
  console.log("req.user:-", req.user);
  if (!req.user) {
    return res.status(404).json({ error: "User not found" });
  }
  const id = req.user.id;
  const user = await User.findById(id, "name email id addresses image")
    .populate("addresses")
    .exec();
  res.json(user);
};


//fetch activiy for current logged user...
exports.getUserActivities = async (req, res) => {
  try {
    //user authenticated?
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetching all activities for the logged-in user
    const activities = await LoginActivity.find({ user: req.user.id })
      .sort({ timestamp: -1 }) 
      .exec();


    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Route to check session
exports.checkSession = async (req, res) => {
  console.log("at auth");
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).send({ message: "Not authenticated" });
  }
};

exports.ensureAuthenticated = (req, res, next) => {
  console.log("ensureAuthenticated");
  if (req.isAuthenticated()) {
    return next(); // User is authenticated
  }
  res.status(401).json({ message: "Unauthorized: Please log in." });
};
