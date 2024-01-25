// database
const pool = require("../config/database/connect");

// helper services
const getBodyData = require("../helpers/getBodyData");

//error handlers
const NotFoundError = require("../errors/notFound.error");
const ValidationError = require("../errors/validation.error");
const InternalError = require("../errors/internal.error");

async function getAllProducts(req, res) {
  try {
    const query = "SELECT * FROM product";

    const results = await new Promise((resolve, reject) => {
      pool.query(query, (error, results) => {
        if(error) reject(error)
        else resolve(results);
      });
    });

    const resp = {
      results: results.rows,
    };

    return res
      .writeHead(200, { "Content-type": "application/json" })
      .end(JSON.stringify(resp));
  } catch (error) {
    return InternalError(res, error);
  }
};

async function createProduct(req, res) {
    try {
      const data = await getBodyData(req);
      const { title, description } = JSON.parse(data);

      if(!title || typeof title !== "string" || typeof description !== "string") {
        return ValidationError(res, "Validation Error! Give correct data");
      };

      const query = 'INSERT INTO product(title, description) VALUES($1, $2)';
      await new Promise((resolve, reject) => {
        pool.query(query, [title, description], (error, result) => {
          if (error) reject(error)
          else resolve(result);
        });
      });

      const resp = {
        status: "CREATED"
      };

      return res
        .writeHead(200, { "Content-type": "application/json" })
        .end(JSON.stringify(resp));
    } catch (error) {
      return InternalError(res);
    }
};

async function getProductById(req, res) {
  try {
    const id = req.url.split("/")[2];

    const query = "SELECT * FROM product WHERE id=$1";
    const product = await new Promise((resolve, reject) => {
        pool.query(query, [ id ], (error, result) => {
          if (error) reject(error)
          else resolve(result);
        });
    });

    if(product.length < 1) {
      return NotFoundError(res, 'Not Found! Product cannot be found');
    };

    const resp = {
      status: 200,
      product: product.rows,
    };

    return res
      .writeHead(200, { "Content-type": "application/json" })
      .end(JSON.stringify(resp));
  } catch (error) {
    return InternalError(res);
  }
};

async function updateProductById(req, res) {
  try {
    const id = req.url.split("/")[2];

    const check = await checkNotFound(id);
    if(check.rows.length < 1) {
      return NotFoundError(res, 'Not Found! Cannot be found');
    };

    const body = await getBodyData(req);
    const { title, description } = JSON.parse(body);
    
    const query = `UPDATE product SET title=$1, description=$2 WHERE id=2`;
    await new Promise((resolve, reject) => {
      pool.query(query, [ title, description ], (error, result) => {
        if (error) reject(error)
        else resolve(result);
      });
    });

    const resp = {
      status: 200,
      message: "UPDATED",
    };

    return res
      .writeHead(200, { "Content-type": "application/json" })
      .end(JSON.stringify(resp));
  } catch (error) {
    return InternalError(res);
  };
};

async function deleteProductById(req, res) {
  try {
    const id = req.url.split("/")[2];

    const check = await checkNotFound(id);
    if(check.rows.length < 1) {
      return NotFoundError(res, 'Not Found! Cannot be found');
    };
    
    const query = "DELETE FROM product WHERE id=$1";
    await new Promise((resolve, reject) => {
      pool.query(query, [ id ], (error, result) => {
        if (error) reject(error)
        else resolve(result);
      });
    });

    const resp = {
      status: 200,
      message: "DELETED",
    };

    return res
      .writeHead(200, { "Content-type": "application/json" })
      .end(JSON.stringify(resp));
  } catch (error) {
    return InternalError(res);
  };
};

async function checkNotFound(id) {
  try {
    const query = 'SELECT * FROM product WHERE id=$1';
    const result = await new Promise((resolve, reject) => {
      pool.query(query, [ id ], (error,result) => {
        if (error) reject(error)
        else resolve(result);
      });
    });

    return result;
  } catch(error) {
    return InternalError(error);
  };
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
};