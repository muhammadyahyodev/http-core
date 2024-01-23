function InternalError(res) {
    res.writeHead(502,{
        "Content-type":"application/json"
    })

    const resp = {
        status: 502,
        message: error.message,
    }
    
    res.end(JSON.stringify(resp));
};

module.exports = InternalError;