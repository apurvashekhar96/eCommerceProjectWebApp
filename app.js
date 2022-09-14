const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

//without mongoose
// const mongoConnect = require("./utility/database").mongoConnect;
//for connecting mongoose with database
const mongoose = require("mongoose");
//import for using session
const session = require("express-session");
//for storing session data in mongodb, pass in the session in the following function
// it will yield a constructor function
const MongoDBStore = require("connect-mongodb-session")(session);

//using helmet for security
const helmet = require("helmet");
//using compression
const compression = require("compression");

//using login middleware morgan
const morgan = require("morgan");

//using csurf for protection against csrf attacks
const csrf = require("csurf");
const csrfProtection = csrf();

//reading private key for openssl
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

//congiguring multer to recieve images
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//importing connect-flash for sending data via rerouting and using session to store error messages
const flash = require("connect-flash");

//uri variable for mongodb database access
const MONGODB_URI =
  //"mongodb+srv://apurvashekhar:prince56789@cluster0.pvxomb7.mongodb.net/shop?retryWrites=true&w=majority";
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.pvxomb7.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const req = require("express/lib/request");
const { userInfo } = require("os");

const User = require("./models/user");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const authRoutes = require("./routes/auth");

const app = express();

//calling the mongodb session storing constructor function
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

//running helmet header security and compression
app.use(helmet());
app.use(compression());

//using morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

//for using session we need to register the following middleware just like bodyparser and static
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//initialising scrf protection after creating the user session after it logs in
app.use(csrfProtection);

//initialising scrf protection after creating the user session after it logs in
app.use(flash());

//adding some information to every reaponse page rendered
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//to get a mongoose model with inbuilt methods to make the orders func work
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

//mongodb code
// mongoConnect(() => {
//   app.listen(3000);
// });

//mongoose code

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000);
    //for manually setting up sssl certification
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
