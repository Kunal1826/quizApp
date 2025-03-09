const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: String,
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    }
}, {timestamps: true});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
