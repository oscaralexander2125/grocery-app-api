const express = require('express');
const UsersService = require('./users-services');
const path = require('path');
const bycrypt = require('bcryptjs');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
  id: user.id,
  email: user.email,
})

function validUser(user) {
  const {firstname, lastname, email, password} = user;
  const newUser = {firstname, lastname, email, password};

  for (const [key, value] of Object.entries(newUser)) {
    if (value == null)
      return null;
  }

  const explicitlyTrimmedFields = ['email', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => user[field].trim() !== user[field]
  );

  if (nonTrimmedField) {
    return null;
  }

  const sizeFields = {
    email: {
      min: 1
    },
    password: {
      min:10,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizeFields).find(
    field => 
      'min' in sizeFields[field] && user[field].trim().length < sizeFields[field].min
  );
  const tooLargeField = Object.keys(sizeFields).find(
    field => 
      'max' in sizeFields[field] && user[field].trim().length > sizeFields[field].max
  )

  if (tooSmallField || tooLargeField) {
    return null;
  }
  return 1;
}

usersRouter
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');

    let isValid = validUser(req.body);

    if (isValid == null) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Make sure there are no trailing whitespaces and the password is an accurate length'
      })
    }

    let {email, password, firstname = '', lastname = ''} = req.body;

    firstname = firstname.trim();
    lastname = lastname.trim();

    UsersService.getEmailCount(knexInstance, email)
      .then(user => {
        if (user[0].count > 0) {
          return res.status(422).json({
            error: {message: 'User already exists'}
          })
        }
        return;
      })
      .catch(next);

    return bycrypt.hash(password, 12)
      .then(hashPassword => {
        password = hashPassword;
        const newUser = {firstname, lastname, email, password};
        return UsersService.insertUser(req.app.get('db'), newUser)
      })
      .then(user => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json(serializeUser(user))
      })
      .catch(next);
  })

usersRouter
  .route('/:id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getById(knexInstance, req.params.id)
      .then(user => {
        if(!user) {
          return res.status(404).json({
            error: {message: 'User not found'}
          })
        }
        res.json(user)
      })
      .catch(next);
  })

  module.exports = usersRouter;