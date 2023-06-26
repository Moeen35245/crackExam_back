const mongoose = require('mongoose');

const examSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', require: true },
        name: {
            type: String,
            require: true,
        },
        date: {
            type: Date,
            require: true,
        },
        subject: {
            type: String,
            require: true,
        },
        className: {
            type: String,
            require: true,
        },
        paperCode: {
            type: String,
        },
        startTime: {
            type: Date,
            require: true,
        },
        endTime: {
            type: Date,
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

module.exports = mongoose.model('Exam', examSchema);
