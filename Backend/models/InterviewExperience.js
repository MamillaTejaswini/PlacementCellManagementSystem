const mongoose = require("mongoose");

const ExpSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    email:{type:String,required:true},
    experience: String,
    difficulty: String, 
    rounds: Number,
    problems: Number,
    mode: String, 
    experienceLevel: String, 
    status: String, 
    date: { type: Date, default: Date.now },
    jobPackage:String,
});

module.exports = mongoose.model("experience", ExpSchema);
