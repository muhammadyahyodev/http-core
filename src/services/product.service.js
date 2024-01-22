// const createNewObjectBook = require("../helpers/createnewObjectbook");
const getBodyData = require("../helpers/getBodyData");
const InternalError = require("../errors/internal.error");
const pool = require("../config/database/connect");

//error handlers
const NotFoundError = require("../errors/notFound.error");
const ValidationError = require("../errors/validation.error");

async function getAllProducts(req, res) {
  try {
    const results = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM product',(error, results) => {
        if(error) {
            console.log("if error: ", error);
          reject(error);
        } else {
            console.log("error else: ", error);
          resolve(results)
        }
      })
    });

    console.log(results);

    res.writeHead(200, {
      "Content-type": "application/json",
    });

    const resp = {
      status: "OK",
      results,
    };

    res.end(JSON.stringify(resp));
  } catch (error) {
    console.log(error)
    InternalError(res);
  }
};

async function createProduct(req, res) {
    try {
      const data = await getBodyData(req);
      const { title, description } = JSON.parse(data);

      if(!title || typeof title !== "string" || typeof description !== "string") {
        return ValidationError(res)
      };

      const query = 'INSERT INTO product(title, description) VALUES($1, $2)';
      
      const new_product = await new Promise((resolve, reject) => {
        pool.query(query, [title, description], (error, result) => {
          if (error) {
            console.log("error if: " ,error);
            reject(error);
          } else {
            console.log("error else: ", result);
            resolve(result);
          }
        });
      });
      
      res.writeHead(201, {
        "Content-type": "application/json charset utf-8",
      });

      const resp = {
        status: "Created",
        book: new_product,
      };

      res.end(JSON.stringify(resp));
    } catch (error) {
      console.log("INTERNAL ERROR: ", error);
      InternalError(res);
    }
  }

module.exports = {
    getAllProducts,
    createProduct,
};