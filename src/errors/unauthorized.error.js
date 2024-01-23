function Unauthorized(res, message = "Unauthorized") {
    const resp = {
        status: 401,
        message: message,
    };

    res
        .writeHead(401, { 'Content-type': 'application/json' })
        .end(JSON.stringify(resp));
}

module.exports = Unauthorized;