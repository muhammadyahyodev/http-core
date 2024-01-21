function InternalError(res) {
    res.writeHead(502,{
        "Content-type":"application/json"
    })

    const resp = {
        status: 502,
        message: "Error! Internal Server Error!"
    }
    
    res.end(JSON.stringify(resp));
};

module.exports = InternalError;