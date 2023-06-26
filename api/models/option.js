const mongoose = require('mongoose');

const optionSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', require: true },
        text: {
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

module.exports = mongoose.model('Option', optionSchema);
