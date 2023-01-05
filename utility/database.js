// /////////////////////////////////////////////////////////////////////
// //With Mongodb

// const mongodb = require("mongodb");

// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//   MongoClient.connect(
//     "mongodb+srv://apurvashekhar:prince56789@cluster0.pvxomb7.mongodb.net/shop?retryWrites=true&w=majority"
//   )
//     .then((client) => {
//       console.log(`MongoDB cloud Server Connected!`);
//       _db = client.db();
//       callback();
//     })
//     .catch((err) => {
//       console.log(err);
//       throw err;
//     });
// };

// const getDb = () => {
//   if (_db) {
//     return _db;
//   }
//   throw `No DataBase Found🤖🤖🤖`;
// };

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
