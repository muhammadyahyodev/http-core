function InternalError(res, message = "Internal Error") {
    const resp = {
        status: 502,
        message: message,
    };
    
    res
        .writeHead(502, { "Content-type":"application/json" })
        .end(JSON.stringify(resp));
};

module.exports = InternalError;