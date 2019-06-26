const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const UsersService = require('../users/users-services');
const {JWT_SECRET} = require('../config');

module.exports = {localStrategy, jwtStrategy}