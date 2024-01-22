const pool = require("../config/database/connect");
const getBodyData = require("../helpers/getBodyData");
const NotFoundError = require("../errors/notFound.error");
const ValidationError = require("../errors/validation.error");
const InternalError = require("../errors/internal.error");
const BadRequestError = require('../errors/badRequest.error');
const ForbiddenError = require('../errors/forbidden.error');

async function registration(req, res) {
    try {
        const data = await getBodyData(req);
        const { full_name, email, password } = JSON.parse(data);

        if (!full_name || !email || !password) {
            return BadRequestError(res);
        };

        if (typeof full_name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return ValidationError(res);
        };

        const values = [ full_name, email, password, true, "token" ];

        const query = `
            INSERT INTO users(full_name, email, password, is_active, token) 
            VALUES($1, $2, $3, $4, $5) 
            ON CONFLICT (email) DO NOTHING 
            RETURNING *`;

        const new_user = await new Promise((resolve, reject) => {
            pool.query(query, values, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        
        if (new_user.rows.length === 0) {
            return ForbiddenError(res, "Already exists");
        };

        const response = { status: "CREATED", user: new_user.rows };

        return res
            .writeHead(201, { "Content-type":"application/json" })
            .end(JSON.stringify(response));
    } catch (error) {
        InternalError(res);
    }
}

module.exports = {
    registration,
}