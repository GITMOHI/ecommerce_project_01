const express = require('express');
const { loginUser, loggedUser, logoutUser, checkSession, getUserActivities, changePassword, ensureAuthenticated, forgotPassword, resetPassword } = require('../controllers/Auth');
const router = express.Router();

const passport = require('passport');

router
  .post('/login',passport.authenticate('local'),loginUser)
  .post('/logout',logoutUser)
  .post('/change_password',ensureAuthenticated,changePassword)
  .post('/forgot-password',forgotPassword)
  .post('/reset-password',resetPassword)
  .get('/loggeduser',loggedUser)
  .get('/loggeduserActivity',getUserActivities)
  .get('/check',checkSession);


exports.router = router;