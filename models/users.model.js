const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   userId: {
    type: String,
    required: true,
    unique: true,
   },
   score: {
    type: Number,
    default: 0,
   }, 
   attemptedQuizzes: {
    type: Number,
    default: 0,
   },
   sectionScore: [{
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    },
    score: {
        type: Number,
        default: 0,
    }
   }],
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;
