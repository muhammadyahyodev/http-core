function Forbidden(res, message = "Forbidden Error") {
    const response = {
        status: 403,
        message: message
    };
    
    res
        .writeHead(403, { "Content-type":"application/json" })
        .end(JSON.stringify(response));
};

module.exports = Forbidden;