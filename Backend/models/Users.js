const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, trim: true, default: "Not set" },
  lastName: { type: String, trim: true, default: "Not set" },
  regNo: { type: String, trim: true, default: "Not set" },
  phone: {
    type: String,
    match: [/^\d{10}$/, "Invalid phone number"],
    default: "Not set"
  },
  dateOfBirth: {
    type: String,
    default: "Not set"
  },
  currentSemester: { type: String, default: "Not set" },
  branchOfStudy: { type: String, trim: true, default: "Not set" },
  sslcAggregate: {
    type: String, // can be changed to Number if strictly numeric
    default: "Not set"
  },
  diplomaOr12thAggregate: {
    type: String, // can be changed to Number if strictly numeric
    default: "Not set"
  },
  historyOfBacklogs: {
    type: String, // accepting numbers as string; can use Number if preferred
    default: "Not set"
  },
  skills: {
    type: [String],
    default: ["Not set"]
  },
  resume: {
    type: String, // base64 string or URL
    default: "Not set"
  },
  location: {
    type: String,
    default: "Not set"
  },
  appliedJobs: {
  type: [mongoose.Schema.Types.ObjectId], // Store job IDs
  ref: 'Job',
  default: []
}

});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profile: ProfileSchema
  },
  { timestamps: true }
);

// Hash password before saving (only during registration)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
