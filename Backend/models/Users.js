
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { 
//     type: String, 
//     enum: ['student', 'admin'], // Only these values are allowed
//     default: 'student', // Default role is student
//     required: true 
//   },
//   profile: {
//     firstName: { type: String },
//     lastName: { type: String },
//     regNo: { type: String },
//     phone: { type: String },
//     address: { type: String },
//   }
// });

// const UserModel = mongoose.model("users", UserSchema);

// module.exports = UserModel;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  regNo: { type: String, required: true, unique: true, trim: true },
  phone: { 
    type: String, 
   // required: true, 
    match: [/^\d{10}$/, "Invalid phone number"], // Ensures a 10-digit phone number
  },
  email: { type: String, required: true, trim: true, lowercase: true },
  dateOfBirth: { type: Date, required: true },
  currentSemester: { type: Number, required: true, min: 1, max: 8 }, // Assuming a max of 8 semesters
  branchOfStudy: { type: String, required: true, trim: true },
  sslcAggregate: { type: Number, required: true, min: 0, max: 100 }, // SSLC (10th) percentage
  diplomaOr12thAggregate: { type: Number, required: true, min: 0, max: 100 }, // 12th/Diploma percentage
  historyOfBacklogs: { 
    type: String, 
    enum: ['Y', 'N'], 
    required: true 
  },
  skills: [{ type: String}],
  resume: { type: String} // File path or URL of uploaded resume
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student', 
    required: true 
  },
  profile: ProfileSchema
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;





