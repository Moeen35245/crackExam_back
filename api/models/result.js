const mongoose = require('mongoose');

const ansSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    question: {
        type: String,
        require: true,
    },
    ans: {
        type: String,
        require: true,
    },
    correct: {
        type: Boolean,
        require: true,
    },
});

const resultSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', require: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        maxScore: {
            type: Number,
            require: true,
        },
        minScore: {
            type: Number,
        },
        obtainedScore: {
            type: Number,
        },
        data: [ansSchema],
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('Result', resultSchema);
