const Product = require("../models/product");

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const fileHelper = require("../utility/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  // const imageUrl = req.body.imageUrl;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        image: image,
        price: price,
        description: description,
      },
      errorMessage: "Image should be png/jpg/jpeg only!",
      validationErrors: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        // imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    //userId: req.user // this will also work, mongoose wqill automatically convert the user object and extract the id.
    userId: req.user._id,
  });

  //below with mongo, above with mngoose
  // const product = new Product(
  //   title,
  //   imageUrl,
  //   description,
  //   price,
  //   null,
  //   req.user._id
  // );

  product
    .save()
    .then((result) => {
      res.redirect("/admin/admin-product-list");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      // res.redirect("/500");
      //////
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   errorMessage: "Database opearation failed, Please try again",
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   validationErrors: [],
      // });
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  // const updatedImageUrl = req.body.imageUrl;
  image = req.file;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        // imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      // product.imageUrl = updatedImageUrl;
      product.description = updatedDescription;
      product.price = updatedPrice;
      return product.save().then((result) => {
        console.log("Updated Product!");
        res.redirect("/admin/admin-product-list");
      });
    })

    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedImageUrl = req.body.imageUrl;
//   const updatedDescription = req.body.description;
//   const updatedPrice = req.body.price;

//   const product = new Product(
//     updatedTitle,
//     updatedImageUrl,
//     updatedDescription,
//     updatedPrice,
//     prodId
//   );
//   product
//     .save()
//     .then((result) => {
//       console.log("Updated Product!");
//       res.redirect("/admin/admin-product-list");
//     })
//     .catch((err) => console.log(err));
// };

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId)
//     .then((product) => {
//       if (!product) {
//         return next(new Error("product not found!"));
//       }
//       fileHelper.deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id });
//     })
//     // Product.deleteById(prodId)
//     //Product.findByIdAndRemove(prodId)

//     .then(() => {
//       console.log(`destroyed💥💥💥💥`);
//       res.redirect("/admin/admin-product-list");
//     })
//     .catch((err) => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };
//below is for deleting via async js requests

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("product not found!"));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })

    .then(() => {
      console.log(`destroyed💥💥💥💥`);
      res.status(200).json({ message: "Successfully deleted!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Deleting product failed" });
    });
};

exports.getProducts = (req, res, next) => {
  //product.fetchAll()
  Product.find({ userId: req.user._id })
    //.select("title price -_id")
    //.populate("userId", "name email")
    .then((products) => {
      res.render("admin/admin-product-list", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/admin-product-list",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
