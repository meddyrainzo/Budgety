'use strict';

const User = function(name, email, password) {
  this.name = name;
  this.email = email;
  this.password = password;
};

module.exports = User;
