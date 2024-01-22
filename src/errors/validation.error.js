function validationError(res) {
    res.writeHead(400, {
        'Content-type': 'application/json'
    });

    const resp = {
        status: 400,
        message: 'Validation Error! Give correct data to registrate'
    };

    res.end(JSON.stringify(resp));
}

module.exports = validationError;