function Forbidden(res, error) {
    const response = {
        status: 403,
        message: `Forbidden! ${error}`
    }
    
    return res.
    writeHead(403, { "Content-type":"application/json" })
    .end(JSON.stringify(response));
};

module.exports = Forbidden;