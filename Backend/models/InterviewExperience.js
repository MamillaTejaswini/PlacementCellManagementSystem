const mongoose = require("mongoose");

const ExpSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    experience: { type: String, required: true },
    email:{type:String,required:true},
});

module.exports = mongoose.model("experience", ExpSchema);
