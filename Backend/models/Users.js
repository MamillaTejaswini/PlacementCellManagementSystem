// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });


// const UserModel = mongoose.model("users", UserSchema);

// module.exports = UserModel;

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin'], // Only these values are allowed
    default: 'student', // Default role is student
    required: true 
  },
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;




