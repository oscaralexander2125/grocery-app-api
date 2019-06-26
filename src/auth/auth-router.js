'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const UsersService = require('../users/users-services');
const bcrypt = require('bcryptjs');

const config = require('../config');
const authRouter = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.email,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

//const localAuth = passport.authenticate('local', {session: false});
authRouter.use(bodyParser.json());

authRouter
.route('/login')
.post((req, res, next) => {
  const {email, password} = req.body;
  const knexInstance = req.app.get('db');
  UsersService.getByEmail(knexInstance, email)
  .then(user => {
    if (!user) {
      return res.status(422).json({
        error: {message: 'Email not found'}
      })
    }
    bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if(doMatch) {
          req.session.user = user;
        }
        res.status(422).json({
          reason: 'LoginError',
          message: 'Incorrect email or password'
        })
      })
  })
  .then(() => {
    const authToken = createAuthToken(req.session.user);
    res.json({authToken});
  })
  .catch(next);
});

module.exports = authRouter;