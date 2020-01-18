'use strict';

const jwt = require('jsonwebtoken');
const logger = require('pino')();

const authorizationMiddleware = function(refreshTokenService) {
  return async (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
      logger.error('No token found. Authorization denied');
      return res.status(401).json({ errorMessage: 'Authorization denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId };
      next();
    } catch (err) {
      // Try to refresh the token
      const refreshToken = req.header('x-refresh-token');
      try {
        const accessToken = await refreshTokenService.createAccessToken(
          refreshToken
        );
        const decoded = jwt.verify(accessToken.token, process.env.JWT_SECRET);
        res.set(
          'Access-Control-Expose-Headers',
          'x-auth-token, x-refresh-token'
        );
        res.set('x-auth-token', accessToken.token);
        res.set('x-refresh-token', refreshToken);
        req.user = { userId: decoded.userId };
        next();
      } catch (err) {
        logger.error(`Failed to authenticate user :: ${err}`);
        res.status(401).json({ errorMessage: 'Not authenticated' });
      }
    }
  };
};

module.exports = authorizationMiddleware;
