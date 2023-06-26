const mongoose = require('mongoose');

const optionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    optionText: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        require: true,
        enum: ['A', 'B', 'C', 'D'],
    },
    isCorrect: {
        type: Boolean,
    },
});

const questionSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', require: true },
        questionText: {
            type: String,
            require: true,
        },
        options: [optionSchema],
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('Question', questionSchema);
