const http = require('http');
const client = require('./config/database/connect');
const run = require('./config/database/migrations');

const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductById,
  deleteProductById,
} = require('./services/product.service');
const { registration, getAllUsers, getUserById, deleteUserById, login, logout } = require('./services/user.service');

const host = "localhost";
const port = 8080;

// checking connection with database
;(async () => {
  try {
    await client.connect();
    run();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error.message);
  }
})();

const server = http.createServer(async (req, res) => {
  if (req.url === "/products" && req.method === "GET") {
    getAllProducts(req, res);
  } else
  if (req.url.match(/\/products\/\w+/)  && req.method === "GET") {
    getProductById(req, res);
  } else
  if (req.url === "/products" && req.method === "POST") {
    createProduct(req, res);
  } else
  if (req.url.match(/\/products\/\w+/) && req.method === "PUT") {
    updateProductById(req, res);
  } else
  if (req.url.match(/\/products\/\w+/) && req.method === "DELETE") {
    deleteProductById(req, res);
  } else
  if (req.url === "/user/registration" && req.method === "POST") {
    registration(req, res);
  } else
  if (req.url === "/user/login" && req.method === "POST") {
    login(req, res);
  } else
  if (req.url === "/users" && req.method === "GET") {
    getAllUsers(req, res);
  } else
  if (req.url.match(/\/users\/\w+/) && req.method === "GET") {
    getUserById(req, res);
  } else
  if (req.url.match(/\/users\/\w+/) && req.method === "DELETE") {
    deleteUserById(req, res);
  } else
  if (req.url === "/user/logout" && req.method === "POST") {
    logout(req, res);
  }  else {
    res.writeHead(404, {
      "Content-type": "application/json charset utf-8",
    });

    const resp = {
      status: 404,
      message: "Endpoint or method not found",
    };

    res.end(JSON.stringify(resp));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});