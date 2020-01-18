'use strict';

const LoggedUserDTO = function(token, user, refreshToken) {
  this.token = token;
  this.user = user;
  this.refreshToken = refreshToken;
};

module.exports = LoggedUserDTO;
