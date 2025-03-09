const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    instructorId: {
        type: String,
        required: true,
        unique: true,
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]      
}, {timestamps: true});

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;