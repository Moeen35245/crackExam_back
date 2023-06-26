const mongoose = require('mongoose');

const answerSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', require: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', require: true },
        optionText: { type: String, require: true },
        isCorrect: {
            type: Boolean,
            require: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('Answer', answerSchema);
