function NotFoundError(res, message = 'Not found') {
    const resp = {
        status: 404,
        message: `${message}`,
    };

    res
        .writeHead(404,{ "Content-type":"application/json" })
        .end(JSON.stringify(resp));
}

module.exports = NotFoundError;