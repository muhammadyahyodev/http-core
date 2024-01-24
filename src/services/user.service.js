const pool = require("../config/database/connect");
const getBodyData = require("../helpers/getBodyData");
const jwt = require('../jwt/jwtService');
const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const dotenv = require('dotenv');
dotenv.config();
// error handlers
const NotFoundError = require("../errors/notFound.error");
const ValidationError = require("../errors/validation.error");
const InternalError = require("../errors/internal.error");
const BadRequestError = require('../errors/badRequest.error');
const ForbiddenError = require('../errors/forbidden.error');
const Unauthorized = require('../errors/unauthorized.error');

async function registration(req, res) {
    try {
        const data = await getBodyData(req);
        const { full_name, email, password } = JSON.parse(data);

        if (!full_name || !email || !password) {
            return BadRequestError(res, "Bad Request! Give correct data");
        };

        if (typeof full_name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return ValidationError(res, "Validation Error! Give correct data to registrate");
        };

        const hashedPassword = bcrypt.hashSync(password, 7);

        const values = [ full_name, email, hashedPassword, false, "token" ];

        const query = `
            INSERT INTO users(full_name, email, password, is_active, token) 
            VALUES($1, $2, $3, $4, $5) 
            ON CONFLICT (email) DO NOTHING 
            RETURNING *`;

        const adding = await new Promise((resolve, reject) => {
            pool.query(query, values, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const user = adding.rows[0];

        if (!user) {
            return ForbiddenError(res, "Forbidden! Already exists");
        };

        const payload = {
            id: user.id,
            password: user.password,
            is_active: user.is_active,
        };

        const tokens = jwt.generateTokens(payload);

        const hashedToken = bcrypt.hashSync(tokens.token, 7);
        const secondQuery = `UPDATE users SET token=$1, is_active=$2 WHERE id=$3 RETURNING *`;
        const adding_token = await new Promise((resolve, reject) => {
            pool.query(secondQuery, [ hashedToken, user.is_active, user.id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);                
            });
        });

        if (!adding_token.rows[0]) {
            return ValidationError(res, "Canceled! Operation does not finished");
        };

        const response = { status: "CREATED", token: tokens.token };
        return res
            .setHeader('Set-Cookie', `token=${tokens.token};`)
            .writeHead(200, { "Content-type":"application/json" })
            .end(JSON.stringify(response));
    } catch (error) {
        return InternalError(res, error);
    }
};

async function login(req, res) {
    try {
        const data = await getBodyData(req);
        const { email, password } = JSON.parse(data);

        if (!email || !password) {
            return BadRequestError(res, "Bad Request! Give correct data");
        };

        if (typeof email !== "string" || typeof password !== "string") {
            return ValidationError(res, "Validation Error! Give correct data to registrate");
        };

        const query = 'SELECT * FROM users WHERE email=$1';
        const check = await new Promise((resolve, reject) => {
            pool.query(query, [ email ], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (!check.rows.length) {
            return Unauthorized(res, "Canceled, you are unauthorized");
        };

        const user = check.rows[0];
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
          return ValidationError(res, "Validation Error! Password is incorrect" );
        };

        const payload = {
            id: user.id,
            password: user.password,
            is_active: user.is_active,
        };

        const tokens = jwt.generateTokens(payload);

        const hashedToken = bcrypt.hashSync(tokens.token, 7);
        const secondQuery = `UPDATE users SET token=$1, is_active=$2 WHERE id=$3 RETURNING *`;
        const adding_token = await new Promise((resolve, reject) => {
            pool.query(secondQuery, [ hashedToken, user.is_active, user.id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);                
            });
        });

        if (!adding_token.rows[0]) {
            return ValidationError(res, "Canceled! Operation does not finished");
        };
        
        const response = { status: "DONE", token: tokens.token };
        return res
            .setHeader('Set-Cookie', `token=${tokens.token};`)
            .writeHead(200, { "Content-type":"application/json" })
            .end(JSON.stringify(response));
    } catch (error) {
        return InternalError(res, error);
    };
};

async function logout(req, res) {
    try {
        const { token } = cookie.parse(req.headers.cookie || "");
        if (!token) {
            return ValidationError(res, "Validation Error! Jwt Expired");
        };

        const rToken = await jwt.verifyAccess(token);

        const query = 'UPDATE users SET token=$1, is_active=$2 WHERE id=$3 RETURNING *';
        const logout = await new Promise((resolve, reject) => {
            pool.query(query, [ null, false, rToken.id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);                      
            });
        });

        if (!logout.rows.length) {
            return ValidationError(res, "Canceled, operation does not finished");
        };
        
        const response = { status: "DONE" };
        return res
            .setHeader('Set-Cookie', `token=`)
            .writeHead(200, { "Content-type":"application/json" })
            .end(JSON.stringify(response));
    } catch (error) {
        return InternalError(res, error);
    };
};

async function getAllUsers(req, res) {
    try {
        const query = 'SELECT * FROM users';
        const users = await new Promise((resolve, reject) => {
            pool.query(query, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return res
            .writeHead(200, { "Content-type": "application/json" })
            .end(JSON.stringify(users.rows));
    } catch (error) {
        return InternalError(res, error);
    };
};

async function getUserById(req, res) {
    try {
        const id = req.url.split('/')[2];

        const query = 'SELECT * FROM users WHERE id=$1';
        const user = await new Promise((resolve, reject) => {
            pool.query(query, [ id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (user.rows.length < 1) {
            return NotFoundError(res, "Not Found! Cannot be found this user");
        };

        return res.end(JSON.stringify(user.rows[0]));
    } catch (error) {
        return InternalError(res, error);
    };
};

async function deleteUserById(req, res) {
    try {
        const id = req.url.split('/')[2];

        const check = await checkNotFound(id);

        if (!check.rows.length) {
            return NotFoundError(res, "Not Found! Cannot be found");
        };

        const query = 'DELETE FROM users WHERE id=$1';
        await new Promise((resolve, reject) => {
            pool.query(query, [ id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return res
            .writeHead(200, { "Content-type": "application/json" })
            .end(JSON.stringify({status: "DELETED"}));
    } catch (error) {
        return InternalError(res, error);
    }
};

async function checkNotFound(id) {
    try {
        const query = 'SELECT * FROM users WHERE id=$1';
        const result = await new Promise((resolve, reject) => {
            pool.query(query, [ id ], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return result;
    } catch (error) {
        console.log(error);
        return;
    };
};

module.exports = {
    registration,
    login,
    logout,
    getAllUsers,
    getUserById,
    deleteUserById,
};