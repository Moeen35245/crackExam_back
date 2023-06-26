const mongoose = require('mongoose');

const instituteSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        new: {
            type: Boolean,
            default: true,
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('Institute', instituteSchema);
