const express = require("express");
const path = require("path");

const { body } = require("express-validator");

//const rootDir = require("../utility/path");

//importing from the products controller
const adminConroller = require("../controllers/admin");

// importing self made authenticating middleware
const isAuth = require("../middleware/is-auth");

const router = express.Router();

//render the add product page when '/add-product' is requested
//  /admin/add-product => GET
router.get("/add-product", isAuth, adminConroller.getAddProduct);

// // //collect the form input and redirect to '/' route
// // //  /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    // body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  adminConroller.postAddProduct
);

// // /admin/admin-product-list => GET
router.get("/admin-product-list", isAuth, adminConroller.getProducts);

router.get("/edit-product/:productId", isAuth, adminConroller.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    // body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  adminConroller.postEditProduct
);

// router.post("/delete-product", isAuth, adminConroller.postDeleteProduct);
//above for sending req , below for async req sent via js, and not rerendering the html
router.delete("/product/:productId", isAuth, adminConroller.deleteProduct);

module.exports = router;
