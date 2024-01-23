const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

class JwtService {
  constructor(accessKey, accessTime) {
    this.tokenKey = accessKey;
    this.tokenTime = accessTime;
  }

  async verifyAccess(token) {
    return jwt.verify(token, this.tokenKey, {});
  }

  generateTokens(payload) {
    const token = jwt.sign(payload, this.tokenKey, {
      expiresIn: this.tokenTime,
    });

    return {
      token,
    };
  }
}

module.exports = new JwtService(
  process.env.ACCESS_KEY,
  process.env.ACCESS_TIME
);