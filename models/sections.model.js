const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    sect: String,
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
    }],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
    },
    //user-array
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]

}, {timestamps: true});

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
