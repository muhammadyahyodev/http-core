function validationError(res, message = "Validation Error") {
    const resp = {
        status: 400,
        message: message,
    };

    res
        .writeHead(400, { 'Content-type': 'application/json' })
        .end(JSON.stringify(resp));
}

module.exports = validationError;