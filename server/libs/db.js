const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let isConnected;
let db;

module.exports = async function connectToDatabase() {
    console.log("connectToDatabase...");

    if (isConnected) {
      console.log("=> use existing database connection");
      return db;
    }
  
    console.log("=> using new database connection");
    db = await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    return db;
}