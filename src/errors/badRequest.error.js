function BadRequest(res) {
    res.writeHead(400, {
        "Content-type":"application/json"
    })

    const resp = {
        status: 400,
        message: "Bad Request! Give correct data"
    }
    
    res.end(JSON.stringify(resp));
};

module.exports = BadRequest;